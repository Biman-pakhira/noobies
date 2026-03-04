import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Extend FastifyRequest to include user from JWT
 */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            JWT_REFRESH_SECRET: string;
        }
    }
}
/**
 * Authentication middleware to verify JWT
 */
export declare function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void>;
/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export declare function optionalAuthMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
/**
 * Verify user role
 */
export declare function requireRole(...roles: string[]): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
//# sourceMappingURL=auth.d.ts.map