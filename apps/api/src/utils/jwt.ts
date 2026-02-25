import { JWTPayload } from '@video-platform/types';

/**
 * JWT utilities for token generation and validation
 * Fastify's @fastify/jwt plugin handles the actual signing/verification
 */

export interface TokenPayload extends JWTPayload {
  iat: number;
  exp: number;
}

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
};

/**
 * Calculate token expiration time
 */
export function getTokenExpiration(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) throw new Error('Invalid expiration format');

  const [, amount, unit] = match;
  const num = parseInt(amount, 10);
  let seconds = 0;

  switch (unit) {
    case 'm':
      seconds = num * 60;
      break;
    case 'h':
      seconds = num * 60 * 60;
      break;
    case 'd':
      seconds = num * 24 * 60 * 60;
      break;
  }

  return Math.floor(Date.now() / 1000) + seconds;
}
