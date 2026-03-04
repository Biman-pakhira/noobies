/**
 * Constants for the API
 */
export declare const PAGINATION_DEFAULTS: {
    PAGE: number;
    PAGE_SIZE: number;
    MAX_PAGE_SIZE: number;
};
export declare const VIDEO_UPLOAD_LIMITS: {
    MAX_FILE_SIZE: number;
    ALLOWED_FORMATS: string[];
};
export declare const VIDEO_PROCESSING: {
    RESOLUTIONS: string[];
    HLS_SEGMENT_DURATION: number;
    BITRATES: {
        '360p': number;
        '480p': number;
        '720p': number;
        '1080p': number;
    };
};
export declare const CACHE_TTL: {
    VIDEO: number;
    USER: number;
    TRENDING: number;
};
//# sourceMappingURL=constants.d.ts.map