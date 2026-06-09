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
  commissionAmount: number; 
  setCommissionAmount: (amount: number) => void;
  onSaveReport: () => void;
  onGenerateReport: () => void;
  processing: boolean;
}

export const ResultsPreview = ({
  results,
  commissionApplied,
  setCommissionAmount,
  commissionAmount,
  onApplyCommission,
  onSaveReport,
  onGenerateReport,
  processing
}: ResultsPreviewProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <div className="p-6 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          ({results.length} Highest Bids)
          {commissionApplied && <span className="ml-2 text-sm text-green-600">(Commission Applied)</span>}
        </h2>

        <div className="mt-4">
          <TextField
            label="Commission Amount ($)"
            value={commissionAmount}
            onChange={(e) => setCommissionAmount(Number(e.target.value))}
            variant="outlined"
            size="small"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="info"
            startIcon={<PaidIcon />}
            onClick={onApplyCommission}
            disabled={commissionApplied || results.length === 0}
          >
            Apply ${commissionAmount} Commission
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
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Col A */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing ID</th>
              {/* Col B */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OEM</th>
              {/* Col C */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              {/* Col D */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              {/* Col E */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disposition</th>
              {/* Col F */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              {/* Col G */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid ($)</th>
              {/* Col H */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">Code</th>
              {/* Col I */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Customer</th>
              {/* Extra */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission ($)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* A */}
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{item.listingId}</td>
                {/* B */}
                <td className="px-4 py-3 text-sm text-gray-500">{item.oem}</td>
                {/* C */}
                <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                {/* D */}
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                {/* E */}
                <td className="px-4 py-3 text-sm text-gray-500">{item.disposition}</td>
                {/* F */}
                <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                {/* G */}
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {item.originalUnitPrice != null
                    ? `$${commissionApplied
                        ? applyCommission(item.originalUnitPrice, commissionAmount)
                        : item.originalUnitPrice.toFixed(2)}`
                    : <span className="text-gray-400 italic">No bid</span>}
                </td>
                {/* H — Code highlighted */}
                <td className="px-4 py-3 text-sm font-semibold text-blue-700 bg-yellow-50">
                  {item.customerCode || 'N/A'}
                </td>
                {/* I */}
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.fileName || 'N/A'}</td>
                {/* Commission */}
                <td className="px-4 py-3 text-sm text-red-600">
                  ${item.commissionAmount || 0}
                </td>
              </tr>
            ))}
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