/**
 * ShopSense AI Commerce OS — Netflix Hystrix / Resilience4j Distributed Circuit Breaker Engine
 * 
 * Provides fault isolation, rapid fail-fast behavior, and seamless fallback degradation
 * across downstream RecSys models, hybrid vector search, and payment gateways.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThresholdPercent?: number; // e.g. 50% failures trigger trip
  minimumRequests?: number;         // Minimum executions in window before evaluating threshold
  samplingWindowMs?: number;        // Time window for counting failures (default 10s)
  recoveryTimeoutMs?: number;       // Time to wait before testing recovery in HALF_OPEN (default 5s)
  name: string;
}

export interface CircuitBreakerMetrics {
  name: string;
  state: CircuitState;
  totalRequests: number;
  successes: number;
  failures: number;
  rejectedRequests: number;
  failureRatePercent: number;
  lastStateChange: string;
  lastFailureTime?: string;
  consecutiveSuccessesInHalfOpen: number;
}

export class CircuitBreaker {
  public readonly name: string;
  private state: CircuitState = 'CLOSED';
  private failureThresholdPercent: number;
  private minimumRequests: number;
  private samplingWindowMs: number;
  private recoveryTimeoutMs: number;

  private totalRequests: number = 0;
  private successes: number = 0;
  private failures: number = 0;
  private rejectedRequests: number = 0;
  private lastStateChange: number = Date.now();
  private lastFailureTime?: number;
  private consecutiveSuccessesInHalfOpen: number = 0;
  private windowStart: number = Date.now();

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThresholdPercent = options.failureThresholdPercent ?? 50;
    this.minimumRequests = options.minimumRequests ?? 4;
    this.samplingWindowMs = options.samplingWindowMs ?? 10000;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 5000;
  }

  public getState(): CircuitState {
    this.checkHalfOpenTransition();
    return this.state;
  }

  private checkHalfOpenTransition(): void {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastStateChange >= this.recoveryTimeoutMs) {
        this.transitionTo('HALF_OPEN');
      }
    }
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChange = Date.now();
    if (newState === 'HALF_OPEN') {
      this.consecutiveSuccessesInHalfOpen = 0;
    } else if (newState === 'CLOSED') {
      this.resetWindow();
    }
  }

  private resetWindow(): void {
    this.totalRequests = 0;
    this.successes = 0;
    this.failures = 0;
    this.windowStart = Date.now();
  }

  private rotateWindowIfNeeded(): void {
    const now = Date.now();
    if (now - this.windowStart >= this.samplingWindowMs) {
      this.resetWindow();
    }
  }

  public async execute<T>(
    action: () => Promise<T>,
    fallback?: (error?: any) => Promise<T> | T
  ): Promise<T> {
    this.rotateWindowIfNeeded();
    this.checkHalfOpenTransition();

    // Fail-fast when circuit is OPEN
    if (this.state === 'OPEN') {
      this.rejectedRequests++;
      if (fallback) {
        return fallback(new Error(`CircuitBreaker [${this.name}] is OPEN (fail-fast active)`));
      }
      throw new Error(`CircuitBreaker [${this.name}] is OPEN (downstream degraded)`);
    }

    this.totalRequests++;

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (err: any) {
      this.recordFailure();
      if (fallback) {
        return fallback(err);
      }
      throw err;
    }
  }

  private recordSuccess(): void {
    this.successes++;
    if (this.state === 'HALF_OPEN') {
      this.consecutiveSuccessesInHalfOpen++;
      // If 2 consecutive probes pass in HALF_OPEN, fully recover to CLOSED
      if (this.consecutiveSuccessesInHalfOpen >= 2) {
        this.transitionTo('CLOSED');
      }
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Any failure during recovery test immediately kicks back to OPEN
      this.transitionTo('OPEN');
      return;
    }

    if (this.state === 'CLOSED') {
      if (this.totalRequests >= this.minimumRequests) {
        const failureRate = (this.failures / this.totalRequests) * 100;
        if (failureRate >= this.failureThresholdPercent) {
          this.transitionTo('OPEN');
        }
      }
    }
  }

  public trip(): void {
    this.transitionTo('OPEN');
  }

  public reset(): void {
    this.transitionTo('CLOSED');
    this.rejectedRequests = 0;
  }

  public getMetrics(): CircuitBreakerMetrics {
    const failureRate = this.totalRequests > 0 
      ? Math.round((this.failures / this.totalRequests) * 100) 
      : 0;

    return {
      name: this.name,
      state: this.getState(),
      totalRequests: this.totalRequests,
      successes: this.successes,
      failures: this.failures,
      rejectedRequests: this.rejectedRequests,
      failureRatePercent: failureRate,
      lastStateChange: new Date(this.lastStateChange).toISOString(),
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : undefined,
      consecutiveSuccessesInHalfOpen: this.consecutiveSuccessesInHalfOpen
    };
  }
}

/**
 * Global Registry of Platform Circuit Breakers
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    this.register(new CircuitBreaker({
      name: 'recsys_ranker_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 3,
      recoveryTimeoutMs: 4000
    }));

    this.register(new CircuitBreaker({
      name: 'hybrid_search_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 3,
      recoveryTimeoutMs: 4000
    }));

    this.register(new CircuitBreaker({
      name: 'payment_gateway_breaker',
      failureThresholdPercent: 40,
      minimumRequests: 3,
      recoveryTimeoutMs: 5000
    }));

    this.register(new CircuitBreaker({
      name: 'dark_store_fleet_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 3,
      recoveryTimeoutMs: 4000
    }));
  }

  public register(breaker: CircuitBreaker): void {
    this.breakers.set(breaker.name, breaker);
  }

  public get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  public getAllMetrics(): CircuitBreakerMetrics[] {
    return Array.from(this.breakers.values()).map(b => b.getMetrics());
  }

  public resetAll(): void {
    this.breakers.forEach(b => b.reset());
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
