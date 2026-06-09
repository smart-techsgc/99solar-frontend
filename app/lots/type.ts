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

export type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

export type Filters = {
  page: number;
  limit: number;
};