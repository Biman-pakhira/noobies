import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
/**
 * Custom hooks for request validation and logging
 */
/**
 * Log all requests
 */
export declare function logRequestHook(request: FastifyRequest, _reply: FastifyReply): Promise<() => Promise<void>>;
/**
 * Register all hooks
 */
export declare function registerHooks(fastify: FastifyInstance): void;
//# sourceMappingURL=index.d.ts.map