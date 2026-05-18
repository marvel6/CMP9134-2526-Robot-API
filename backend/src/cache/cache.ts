import { getRedis } from './redis';

interface MemoryValue {
  value: string;
  expiresAt: number | null;
}

const memoryStore = new Map<string, MemoryValue>();

function isFresh(entry: MemoryValue | undefined): entry is MemoryValue {
  if (!entry) return false;
  if (entry.expiresAt == null) return true;
  return entry.expiresAt > Date.now();
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const value = await getRedis().get(key);
    if (value != null) return value;
  } catch {
    // fall through to memory store
  }

  const entry = memoryStore.get(key);
  if (!isFresh(entry)) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  try {
    if (ttlSeconds && ttlSeconds > 0) {
      await getRedis().set(key, value, 'EX', ttlSeconds);
    } else {
      await getRedis().set(key, value);
    }
    return;
  } catch {
    // fall back to memory store
  }

  memoryStore.set(key, {
    value,
    expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
  });
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {
    // ignore
  }
  memoryStore.delete(key);
}
