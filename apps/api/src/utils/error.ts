import type { FastifyReply, FastifyRequest } from 'fastify';

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
  timestamp: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createErrorHandler() {
  return async (error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          ...(error.details && { details: error.details }),
        },
        timestamp: Date.now(),
      } as ApiErrorResponse);
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: {
          message: 'Validation error',
          code: 'INVALID_INPUT',
          details: (error as any).errors,
        },
        timestamp: Date.now(),
      } as ApiErrorResponse);
    }

    // Log unexpected errors
    console.error('Unexpected error:', error);

    return reply.status(500).send({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
      timestamp: Date.now(),
    } as ApiErrorResponse);
  };
}
