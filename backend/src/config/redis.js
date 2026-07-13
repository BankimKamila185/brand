import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

let redis;

const createRedisClient = () => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
  });

  client.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  client.on("error", (err) => {
    logger.error("Redis connection error:", err.message);
  });

  client.on("close", () => {
    logger.warn("Redis connection closed");
  });

  return client;
};

export const getRedis = () => {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
};

export const connectRedis = async () => {
  const client = getRedis();
  await client.connect();
};

export const disconnectRedis = async () => {
  if (redis) {
    await redis.quit();
  }
};

export default getRedis;
