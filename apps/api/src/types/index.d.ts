/**
 * Types for API responses and requests
 */
export interface ApiMeta {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
    timestamp: number;
}
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    timestamp: number;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        message: string;
        code: string;
        details?: unknown;
    };
    timestamp: number;
}
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
//# sourceMappingURL=index.d.ts.map