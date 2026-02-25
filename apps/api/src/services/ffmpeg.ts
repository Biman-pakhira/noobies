import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * FFmpeg transcoding service
 */

export interface TranscodeOptions {
  inputPath: string;
  outputDir: string;
  resolutions: string[]; // "360p", "480p", "720p", "1080p"
  onProgress?: (progress: number) => void;
}

export interface TranscodeResult {
  resolution: string;
  outputPath: string;
  bitrate: number;
  size: number;
}

const BITRATE_MAP: Record<string, number> = {
  '360p': 800,
  '480p': 1500,
  '720p': 2500,
  '1080p': 5000,
};

const RESOLUTION_MAP: Record<string, string> = {
  '360p': '640:360',
  '480p': '854:480',
  '720p': '1280:720',
  '1080p': '1920:1080',
};

/**
 * Get video metadata
 */
export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  bitrate: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const stream = metadata.streams.find((s) => s.codec_type === 'video');
      if (!stream) return reject(new Error('No video stream found'));

      resolve({
        duration: metadata.format.duration || 0,
        width: stream.width || 0,
        height: stream.height || 0,
        bitrate: stream.bit_rate ? parseInt(stream.bit_rate) / 1000 : 0,
      });
    });
  });
}

/**
 * Transcode video to HLS segments
 */
export async function transcodeToHLS(options: TranscodeOptions): Promise<TranscodeResult[]> {
  const { inputPath, outputDir, resolutions } = options;

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const results: TranscodeResult[] = [];

  for (const resolution of resolutions) {
    const result = await transcodeResolution(inputPath, outputDir, resolution);
    results.push(result);
  }

  return results;
}

/**
 * Transcode a single resolution
 */
async function transcodeResolution(
  inputPath: string,
  outputDir: string,
  resolution: string
): Promise<TranscodeResult> {
  return new Promise((resolve, reject) => {
    const resolutionString = RESOLUTION_MAP[resolution];
    const bitrate = BITRATE_MAP[resolution];

    if (!resolutionString || !bitrate) {
      return reject(new Error(`Unsupported resolution: ${resolution}`));
    }

    const playlistPath = path.join(outputDir, `${resolution}.m3u8`);
    const segmentPattern = path.join(outputDir, `${resolution}-segment-%d.ts`);

    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=${resolutionString}:force_original_aspect_ratio=decrease,pad=trunc(iw/2)*2:trunc(ih/2)*2`,
        `-b:v ${bitrate}k`,
        `-maxrate ${bitrate}k`,
        `-bufsize ${bitrate * 2}k`,
        `-c:a aac`,
        `-b:a 128k`,
        `-hls_time 10`,
        `-hls_playlist_type vod`,
      ])
      .output(playlistPath)
      .on('end', async () => {
        try {
          const segmentPath = path.join(outputDir, `${resolution}-segment-0.ts`);
          const stats = await fs.stat(segmentPath);

          resolve({
            resolution,
            outputPath: playlistPath,
            bitrate,
            size: stats.size,
          });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject)
      .run();
  });
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  timestamp: number = 5
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshot({
        timestamps: [timestamp],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x180',
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

/**
 * Extract frame at specific time
 */
export async function extractFrame(
  inputPath: string,
  outputPath: string,
  timestamp: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        count: 1,
        timemarks: [timestamp.toString()],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x180',
      })
      .on('end', resolve)
      .on('error', reject);
  });
}
