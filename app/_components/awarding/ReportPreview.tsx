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

interface ReportPreviewProps {
  sourceFileReports: Record<string, AwardedBid[]>;
  processing: boolean;
  onGenerateReports: () => void;
  onGenerateAllWins: () => void;
};

export const ReportPreview = ({
  sourceFileReports,
  processing,
  onGenerateReports,
  onGenerateAllWins
}: ReportPreviewProps) => (
  <div className="p-6 shadow-lg mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Awarded Bids by Source File ({Object.keys(sourceFileReports).length} files)
      </h2>
      
      <div className="flex gap-2">
        <Button
          variant="outlined"
          color="primary"
          onClick={onGenerateAllWins}
          disabled={processing || Object.keys(sourceFileReports).length === 0}
          startIcon={<EventNoteIcon />}
        >
          Download All Wins
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={onGenerateReports}
          disabled={processing || Object.keys(sourceFileReports).length === 0}
          startIcon={<EventNoteIcon />}
        >
          Download Individual Reports
        </Button>
      </div>
    </div>
    
    <div className="space-y-6">
      {Object.entries(sourceFileReports).map(([sourceFile, data]) => (
        <div key={sourceFile} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h3 className="font-medium text-gray-800">
              {sourceFile} ({data.length} bids)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Listing ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Awarded Price ($)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Price ($)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 5).map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.listingId}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.sku}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">{item.unitAwardedPrice?.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">
                      {((item.quantity || 0) * (item.unitAwardedPrice || 0)).toFixed(2)}
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
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-700 uppercase">Totals</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {data.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                  </td>
                  <td className="px-4 py-2 text-sm text-green-700">
                    {/* Column G Total removed as requested */}
                  </td>
                  <td className="px-4 py-2 text-sm text-blue-700">
                    {data.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitAwardedPrice || 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  </div>
);