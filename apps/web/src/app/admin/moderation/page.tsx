'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useModerationQueue, useApproveVideo } from '@/hooks/useAdmin';

export default function ModerationPage() {
  const [page, setPage] = useState(1);
  const { videos, total, isLoading, error } = useModerationQueue(page, 20);
  const approveVideo = useApproveVideo();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (videoId: string) => {
    await approveVideo.mutateAsync({ videoId, approved: true });
    setSelectedVideo(null);
  };

  const handleReject = async (videoId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    await approveVideo.mutateAsync({
      videoId,
      approved: false,
      reason: rejectionReason,
    });
    setSelectedVideo(null);
    setRejectionReason('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-200">
        Failed to load moderation queue: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Moderation Queue</h1>
        <p className="text-gray-400 mt-2">Review and approve pending videos</p>
      </div>

      {/* Status */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-200">
          {total} video(s) pending review
        </p>
      </div>

      {/* Videos Grid */}
      {!videos || videos.length === 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-400">No videos pending moderation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video: any) => (
            <div
              key={video.id}
              className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="bg-gray-800 h-40 relative">
                {video.thumbnails?.[0]?.url && (
                  <img
                    src={video.thumbnails[0].url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white truncate">{video.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  by {video.uploader.username}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 rounded bg-blue-900/20 text-blue-300">
                    {video.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(video.id)}
                    disabled={approveVideo.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedVideo(video.id)}
                    disabled={approveVideo.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {videos && videos.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {Math.ceil((total || 1) / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page * 20) >= (total || 0)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Reject Video</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  selectedVideo && handleReject(selectedVideo)
                }
                disabled={approveVideo.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
