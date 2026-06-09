import { Bid, SnackbarState } from "@/app/lots/bids/type";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { awardBid } from "../customer-bidding/api/bidService";

interface AwardBidDialogProps {
  bid: Bid;
  onClose: () => void;
  onSuccess: (updatedBid: Bid) => void;
  showNotification: (message: string, severity: SnackbarState["severity"]) => void;
}

export default function AwardBidDialog({
  bid,
  onClose,
  onSuccess,
  showNotification
}: AwardBidDialogProps) {
  const [form, setForm] = useState({
    final_price: bid.bid_amount.toString(),
    commission: "10.00"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const finalPrice = parseFloat(form.final_price);
      const commission = parseFloat(form.commission);

      if (isNaN(finalPrice)) {
        throw new Error("Invalid final price");
      }

      if (isNaN(commission)) {
        throw new Error("Invalid commission value");
      }

      const updatedBid = await awardBid(bid.bid_id, finalPrice, commission);
      onSuccess(updatedBid);
    } catch (error) {
      console.error("Award bid error:", error);
      showNotification("Failed to award bid", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-gray-50 p-4 border-b">
        Award Bid #{bid.bid_id}
      </DialogTitle>
      
<DialogContent className="p-6">
  <div className="grid grid-cols-2 gap-6 mb-4"> {/* Replace Grid container */}
    <div> {/* Replace Grid item */}
      <div className="text-sm text-gray-500">Bidder</div>
      <div className="font-medium">{bid.user_name}</div>
    </div>
    <div>
      <div className="text-sm text-gray-500">Current Bid</div>
      <div className="font-medium">${bid.bid_amount.toFixed(2)}</div>
    </div>
    <div>
      <div className="text-sm text-gray-500">Bidder Email</div>
      <div className="font-medium">{bid.user_email}</div>
    </div>
    <div>
      <div className="text-sm text-gray-500">Bid Time</div>
      <div className="font-medium">
        {new Date(bid.bid_time).toLocaleString()}
      </div>
    </div>
  </div>

  {/* Keep your existing TextFields here */}
  <div className="grid grid-cols-2 gap-4">
    <TextField
      label="Final Price"
      type="number"
      value={form.final_price}
      onChange={(e) => setForm({...form, final_price: e.target.value})}
      fullWidth
      required
      inputProps={{ step: "0.01", min: "0" }}
      InputProps={{
        startAdornment: <span className="mr-2">$</span>,
      }}
    />
    
    <TextField
      label="Commission"
      type="number"
      value={form.commission}
      onChange={(e) => setForm({...form, commission: e.target.value})}
      fullWidth
      required
      inputProps={{ step: "0.01", min: "0", max: "100" }}
      InputProps={{
        endAdornment: <span className="ml-2">%</span>,
      }}
    />
  </div>
</DialogContent>
      
      <DialogActions className="p-4 border-t">
        <Button 
          variant="outlined" 
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Confirm Award"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}