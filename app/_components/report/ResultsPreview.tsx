"use client";

import { useState } from 'react';
import { 
  Button, 
  TablePagination, 
  TextField
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PaidIcon from '@mui/icons-material/Paid';
import { applyCommission } from '@/utils/commission';

interface BidData {
  listingId: string;
  oem: string;
  sku: string;
  description: string;
  disposition: string;
  quantity: number;
  originalUnitPrice?: number | null;
  unitPrice: number | null;
  commissionAmount?: number;
  fileName: string;
  customerCode?: string;
}

interface ResultsPreviewProps {
  results: BidData[];
  commissionApplied: boolean;
  onApplyCommission: () => void;
  fileCommissions: Record<string, string>;
  onCommissionChange: (fileName: string, value: string) => void;
  getCommissionForFile: (fileName: string) => number;
  onSaveReport: () => void;
  onGenerateReport: () => void;
  processing: boolean;
}

const isDecimalInput = (value: string) => value === '' || /^\d*\.?\d*$/.test(value);

export const ResultsPreview = ({
  results,
  commissionApplied,
  fileCommissions,
  onCommissionChange,
  getCommissionForFile,
  onApplyCommission,
  onSaveReport,
  onGenerateReport,
  processing
}: ResultsPreviewProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const companies = Array.from(
    new Set(results.map((item) => item.fileName).filter(Boolean))
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <div className="p-6 shadow-lg mb-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-semibold text-gray-800">
            ({results.length} Highest Bids)
            {commissionApplied && <span className="ml-2 text-sm text-green-600">(Commission Applied)</span>}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="contained"
              color="info"
              startIcon={<PaidIcon />}
              onClick={onApplyCommission}
              disabled={commissionApplied || results.length === 0}
            >
              Apply Commission
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<EventNoteIcon />}
              onClick={onSaveReport}
              disabled={processing}
            >
              Save Report
            </Button>
            
            <Button
              variant="contained"
              color="success"
              onClick={onGenerateReport}
              disabled={processing || results.length === 0}
            >
              Download Report
            </Button>
          </div>
        </div>

        {companies.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Deduct a different amount per company
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {companies.map((fileName) => (
                <div key={fileName} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 truncate flex-1 min-w-0" title={fileName}>
                    {fileName}
                  </span>
                  <TextField
                    label="Deduct ($)"
                    size="small"
                    value={fileCommissions[fileName] ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!isDecimalInput(raw)) return;
                      onCommissionChange(fileName, raw);
                    }}
                    disabled={commissionApplied}
                    sx={{ width: 140 }}
                    inputProps={{ inputMode: 'decimal' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OEM</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disposition</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid ($)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission ($)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => {
                const companyCommission = getCommissionForFile(item.fileName);
                return (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{item.listingId}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.oem}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.disposition}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {item.originalUnitPrice != null
                    ? `$${commissionApplied
                        ? applyCommission(item.originalUnitPrice, item.commissionAmount ?? companyCommission)
                        : item.originalUnitPrice.toFixed(2)}`
                    : <span className="text-gray-400 italic">No bid</span>}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-700 bg-yellow-50">
                  {item.customerCode || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.fileName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-red-600">
                  ${Number(commissionApplied ? item.commissionAmount ?? 0 : companyCommission).toFixed(2)}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      
      <TablePagination
        component="div"
        count={results.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        className="border-t"
      />
    </div>
  );
};
