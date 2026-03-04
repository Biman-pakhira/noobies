import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
});
const transcodingQueue = new Queue('video-processing', { connection });
export function getTranscodingQueue() {
    return {
        startWorker: () => {
            console.log('🚀 Transcoding queue initialized');
        },
        stopWorker: async () => {
            await transcodingQueue.close();
        },
        addJob: async (data) => {
            const job = await transcodingQueue.add('transcode', data, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            });
            return job.id;
        },
        getJobStatus: async (jobId) => {
            const job = await transcodingQueue.getJob(jobId);
            if (!job)
                return null;
            const state = await job.getState();
            return {
                id: job.id,
                status: state,
                progress: job.progress,
            };
        },
    };
}
//# sourceMappingURL=transcoding.js.map