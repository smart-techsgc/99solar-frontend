import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Bid, LotWithBids } from "@/app/lots/bids/type";

interface LotBidsTableProps {
  lot: LotWithBids;
  onAwardBid: (bid: Bid) => void;
  onRefresh: () => void;
}

export default function LotBidsTable({ 
  lot, 
  onAwardBid, 
  onRefresh 
}: LotBidsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "awarded": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">
              Lot #{lot.lot_number} - {lot.item_description}
            </h2>
            <div className="flex gap-4 mt-2">
              <div>
                <span className="text-gray-500">Total Bids:</span>
                <span className="ml-2 font-bold">{lot.bid_count}</span>
              </div>
              <div>
                <span className="text-gray-500">Highest Bid:</span>
                <span className="ml-2 font-bold text-green-600">
                  ${lot.highest_bid.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <Tooltip title="Refresh bids">
            <IconButton onClick={onRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <TableContainer component={Paper} className="shadow-lg rounded-lg">
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell className="font-bold">Rank</TableCell>
              <TableCell className="font-bold">Bidder</TableCell>
              <TableCell className="font-bold">Email</TableCell>
              <TableCell className="font-bold text-right">Bid Amount</TableCell>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell className="font-bold">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lot.bids.map((bid, index) => (
              <TableRow key={bid.bid_id}>
                <TableCell>
                  <Chip 
                    label={`#${index + 1}`} 
                    color={index === 0 ? "primary" : "default"} 
                    size="small"
                  />
                </TableCell>
                <TableCell className="font-medium">{bid.user_name}</TableCell>
                <TableCell>{bid.user_email}</TableCell>
                <TableCell className="text-right font-bold">
                  ${bid.bid_amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={bid.status} 
                    className={getStatusColor(bid.status)} 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {bid.status === "pending" && (
                    <Tooltip title="Award this bid">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => onAwardBid(bid)}
                      >
                        Award
                      </Button>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}