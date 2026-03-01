import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

export function createErrorHandler() {
  return function (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const statusCode = error.statusCode || 500

    request.log.error(error)

    return reply.status(statusCode).send({
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
      },
      timestamp: Date.now(),
    })
  }
}
