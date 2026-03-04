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
export declare function useVideos(page?: number, limit?: number): import("@tanstack/react-query").UseQueryResult<{
    videos: Video[];
    total: number;
    pages: number;
}, Error>;
export declare function useVideo(id: string): import("@tanstack/react-query").UseQueryResult<Video, Error>;
export declare function useTrendingVideos(): import("@tanstack/react-query").UseQueryResult<Video[], Error>;
export declare function useUploadVideo(onProgress?: (progress: number) => void): import("@tanstack/react-query").UseMutationResult<{
    video: Video;
    job: any;
}, any, FormData, unknown>;
export declare function useUploadStatus(jobId: string): import("@tanstack/react-query").UseQueryResult<{
    video: Video;
    job: any;
}, Error>;
/**
 * Get personalized recommendations for the current user
 * Falls back to trending if user is not logged in
 */
export declare function useRecommendations(limit?: number): import("@tanstack/react-query").UseQueryResult<Recommendation[], Error>;
/**
 * Get trending videos for recommendations
 */
export declare function useRecommendationsTrending(limit?: number): import("@tanstack/react-query").UseQueryResult<TrendingVideo[], Error>;
//# sourceMappingURL=useVideos.d.ts.map