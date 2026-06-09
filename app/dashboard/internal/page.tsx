'use client';

import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { Card } from '@mui/material';
import { parseCSV, generateXLSX } from '@/utils/csvParser';
import { DateSelector } from '@/app/_components/awarding/DateSelector';
import { FileUploader } from '@/app/_components/awarding/FileUploader';
import { SnackbarAlert } from '../components/SnackbarAlert';
import { AwardReportPreview } from '@/app/_components/awarding/AwardReportPreview';

interface AwardedBid {
  listingId: string;
  oem: string;
  sku: string;
  prop65Warning: string;
  description: string;
  disposition: string;
  quantity: number;
  unitAwardedPrice: number;
  fileName: string;
  customerCode?: string;
}

export default function Awarding() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const [historyDate, setHistoryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sourceFileReports, setSourceFileReports] = useState<
    Record<string, AwardedBid[]>
  >({});

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // ✅ Process awarded CSVs
  const processAwardedFiles = useCallback(async () => {
    if (files.length === 0) {
      showSnackbar('Please select at least one awarded CSV file', 'warning');
      return;
    }

    setProcessing(true);

    try {
      const sourceFileData: Record<string, AwardedBid[]> = {
        Awards: [],
        Internal: [],
      };

      for (const file of files) {
        const awardedItems = await parseCSV(file);

        awardedItems.forEach((item: Record<string, unknown>) => {
          const listingId = String(item['Listing Id']);
          const price = Number(item['Unit Awarded Price']) || 0;
          const priceStr = price.toFixed(2);

          const bid: AwardedBid = {
            listingId,
            oem: String(item['OEM'] || ''),
            sku: String(item['SKU'] || ''),
            prop65Warning: String(item['Prop65 Warning'] || ''),
            description: String(item['Description'] || ''),
            disposition: String(item['Disposition'] || ''),
            quantity: Number(item['Quantity']) || 0,
            unitAwardedPrice: price,
            fileName: file.name,
            customerCode: String(item['Code'] || ''),
          };

          // ✅ Only bids ending in .44 or .88 → Internal
          if (priceStr.endsWith('.44') || priceStr.endsWith('.88')) {
            sourceFileData['Internal'].push({ ...bid, fileName: 'Internal' });
          } else {
            sourceFileData['Awards'].push({ ...bid, fileName: 'Awards' });
          }
        });
      }

      setSourceFileReports(sourceFileData);
      showSnackbar(`Processed ${files.length} file(s) successfully`, 'success');
    } catch (error) {
      console.error('Processing error:', error);
      showSnackbar('Failed to process files', 'error');
    } finally {
      setProcessing(false);
    }
  }, [files, showSnackbar]);

  // ✅ Generate reports for each source file
  const generateSourceFileReports = useCallback(() => {
    if (Object.keys(sourceFileReports).length === 0) {
      showSnackbar('No source file data to export', 'warning');
      return;
    }

    try {
      Object.entries(sourceFileReports).forEach(([sourceFile, data]) => {
        const formattedData = data.map((item) => ({
          'Listing Id': item.listingId,
          OEM: item.oem,
          SKU: item.sku,
          Description: item.description,
          Disposition: item.disposition,
          Quantity: item.quantity,
          'Unit Awarded Price ($)': item.unitAwardedPrice,
          Code: item.customerCode || 'N/A',
          'Sales Customer': sourceFile,
        }));

        const { blob, fileName } = generateXLSX(
          formattedData,
          sourceFile,
          historyDate
        );
        saveAs(blob, fileName);
      });

      showSnackbar('Reports generated successfully', 'success');
    } catch (error) {
      console.error('Generation error:', error);
      showSnackbar('Error generating reports', 'error');
    }
  }, [sourceFileReports, historyDate, showSnackbar]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Awarded Bids Processor
      </h1>

      <Card className="p-6 mb-6 shadow-lg">
        <DateSelector
          date={historyDate}
          loading={false}
          onDateChange={setHistoryDate}
          onLoadReports={() => {}}
        />

        <FileUploader
          files={files}
          processing={processing}
          onFileChange={(e) =>
            e.target.files && setFiles(Array.from(e.target.files))
          }
          onProcessFiles={processAwardedFiles}
          onClearFiles={() => setFiles([])}
        />
      </Card>

      {Object.keys(sourceFileReports).length > 0 && (
        <AwardReportPreview
          sourceFileReports={sourceFileReports}
          processing={processing}
          onGenerateReports={generateSourceFileReports}
        />
      )}

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
}
