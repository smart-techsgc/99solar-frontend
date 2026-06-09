import React, { useState } from "react";
import { TextField, Button, Snackbar, Alert, MenuItem, AlertColor } from "@mui/material";
import { Lot } from "../dashboard/bid-processing/page";


interface UploadLotFormProps {
  setLots: React.Dispatch<React.SetStateAction<Lot[]>>;
}


export default function UploadLotForm({ setLots }: UploadLotFormProps) {
  const [lotData, setLotData] = useState({
    lotNumber: "",
    itemDescription: "",
    grade: "",
    quantity: "",
    basePrice: "",
    commissionRate: "0.10",
    oem: "",
    sku: "",
    prop65Warning: "",
    description: "",
    disposition: "",
    availableFrom: "",
    availableTo: "",
  });

  // Explicitly type the snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [showForm, setShowForm] = useState(false); // Toggle form visibility

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLotData({ ...lotData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSnackbar({ open: true, message: "User ID not found. Please log in again.", severity: "error" });
      setLots([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/upload-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...lotData, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload lot.");
      }

      setSnackbar({ open: true, message: "Lot uploaded successfully!", severity: "success" });
      setLotData({
        lotNumber: "",
        itemDescription: "",
        grade: "",
        quantity: "",
        basePrice: "",
        commissionRate: "0.10",
        oem: "",
        sku: "",
        prop65Warning: "",
        description: "",
        disposition: "",
        availableFrom: "",
        availableTo: "",
      });
    } catch {
      setSnackbar({ open: true, message: "Failed to upload lot.", severity: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowForm(!showForm)}
        className="mb-4"
      >
        {showForm ? "Hide Upload Form" : "Show Upload Form"}
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            name="lotNumber"
            label="Lot Number"
            value={lotData.lotNumber}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="itemDescription"
            label="Item Description"
            value={lotData.itemDescription}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="grade"
            label="Grade"
            value={lotData.grade}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="quantity"
            label="Quantity"
            type="number"
            value={lotData.quantity}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="basePrice"
            label="Base Price"
            type="number"
            value={lotData.basePrice}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            name="commissionRate"
            label="Commission Rate (%)"
            type="number"
            value={lotData.commissionRate}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="oem"
            label="OEM"
            value={lotData.oem}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="sku"
            label="SKU"
            value={lotData.sku}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="prop65Warning"
            label="Prop 65 Warning"
            value={lotData.prop65Warning}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="description"
            label="Description"
            value={lotData.description}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="disposition"
            label="Disposition"
            select
            value={lotData.disposition}
            onChange={handleChange}
            fullWidth
            required
          >
            <MenuItem value="DNB">DNB</MenuItem>
            <MenuItem value="DNC">DNC</MenuItem>
            <MenuItem value="DNA">DNA</MenuItem>
          </TextField>
          <TextField
            name="availableFrom"
            label="Available From"
            type="date"
            value={lotData.availableFrom}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            name="availableTo"
            label="Available To"
            type="date"
            value={lotData.availableTo}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
          <div className="col-span-1 md:col-span-2">
            <Button type="submit" variant="contained" color="primary" className="w-full">
              Upload Lot
            </Button>
          </div>
        </form>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};