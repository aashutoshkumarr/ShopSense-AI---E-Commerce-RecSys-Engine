export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class CacheService {
  private store: Map<string, CacheEntry<any>> = new Map();
  private hits: number = 0;
  private misses: number = 0;

  /**
   * Fetch item from cache. Returns null if missing or expired.
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    entry.hitCount++;
    this.hits++;
    return entry.value as T;
  }

  /**
   * Store item with TTL (in seconds)
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 60): void {
    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + (ttlSeconds * 1000),
      createdAt: now,
      hitCount: 0
    });
  }

  public has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.store.size,
      hitRate: total > 0 ? Math.round((this.hits / total) * 1000) / 10 : 0
    };
  }

  // Key naming conventions
  public static recKey(model: string, userId: string, query?: string | null): string {
    return `rec:${model}:${userId}:${query ? encodeURIComponent(query) : 'default'}`;
  }

  public static userFeatureKey(userId: string): string {
    return `feat:user:${userId}`;
  }

  public static sessionKey(sessionId: string): string {
    return `sess:${sessionId}`;
  }

  public static experimentKey(expId: string, userId: string): string {
    return `exp:${expId}:${userId}`;
  }
}

export const cacheServiceInstance = new CacheService();
