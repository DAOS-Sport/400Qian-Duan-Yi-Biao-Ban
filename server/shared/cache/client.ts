import { env } from "../config/env";

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

const memoryCache = new Map<string, { value: string; expiresAt?: number }>();

export const createCacheClient = (): CacheClient => {
  if (env.redisUrl) {
    console.warn("[cache] REDIS_URL is configured, but Redis client is reserved for the next reconnect phase.");
  }

  return {
    async get(key) {
      const item = memoryCache.get(key);
      if (!item) return null;
      if (item.expiresAt && item.expiresAt < Date.now()) {
        memoryCache.delete(key);
        return null;
      }
      return item.value;
    },
    async set(key, value, ttlSeconds) {
      memoryCache.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
    },
    async del(key) {
      memoryCache.delete(key);
    },
  };
};
