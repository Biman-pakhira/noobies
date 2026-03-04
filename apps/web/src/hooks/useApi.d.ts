import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
export declare function useGetQuery<T>(key: string | string[], url: string, options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>): import("@tanstack/react-query").UseQueryResult<import("@tanstack/react-query").NoInfer<T>, Error>;
export declare function usePostMutation<T, V = any>(url: string, options?: UseMutationOptions<T, any, V>): import("@tanstack/react-query").UseMutationResult<T, any, V, unknown>;
export declare function useUploadMutation<T, V = any>(url: string, onProgress?: (progress: number) => void, options?: UseMutationOptions<T, any, V>): import("@tanstack/react-query").UseMutationResult<T, any, V, unknown>;
export declare function useDeleteMutation<T>(url: string, options?: UseMutationOptions<T, any, void>): import("@tanstack/react-query").UseMutationResult<T, any, void, unknown>;
//# sourceMappingURL=useApi.d.ts.map