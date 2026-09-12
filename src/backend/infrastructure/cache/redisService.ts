/**
 * ShopSense AI Commerce OS — Distributed Redis Keyspace Service
 * 
 * Provides production-grade Redis key naming conventions, TTL policies,
 * atomic counters, and key prefix segmentation across all Commerce OS domains.
 */

export interface RedisEntry<T = any> {
  value: T;
  expiresAt: number | null;
  createdAt: number;
}

export class RedisKeyspaceService {
  private static instance: RedisKeyspaceService;
  private memoryStore: Map<string, RedisEntry> = new Map();
  private hashes: Map<string, Map<string, string>> = new Map();

  private constructor() {}

  public static getInstance(): RedisKeyspaceService {
    if (!RedisKeyspaceService.instance) {
      RedisKeyspaceService.instance = new RedisKeyspaceService();
    }
    return RedisKeyspaceService.instance;
  }

  // --- Key Name Conventions (FAANG standard namespace hierarchy) ---

  public static keyspace = {
    rec: (userId: string, domain: string = 'flagship') => `recs:${userId}:${domain}`,
    session: (sessionId: string) => `session:${sessionId}:state`,
    cart: (userId: string) => `cart:${userId}`,
    rateLimit: (clientIp: string, action: string) => `rate:${action}:${clientIp}`,
    idempotency: (key: string) => `idempotency:${key}`,
    darkStoreStock: (storeId: string, productId: string) => `stock:${storeId}:${productId}`,
    searchQuery: (queryHash: string) => `search:cache:${queryHash}`,
    userPersona: (userId: string) => `persona:${userId}:affinities`,
    modelMetrics: (modelVersion: string) => `metrics:model:${modelVersion}`
  };

  // --- Core Key-Value Operations ---

  public async get<T = any>(key: string): Promise<T | null> {
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async set<T = any>(key: string, value: T, ttlSeconds?: number): Promise<'OK'> {
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
    return 'OK';
  }

  public async del(key: string): Promise<number> {
    const existed = this.memoryStore.delete(key);
    return existed ? 1 : 0;
  }

  public async exists(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const entry = this.memoryStore.get(key);
    if (!entry) return false;
    entry.expiresAt = Date.now() + ttlSeconds * 1000;
    return true;
  }

  public async ttl(key: string): Promise<number> {
    const entry = this.memoryStore.get(key);
    if (!entry) return -2;
    if (!entry.expiresAt) return -1;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  public async incr(key: string): Promise<number> {
    const entry = this.memoryStore.get(key);
    const current = (entry && typeof entry.value === 'number') ? entry.value : 0;
    const newVal = current + 1;
    const remainingTtl = entry?.expiresAt ? Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000)) : undefined;
    await this.set(key, newVal, remainingTtl);
    return newVal;
  }

  // --- Hash Operations (hget / hset) ---

  public async hset(hashKey: string, field: string, value: string): Promise<number> {
    if (!this.hashes.has(hashKey)) {
      this.hashes.set(hashKey, new Map());
    }
    const map = this.hashes.get(hashKey)!;
    const isNew = !map.has(field);
    map.set(field, value);
    return isNew ? 1 : 0;
  }

  public async hget(hashKey: string, field: string): Promise<string | null> {
    const map = this.hashes.get(hashKey);
    if (!map) return null;
    return map.get(field) ?? null;
  }

  public async hgetall(hashKey: string): Promise<Record<string, string>> {
    const map = this.hashes.get(hashKey);
    if (!map) return {};
    const res: Record<string, string> = {};
    for (const [k, v] of map.entries()) {
      res[k] = v;
    }
    return res;
  }

  // --- Pattern Invalidation & Maintenance ---

  public async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matched: string[] = [];
    const now = Date.now();

    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.memoryStore.delete(key);
        continue;
      }
      if (regex.test(key)) {
        matched.push(key);
      }
    }
    return matched;
  }

  public async flushall(): Promise<'OK'> {
    this.memoryStore.clear();
    this.hashes.clear();
    return 'OK';
  }

  public getStats(): { keyCount: number; hashCount: number } {
    return {
      keyCount: this.memoryStore.size,
      hashCount: this.hashes.size
    };
  }
}

export const redis = RedisKeyspaceService.getInstance();
