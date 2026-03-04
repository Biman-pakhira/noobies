'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
/**
 * Hook for admin dashboard stats
 */
export function useAdminDashboard() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
                credentials: 'include',
            });
            if (!response.ok)
                throw new Error('Failed to fetch dashboard');
            const json = await response.json();
            return json.data;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });
    return {
        stats: data?.stats,
        recentVideos: data?.recentVideos,
        recentReports: data?.recentReports,
        isLoading,
        error: error ? 'Failed to load dashboard' : null,
    };
}
/**
 * Hook for moderation queue
 */
export function useModerationQueue(page = 1, pageSize = 20) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['moderation-queue', page],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/admin/moderation?page=${page}&pageSize=${pageSize}`, { credentials: 'include' });
            if (!response.ok)
                throw new Error('Failed to fetch moderation queue');
            const json = await response.json();
            return json.data;
        },
    });
    return { videos: data?.videos, total: data?.total, page, pageSize, isLoading, error };
}
/**
 * Hook for approving/rejecting videos
 */
export function useApproveVideo() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async ({ videoId, approved, reason }) => {
            const response = await fetch(`${API_BASE}/api/admin/moderation/${videoId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ approved, reason }),
            });
            if (!response.ok)
                throw new Error('Failed to update video');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        },
    });
    return mutation;
}
/**
 * Hook for getting reports
 */
export function useReports(page = 1, pageSize = 20, status = 'OPEN') {
    const { data, isLoading, error } = useQuery({
        queryKey: ['reports', page, status],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/admin/reports?page=${page}&pageSize=${pageSize}&status=${status}`, { credentials: 'include' });
            if (!response.ok)
                throw new Error('Failed to fetch reports');
            const json = await response.json();
            return json.data;
        },
    });
    return { reports: data?.reports, total: data?.total, page, pageSize, isLoading, error };
}
/**
 * Hook for handling reports
 */
export function useHandleReport() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async ({ reportId, action, notes }) => {
            const response = await fetch(`${API_BASE}/api/admin/reports/${reportId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action, notes }),
            });
            if (!response.ok)
                throw new Error('Failed to handle report');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        },
    });
    return mutation;
}
/**
 * Hook for user analytics
 */
export function useUserAnalytics() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-users'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/admin/analytics/users`, {
                credentials: 'include',
            });
            if (!response.ok)
                throw new Error('Failed to fetch user analytics');
            const json = await response.json();
            return json.data;
        },
    });
    return { data, isLoading, error };
}
/**
 * Hook for platform analytics
 */
export function usePlatformAnalytics() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-platform'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/api/admin/analytics/platform`, {
                credentials: 'include',
            });
            if (!response.ok)
                throw new Error('Failed to fetch platform analytics');
            const json = await response.json();
            return json.data;
        },
    });
    return { data, isLoading, error };
}
//# sourceMappingURL=useAdmin.js.map