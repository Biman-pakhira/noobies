/**
 * Shared TypeScript types for the video streaming platform
 */

// ============= User Types =============

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
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

// ============= Video Types =============

export enum VideoStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

export enum VideoResolution {
  '360p' = '360p',
  '480p' = '480p',
  '720p' = '720p',
  '1080p' = '1080p',
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
  timestamp: number; // seconds
}

// ============= Tag & Category Types =============

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

// ============= Comment Types =============

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

// ============= Playlist Types =============

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

// ============= Watch History Types =============

export interface WatchHistory {
  id: string;
  userId: string;
  videoId: string;
  watchedAt: Date;
  progressSeconds: number;
}

// ============= Interaction Types =============

export enum InteractionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
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

// ============= API Response Types =============

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

// ============= Job Types =============

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

// ============= Recommendation Types =============

export interface RecommendationRequest {
  userId?: string; // undefined for anonymous users
  limit?: number;
}

export interface RecommendedVideo {
  videoId: string;
  score: number;
  reason: 'collaborative' | 'content-based' | 'trending';
}

// ============= Search Types =============

export interface SearchFilters {
  category?: string;
  minDuration?: number; // seconds
  maxDuration?: number; // seconds
  uploaded?: 'day' | 'week' | 'month' | 'year';
  sort?: 'newest' | 'mostViewed' | 'topRated' | 'relevance';
}

export interface SearchResults {
  videos: Video[];
  total: number;
  suggestions?: string[];
}

// ============= Event Tracking Types =============

export enum EventType {
  WATCH = 'watch',
  LIKE = 'like',
  DISLIKE = 'dislike',
  COMMENT = 'comment',
  SKIP = 'skip',
  SEARCH = 'search',
  SHARE = 'share',
  REPORT = 'report',
}

export interface UserEvent {
  userId?: string; // undefined for anonymous
  eventType: EventType;
  videoId?: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}
