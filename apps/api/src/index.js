import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import { createErrorHandler } from './utils/error.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerUserRoutes } from './routes/users.js';
import { registerVideoRoutes } from './routes/videos.js';
import { registerCommentRoutes } from './routes/comments.js';
import { registerInteractionRoutes } from './routes/interactions.js';
import { registerRecommendationRoutes } from './routes/recommendations.js';
import { registerVideoUploadRoutes } from './routes/upload.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerDebugRoutes } from './routes/debug.js';
import { getTranscodingQueue } from './services/transcoding.js';
import { getElasticsearchService } from './services/elasticsearch.js';
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
        secret: process.env.JWT_SECRET || "fallback-dev-secret-change-in-production",
    });
    // Attach authentication helpers to fastify instance
    fastify.decorate('authenticate', async (request, reply) => authMiddleware(request, reply));
    fastify.decorate('optionalAuthenticate', async (request, reply) => optionalAuthMiddleware(request, reply));
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
    await registerDebugRoutes(fastify);
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
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer();
}
//# sourceMappingURL=index.js.map