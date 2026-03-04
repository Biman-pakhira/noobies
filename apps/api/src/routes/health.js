/**
 * Health check route
 */
export async function healthCheck(_request, reply) {
    try {
        return reply.send({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return reply.status(503).send({
            status: 'error',
            timestamp: new Date().toISOString(),
        });
    }
}
//# sourceMappingURL=health.js.map