import { useGetQuery, usePostMutation, useUploadMutation } from './useApi';
import { useAuthStore } from '@/lib/auth';

export interface Video {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  thumbnail: {
    url: string;
  };
  videoFiles: Array<{
    resolution: string;
    url: string;
  }>;
  createdAt: string;
}

export interface Recommendation {
  video_id: string;
  title: string;
  thumbnail?: string;
  score: number;
  reason: string;
  category?: string;
}

export interface TrendingVideo {
  video_id: string;
  title: string;
  thumbnail?: string;
  views: number;
  likes: number;
  trend_score: number;
  category?: string;
}

export function useVideos(page = 1, limit = 12) {
  return useGetQuery<{ videos: Video[]; total: number; pages: number }>(
    ['videos', `${page}`],
    `/api/videos?page=${page}&limit=${limit}`
  );
}

export function useVideo(id: string) {
  return useGetQuery<Video>(['video', id], `/api/videos/${id}`);
}

export function useTrendingVideos() {
  return useGetQuery<Video[]>(['trending'], '/api/videos/trending');
}

export function useUploadVideo(onProgress?: (progress: number) => void) {
  return useUploadMutation<{ video: Video; job: any }, FormData>(
    '/api/videos/upload',
    onProgress
  );
}

export function useUploadStatus(jobId: string) {
  return useGetQuery<{ video: Video; job: any }>(
    ['upload-status', jobId],
    `/api/videos/upload/${jobId}`,
    { refetchInterval: 2000 }
  );
}

/**
 * Get personalized recommendations for the current user
 * Falls back to trending if user is not logged in
 */
export function useRecommendations(limit = 10) {
  const { user } = useAuthStore();

  return useGetQuery<Recommendation[]>(
    ['recommendations', user?.id || ''],
    `/api/recommendations/${user?.id || 'anonymous'}?limit=${limit}`,
    {
      enabled: !!user?.id, // Only fetch if user is logged in
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Get trending videos for recommendations
 */
export function useRecommendationsTrending(limit = 20) {
  return useGetQuery<TrendingVideo[]>(
    ['recommendations-trending', `${limit}`],
    `/api/recommendations/trending?limit=${limit}`,
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}
