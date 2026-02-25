/**
 * Utility functions for API responses
 */

export interface PaginationParams {
  page?: number | string;
  pageSize?: number | string;
}

export function parsePagination(query: PaginationParams, maxPageSize: number = 100) {
  let page = parseInt((query.page as any) || '1', 10);
  let pageSize = parseInt((query.pageSize as any) || '20', 10);

  // Validate and clamp values
  page = Math.max(1, page);
  pageSize = Math.min(Math.max(1, pageSize), maxPageSize);

  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function formatVideoResponse(video: any) {
  return {
    ...video,
    duration: video.duration || 0,
    views: video.views || 0,
    likes: video.likes || 0,
    dislikes: video.dislikes || 0,
  };
}

export function logRequest(method: string, path: string, statusCode: number, duration: number) {
  const emoji =
    statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : statusCode >= 300 ? '↩️' : '✅';
  console.log(`${emoji} ${method} ${path} ${statusCode} (${duration}ms)`);
}
