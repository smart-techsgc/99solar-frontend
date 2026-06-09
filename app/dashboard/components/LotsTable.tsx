import { LotWithBids } from "@/app/lots/bids/type";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Chip
} from "@mui/material";

interface LotsTableProps {
  lots: LotWithBids[];
  selectedLot: LotWithBids | null;
  onSelectLot: (lot: LotWithBids) => void;
}

export default function LotsTable({ 
  lots, 
  selectedLot, 
  onSelectLot 
}: LotsTableProps) {
  if (lots.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium text-gray-500">
          No lots available with bids
        </h3>
        <p className="mt-2 text-gray-400">
          Try creating new lots or encouraging bidders
        </p>
      </div>
    );
  }

  return (
    <TableContainer component={Paper} className="shadow-lg rounded-lg">
      <Table>
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell className="font-bold">Lot #</TableCell>
            <TableCell className="font-bold">Description</TableCell>
            <TableCell className="font-bold text-right">Bids</TableCell>
            <TableCell className="font-bold text-right">Highest Bid</TableCell>
            <TableCell className="font-bold">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lots.map((lot) => (
            <TableRow 
              key={lot.lot_id}
              className={selectedLot?.lot_id === lot.lot_id ? "bg-blue-50" : ""}
            >
              <TableCell className="font-medium">{lot.lot_number}</TableCell>
              <TableCell className="max-w-xs truncate">
                {lot.item_description}
              </TableCell>
              <TableCell className="text-right">
                <Chip 
                  label={lot.bid_count} 
                  color="primary" 
                  size="small" 
                />
              </TableCell>
              <TableCell className="text-right font-bold">
                {typeof lot.highest_bid === "number" && !isNaN(lot.highest_bid)
                  ? `$${lot.highest_bid.toFixed(2)}`
                  : "$0.00"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => onSelectLot(lot)}
                >
                  View Bids
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}