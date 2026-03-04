import { JWTPayload } from '@video-platform/types';
/**
 * JWT utilities for token generation and validation
 * Fastify's @fastify/jwt plugin handles the actual signing/verification
 */
export interface TokenPayload extends JWTPayload {
    iat: number;
    exp: number;
}
export declare const JWT_CONFIG: {
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
};
/**
 * Calculate token expiration time
 */
export declare function getTokenExpiration(expiresIn: string): number;
//# sourceMappingURL=jwt.d.ts.map