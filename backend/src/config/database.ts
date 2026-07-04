import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // Prevent multiple Prisma instances in development (Next.js hot reload issue)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'colorless',
  });

export const db: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  global.__prisma = db;
}

export default db;
