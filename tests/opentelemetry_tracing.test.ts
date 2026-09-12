import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  telemetryMiddleware, 
  getRecentSpans, 
  getTelemetrySummary 
} from '../src/backend/middleware/telemetry';

describe('OpenTelemetry W3C Distributed Tracing Suite', () => {

  test('should inject W3C traceparent, x-trace-id, and x-span-id into response headers', (t, done) => {
    const headers: Record<string, string> = {};
    const mockReq: any = {
      headers: {},
      method: 'GET',
      path: '/api/recommendations',
      route: { path: '/api/recommendations' }
    };

    const listeners: Record<string, Function[]> = {};
    const mockRes: any = {
      setHeader: (name: string, value: string) => {
        headers[name.toLowerCase()] = value;
      },
      statusCode: 200,
      on: (event: string, fn: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(fn);
      }
    };

    telemetryMiddleware(mockReq, mockRes, () => {
      assert.ok(headers['x-trace-id'], 'Must include x-trace-id header');
      assert.ok(headers['x-span-id'], 'Must include x-span-id header');
      assert.ok(headers['traceparent'], 'Must include W3C traceparent header');
      assert.ok(headers['traceparent'].startsWith('00-'), 'Traceparent must start with version 00');
      assert.strictEqual(headers['x-trace-id'].length, 32, 'Trace ID must be 32 hex chars (16 bytes)');
      assert.strictEqual(headers['x-span-id'].length, 16, 'Span ID must be 16 hex chars (8 bytes)');

      // Simulate response finish
      listeners['finish']?.forEach(fn => fn());

      const spans = getRecentSpans(10);
      assert.ok(spans.length > 0, 'Spans must be buffered');
      const latest = spans[0];
      assert.strictEqual(latest.method, 'GET');
      assert.strictEqual(latest.path, '/api/recommendations');
      assert.strictEqual(latest.statusCode, 200);
      assert.ok(latest.durationMs >= 0);
      done();
    });
  });

  test('should propagate incoming W3C traceparent from upstream client or microservice', (t, done) => {
    const upstreamTraceId = '4bf92f3577b34da6a3ce929d0e0e4736';
    const upstreamSpanId = '00f067aa0ba902b7';
    const upstreamTraceparent = `00-${upstreamTraceId}-${upstreamSpanId}-01`;

    const headers: Record<string, string> = {};
    const mockReq: any = {
      headers: { traceparent: upstreamTraceparent },
      method: 'POST',
      path: '/api/payments/intent'
    };

    const listeners: Record<string, Function[]> = {};
    const mockRes: any = {
      setHeader: (name: string, value: string) => {
        headers[name.toLowerCase()] = value;
      },
      statusCode: 201,
      on: (event: string, fn: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(fn);
      }
    };

    telemetryMiddleware(mockReq, mockRes, () => {
      assert.strictEqual(headers['x-trace-id'], upstreamTraceId, 'Trace ID must match propagated upstream ID');
      assert.ok(headers['traceparent'].includes(upstreamTraceId));
      listeners['finish']?.forEach(fn => fn());
      done();
    });
  });

  test('should compute accurate SLA latency percentiles and error metrics', () => {
    const summary = getTelemetrySummary();
    assert.ok(typeof summary.totalRequests === 'number');
    assert.ok(typeof summary.p50LatencyMs === 'number');
    assert.ok(typeof summary.p95LatencyMs === 'number');
    assert.ok(typeof summary.p99LatencyMs === 'number');
    assert.ok(summary.p95LatencyMs >= summary.p50LatencyMs);
    assert.ok(summary.p99LatencyMs >= summary.p95LatencyMs);
  });

});
