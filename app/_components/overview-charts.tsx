'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyStat {
  month: string;
  count: number;
}

export function OverviewChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [submittedData, setSubmittedData] = useState<number[]>([]);
  const [awardedData, setAwardedData] = useState<number[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/reports/monthly-stats`);
      if (!res.ok) return;
      const stats = await res.json();

      // Ensure months are aligned
      const months = stats.submitted.map((row: MonthlyStat) => row.month);
      setLabels(months);

      setSubmittedData(stats.submitted.map((row: MonthlyStat) => Number(row.count)));
      setAwardedData(stats.awarded.map((row: MonthlyStat) => Number(row.count)));
    }
    fetchStats();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Bids Submitted',
        data: submittedData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Bids Awarded',
        data: awardedData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      },
    ],
  };

  return <Line options={options} data={data} />;
}