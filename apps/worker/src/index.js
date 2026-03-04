import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { db } from '@video-platform/db';
const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});
const OUTPUT_DIR = process.env.FFMPEG_OUTPUT_DIR || '/tmp/video-processing';
const worker = new Worker('video-processing', async (job) => {
    const { videoId, uploadPath, resolutions } = job.data;
    console.log(`🎬 Processing video ${videoId} from ${uploadPath}`);
    try {
        // 1. Update status to PROCESSING
        await db.video.update({
            where: { id: videoId },
            data: { status: 'PROCESSING' },
        });
        const videoDir = path.join(OUTPUT_DIR, videoId);
        await fs.mkdir(videoDir, { recursive: true });
        // 2. Transcode to each resolution
        for (const res of resolutions) {
            const height = parseInt(res);
            const outputFileName = `video_${res}.mp4`;
            const outputPath = path.join(videoDir, outputFileName);
            console.log(`  🔧 Transcoding to ${res}...`);
            await new Promise((resolve, reject) => {
                ffmpeg(uploadPath)
                    .size(`?x${height}`)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .output(outputPath)
                    .on('progress', (progress) => {
                    if (progress.percent !== undefined) {
                        // Update job progress (approximate based on number of resolutions)
                        const baseProgress = (resolutions.indexOf(res) / resolutions.length) * 80;
                        const currentProgress = baseProgress + (progress.percent / resolutions.length) * 0.8;
                        job.updateProgress(Math.round(currentProgress));
                    }
                })
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });
            // Add VideoFile record
            const resolutionKey = `RES_${res.toUpperCase()}`;
            await db.videoFile.create({
                data: {
                    videoId,
                    resolution: resolutionKey,
                    fileUrl: outputPath,
                    size: Math.round((await fs.stat(outputPath)).size),
                    bitrate: 0,
                    format: 'hls',
                },
            });
        }
        // 3. Generate Thumbnail
        console.log('  🖼️  Generating thumbnail...');
        const thumbnailPath = path.join(videoDir, 'thumbnail.jpg');
        await new Promise((resolve, reject) => {
            ffmpeg(uploadPath)
                .screenshots({
                timestamps: ['20%'],
                filename: 'thumbnail.jpg',
                folder: videoDir,
                size: '640x360',
            })
                .on('end', resolve)
                .on('error', reject);
        });
        await db.thumbnail.create({
            data: {
                videoId,
                url: thumbnailPath,
                timestamp: 2,
            },
        });
        // 4. Update status to READY
        const duration = await new Promise((resolve) => {
            ffmpeg.ffprobe(uploadPath, (_, metadata) => {
                resolve(Math.round(metadata?.format?.duration || 0));
            });
        });
        await db.video.update({
            where: { id: videoId },
            data: {
                status: 'READY',
                duration,
            },
        });
        console.log(`✅ Video ${videoId} processed successfully`);
        job.updateProgress(100);
        // Cleanup original upload (optional, but good for disk space)
        // await fs.unlink(uploadPath);
    }
    catch (error) {
        console.error(`❌ Job ${job.id} failed:`, error);
        await db.video.update({
            where: { id: videoId },
            data: { status: 'FAILED' },
        });
        throw error;
    }
}, {
    connection,
    concurrency: 1 // Only process one video at a time for dev
});
worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});
console.log('🚀 Worker ready, waiting for video jobs...');
//# sourceMappingURL=index.js.map