import { useGetQuery, useUploadMutation } from './useApi';
import { useAuthStore } from '@/lib/auth';
export function useVideos(page = 1, limit = 12) {
    return useGetQuery(['videos', `${page}`], `/api/videos?page=${page}&limit=${limit}`);
}
export function useVideo(id) {
    return useGetQuery(['video', id], `/api/videos/${id}`);
}
export function useTrendingVideos() {
    return useGetQuery(['trending'], '/api/videos/trending');
}
export function useUploadVideo(onProgress) {
    return useUploadMutation('/api/videos/upload', onProgress);
}
export function useUploadStatus(jobId) {
    return useGetQuery(['upload-status', jobId], `/api/videos/upload/${jobId}`, { refetchInterval: 2000 });
}
/**
 * Get personalized recommendations for the current user
 * Falls back to trending if user is not logged in
 */
export function useRecommendations(limit = 10) {
    const { user } = useAuthStore();
    return useGetQuery(['recommendations', user?.id || ''], `/api/recommendations/${user?.id || 'anonymous'}?limit=${limit}`, {
        enabled: !!user?.id, // Only fetch if user is logged in
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
/**
 * Get trending videos for recommendations
 */
export function useRecommendationsTrending(limit = 20) {
    return useGetQuery(['recommendations-trending', `${limit}`], `/api/recommendations/trending?limit=${limit}`, {
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
}
//# sourceMappingURL=useVideos.js.map