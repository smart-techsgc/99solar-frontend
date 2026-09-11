import { toLocalDateString } from '@/utils/date';

export async function fetchTotalRevenue(): Promise<number> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/reports/revenue`);
  if (!response.ok) throw new Error("Failed to fetch revenue");
  const data = await response.json();
  return data.totalRevenue;
}

export async function fetchReportsByDate(date: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/reports?date=${date}`);
  if (!response.ok) throw new Error("Failed to fetch reports");
  return response.json();
}

export async function fetchDashboardStats() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const today = toLocalDateString();
  const response = await fetch(`${apiUrl}/api/reports/dashboard-stats?date=${today}`);
  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  const data = await response.json();
  return {
    monthlyRevenue: Number(data.totalRevenue || 0),
    totalBids: Number(data.totalBidsToday || 0),
    activeCustomers: Number(data.activeCustomers || 0),
    highestBid: data.highestBid || { amount: 0, description: null, date: null },
  };
}

export async function fetchActiveCustomers(_fileName?: string): Promise<number> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/reports/active-customers`);
  if (!response.ok) throw new Error("Failed to fetch active customers");
  const data = await response.json();
  return Number(data.activeCustomers ?? data.customers?.length ?? 0);
}

export async function fetchHighestBid(): Promise<{ amount: number; description: string; date: string }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/reports/highest`);
  if (!response.ok) throw new Error("Failed to fetch highest bid");
  return response.json();
}

export async function fetchRecentActivities() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/reports/recent-activities`);
  if (!response.ok) throw new Error("Failed to fetch recent activities");
  return response.json();
}
