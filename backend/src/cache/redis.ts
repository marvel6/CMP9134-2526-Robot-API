import Redis from 'ioredis';
import { config } from '../config';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.redisUrl, {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });

    redisInstance.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Redis error:', err.message);
    });
  }
  return redisInstance;
}

export async function pingRedis(): Promise<void> {
  await getRedis().ping();
}

export async function waitForRedis(
  options: { retries?: number; delayMs?: number } = {},
): Promise<void> {
  const { retries = 20, delayMs = 1500 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await getRedis().ping();
      return;
    } catch (err) {
      lastError = err;
      // eslint-disable-next-line no-console
      console.log(
        `[startup] redis not ready (attempt ${attempt}/${retries}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('redis not reachable');
}

export async function closeRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
  }
}
