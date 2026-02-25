'use client';

import Link from 'next/link';
import { Video } from 'lucide-react';

interface RecentVideosProps {
  videos?: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    uploader: {
      id: string;
      username: string;
    };
  }>;
}

const statusColors = {
  READY: 'bg-green-900/20 text-green-400',
  PROCESSING: 'bg-blue-900/20 text-blue-400',
  FLAGGED: 'bg-red-900/20 text-red-400',
  REJECTED: 'bg-red-900/20 text-red-400',
};

export default function RecentVideos({ videos = [] }: RecentVideosProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Video className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-white">Recent Videos</h3>
      </div>

      {videos.length === 0 ? (
        <p className="text-gray-400 text-sm">No recent videos</p>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/admin/moderation`}
              className="block p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white truncate">{video.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    by {video.uploader.username}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${
                    statusColors[video.status as keyof typeof statusColors] ||
                    'bg-gray-700 text-gray-300'
                  }`}
                >
                  {video.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
