import '@fastify/jwt';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            userId: string;
            email: string;
            role: 'USER' | 'MODERATOR' | 'ADMIN';
        };
        user: {
            userId: string;
            email: string;
            role: 'USER' | 'MODERATOR' | 'ADMIN';
        };
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: any;
    }
}
