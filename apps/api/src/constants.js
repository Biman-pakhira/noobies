/**
 * Constants for the API
 */
export const PAGINATION_DEFAULTS = {
    PAGE: 1,
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};
export const VIDEO_UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024 * 1024, // 10GB
    ALLOWED_FORMATS: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'],
};
export const VIDEO_PROCESSING = {
    RESOLUTIONS: ['360p', '480p', '720p', '1080p'],
    HLS_SEGMENT_DURATION: 10,
    BITRATES: {
        '360p': 800,
        '480p': 1500,
        '720p': 2500,
        '1080p': 5000,
    },
};
export const CACHE_TTL = {
    VIDEO: 3600, // 1 hour
    USER: 1800, // 30 minutes
    TRENDING: 600, // 10 minutes
};
//# sourceMappingURL=constants.js.map