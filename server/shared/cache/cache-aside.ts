import type { CacheClient } from "./client";

export const cacheAside = async <T>(
  cache: CacheClient,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> => {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached) as T;

  const value = await loader();
  await cache.set(key, JSON.stringify(value), ttlSeconds);
  return value;
};
