import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';

export function useGetQuery<T>(
  key: string | string[],
  url: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
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

export function usePostMutation<T, V = any>(
  url: string,
  options?: UseMutationOptions<T, any, V>
) {
  return useMutation<T, any, V>({
    mutationFn: async (data: V) => {
      const response = await apiClient.post(url, data);
      return response.data.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'An error occurred';
      toast.error(message);
    },
    ...options,
  });
}

export function useUploadMutation<T, V = any>(
  url: string,
  onProgress?: (progress: number) => void,
  options?: UseMutationOptions<T, any, V>
) {
  return useMutation<T, any, V>({
    mutationFn: async (data: V) => {
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
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'An error occurred';
      toast.error(message);
    },
    ...options,
  });
}

export function useDeleteMutation<T>(
  url: string,
  options?: UseMutationOptions<T, any, void>
) {
  return useMutation<T, any, void>({
    mutationFn: async () => {
      const response = await apiClient.delete(url);
      return response.data.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'An error occurred';
      toast.error(message);
    },
    ...options,
  });
}
