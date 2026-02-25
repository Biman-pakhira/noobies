import { PrismaClient } from '@prisma/client';
export const db = global.prisma ||
    new PrismaClient({
        log: ['error', 'warn'],
    });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = db;
}
export default db;
//# sourceMappingURL=client.js.map