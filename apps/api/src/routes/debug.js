import db from '../lib/db';
export async function registerDebugRoutes(fastify) {
    fastify.get('/api/debug/db', async (request, reply) => {
        try {
            const keys = Object.keys(db || {});
            const constructorName = db ? db.constructor?.name : null;
            const isPrismaClient = constructorName === 'PrismaClient' || !!(db && db._requestHandler);
            const userType = db && db.user ? typeof db.user : 'undefined';
            return reply.send({ ok: true, keys, constructorName, isPrismaClient, userType, hasUser: !!(db && db.user), hasFindFirst: typeof db?.user?.findFirst === 'function' });
        }
        catch (e) {
            return reply.status(500).send({ ok: false, error: String(e) });
        }
    });
    fastify.get('/api/debug/env', async (request, reply) => {
        try {
            const raw = request.query?.raw === 'true';
            const env = process.env.DATABASE_URL || null;
            const masked = env ? `${env.slice(0, 30)}...${env.slice(-10)}` : null;
            const canShowRaw = process.env.NODE_ENV !== 'production' && raw;
            return reply.send({ ok: true, databaseUrlMasked: masked, databaseUrl: canShowRaw ? env : undefined });
        }
        catch (e) {
            return reply.status(500).send({ ok: false, error: String(e) });
        }
    });
}
//# sourceMappingURL=debug.js.map