/**
 * Hook for admin dashboard stats
 */
export declare function useAdminDashboard(): {
    stats: any;
    recentVideos: any;
    recentReports: any;
    isLoading: boolean;
    error: string | null;
};
/**
 * Hook for moderation queue
 */
export declare function useModerationQueue(page?: number, pageSize?: number): {
    videos: any;
    total: any;
    page: number;
    pageSize: number;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Hook for approving/rejecting videos
 */
export declare function useApproveVideo(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    videoId: string;
    approved: boolean;
    reason?: string;
}, unknown>;
/**
 * Hook for getting reports
 */
export declare function useReports(page?: number, pageSize?: number, status?: string): {
    reports: any;
    total: any;
    page: number;
    pageSize: number;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Hook for handling reports
 */
export declare function useHandleReport(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    reportId: string;
    action: "dismiss" | "delete_video";
    notes?: string;
}, unknown>;
/**
 * Hook for user analytics
 */
export declare function useUserAnalytics(): {
    data: any;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Hook for platform analytics
 */
export declare function usePlatformAnalytics(): {
    data: any;
    isLoading: boolean;
    error: Error | null;
};
//# sourceMappingURL=useAdmin.d.ts.map