#!/usr/bin/env node
/**
 * Standalone transcoding worker
 * Can be run as a separate process using: npm run worker
 */
import { getTranscodingQueue } from './services/transcoding.js';
async function startWorker() {
    console.log('🎬 Starting video transcoding worker...');
    const transcodingQueue = getTranscodingQueue();
    transcodingQueue.startWorker();
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down worker...');
        await transcodingQueue.stopWorker();
        process.exit(0);
    });
    console.log('✅ Worker is running and listening for jobs');
}
startWorker().catch((error) => {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
});
//# sourceMappingURL=worker.js.map