import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import path from 'path';
import { promises as fs } from 'fs';
import { transcodeToHLS, getVideoMetadata, generateThumbnail } from './ffmpeg.js';

// ─── Lazy singleton Redis + Queue ─────────────────────────────────────────────
// We do NOT create the connection at module-load time.
// This prevents the API from crashing on startup when Redis is not available.
let redisConnection: Redis | null = null;
let queue: Queue | null = null;
let worker: Worker | null = null;

function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
      // Fail fast so the caller can handle gracefully
      connectTimeout: 3000,
      lazyConnect: true,
    });

    redisConnection.on('error', (err) => {
      // Just log — don't crash the process
      console.warn('⚠️  Redis connection error (transcoding queue unavailable):', err.message);
    });
  }
  return redisConnection;
}

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue('video-processing', { connection: getRedisConnection() });
  }
  return queue;
}

// ─── Job processor ───────────────────────────────────────────────────────────

async function processTranscodeJob(
  job: Job<{ videoId: string; uploadPath: string; resolutions: string[] }>
) {
  const { videoId, uploadPath, resolutions } = job.data;

  // Lazy import db to avoid circular deps at module load
  const dbModule = await import('../lib/db.js');
  const db = dbModule.default;

  const outputDir = path.join(
    process.env.FFMPEG_OUTPUT_DIR || '/tmp/video-processing',
    videoId
  );

  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Update status to PROCESSING
    await db.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    });

    await job.updateProgress(5);

    // Get video metadata
    const metadata = await getVideoMetadata(uploadPath);
    await job.updateProgress(10);

    // Generate thumbnail
    const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
    try {
      await generateThumbnail(uploadPath, thumbnailPath, Math.min(5, metadata.duration));
      // Save thumbnail to DB
      await db.thumbnail.create({
        data: {
          videoId,
          url: thumbnailPath, // Local path; replace with CDN URL when R2 is configured
          width: 320,
          height: 180,
        },
      });
    } catch (thumbErr) {
      console.warn('⚠️  Could not generate thumbnail:', thumbErr);
    }

    await job.updateProgress(15);

    // Transcode to HLS for each resolution
    const results = await transcodeToHLS({
      inputPath: uploadPath,
      outputDir,
      resolutions,
      onProgress: async (pct) => {
        // Scale 15–90% for transcoding phase
        await job.updateProgress(15 + Math.round(pct * 0.75));
      },
    });

    await job.updateProgress(90);

    // Persist VideoFile records for each resolution
    const resolutionMap: Record<string, string> = {
      '360p': 'RES_360P',
      '480p': 'RES_480P',
      '720p': 'RES_720P',
      '1080p': 'RES_1080P',
    };

    for (const result of results) {
      await db.videoFile.create({
        data: {
          videoId,
          resolution: resolutionMap[result.resolution] || result.resolution,
          fileUrl: result.outputPath, // Local HLS path or CDN URL
          fileSize: BigInt(result.size),
          format: 'HLS',
        },
      });
    }

    // Update video with metadata and mark READY
    await db.video.update({
      where: { id: videoId },
      data: {
        status: 'READY',
        duration: metadata.duration,
      },
    });

    await job.updateProgress(100);
    console.log(`✅ Transcoding complete for video ${videoId}`);
  } catch (error) {
    console.error(`❌ Transcoding failed for video ${videoId}:`, error);
    // Mark video as FAILED in DB
    try {
      const dbModule2 = await import('../lib/db.js');
      const db2 = dbModule2.default;
      await db2.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });
    } catch (_) { }
    throw error; // Re-throw so BullMQ marks the job as failed
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTranscodingQueue() {
  return {
    startWorker: () => {
      try {
        worker = new Worker('video-processing', processTranscodeJob, {
          connection: getRedisConnection(),
          concurrency: 2,
        });

        worker.on('completed', (job) => {
          console.log(`✅ Job ${job.id} completed`);
        });

        worker.on('failed', (job, err) => {
          console.error(`❌ Job ${job?.id} failed:`, err.message);
        });

        console.log('🚀 Transcoding worker started');
      } catch (err: any) {
        console.warn('⚠️  Could not start transcoding worker (Redis unavailable):', err.message);
      }
    },

    stopWorker: async () => {
      try {
        if (worker) await worker.close();
        if (queue) await getQueue().close();
      } catch (_) { }
    },

    addJob: async (data: { videoId: string; uploadPath: string; resolutions: string[] }) => {
      try {
        const job = await getQueue().add('transcode', data, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
        return job.id;
      } catch (err: any) {
        // Redis not available — return a fake job ID so the upload route
        // can still save the DB record and respond 202.
        console.warn('⚠️  Could not queue transcoding job (Redis unavailable):', err.message);
        return `local-${data.videoId}`;
      }
    },

    getJobStatus: async (jobId: string) => {
      // Local fallback jobs don't exist in Redis
      if (jobId.startsWith('local-')) {
        return { id: jobId, status: 'waiting', progress: 0 };
      }
      try {
        const job = await getQueue().getJob(jobId);
        if (!job) return null;
        const state = await job.getState();
        return { id: job.id, status: state, progress: job.progress };
      } catch (_) {
        return { id: jobId, status: 'unknown', progress: 0 };
      }
    },
  };
}
