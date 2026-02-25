import { createApp } from './index';
import { setupAWSSDK } from './config/aws';

/**
 * Start the Fastify server with video processing pipeline
 */
async function startServer() {
  // Setup AWS SDK
  setupAWSSDK();

  const app = await createApp();

  const port = parseInt(process.env.API_PORT || '3001', 10);
  const host = process.env.API_HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ API Server running at http://${host}:${port}`);
    console.log(`📝 Health check: http://${host}:${port}/health`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n🔐 Authentication Routes:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/refresh`);
    console.log(`   POST /api/auth/logout`);
    console.log(`\n📹 Video Routes:`);
    console.log(`   POST /api/videos/upload`);
    console.log(`   GET  /api/videos`);
    console.log(`   GET  /api/videos/:id`);
    console.log(`   GET  /api/videos/trending`);
    console.log(`   DELETE /api/videos/:id`);
    console.log(`\n🔍 Search Routes:`);
    console.log(`   GET  /api/search?q=query`);
    console.log(`   GET  /api/search/autocomplete?q=prefix`);
    console.log(`   GET  /api/search/trending`);
    console.log(`   GET  /api/search/categories`);
    console.log(`\n🎬 Transcoding Pipeline:`);
    console.log(`   BullMQ Queue: video-transcoding`);
    console.log(`   Workers: Active`);
    console.log(`   Storage: ${process.env.AWS_S3_BUCKET || process.env.R2_BUCKET_NAME || 'Configured'}`);
    console.log(`${'='.repeat(60)}\n`);

    return app;
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Start server
startServer();
