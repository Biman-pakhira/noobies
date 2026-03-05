import { createApp } from '../apps/api/src/index.js';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

export default async (req: any, res: any) => {
    if (!app) {
        app = await createApp();
        await app.ready();
    }

    app.server.emit('request', req, res);
};
