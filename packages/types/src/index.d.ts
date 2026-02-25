/**
 * Shared TypeScript types for the video streaming platform
 */
export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    USER = "user",
    MODERATOR = "moderator",
    ADMIN = "admin"
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export declare enum VideoStatus {
    UPLOADED = "uploaded",
    PROCESSING = "processing",
    READY = "ready",
    FAILED = "failed",
    ARCHIVED = "archived"
}
export declare enum VideoResolution {
    '360p' = "360p",
    '480p' = "480p",
    '720p' = "720p",
    '1080p' = "1080p"
}
export interface Video {
    id: string;
    title: string;
    description: string;
    uploaderId: string;
    status: VideoStatus;
    duration: number;
    views: number;
    likes: number;
    dislikes: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface VideoFile {
    id: string;
    videoId: string;
    resolution: VideoResolution;
    fileUrl: string;
    format: 'hls' | 'mp4';
    size: number;
    bitrate: number;
}
export interface Thumbnail {
    id: string;
    videoId: string;
    url: string;
    timestamp: number;
}
export interface Tag {
    id: string;
    name: string;
    slug: string;
}
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}
export interface Comment {
    id: string;
    videoId: string;
    userId: string;
    content: string;
    likes: number;
    dislikes: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Playlist {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface PlaylistVideo {
    playlistId: string;
    videoId: string;
    position: number;
}
export interface WatchHistory {
    id: string;
    userId: string;
    videoId: string;
    watchedAt: Date;
    progressSeconds: number;
}
export declare enum InteractionType {
    LIKE = "like",
    DISLIKE = "dislike"
}
export interface VideoInteraction {
    userId: string;
    videoId: string;
    type: InteractionType;
}
export interface Report {
    id: string;
    videoId: string;
    userId: string;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: Date;
    resolvedAt?: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
    timestamp: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
export interface TranscodingJob {
    jobId: string;
    videoId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    sourceFile: string;
    resolutions: VideoResolution[];
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}
export interface RecommendationRequest {
    userId?: string;
    limit?: number;
}
export interface RecommendedVideo {
    videoId: string;
    score: number;
    reason: 'collaborative' | 'content-based' | 'trending';
}
export interface SearchFilters {
    category?: string;
    minDuration?: number;
    maxDuration?: number;
    uploaded?: 'day' | 'week' | 'month' | 'year';
    sort?: 'newest' | 'mostViewed' | 'topRated' | 'relevance';
}
export interface SearchResults {
    videos: Video[];
    total: number;
    suggestions?: string[];
}
export declare enum EventType {
    WATCH = "watch",
    LIKE = "like",
    DISLIKE = "dislike",
    COMMENT = "comment",
    SKIP = "skip",
    SEARCH = "search",
    SHARE = "share",
    REPORT = "report"
}
export interface UserEvent {
    userId?: string;
    eventType: EventType;
    videoId?: string;
    metadata: Record<string, unknown>;
    timestamp: number;
}
//# sourceMappingURL=index.d.ts.map