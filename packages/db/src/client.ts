import { PrismaClient } from '@prisma/client';

/**
 * Singleton instance of Prisma Client
 * Ensures we only have one database connection in the app
 */

declare global {
  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

export default db;
