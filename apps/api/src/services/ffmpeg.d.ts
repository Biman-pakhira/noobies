/**
 * FFmpeg transcoding service
 */
export interface TranscodeOptions {
    inputPath: string;
    outputDir: string;
    resolutions: string[];
    onProgress?: (progress: number) => void;
}
export interface TranscodeResult {
    resolution: string;
    outputPath: string;
    bitrate: number;
    size: number;
}
/**
 * Get video metadata
 */
export declare function getVideoMetadata(filePath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    bitrate: number;
}>;
/**
 * Transcode video to HLS segments
 */
export declare function transcodeToHLS(options: TranscodeOptions): Promise<TranscodeResult[]>;
/**
 * Generate thumbnail
 */
export declare function generateThumbnail(inputPath: string, outputPath: string, timestamp?: number): Promise<void>;
/**
 * Extract frame at specific time
 */
export declare function extractFrame(inputPath: string, outputPath: string, timestamp: number): Promise<void>;
//# sourceMappingURL=ffmpeg.d.ts.map