import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';
export function useGetQuery(key, url, options) {
    return useQuery({
        queryKey: Array.isArray(key) ? key : [key],
        queryFn: async () => {
            const response = await apiClient.get(url);
            return response.data.data;
        },
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}
export function usePostMutation(url, options) {
    return useMutation({
        mutationFn: async (data) => {
            const response = await apiClient.post(url, data);
            return response.data.data;
        },
        onError: (error) => {
            const message = error.response?.data?.error?.message || 'An error occurred';
            toast.error(message);
        },
        ...options,
    });
}
export function useUploadMutation(url, onProgress, options) {
    return useMutation({
        mutationFn: async (data) => {
            const response = await apiClient.post(url, data, {
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            });
            return response.data.data;
        },
        onError: (error) => {
            const message = error.response?.data?.error?.message || 'An error occurred';
            toast.error(message);
        },
        ...options,
    });
}
export function useDeleteMutation(url, options) {
    return useMutation({
        mutationFn: async () => {
            const response = await apiClient.delete(url);
            return response.data.data;
        },
        onError: (error) => {
            const message = error.response?.data?.error?.message || 'An error occurred';
            toast.error(message);
        },
        ...options,
    });
}
//# sourceMappingURL=useApi.js.map