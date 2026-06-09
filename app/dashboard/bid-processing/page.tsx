"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip,
  Pagination,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Upload, Edit, Cancel, CheckCircle, Delete, ClearAll } from "@mui/icons-material";
import UploadLotForm from "@/app/_components/UploadLotForm";

export type Lot = {
  id: string | number;
  lot_number?: string;
  item_description?: string;
  quantity?: number;
  commission_rate?: string;
  available_from?: string;
  available_to?: string;
  base_price?: number;
};
export default function LotsPage() {
    const [lots, setLots] = useState<Lot[]>([]); // Explicitly define the type of lots
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [editForm, setEditForm] = useState({
    available_from: "",
    available_to: "",
    commission_rate: "",
    base_price: "",
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" | "warning" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);

  const fetchLots = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/alllots`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch lots.");
      }
  
      const data = await response.json();
      setLots(data || []); // Assume API returns { lots: [], totalPages }
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching lots:", error);
      setError("Failed to load lots. Please try again.");
      setSnackbar({ open: true, message: "Failed to load lots.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, []); // Removed 'filters' from the dependency array

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setSnackbar({ open: true, message: "Please select a file.", severity: "error" });
      return;
    }
  
    // Validate file type (e.g., CSV, Excel)
    const validTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type)) {
      setSnackbar({ open: true, message: "Please upload a CSV or Excel file.", severity: "error" });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", localStorage.getItem("userId") || "");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }
  
      setFile(null);
      fetchLots();
      setSnackbar({ open: true, message: "File uploaded successfully!", severity: "success" });
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbar({ open: true, message: "Failed to upload file.", severity: "error" });
    }
  };


  const handleDeleteLot = async (lotId: string | number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${lotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete lot.");
      }
  
      setLots((prevLots) => prevLots.filter((lot) => lot.id !== lotId));
      setSnackbar({ open: true, message: "Lot deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting lot:", error);
      setSnackbar({ open: true, message: "Failed to delete lot.", severity: "error" });
    }
  };

  const handleClearAllLots = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/clear-all`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to clear all lots.");
      }
  
      setLots([]); // Clear the lots from the state
      setSnackbar({ open: true, message: "All lots cleared successfully!", severity: "success" });
    } catch (error) {
      console.error("Error clearing all lots:", error);
      setSnackbar({ open: true, message: "Failed to clear all lots.", severity: "error" });
    }
  };
  
  const handleEditClick = (lot: Lot) => {
    setEditingLot(lot);
    setEditForm({
      available_from: lot.available_from || "",
      available_to: lot.available_to || "",
      commission_rate: lot.commission_rate || "",
      base_price: lot.base_price ? String(lot.base_price) : "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Edit Form Data:", editForm);
    
    

    // Basic validation
    const commission = parseFloat(editForm.commission_rate);
    if (commission < 0 || commission > 100) {
      setSnackbar({ open: true, message: "Commission rate must be between 0 and 100.", severity: "error" });
      return;
    }
    if (new Date(editForm.available_from) > new Date(editForm.available_to)) {
      setSnackbar({ open: true, message: "Available From date cannot be after Available To date.", severity: "error" });
      return;
    }

    try {
      if (!editingLot) {
        throw new Error("No lot is being edited.");
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/${editingLot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update lot.");
      }

      const updatedLot = await response.json();
      setLots((prevLots) =>
        prevLots.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot))
      );
      setEditingLot(null);
      setSnackbar({ open: true, message: "Lot updated successfully!", severity: "success" });
    } catch (error) {
      console.error("Error updating lot:", error);
      setSnackbar({ open: true, message: "Failed to update lot.", severity: "error" });
    }
  };

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const columns = [
    { field: "lot_number", headerName: "Lot Number", width: 120 },
    { field: "item_description", headerName: "Description", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    { field: "commission_rate", headerName: "Commission Rate (%)", width: 180 },
    { field: "available_from", headerName: "Available From", width: 180 },
    { field: "available_to", headerName: "Available To", width: 180 },
    {
      field: "base_price",
      headerName: "Base Price",
      width: 120,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex gap-2">
          <Tooltip title="Edit this lot">
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<Edit />}
              onClick={() => handleEditClick(params.row)}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete this lot">
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={() => handleDeleteLot(params.row.id)}
            >
              Delete
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Lots Management</h1>

        {/* File Upload Form */}
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex-1">
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
            >
              {file ? file.name : "Choose File"}
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!file}
            startIcon={<Upload />}
          >
            Upload Lots
          </Button>
          {file && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setFile(null)}
            >
              Clear
            </Button>
          )}
        </form>
        <UploadLotForm setLots={setLots} />

        <div className="flex justify-end">
          <Button
            variant="contained"
            color="error"
            startIcon={<ClearAll />}
            onClick={handleClearAllLots}
          >
            Clear All Lots
          </Button>
        </div>


        {/* Lots Table */}
        {loading ? (
          <div className="flex justify-center py-10">
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : lots.length === 0 ? (
          <Alert severity="info">
            No lots available. Try uploading a file or refreshing.
          </Alert>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <DataGrid
              rows={lots}
              columns={columns}
              paginationModel={{ pageSize: filters.limit, page: filters.page - 1 }}
              pageSizeOptions={[20]}
              disableRowSelectionOnClick
              autoHeight
              getRowId={(row) => row.id}
              className="border-0"
            />
            <div className="flex justify-center py-4">
              <Pagination
                count={totalPages}
                page={filters.page}
                onChange={(e, page) => setFilters({ ...filters, page: page })}
                color="primary"
              />
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingLot} onClose={() => setEditingLot(null)}>
          <DialogTitle>Edit Lot #{editingLot?.lot_number}</DialogTitle>
          <DialogContent>
            <div className="space-y-2 mb-4">
              <p><strong>Description:</strong> {editingLot?.item_description}</p>
              <p><strong>Quantity:</strong> {editingLot?.quantity}</p>
              <p><strong>Base Price:</strong> ${editingLot?.base_price?.toFixed(2)}</p>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <DatePicker
                label="Available From"
                value={editForm.available_from ? new Date(editForm.available_from) : null}
                onChange={(date) => setEditForm({ ...editForm, available_from: date?.toISOString().split("T")[0] || "" })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Available To"
                value={editForm.available_to ? new Date(editForm.available_to) : null}
                onChange={(date) => setEditForm({ ...editForm, available_to: date?.toISOString().split("T")[0] || "" })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField
                label="Commission Rate (%)"
                type="number"
                inputProps={{ step: "0.01" }}
                value={editForm.commission_rate}
                onChange={(e) => setEditForm({ ...editForm, commission_rate: e.target.value })}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Enter a value between 0 and 100"
              />
                            <TextField
                              label="Base Price"
                              type="number"
                              value={editForm.base_price}
                              onChange={(e) => setEditForm({ ...editForm, base_price: e.target.value })}
                              fullWidth
                              InputProps={{
                                endAdornment: <InputAdornment position="end">$</InputAdornment>,
                              }}
                              helperText="Enter amount in USD"
                            />
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditingLot(null)}
              color="secondary"
              startIcon={<Cancel />}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              color="primary"
              variant="contained"
              startIcon={<CheckCircle />}
              disabled={
                !editForm.available_from ||
                !editForm.available_to ||
                !editForm.commission_rate ||
                parseFloat(editForm.commission_rate) < 0 ||
                parseFloat(editForm.commission_rate) > 100
              }
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
}