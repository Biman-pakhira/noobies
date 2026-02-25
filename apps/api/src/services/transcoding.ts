import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { db } from '@video-platform/db';
import { getStorageProvider } from './storage';
import {
  transcodeToHLS,
  getVideoMetadata,
  generateThumbnail,
  TranscodeResult,
} from './ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Transcoding job data
 */
export interface TranscodingJobData {
  videoId: string;
  uploadPath: string;
  resolutions: string[];
}

/**
 * Transcoding job progress
 */
export interface TranscodingProgress {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
}

/**
 * Initialize transcoding queue
 */
export class TranscodingQueue {
  private queue: Queue<TranscodingJobData>;
  private worker: Worker<TranscodingJobData> | null = null;
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    this.queue = new Queue<TranscodingJobData>('video-transcoding', {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }

  /**
   * Add transcoding job to queue
   */
  async addJob(data: TranscodingJobData): Promise<string> {
    const job = await this.queue.add(`transcode-${data.videoId}`, data, {
      jobId: data.videoId,
    });

    if (!job.id) throw new Error('Job ID was not generated');
    return job.id;
  }

  /**
   * Start the worker
   */
  startWorker(): void {
    if (this.worker) return;

    this.worker = new Worker<TranscodingJobData>(
      'video-transcoding',
      async (job) => {
        console.log(`🎬 Processing job: ${job.id}`);

        try {
          const { videoId, uploadPath, resolutions } = job.data;

          // Update video status to processing
          await db.video.update({
            where: { id: videoId },
            data: { status: 'PROCESSING' },
          });

          // Get video metadata
          job.updateProgress(10);
          console.log(`📊 Extracting metadata for ${videoId}`);
          const metadata = await getVideoMetadata(uploadPath);

          // Transcode to different resolutions
          job.updateProgress(30);
          console.log(`🔄 Transcoding ${resolutions.length} resolutions for ${videoId}`);
          const outputDir = path.join(process.env.FFMPEG_OUTPUT_DIR || '/tmp/video-processing', videoId);
          const transcodeResults = await transcodeToHLS({
            inputPath: uploadPath,
            outputDir,
            resolutions,
            onProgress: (progress) => {
              job.updateProgress(30 + progress * 0.5); // 30-80%
            },
          });

          // Generate thumbnail
          job.updateProgress(85);
          console.log(`🖼️ Generating thumbnail for ${videoId}`);
          const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
          await generateThumbnail(uploadPath, thumbnailPath, Math.floor(metadata.duration / 4));

          // Upload to storage
          job.updateProgress(90);
          console.log(`☁️ Uploading files to storage for ${videoId}`);
          const storage = getStorageProvider();
          const uploadedFiles = await uploadToStorage(videoId, outputDir, transcodeResults, thumbnailPath);

          // Save video files and thumbnails to database
          job.updateProgress(95);
          console.log(`💾 Saving metadata to database for ${videoId}`);

          // Create video files records
          for (const result of uploadedFiles.files) {
            await db.videoFile.create({
              data: {
                videoId,
                resolution: `RES_${result.resolution.replace('p', 'P').toUpperCase()}`,
                fileUrl: result.url,
                format: 'hls',
                size: result.size,
                bitrate: result.bitrate,
              },
            });
          }

          // Create thumbnail record
          if (uploadedFiles.thumbnail) {
            await db.thumbnail.create({
              data: {
                videoId,
                url: uploadedFiles.thumbnail.url,
                timestamp: Math.floor(metadata.duration / 4),
              },
            });
          }

          // Update video status to ready
          const updatedVideo = await db.video.update({
            where: { id: videoId },
            data: {
              status: 'READY',
              duration: Math.floor(metadata.duration),
            },
            include: {
              uploader: { select: { id: true, username: true } },
              thumbnails: { take: 1, select: { url: true } },
              tags: { select: { name: true } },
              category: { select: { id: true, name: true } },
            },
          });

          // Index video in Elasticsearch
          try {
            const { getElasticsearchService } = await import('./elasticsearch');
            const esService = getElasticsearchService();
            if (esService.isHealthy()) {
              await esService.indexVideo(updatedVideo);
            }
          } catch (error) {
            console.warn('⚠️  Failed to index video in Elasticsearch:', error);
          }

          // Cleanup temporary files
          await fs.rm(outputDir, { recursive: true, force: true });

          job.updateProgress(100);
          console.log(`✅ Transcoding completed for ${videoId}`);

          return {
            videoId,
            duration: metadata.duration,
            files: uploadedFiles.files.length,
          };
        } catch (error) {
          console.error(`❌ Transcoding failed for job ${job.id}:`, error);

          // Update video status to failed
          await db.video.update({
            where: { id: job.data.videoId },
            data: { status: 'FAILED' },
          });

          throw error;
        }
      },
      {
        connection: this.redis,
        concurrency: 2, // Process 2 videos at a time
      }
    );

    console.log('👷 Transcoding worker started');
  }

  /**
   * Stop the worker
   */
  async stopWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
      console.log('🛑 Transcoding worker stopped');
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress as number,
      data: job.data,
    };
  }
}

/**
 * Upload transcoded files to storage
 */
async function uploadToStorage(
  videoId: string,
  outputDir: string,
  transcodeResults: TranscodeResult[],
  thumbnailPath: string
) {
  const storage = getStorageProvider();
  const files = [];

  for (const result of transcodeResults) {
    const key = `videos/${videoId}/${result.resolution}/playlist.m3u8`;
    const url = await storage.uploadFile(result.outputPath, key, 'application/x-mpegURL');
    files.push({
      resolution: result.resolution,
      url,
      bitrate: result.bitrate,
      size: result.size,
    });
  }

  // Upload thumbnail
  const thumbnailKey = `videos/${videoId}/thumbnail.jpg`;
  const thumbnailUrl = await storage.uploadFile(thumbnailPath, thumbnailKey, 'image/jpeg');

  return {
    files,
    thumbnail: {
      url: thumbnailUrl,
    },
  };
}

// Create singleton instance
let transcodingQueueInstance: TranscodingQueue | null = null;

export function getTranscodingQueue(): TranscodingQueue {
  if (!transcodingQueueInstance) {
    transcodingQueueInstance = new TranscodingQueue();
  }
  return transcodingQueueInstance;
}
