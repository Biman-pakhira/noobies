import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Default export for compatibility with callers using default imports
export default db
