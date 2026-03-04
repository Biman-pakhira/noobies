export function createErrorHandler() {
    return function (error, request, reply) {
        const statusCode = error.statusCode || 500;
        request.log.error(error);
        return reply.status(statusCode).send({
            success: false,
            error: {
                message: error.message || 'Internal Server Error',
                code: error.code || 'INTERNAL_ERROR',
            },
            timestamp: Date.now(),
        });
    };
}
//# sourceMappingURL=error.js.map