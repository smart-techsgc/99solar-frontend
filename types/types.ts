export interface BidData {
  listingId: string;
  oem: string;
  sku: string;
  description: string;
  disposition: string;
  quantity: number;
  unitPrice: number | null;
  originalUnitPrice?: number | null;
  fileName: string;
  commissionAmount?: number;
  customerCode?: string;
}

export interface SavedReport {
  id: number;
  report_date: string;
  report_data: BidData[];
  created_at: string;
  item_count?: number;
}