import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CircuitBreaker, circuitBreakerRegistry } from '../src/backend/infrastructure/resilience/circuitBreaker';

describe('Distributed Resilience & Circuit Breaker Engine Suite', () => {

  test('should initialize in CLOSED state with 0% failure rate', () => {
    const breaker = new CircuitBreaker({
      name: 'test_service_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 3
    });

    assert.strictEqual(breaker.getState(), 'CLOSED');
    const metrics = breaker.getMetrics();
    assert.strictEqual(metrics.state, 'CLOSED');
    assert.strictEqual(metrics.totalRequests, 0);
    assert.strictEqual(metrics.failureRatePercent, 0);
  });

  test('should execute action successfully and maintain CLOSED state', async () => {
    const breaker = new CircuitBreaker({
      name: 'test_success_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 3
    });

    const result = await breaker.execute(async () => {
      return { status: 'healthy', data: [1, 2, 3] };
    });

    assert.strictEqual(result.status, 'healthy');
    assert.strictEqual(breaker.getState(), 'CLOSED');
    assert.strictEqual(breaker.getMetrics().successes, 1);
  });

  test('should trip to OPEN when failure threshold is breached and execute fallback', async () => {
    const breaker = new CircuitBreaker({
      name: 'test_failing_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 3,
      recoveryTimeoutMs: 200
    });

    // 1st failure
    await breaker.execute(
      async () => { throw new Error('Downstream model timeout'); },
      () => ({ fallback: true })
    );

    // 2nd failure
    await breaker.execute(
      async () => { throw new Error('Downstream model timeout'); },
      () => ({ fallback: true })
    );

    // 3rd failure (3 out of 3 = 100% failure rate >= 50%)
    await breaker.execute(
      async () => { throw new Error('Downstream model timeout'); },
      () => ({ fallback: true })
    );

    assert.strictEqual(breaker.getState(), 'OPEN');
    assert.strictEqual(breaker.getMetrics().failureRatePercent, 100);

    // Next request should fail-fast without invoking target action
    let actionInvoked = false;
    const fastFallback = await breaker.execute(
      async () => { actionInvoked = true; return 'live'; },
      (err) => {
        assert.ok(err?.message.includes('fail-fast active'));
        return 'degraded_cache_result';
      }
    );

    assert.strictEqual(actionInvoked, false, 'Action should not be invoked when circuit is OPEN');
    assert.strictEqual(fastFallback, 'degraded_cache_result');
    assert.strictEqual(breaker.getMetrics().rejectedRequests, 1);
  });

  test('should transition to HALF_OPEN after recovery timeout and reset to CLOSED after successful probes', async () => {
    const breaker = new CircuitBreaker({
      name: 'test_recovery_breaker',
      failureThresholdPercent: 50,
      minimumRequests: 2,
      recoveryTimeoutMs: 100 // 100ms for fast testing
    });

    breaker.trip();
    assert.strictEqual(breaker.getState(), 'OPEN');

    // Wait for recovery timeout
    await new Promise(resolve => setTimeout(resolve, 120));
    assert.strictEqual(breaker.getState(), 'HALF_OPEN');

    // Probe 1
    await breaker.execute(async () => 'probe_1_ok');
    assert.strictEqual(breaker.getState(), 'HALF_OPEN');

    // Probe 2 (consecutive success resets to CLOSED)
    await breaker.execute(async () => 'probe_2_ok');
    assert.strictEqual(breaker.getState(), 'CLOSED');
  });

  test('should verify global circuit breaker registry has core commerce breakers registered', () => {
    const allMetrics = circuitBreakerRegistry.getAllMetrics();
    assert.ok(allMetrics.length >= 4);

    const recsysBreaker = circuitBreakerRegistry.get('recsys_ranker_breaker');
    assert.ok(recsysBreaker);
    assert.strictEqual(recsysBreaker.name, 'recsys_ranker_breaker');

    const searchBreaker = circuitBreakerRegistry.get('hybrid_search_breaker');
    assert.ok(searchBreaker);

    const paymentBreaker = circuitBreakerRegistry.get('payment_gateway_breaker');
    assert.ok(paymentBreaker);

    const fleetBreaker = circuitBreakerRegistry.get('dark_store_fleet_breaker');
    assert.ok(fleetBreaker);
  });

});
