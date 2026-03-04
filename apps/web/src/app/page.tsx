'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VideoCard } from '@/components/VideoCard';
import { useVideos, useTrendingVideos, useRecommendations, useRecommendationsTrending } from '@/hooks/useVideos';
import { useAuthStore } from '@/lib/auth';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'trending' | 'recommendations'>('home');
  const { user } = useAuthStore();
  const { data: videosData, isLoading: videosLoading } = useVideos();
  const { data: trendingData, isLoading: trendingLoading } = useTrendingVideos();
  const { data: recommendationsData, isLoading: recommendationsLoading } = useRecommendations(20);
  const { data: recommendationsTrendingData } = useRecommendationsTrending(20);

  // Map recommendation data to video format for VideoCard
  const recommendedVideos = recommendationsData?.map((rec) => ({
    id: rec.video_id,
    title: rec.title,
    description: rec.reason || 'Recommended for you',
    duration: 0,
    views: 0,
    likes: 0,
    dislikes: 0,
    status: 'READY' as const,
    author: { id: '', username: 'Unknown', avatar: '' },
    thumbnail: { url: rec.thumbnail || '' },
    videoFiles: [],
    createdAt: new Date().toISOString(),
  })) || [];

  const recommendedTrendingVideos = recommendationsTrendingData?.map((rec) => ({
    id: rec.video_id,
    title: rec.title,
    description: `${rec.views} views • ${rec.likes} likes`,
    duration: 0,
    views: rec.views,
    likes: rec.likes,
    dislikes: 0,
    status: 'READY' as const,
    author: { id: '', username: 'Unknown', avatar: '' },
    thumbnail: { url: rec.thumbnail || '' },
    videoFiles: [],
    createdAt: new Date().toISOString(),
  })) || [];

  let displayVideos = null;
  let isLoading = false;

  switch (activeTab) {
    case 'trending':
      displayVideos = trendingData;
      isLoading = trendingLoading;
      break;
    case 'recommendations':
      displayVideos = recommendedVideos.length > 0 ? recommendedVideos : recommendedTrendingVideos;
      isLoading = recommendationsLoading;
      break;
    case 'home':
    default:
      displayVideos = videosData?.videos;
      isLoading = videosLoading;
      break;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to noobies</h1>
          <p className="text-gray-400 mb-6">
            {user
              ? 'Discover personalized videos powered by AI recommendations'
              : 'Discover amazing videos from our community'}
          </p>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('home')}
              className={`pb-2 px-4 font-semibold transition whitespace-nowrap ${activeTab === 'home'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`pb-2 px-4 font-semibold transition whitespace-nowrap ${activeTab === 'trending'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              Trending
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`pb-2 px-4 font-semibold transition whitespace-nowrap flex items-center gap-2 ${activeTab === 'recommendations'
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                <span>🤖</span>
                For You
              </button>
            )}
          </div>
        </div>

        {/* Recommendation Info (if not logged in) */}
        {activeTab === 'recommendations' && !user && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <p className="text-gray-400 mb-4">
              Sign in to get personalized video recommendations powered by AI.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Videos Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500" />
          </div>
        ) : displayVideos && displayVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {activeTab === 'recommendations'
                ? 'No recommendations yet. Start watching videos!'
                : 'No videos found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
