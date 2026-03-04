/**
 * Utility functions for API responses
 */
export interface PaginationParams {
    page?: number | string;
    pageSize?: number | string;
}
export declare function parsePagination(query: PaginationParams, maxPageSize?: number): {
    page: number;
    pageSize: number;
    skip: number;
};
export declare function formatVideoResponse(video: any): any;
export declare function logRequest(method: string, path: string, statusCode: number, duration: number): void;
//# sourceMappingURL=helpers.d.ts.map