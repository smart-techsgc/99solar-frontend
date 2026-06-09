import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  InputAdornment
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Lot, SnackbarState } from "@/app/lots/type";

interface EditLotDialogProps {
  lot: Lot;
  onClose: () => void;
  onSaveSuccess: (updatedLot: Lot) => void;
  showNotification: (message: string, severity: SnackbarState["severity"]) => void;
}

export default function EditLotDialog({
  lot,
  onClose,
  onSaveSuccess,
  showNotification
}: EditLotDialogProps) {
  const [form, setForm] = useState({
    available_from: lot.available_from || "",
    available_to: lot.available_to || "",
    commission_rate: lot.commission_rate || "",
    base_price: lot.base_price?.toString() || "",
  });

  useEffect(() => {
    setForm({
      available_from: lot.available_from || "",
      available_to: lot.available_to || "",
      commission_rate: lot.commission_rate || "",
      base_price: lot.base_price?.toString() || "",
    });
  }, [lot]);

  const validateForm = () => {
    const commission = parseFloat(form.commission_rate);
    if (commission < 0 || commission > 100) {
      showNotification("Commission must be 0-100%", "error");
      return false;
    }
    if (new Date(form.available_from) > new Date(form.available_to)) {
      showNotification("Start date must be before end date", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${lot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...form,
          base_price: parseFloat(form.base_price)
        }),
      });

      if (!response.ok) throw new Error("Update failed");
      
      const updatedLot = await response.json();
      onSaveSuccess(updatedLot);
      onClose();
    } catch {
      showNotification("Failed to update lot", "error");
    }
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Lot #{lot.lot_number}</DialogTitle>
      <DialogContent dividers>
        <div className="space-y-4 mb-4">
          <p><strong>Description:</strong> {lot.item_description}</p>
          <p><strong>Quantity:</strong> {lot.quantity}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <DatePicker
            label="Available From"
            value={form.available_from ? new Date(form.available_from) : null}
            onChange={(date) => 
              setForm({...form, available_from: date?.toISOString().split("T")[0] || ""})
            }
            className="w-full"
          />
          
          <DatePicker
            label="Available To"
            value={form.available_to ? new Date(form.available_to) : null}
            onChange={(date) => 
              setForm({...form, available_to: date?.toISOString().split("T")[0] || ""})
            }
            className="w-full"
          />
          
          <TextField
            label="Commission Rate"
            type="number"
            value={form.commission_rate}
            onChange={(e) => setForm({...form, commission_rate: e.target.value})}
            fullWidth
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
          />
          
          <TextField
            label="Base Price"
            type="number"
            value={form.base_price}
            onChange={(e) => setForm({...form, base_price: e.target.value})}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          />
        </div>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}