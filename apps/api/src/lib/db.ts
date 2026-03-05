import { PrismaClient } from '@prisma/client';

// Declare global cache to avoid multiple instances in dev hot-reload
declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var __prismaClient: PrismaClient | undefined;
}

let client: PrismaClient;

if (global.__prismaClient) {
  client = global.__prismaClient;
} else {
  client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    global.__prismaClient = client;
  }
}

export default client;
