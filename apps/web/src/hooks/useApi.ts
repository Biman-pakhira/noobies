import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from 'react-query';
import apiClient from '@/lib/api';
import toast from 'react-hot-toast';

export function useGetQuery<T>(
  key: string | string[],
  url: string,
  options?: UseQueryOptions<T>
) {
  return useQuery<T>(
    key,
    async () => {
      const response = await apiClient.get(url);
      return response.data.data;
    },
    {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

export function usePostMutation<T, V = any>(
  url: string,
  options?: UseMutationOptions<T, any, V>
) {
  return useMutation<T, any, V>(
    async (data: V) => {
      const response = await apiClient.post(url, data);
      return response.data.data;
    },
    {
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || 'An error occurred';
        toast.error(message);
      },
      ...options,
    }
  );
}

export function useDeleteMutation<T>(
  url: string,
  options?: UseMutationOptions<T, any, void>
) {
  return useMutation<T, any, void>(
    async () => {
      const response = await apiClient.delete(url);
      return response.data.data;
    },
    {
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || 'An error occurred';
        toast.error(message);
      },
      ...options,
    }
  );
}
