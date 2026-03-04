// unused
/**
 * Custom hooks for request validation and logging
 */
/**
 * Log all requests
 */
export async function logRequestHook(request, _reply) {
    const start = Date.now();
    request.log.info({
        method: request.method,
        url: request.url,
        ip: request.ip,
    });
    return async () => {
        const duration = Date.now() - start;
        request.log.info({
            method: request.method,
            url: request.url,
            duration,
        });
    };
}
/**
 * Register all hooks
 */
export function registerHooks(fastify) {
    fastify.addHook('onRequest', logRequestHook);
}
//# sourceMappingURL=index.js.map