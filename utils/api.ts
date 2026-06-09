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
  const [revenueRes, reportsRes] = await Promise.all([
    fetch(`${apiUrl}/api/reports/revenue`),
    fetch(`${apiUrl}/api/reports?date=${new Date().toISOString().split('T')[0]}`),
  ]);
  if (!revenueRes.ok || !reportsRes.ok) throw new Error("Failed to fetch stats");
  const revenueData = await revenueRes.json();
  const reports = await reportsRes.json();
  const allBids = reports.flatMap((r: any) => Array.isArray(r.report_data) ? r.report_data : []);
  return {
    monthlyRevenue: revenueData.totalRevenue,
    totalBids: allBids.length,
  };
}

export async function fetchActiveCustomers(fileName: string): Promise<number> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/api/reports/active-customers?fileName=${encodeURIComponent(fileName)}`);
  if (!response.ok) throw new Error("Failed to fetch active customers");
  const data = await response.json();
  return data.activeCustomers;
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