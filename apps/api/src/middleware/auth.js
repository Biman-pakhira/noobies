// augment handled in types/fastify.d.ts
/**
 * Authentication middleware to verify JWT
 */
export async function authMiddleware(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (error) {
        reply.status(401).send({
            success: false,
            error: {
                message: 'Unauthorized: Invalid or missing token',
                code: 'UNAUTHORIZED',
            },
        });
    }
}
/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export async function optionalAuthMiddleware(request, _reply) {
    try {
        await request.jwtVerify();
    }
    catch {
        // User is not authenticated, continue anyway
    }
}
/**
 * Verify user role
 */
export function requireRole(...roles) {
    return async (request, reply) => {
        try {
            await request.jwtVerify();
            if (!request.user || !roles.includes(request.user.role)) {
                return reply.status(403).send({
                    success: false,
                    error: {
                        message: 'Forbidden: Insufficient permissions',
                        code: 'FORBIDDEN',
                    },
                });
            }
        }
        catch {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Unauthorized: Invalid or missing token',
                    code: 'UNAUTHORIZED',
                },
            });
        }
    };
}
//# sourceMappingURL=auth.js.map