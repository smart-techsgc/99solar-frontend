'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FileText, Upload, Award, CheckCircle } from 'lucide-react';
import { fetchRecentActivities } from '@/utils/api';

const iconMap = {
  report: FileText,
  bid: Upload,
  award: Award,
  invoice: CheckCircle,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  type ActivityType = keyof typeof iconMap;

  interface Activity {
    type: ActivityType;
    description: string;
    date: string;
    fileName?: string;
  }
  
  useEffect(() => {
    fetchRecentActivities().then(setActivities).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => {
        const Icon = iconMap[activity.type] || FileText;
        return (
          <div key={idx} className="flex items-start">
            <div className="flex-shrink-0 text-blue-500">
              <Icon className="w-5 h-5" />
            </div>
            <div className="ml-3 space-y-0.5">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(activity.date), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}