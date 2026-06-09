// app/bids/components/BidsTable.tsx
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams 
} from "@mui/x-data-grid";
import { 
  Button, 
  Tooltip, 
  Pagination, 
  CircularProgress, 
  Alert 
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Bid, BidFilters } from "@/app/lots/bids/type";

interface BidsTableProps {
  bids: Bid[];
  loading: boolean;
  filters: BidFilters;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAwardClick: (bid: Bid) => void;
}

export default function BidsTable({
  bids,
  loading,
  filters,
  totalPages,
  onPageChange,
  onAwardClick
}: BidsTableProps) {
  const columns: GridColDef[] = [
    { field: "bid_time", headerName: "Bid Time", width: 180 },
    { field: "lot_number", headerName: "Lot ID", width: 120 },
    { field: "user_name", headerName: "User", width: 150 },
    { field: "user_email", headerName: "Email", width: 200 },
    { 
      field: "bid_amount", 
      headerName: "Amount", 
      width: 120,
      valueFormatter: (params: { value: number }) => `$${params.value.toFixed(2)}`
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      renderCell: (params) => (
        <span className={`font-medium ${
          params.value === "awarded" ? "text-green-600" : 
          params.value === "rejected" ? "text-red-600" : "text-amber-600"
        }`}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        params.row.status === "pending" && (
          <Tooltip title="Award bid">
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={() => onAwardClick(params.row)}
            >
              Award
            </Button>
          </Tooltip>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <CircularProgress size={60} />
      </div>
    );
  }

  if (!bids.length) {
    return (
      <Alert severity="info" className="my-6">
        No bids found. Try adjusting your filters.
      </Alert>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <DataGrid
        rows={bids}
        columns={columns}
        getRowId={(row) => row.bid_id}
        paginationModel={{ page: filters.page - 1, pageSize: filters.limit }}
        pageSizeOptions={[filters.limit]}
        disableRowSelectionOnClick
        autoHeight
        hideFooter
        className="border-0"
      />
      
      <div className="flex justify-center py-4 border-t">
        <Pagination
          count={totalPages}
          page={filters.page}
          onChange={(_, page) => onPageChange(page)}
          color="primary"
          shape="rounded"
        />
      </div>
    </div>
  );
}