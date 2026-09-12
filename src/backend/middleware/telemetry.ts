/**
 * ShopSense AI Commerce OS — OpenTelemetry W3C Distributed Tracing Middleware
 * 
 * Injects W3C TraceContext headers (traceparent, x-trace-id, x-span-id),
 * calculates microservices execution timings, and records distributed flame spans.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  userAgent?: string;
  tags: Record<string, string | number | boolean>;
}

export interface TelemetrySummary {
  totalRequests: number;
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorCount: number;
  errorRatePercent: number;
  requestsPerSecond: number;
}

// In-memory circular ring buffer for real-time observability
const MAX_TRACES_BUFFER = 200;
const traceBuffer: SpanRecord[] = [];
let totalRecordedRequests = 0;
let totalRecordedErrors = 0;
const serverStartTime = Date.now();

export function telemetryMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime();
  const startTimestamp = new Date().toISOString();

  // W3C TraceContext: version(2)-traceId(32)-parentSpanId(16)-traceFlags(2)
  const incomingTraceParent = req.headers['traceparent'] as string;
  let traceId = '';
  let parentSpanId: string | undefined = undefined;

  if (incomingTraceParent && incomingTraceParent.startsWith('00-')) {
    const parts = incomingTraceParent.split('-');
    if (parts.length === 4 && parts[1].length === 32) {
      traceId = parts[1];
      parentSpanId = parts[2];
    }
  }

  if (!traceId) {
    traceId = (req.headers['x-trace-id'] as string) || crypto.randomBytes(16).toString('hex');
  }

  const spanId = crypto.randomBytes(8).toString('hex');

  // Attach to response headers
  res.setHeader('x-trace-id', traceId);
  res.setHeader('x-span-id', spanId);
  res.setHeader('traceparent', `00-${traceId}-${spanId}-01`);

  // Intercept res.end to set Server-Timing before headers are committed
  const originalEnd = res.end;
  res.end = function(this: any, ...args: any[]): any {
    const hrDuration = process.hrtime(startTime);
    const durationMs = Math.round((hrDuration[0] * 1000 + hrDuration[1] / 1e6) * 100) / 100;
    if (!res.headersSent) {
      res.setHeader('Server-Timing', `total;dur=${durationMs};desc="ShopSense Total Duration"`);
    }
    return originalEnd.apply(this, args);
  };

  // Hook into response finish to capture SLA timing and record span
  res.on('finish', () => {
    const hrDuration = process.hrtime(startTime);
    const durationMs = Math.round((hrDuration[0] * 1000 + hrDuration[1] / 1e6) * 100) / 100;

    const isError = res.statusCode >= 400;
    totalRecordedRequests++;
    if (isError) totalRecordedErrors++;

    const span: SpanRecord = {
      traceId,
      spanId,
      parentSpanId,
      method: req.method,
      path: req.path || req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      timestamp: startTimestamp,
      userAgent: req.headers['user-agent'],
      tags: {
        httpRoute: req.route?.path || req.path,
        env: process.env.NODE_ENV || 'development',
        isError
      }
    };

    if (traceBuffer.length >= MAX_TRACES_BUFFER) {
      traceBuffer.shift();
    }
    traceBuffer.push(span);
  });

  next();
}

/**
 * Retrieve recent spans for the Observability Console
 */
export function getRecentSpans(limit: number = 50): SpanRecord[] {
  return traceBuffer.slice(-limit).reverse();
}

/**
 * Compute real-time SLA metrics across buffered spans
 */
export function getTelemetrySummary(): TelemetrySummary {
  if (traceBuffer.length === 0) {
    return {
      totalRequests: totalRecordedRequests,
      averageLatencyMs: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      errorCount: totalRecordedErrors,
      errorRatePercent: 0,
      requestsPerSecond: 0
    };
  }

  const latencies = traceBuffer.map(s => s.durationMs).sort((a, b) => a - b);
  const sum = latencies.reduce((acc, l) => acc + l, 0);
  const avg = Math.round((sum / latencies.length) * 10) / 10;

  const getPercentile = (p: number) => {
    const idx = Math.min(Math.floor((p / 100) * latencies.length), latencies.length - 1);
    return latencies[idx];
  };

  const uptimeSeconds = Math.max(1, (Date.now() - serverStartTime) / 1000);
  const rps = Math.round((totalRecordedRequests / uptimeSeconds) * 100) / 100;
  const errorRate = totalRecordedRequests > 0 
    ? Math.round((totalRecordedErrors / totalRecordedRequests) * 1000) / 10 
    : 0;

  return {
    totalRequests: totalRecordedRequests,
    averageLatencyMs: avg,
    p50LatencyMs: getPercentile(50),
    p95LatencyMs: getPercentile(95),
    p99LatencyMs: getPercentile(99),
    errorCount: totalRecordedErrors,
    errorRatePercent: errorRate,
    requestsPerSecond: rps
  };
}
