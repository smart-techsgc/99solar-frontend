"use client";

import { useState, useEffect, useCallback } from "react";
import { CircularProgress, Snackbar, Tabs, Tab } from "@mui/material";
import { Bid, LotWithBids, SnackbarState } from "@/app/lots/bids/type";
import { fetchLotsWithBids } from "./api/bidService";
import LotsTable from "../components/LotsTable";
import LotBidsTable from "../components/LotBidsTable";
import AwardBidDialog from "../components/AwardBidDialog";

export default function BidManagementPage() {
  const [lots, setLots] = useState<LotWithBids[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedLot, setSelectedLot] = useState<LotWithBids | null>(null);
  const [awardingBid, setAwardingBid] = useState<Bid | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const showNotification = (
    message: string,
    severity: SnackbarState["severity"]
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLotsWithBids();
      setLots(data);
      if (!selectedLot && data.length > 0) {
        setSelectedLot(data[0]);
      }
    } catch {
      showNotification("Failed to load bid data", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedLot]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAwardSuccess = (updatedBid: Bid) => {
    if (!selectedLot) return;
    
    const updatedBids = selectedLot.bids.map(bid => 
      bid.bid_id === updatedBid.bid_id ? updatedBid : bid
    );
    
    const updatedLots = lots.map(lot => 
      lot.lot_id === selectedLot.lot_id 
        ? { ...lot, bids: updatedBids } 
        : lot
    );
    
    setLots(updatedLots);
    setSelectedLot({ ...selectedLot, bids: updatedBids });
    showNotification("Bid awarded successfully", "success");
    setAwardingBid(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Bid Management</h1>

      <Tabs value={activeTab} onChange={handleTabChange} className="mb-6">
        <Tab label="All Lots" />
        <Tab 
          label="Lot Details" 
          disabled={!selectedLot} 
        />
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-12">
          <CircularProgress size={60} />
        </div>
      ) : (
        <>
          {activeTab === 0 && (
            <LotsTable
              lots={lots}
              selectedLot={selectedLot}
              onSelectLot={(lot) => {
                setSelectedLot(lot);
                setActiveTab(1);
              }}
            />
          )}

          {activeTab === 1 && selectedLot && (
            <LotBidsTable
              lot={selectedLot}
              onAwardBid={setAwardingBid}
              onRefresh={loadData}
            />
          )}
        </>
      )}

      {awardingBid && (
        <AwardBidDialog
          bid={awardingBid}
          onClose={() => setAwardingBid(null)}
          onSuccess={handleAwardSuccess}
          showNotification={showNotification}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <div className={`px-4 py-2 rounded shadow-lg ${
          snackbar.severity === "success" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {snackbar.message}
        </div>
      </Snackbar>
    </div>
  );
}