'use client';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useVideo } from '@/hooks/useVideos';
import { useAuthStore } from '@/lib/auth';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';
export default function WatchPage() {
    const params = useParams();
    const videoId = params.id;
    const { data: video, isLoading } = useVideo(videoId);
    const { user } = useAuthStore();
    useEffect(() => {
        // Record watch history
        if (video) {
            apiClient.post(`/api/users/me/history`, { videoId });
        }
    }, [video?.id]);
    const handleLike = async () => {
        if (!user) {
            toast.error('Please login to like videos');
            return;
        }
        try {
            await apiClient.post(`/api/videos/${videoId}/like`);
            toast.success('Video liked!');
        }
        catch (error) {
            toast.error('Failed to like video');
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500"/>
      </div>);
    }
    if (!video) {
        return (<div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Video not found</p>
      </div>);
    }
    // Get the best available quality
    const streamUrl = video.videoFiles?.[0]?.url;
    const qualityOptions = video.videoFiles?.map((f) => f.resolution) || [];
    return (<div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Video Player */}
        {streamUrl ? (<VideoPlayer url={streamUrl} poster={video.thumbnail?.url} title={video.title} className="mb-8"/>) : (<div className="aspect-video bg-gray-900 rounded-lg mb-8 flex items-center justify-center">
            <p className="text-gray-400">
              {video.status === 'PROCESSING'
                ? 'Video is being processed...'
                : 'Video not available'}
            </p>
          </div>)}

        {/* Video Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                {video.author.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{video.author.username}</p>
                <p className="text-sm text-gray-400">
                  {video.author.username} channel
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 ml-auto">
              <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-900 rounded transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H5a2 2 0 01-2-2V9a2 2 0 012-2h6.236a1 1 0 00.894-.553l1.342-2.694a1 1 0 00-.894-1.447H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                </svg>
                <span className="text-sm">{video.likes}</span>
              </button>

              <div className="text-gray-400 text-sm">
                <p>{video.views.toLocaleString()} views</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">About this video</h2>
            <p className="text-gray-400 whitespace-pre-wrap">{video.description}</p>
          </div>

          {/* Quality Options */}
          {qualityOptions.length > 0 && (<div className="mb-8 p-4 bg-gray-900 rounded-lg">
              <h3 className="font-semibold mb-2">Available Qualities</h3>
              <div className="flex flex-wrap gap-2">
                {qualityOptions.map((quality) => (<span key={quality} className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300">
                    {quality}
                  </span>))}
              </div>
            </div>)}
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded">
              <p className="text-gray-400 text-center">Comments coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map