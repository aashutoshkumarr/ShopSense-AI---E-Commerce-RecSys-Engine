import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  Layers, 
  Play, 
  TrendingUp, 
  HardDrive,
  Timer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { BenchmarkConfig, BenchmarkReport } from '../types';

export const BenchmarkPlayground: React.FC = () => {
  const [concurrency, setConcurrency] = useState<number>(50);
  const [totalRequests, setTotalRequests] = useState<number>(1000);
  const [cacheEnabled, setCacheEnabled] = useState<boolean>(true);
  const [diversityEnabled, setDiversityEnabled] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<BenchmarkReport | null>(null);

  const runBenchmark = async () => {
    setIsRunning(true);
    try {
      const config: BenchmarkConfig = {
        concurrency,
        totalRequests,
        cacheEnabled,
        diversityEnabled
      };
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data: BenchmarkReport = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runBenchmark();
  }, []);

  const getStageColor = (idx: number) => {
    const colors = ['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    return colors[idx % colors.length];
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              High-Throughput RecSys Production Benchmark &amp; SLA Playground
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Simulate high-concurrency production traffic, measure strict SLA latency distributions ($p_{50}, p_{95}, p_{99}$), and inspect the 6-stage execution waterfall flamegraph.
          </p>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Simulating {totalRequests} Requests...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>Run Stress Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Control Configuration Panel */}
      <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-lg">
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
            <span>Concurrency (Virtual Users):</span>
            <span className="font-mono text-cyan-400">{concurrency}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="200" 
            step="10"
            value={concurrency}
            onChange={(e) => setConcurrency(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1.5">
            <span>Total Requests:</span>
            <span className="font-mono text-indigo-400">{totalRequests} reqs</span>
          </div>
          <input 
            type="range" 
            min="200" 
            max="5000" 
            step="200"
            value={totalRequests}
            onChange={(e) => setTotalRequests(Number(e.target.value))}
            className="w-full accent-indigo-400"
          />
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs">
            <div className="font-semibold text-white">L1 Redis Cache</div>
            <div className="text-[10px] text-slate-400">TTL 60s hot key buffering</div>
          </div>
          <input 
            type="checkbox" 
            checked={cacheEnabled}
            onChange={(e) => setCacheEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-cyan-400"
          />
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs">
            <div className="font-semibold text-white">MMR Diversity Optimization</div>
            <div className="text-[10px] text-slate-400">Maximal Marginal Relevance</div>
          </div>
          <input 
            type="checkbox" 
            checked={diversityEnabled}
            onChange={(e) => setDiversityEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-indigo-400"
          />
        </div>
      </div>

      {/* Primary Telemetry Metrics Row */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Throughput</div>
            <div className="text-xl font-mono font-bold text-white mt-1">
              {report.throughputQps.toLocaleString()} <span className="text-xs text-cyan-400">QPS</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Requests / second</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Median (p50)</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              {report.p50Ms} <span className="text-xs">ms</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">50th percentile</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">95th Percentile (p95)</div>
            <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
              {report.p95Ms} <span className="text-xs">ms</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Tail SLA target</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">99th Percentile (p99)</div>
            <div className="text-xl font-mono font-bold text-purple-400 mt-1">
              {report.p99Ms} <span className="text-xs">ms</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">SLA limit: &lt; 10ms</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Cache Hit Rate</div>
            <div className="text-xl font-mono font-bold text-amber-400 mt-1">
              {report.cacheHitRatePct}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Redis L1 cache</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Memory Heap</div>
            <div className="text-xl font-mono font-bold text-white mt-1">
              {report.memoryHeapMb} <span className="text-xs text-slate-400">MB</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Node process RSS</div>
          </div>
        </div>
      )}

      {/* Latency Waterfall & Distribution Histogram */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stage Waterfall Flamegraph (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">
                  6-Stage Execution Latency Waterfall Flamegraph
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Sum: {report.p50Ms}ms median
              </span>
            </div>

            <div className="space-y-3.5">
              {report.stages.map((st, idx) => (
                <div key={st.stageName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{st.stageName}</span>
                    <div className="font-mono flex items-center gap-2 text-[11px]">
                      <span className="text-white font-bold">{st.latencyMs}ms</span>
                      <span className="text-slate-500">({st.pctOfTotal}%)</span>
                      <span className="text-slate-400">p99: {st.p99Ms}ms</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.max(5, st.pctOfTotal * 2.5)}%`,
                        backgroundColor: getStageColor(idx) 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latency Distribution Histogram (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">
                  Latency SLA Distribution Bins
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {report.totalRequests} samples
              </span>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.latencyHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="bin" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                    {report.latencyHistogram.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#06b6d4' : index === 2 ? '#8b5cf6' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Fastest Sample: <strong className="text-emerald-400 font-mono">{report.minMs}ms</strong></span>
              <span>Slowest Sample: <strong className="text-amber-400 font-mono">{report.maxMs}ms</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
