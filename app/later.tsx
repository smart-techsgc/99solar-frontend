"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DataGrid,
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
  Avatar,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { Gavel, Cancel, CheckCircle, Logout, Person } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

interface Lot {
  id: number;
  lot_number: string;
  item_description: string;
  quantity: number;
  base_price: number;
  current_bid?: number;
  bid_status?: string;
}

interface Bid {
  id: number;
  bid_id: number;
  lot_id: number;
  lot_number: string;
  bid_amount: number;
  status: string;
  created_at: string;
}

export default function LotsAndBidsPage() {
  const router = useRouter();
  const [lots, setLots] = useState<Lot[]>([]);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [placingBid, setPlacingBid] = useState<Lot | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" | "warning" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "user@example.com",
    bids_placed: 0,
    active_bids: 0,
    won_bids: 0,
  });

useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      setSnackbar({
        open: true,
        message: "You need to log in to access this page.",
        severity: "warning",
      });
      router.push("/login");
    }
  }, [router]);

  const fetchLots = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [key, String(value)])
        )
      ).toString();
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lots/alllots?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch lots.");
      }
  
      const data = await response.json();
      
      // Check if the response is an array
      if (Array.isArray(data)) {
        setLots(data); // Set the lots directly
        setTotalPages(1); // Default to 1 page if pagination is not provided
      } else if (data.lots && Array.isArray(data.lots)) {
        setLots(data.lots); // Handle the case where lots are wrapped in a "lots" field
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Invalid lots data:", data);
        setLots([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching lots:", error);
      setError("Failed to load lots. Please try again.");
      setSnackbar({ open: true, message: "Failed to load lots.", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchUserBids = useCallback(async () => {
    setProfileLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/user/${localStorage.getItem("userId")}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch user bids.");
      }
  
      const data = await response.json();
      setUserBids(data.bids || []);
    } catch {
      setSnackbar({ open: true, message: "Failed to load your bids.", severity: "error" });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/${localStorage.getItem("userId")}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }
  
      const data = await response.json();
      setUserProfile({
        name: data.name || "User",
        email: data.email || "user@example.com",
        bids_placed: data.bids_placed || 0,
        active_bids: data.active_bids || 0,
        won_bids: data.won_bids || 0,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  const handleBidSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const bidValue = parseFloat(bidAmount);
  
    if (!placingBid) {
      setSnackbar({
        open: true,
        message: "No lot selected for bidding.",
        severity: "error",
      });
      return;
    }
  
    if (bidValue <= placingBid.base_price) {
      setSnackbar({
        open: true,
        message: `Bid must be higher than the base price ($${placingBid.base_price}).`,
        severity: "error",
      });
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/addbid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          lot_id: placingBid.id,
          bid_amount: bidValue,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to place bid.");
      }
  
      setPlacingBid(null);
      setBidAmount("");
      fetchLots();
      fetchUserBids();
      fetchUserProfile();
      setSnackbar({ open: true, message: "Bid placed successfully!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to place bid.", severity: "error" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  // const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  // };

  useEffect(() => {
    fetchLots();
    fetchUserBids();
    fetchUserProfile();
  }, [fetchLots, fetchUserBids, fetchUserProfile]);

  const columns = [
    { field: "lot_number", headerName: "Lot ID", width: 100 },
    { field: "item_description", headerName: "Description", width: 200 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    {
      field: "base_price",
      headerName: "Base Price",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        return params.value !== null && !isNaN(params.value)
          ? `$${Number(params.value).toFixed(2)}`
          : "-";
      },
    },
    {
      field: "current_bid",
      headerName: "Current Bid",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? `$${params.value.toFixed(2)}` : "-"
      ),
    },
    {
      field: "bid_status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return "-";
        const color = params.value === "winning" ? "success" : params.value === "outbid" ? "error" : "warning";
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Place a bid on this lot">
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Gavel />}
            onClick={() => setPlacingBid(params.row)}
          >
            Place Bid
          </Button>
        </Tooltip>
      ),
    },
  ];

  const bidColumns = [
    { field: "lot_number", headerName: "Lot ID", width: 100 },
    {
      field: "bid_amount",
      headerName: "Bid Amount",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const value = Number(params.value);
        return !isNaN(value) ? `$${value.toFixed(2)}` : "-";
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const color =
          params.value === "winning"
            ? "success"
            : params.value === "outbid"
            ? "error"
            : "warning";
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    { field: "bid_time", headerName: "Date", width: 150 },
  ];


  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* <AppBar position="static" color="primary" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Favorite sx={{ mr: 1 }} /> Auction House
            </Typography>
            
            <IconButton color="inherit" onClick={() => setActiveTab(0)}>
              <Tooltip title="Home">
                <Home />
              </Tooltip>
            </IconButton>
            
            <IconButton color="inherit">
              <Badge badgeContent={userProfile.active_bids} color="secondary">
                <Tooltip title="Your Bids">
                  <Notifications />
                </Tooltip>
              </Badge>
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-controls="user-menu"
              aria-haspopup="true"
            >
              <AccountCircle />
            </IconButton>
            
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { setActiveTab(1); handleMenuClose(); }}>
                <Person sx={{ mr: 1 }} /> My Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar> */}

        <div className="container mx-auto p-6">
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Auction Lots" icon={<Gavel />} />
            <Tab label="My Bids" icon={<Person />} />
          </Tabs>

          {activeTab === 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h4" component="h1">
                  Available Lots
                </Typography>
                <div className="flex items-center space-x-2">
                  <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    color="secondary"
                    sx={{ input: { color: 'white' } }}
                  />
                  <Button variant="contained" color="secondary">
                    Filter
                  </Button>
                </div>
              </div>

              {/* Lots Table */}
              {loading ? (
                <div className="flex justify-center py-10">
                  <CircularProgress color="secondary" />
                </div>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
                  <DataGrid
                    rows={lots}
                    columns={columns}
                    paginationModel={{ pageSize: filters.limit, page: filters.page - 1 }}
                    pageSizeOptions={[20]}
                    disableRowSelectionOnClick
                    autoHeight
                    getRowId={(row) => row.id}
                    sx={{
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid rgba(81, 81, 81, 1)',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  />
                  <div className="flex justify-center py-4">
                    <Pagination
                      count={totalPages}
                      page={filters.page}
                      onChange={(e, page) => setFilters({ ...filters, page: page })}
                      color="secondary"
                    />
                  </div>
                </Paper>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <Card sx={{ bgcolor: 'background.paper' }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {userProfile.name.charAt(0)}
                    </Avatar>
                  }
                  title={userProfile.name}
                  subheader={userProfile.email}
                  action={
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      startIcon={<Logout />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  }
                />
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Total Bids</Typography>
                      <Typography variant="h4" color="secondary">{userProfile.bids_placed}</Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Active Bids</Typography>
                      <Typography variant="h4" color="primary">{userProfile.active_bids}</Typography>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">Won Bids</Typography>
                      <Typography variant="h4" color="success.main">{userProfile.won_bids}</Typography>
                    </Paper>
                  </div>
                </CardContent>
              </Card>

              <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Your Bidding History</Typography>
              
              {profileLoading ? (
                <div className="flex justify-center py-10">
                  <CircularProgress color="secondary" />
                </div>
              ) : userBids.length === 0 ? (
                <Alert severity="info">You have not placed any bids yet.</Alert>
              ) : (
                <Paper elevation={3}>
                  <DataGrid
                    rows={userBids}
                    columns={bidColumns}
                    pageSizeOptions={[10, 20]}
                    disableRowSelectionOnClick
                    autoHeight
                    getRowId={(row) => row.bid_id} // Use bid_id as the unique identifier
                    sx={{
                      '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid rgba(81, 81, 81, 1)',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  />
                </Paper>
              )}
            </div>
          )}

          {/* Bid Dialog */}
          <Dialog open={!!placingBid} onClose={() => setPlacingBid(null)} PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
            <DialogTitle>Place Bid for Lot #{placingBid?.lot_number}</DialogTitle>
            <DialogContent>
              <div className="space-y-2 mb-4">
                <p><strong>Description:</strong> {placingBid?.item_description}</p>
                <p><strong>Quantity:</strong> {placingBid?.quantity}</p>
                <p><strong>Base Price:</strong> ${Number(placingBid?.base_price || 0).toFixed(2)}</p>
                {placingBid?.current_bid && (
                  <p><strong>Current Highest Bid:</strong> ${Number(placingBid.current_bid).toFixed(2)}</p>
                )}
              </div>
              <form onSubmit={handleBidSubmit}>
                <TextField
                  label="Bid Amount"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  fullWidth
                  required
                  color="secondary"
                  sx={{ input: { color: 'white' } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText={`Must be higher than $${Number(placingBid?.current_bid || placingBid?.base_price || 0).toFixed(2)}`}
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setPlacingBid(null)}
                color="secondary"
                startIcon={<Cancel />}
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleBidSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }}
                color="primary"
                variant="contained"
                startIcon={<CheckCircle />}
                disabled={!bidAmount || parseFloat(bidAmount) <= (placingBid?.current_bid || placingBid?.base_price || 0)}
              >
                Submit Bid
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
      </div>
    </ThemeProvider>
  );
}