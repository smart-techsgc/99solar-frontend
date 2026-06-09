export type Bid = {
  bid_id: string;
  bid_time: string;
  bid_amount: number;
  lot_id: string;
  lot_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  status: "pending" | "awarded" | "rejected";
};

export type LotWithBids = {
  lot_id: string;
  lot_number: string;
  item_description: string;
  highest_bid: number;
  bid_count: number;
  bids: Bid[];
};

export type BidFilters = {
  status: string;
  lot_id: string;
  user_id: string;
  page: number;
  limit: number;
};

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
};