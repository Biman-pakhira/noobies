'use client';

import Link from 'next/link';
import { Flag } from 'lucide-react';

interface RecentReportsProps {
  reports?: Array<{
    id: string;
    reason: string;
    status: string;
    createdAt: string;
    video: {
      id: string;
      title: string;
    };
    reporter: {
      id: string;
      username: string;
    };
  }>;
}

const statusColors = {
  OPEN: 'bg-red-900/20 text-red-400',
  RESOLVED: 'bg-green-900/20 text-green-400',
  DISMISSED: 'bg-gray-700/20 text-gray-400',
};

export default function RecentReports({ reports = [] }: RecentReportsProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flag className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
      </div>

      {reports.length === 0 ? (
        <p className="text-gray-400 text-sm">No recent reports</p>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/admin/reports`}
              className="block p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white truncate">{report.video.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reported by {report.reporter.username}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{report.reason}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${
                    statusColors[report.status as keyof typeof statusColors] ||
                    'bg-gray-700 text-gray-300'
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
