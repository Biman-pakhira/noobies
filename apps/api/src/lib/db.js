// Try to load the compiled DB package client first (preferred)
let client;
try {
    // Use the built client in the workspace packages (absolute path)
    const mod = await import('/Users/macbookair/noobies/packages/db/dist/client.js');
    client = mod.default ?? mod.db ?? mod;
}
catch (e) {
    // Fallback: instantiate a local PrismaClient from @prisma/client
    const { PrismaClient } = await import('@prisma/client');
    client = global.__prismaClient || new PrismaClient();
    if (process.env.NODE_ENV !== 'production')
        global.__prismaClient = client;
}
export default client;
//# sourceMappingURL=db.js.map