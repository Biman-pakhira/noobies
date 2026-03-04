import type { FastifyReply, FastifyRequest } from 'fastify';
export interface HealthCheckResponse {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    services?: {
        database: 'ok' | 'error';
        redis: 'ok' | 'error';
        elasticsearch: 'ok' | 'error';
    };
}
/**
 * Health check route
 */
export declare function healthCheck(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
//# sourceMappingURL=health.d.ts.map