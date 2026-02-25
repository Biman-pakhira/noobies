import { PrismaClient } from '@prisma/client';
/**
 * Singleton instance of Prisma Client
 * Ensures we only have one database connection in the app
 */
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const db: any;
export default db;
//# sourceMappingURL=client.d.ts.map