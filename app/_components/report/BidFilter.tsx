'use client';

import { useState } from 'react';
import { Button, Card, TextField } from '@mui/material';
import { FileUploader } from '@/app/_components/report/FileUploader';
import { FilterResults } from '@/app/_components/report/FilterResults';
import * as XLSX from 'xlsx';

interface BidData {
  listingId: string;
  oem: string;
  sku: string;
  description: string;
  disposition: string;
  quantity: number;
  unitPrice: number;
  fileName: string;
  commissionAmount?: number | null;
  customerCode?: string;
}

export const BidFilter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filteredBids, setFilteredBids] = useState<BidData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);}
  };

const parseFile = async (file: File): Promise<BidData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;

        const workbook = file.name.endsWith('.csv')
          ? XLSX.read(data as string, { type: 'string' })
          : XLSX.read(data as ArrayBuffer, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

        const bids: BidData[] = jsonData.map((row) => {
          const rawPrice =
            row['Unit_Offer_Price'] ||
            row['Unit Offer Price'] ||
            row['Unit Price'] ||
            row['Price'] ||
            '';

          const price = parseFloat(String(rawPrice).replace(/[^\d.]/g, '') || '0');

          return {
            listingId: String(
              row['Listing Id'] || row['ListingId'] || row['listingId'] || ''
            ).trim(),
            oem: String(row['OEM'] || '').trim(),
            sku: String(row['SKU'] || '').trim(),
            description: String(row['Description'] || '').trim(),
            disposition: String(row['Disposition'] || '').trim(),
            quantity: Number(row['Quantity'] || 0),
            unitPrice: isNaN(price) ? 0 : price,
            fileName: file.name,
            customerCode: String(row['Code'] || 'N/A').trim(),
          };
        });

        resolve(bids.filter((b) => b.listingId));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
};


const filterBids = async () => {
  if (files.length === 0) {
    alert('Please select at least one file');
    return;
  }

  setLoading(true);

  try {
    // Parse all files to extract listing IDs + prices
const allParsedFiles = await Promise.all(files.map(parseFile));
const parsedRows = allParsedFiles.flat();

const listingIds = Array.from(
  new Set(parsedRows.map((r) => r.listingId).filter(Boolean))
);
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/filter`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    listingIds,
    date: filterDate,
    fileData: parsedRows, // ✅ send the file data
  }),
});

    if (!response.ok) throw new Error('Failed to filter bids');
    const data = await response.json();

    const backendBids: BidData[] = data.bids || [];

    // Merge: use local price if backend bid has no price
    const mergedBids = listingIds.map((id) => {
      const backend = backendBids.find((b) => b.listingId === id);
      const local = parsedRows.find((b) => b.listingId === id);

      return {
        listingId: id,
        oem: backend?.oem || local?.oem || '',
        sku: backend?.sku || local?.sku || '',
        description: backend?.description || local?.description || '',
        disposition: backend?.disposition || local?.disposition || '',
        quantity: backend?.quantity || local?.quantity || 0,
        unitPrice: backend?.unitPrice && backend.unitPrice > 0 ? backend.unitPrice : local?.unitPrice || 0,
        fileName: local?.fileName || '',
        commissionAmount: backend?.commissionAmount ?? null,
        customerCode: backend?.customerCode || local?.customerCode || 'N/A',
      };
    });

    setFilteredBids(mergedBids);
  } catch (error) {
    console.error('Filter error:', error);
    alert('Failed to filter bids. Please check file formats and try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Filter Bids by Listing ID
        </h2>

        <FileUploader
          files={files}
          processing={loading}
          onFileChange={handleFileChange}
          onClearFiles={() => setFiles([])}
          onProcessFiles={filterBids}
          accept=".csv,.xlsx,.xls"
        />

        <div className="mt-4">
          <TextField
            label="Report Date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          onClick={filterBids}
          disabled={loading || files.length === 0}
          className="mt-4"
        >
          {loading ? 'Filtering...' : 'Filter Bids'}
        </Button>
      </Card>

      {filteredBids.length > 0 && (
        <FilterResults
          bids={filteredBids}
          date={filterDate}
        />
      )}
    </div>
  );
};
