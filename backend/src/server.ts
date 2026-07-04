import 'dotenv/config';
import { env } from './config/env';
import createApp from './app';
import { db } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // ── Connect to database ────────────────────────────────────────────────
    await db.$connect();
    logger.info('✅ Database connected');

    // ── Connect to Redis ───────────────────────────────────────────────────
    try {
      await connectRedis();
    } catch (err) {
      logger.warn('⚠️  Redis connection failed — rate limiting will use memory store', err);
    }

    // ── Start HTTP server ──────────────────────────────────────────────────
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Tevar backend running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`📖 Health: http://localhost:${env.PORT}/health`);
    });

    // ── Graceful shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received — shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await db.$disconnect();
        logger.info('Database disconnected');
        await disconnectRedis();
        logger.info('Redis disconnected');
        process.exit(0);
      });

      // Force-kill after 15s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
      }, 15_000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      void shutdown('uncaughtException');
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

void startServer();
