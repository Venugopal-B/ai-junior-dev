import { ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import { URL } from 'url';
import { env } from './env';

export function getRedisConnectionOptions(): ConnectionOptions {
  if (env.REDIS_URL) {
    const redisUrl = new URL(env.REDIS_URL);
    return {
      host: redisUrl.hostname,
      port: redisUrl.port ? Number(redisUrl.port) : 6379,
      username: redisUrl.username || undefined,
      password: redisUrl.password || undefined,
      maxRetriesPerRequest: null,
    };
  }

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  };
}

export function createRedisPingClient(): IORedis {
  if (env.REDIS_URL) {
    return new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  }

  return new IORedis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
}
