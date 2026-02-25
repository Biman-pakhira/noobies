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
export async function healthCheck(_request: FastifyRequest, reply: FastifyReply) {
  try {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    } as HealthCheckResponse);
  } catch (error) {
    return reply.status(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
    } as HealthCheckResponse);
  }
}
