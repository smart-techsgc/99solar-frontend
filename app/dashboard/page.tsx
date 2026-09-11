'use client';

import { useEffect, useState } from "react";
import { Users, DollarSign, Gavel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { OverviewChart } from '../_components/overview-charts';
import { RecentActivity } from '../_components/recent-activity';
import { fetchDashboardStats } from "@/utils/api";

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { title: 'Total Bids', value: '...', icon: Gavel, change: '' },
    { title: 'Active Customers', value: '...', icon: Users, change: '' },
    { title: 'Highest Bid', value: '...', icon: DollarSign, change: '' },
    { title: 'Monthly Revenue', value: '...', icon: DollarSign, change: '' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('isAuthenticated')) {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    fetchDashboardStats()
      .then((dashboard) => {
        if (cancelled) return;
        setStats([
          {
            title: 'Total Bids Today',
            value: dashboard.totalBids.toLocaleString(),
            icon: Gavel,
            change: '',
          },
          {
            title: 'Active Customers',
            value: dashboard.activeCustomers.toLocaleString(),
            icon: Users,
            change: '',
          },
          {
            title: 'Highest Bid',
            value: `$${(dashboard.highestBid.amount || 0).toLocaleString()}`,
            icon: DollarSign,
            change: `${dashboard.highestBid.description || ''} (${
              dashboard.highestBid.date
                ? new Date(dashboard.highestBid.date).toLocaleDateString()
                : ''
            })`,
          },
          {
            title: 'Monthly Revenue',
            value: `$${dashboard.monthlyRevenue.toLocaleString()}`,
            icon: DollarSign,
            change: '',
          },
        ]);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError('Failed to load dashboard stats');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 h-full overflow-scroll">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-[400px]">
        <Card className="col-span-4 h-full">
          <CardHeader>
            <CardTitle>Bid Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-57px)]">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="col-span-3 h-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-57px)] overflow-y-auto">
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
