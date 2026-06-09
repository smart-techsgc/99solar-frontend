import { Button } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';

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

interface AwardReportPreviewProps {
  sourceFileReports: Record<string, AwardedBid[]>; // contains "Award" and "Internal"
  processing: boolean;
  onGenerateReports: () => void;
}

export const AwardReportPreview = ({
  sourceFileReports,
  processing,
  onGenerateReports
}: AwardReportPreviewProps) => {
  const awards = sourceFileReports['Awards'] || [];
  const internals = sourceFileReports['Internal'] || [];

  const renderTable = (title: string, data: AwardedBid[]) => (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b">
        <h3 className="font-medium text-gray-800">
          {title} ({data.length} bids)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Listing ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Awarded Price ($)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 5).map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 text-sm text-gray-900">{item.listingId}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{item.customerCode || 'N/A'}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{item.sku}</td>
                <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                <td className="px-4 py-2 text-sm font-medium text-green-600">
                  {item.unitAwardedPrice?.toFixed(2)}
                </td>
              </tr>
            ))}
            {data.length > 5 && (
              <tr>
                <td colSpan={6} className="px-4 py-2 text-center text-sm text-gray-500">
                  Showing 5 of {data.length} records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Awarded & Internal Bids
        </h2>
        <Button
          variant="contained"
          color="success"
          onClick={onGenerateReports}
          disabled={processing}
          startIcon={<EventNoteIcon />}
        >
          Download Reports
        </Button>
      </div>

      <div className="space-y-6">
        {renderTable('Awards', awards)}
        {renderTable('Internal', internals)}
      </div>
    </div>
  );
};
