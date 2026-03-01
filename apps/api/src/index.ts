import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { createErrorHandler } from './utils/error';
import { registerAuthRoutes } from './routes/auth';
import { registerUserRoutes } from './routes/users';
import { registerVideoRoutes } from './routes/videos';
import { registerCommentRoutes } from './routes/comments';
import { registerInteractionRoutes } from './routes/interactions';
import { registerRecommendationRoutes } from './routes/recommendations';
import { registerVideoUploadRoutes } from './routes/upload';
import { registerSearchRoutes } from './routes/search';
import { registerAdminRoutes } from './routes/admin';
import { getTranscodingQueue } from './services/transcoding';
import { getElasticsearchService } from './services/elasticsearch';

/**
 * Initialize Fastify app
 */
export async function createApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await fastify.register(fastifyHelmet);
  await fastify.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Register JWT plugin
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
  });

  // Health check route
  fastify.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Register routes
  await registerAuthRoutes(fastify);
  await registerUserRoutes(fastify);
  await registerVideoRoutes(fastify);
  await registerCommentRoutes(fastify);
  await registerInteractionRoutes(fastify);
  await registerRecommendationRoutes(fastify);
  await registerVideoUploadRoutes(fastify);
  await registerSearchRoutes(fastify);
  await registerAdminRoutes(fastify);

  // Initialize Elasticsearch
  const esService = getElasticsearchService();
  await esService.initialize();

  // Start transcoding worker
  const transcodingQueue = getTranscodingQueue();
  transcodingQueue.startWorker();

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await transcodingQueue.stopWorker();
  });

  // Register error handler
  fastify.setErrorHandler(createErrorHandler());

  return fastify;
}

/**
 * Start the server
 */
export async function startServer() {
  const app = await createApp();

  const port = parseInt(process.env.API_PORT || '3001', 10);
  const host = process.env.API_HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });

    console.log(`✅ API Server running at http://${host}:${port}`);
    console.log(`📝 Health check: http://${host}:${port}/health`);
    return app;
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
