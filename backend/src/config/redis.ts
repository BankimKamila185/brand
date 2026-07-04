import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis;

const createRedisClient = (): Redis => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
  });

  client.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  client.on('error', (err: Error) => {
    logger.error('Redis connection error:', err.message);
  });

  client.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return client;
};

export const getRedis = (): Redis => {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
};

export const connectRedis = async (): Promise<void> => {
  const client = getRedis();
  await client.connect();
};

export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
  }
};

export default getRedis;
