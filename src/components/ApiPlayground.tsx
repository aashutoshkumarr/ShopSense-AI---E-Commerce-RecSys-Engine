import React, { useState } from 'react';
import { 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  Globe, 
  Timer, 
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultBody?: any;
  defaultQuery?: Record<string, string>;
}

export const ApiPlayground: React.FC = () => {
  const endpoints: ApiEndpoint[] = [
    {
      id: 'recs',
      name: 'Execute Multi-Stage Recommendation Pipeline',
      method: 'POST',
      path: '/api/recommendations',
      description: 'Executes 4-stage candidate generation, online GBDT LambdaMART ranking, business rules filtering, and MMR diversification.',
      defaultBody: {
        userId: 'user-dev-alex',
        intent: null,
        config: {
          contentWeight: 0.35,
          collaborativeWeight: 0.35,
          sessionWeight: 0.20,
          trendingWeight: 0.10,
          diversityLevel: 0.70,
          topK: 8,
          boostInStock: true
        }
      }
    },
    {
      id: 'intent',
      name: 'Parse Natural Language Shopping Intent',
      method: 'POST',
      path: '/api/parse-intent',
      description: 'Deterministic semantic NLU parser extracting vertical category, INR budget bound, brand preferences, and hardware specs.',
      defaultBody: {
        query: 'ThinkPad or MacBook laptop under 1.2 lakh for coding and docker'
      }
    },
    {
      id: 'buybox',
      name: 'Evaluate Amazon-Grade Buy Box Winner',
      method: 'GET',
      path: '/api/buybox/prod-lap-01',
      description: 'Evaluates multi-merchant Buy Box algorithm across verified sellers considering price, Prime shipping speed, seller rating, and stock reliability.'
    },
    {
      id: 'bandit',
      name: 'Fetch Thompson Sampling Multi-Armed Bandit Telemetry',
      method: 'GET',
      path: '/api/bandit/telemetry',
      description: 'Retrieves Bayesian Beta(alpha, beta) parameters, empirical CTRs, and cumulative regret curve across all candidate arms.'
    },
    {
      id: 'benchmark',
      name: 'Run Production RecSys Latency & Throughput Benchmark',
      method: 'POST',
      path: '/api/benchmark/run',
      description: 'Simulates high-throughput production load, measuring p50, p95, p99 latency percentiles and execution waterfall metrics.',
      defaultBody: {
        concurrency: 50,
        totalRequests: 500,
        cacheEnabled: true,
        diversityEnabled: true
      }
    },
    {
      id: 'bundle',
      name: 'Get Frequently Bought Together Smart Bundle',
      method: 'GET',
      path: '/api/bundles/prod-lap-01',
      description: 'Generates bipartite co-purchase graph bundles with complementary ecosystem accessories and instant 12% bundle savings.'
    }
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(endpoints[0]);
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify(endpoints[0].defaultBody || {}, null, 2));
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'ts' | 'python'>('curl');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: ApiEndpoint) => {
    setSelectedEndpoint(ep);
    setRequestBody(JSON.stringify(ep.defaultBody || {}, null, 2));
    setResponseJson(null);
    setResponseStatus(null);
    setResponseTimeMs(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      let options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const elapsed = Math.round(performance.now() - start);
      const data = await res.json();

      setResponseStatus(res.status);
      setResponseTimeMs(elapsed);
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson(JSON.stringify({ error: err.message || 'Request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = () => {
    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "http://localhost:3000${selectedEndpoint.path}" \\
  -H "Accept: application/json"`;
    }
    return `curl -X POST "http://localhost:3000${selectedEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody.replace(/'/g, "\\'")}'`;
  };

  const getTsSnippet = () => {
    if (selectedEndpoint.method === 'GET') {
      return `const response = await fetch('http://localhost:3000${selectedEndpoint.path}', {
  method: 'GET',
  headers: { 'Accept': 'application/json' }
});
const data = await response.json();
console.log(data);`;
    }
    return `const response = await fetch('http://localhost:3000${selectedEndpoint.path}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${requestBody})
});
const data = await response.json();
console.log(data);`;
  };

  const getPythonSnippet = () => {
    if (selectedEndpoint.method === 'GET') {
      return `import requests

response = requests.get('http://localhost:3000${selectedEndpoint.path}')
print(response.json())`;
    }
    return `import requests

payload = ${requestBody}
response = requests.post(
    'http://localhost:3000${selectedEndpoint.path}',
    json=payload
)
print(response.json())`;
  };

  const currentSnippet = activeCodeTab === 'curl' 
    ? getCurlSnippet() 
    : activeCodeTab === 'ts' 
    ? getTsSnippet() 
    : getPythonSnippet();

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!responseJson) return;
    navigator.clipboard.writeText(responseJson);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Terminal className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Enterprise Developer API &amp; OpenAPI Console
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Live interactive sandbox to query the ShopSense recommendation pipeline, Buy Box repricer, Thompson Sampling bandit, and systems benchmark APIs with copyable SDK snippets.
          </p>
        </div>

        <button
          onClick={handleExecuteRequest}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Executing API Request...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send API Request</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Endpoints & Request Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Endpoint Selector */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2 shadow-lg">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block px-1">
              Select API Endpoint:
            </span>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {endpoints.map(ep => (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                    selectedEndpoint.id === ep.id
                      ? 'bg-indigo-950/50 border-cyan-500/50 text-white shadow'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ep.method === 'GET' 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs text-white truncate">{ep.path}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">{ep.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Payload Editor (if POST) */}
          {selectedEndpoint.method === 'POST' && (
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2 shadow-lg">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  JSON Request Payload:
                </span>
                <span className="text-[10px] text-slate-500 font-mono">application/json</span>
              </div>
              <textarea 
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={8}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 transition leading-relaxed resize-none"
              />
            </div>
          )}

          {/* Code Snippet Generator */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  SDK Code Snippet:
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                {(['curl', 'ts', 'python'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-2 py-0.5 rounded transition ${
                      activeCodeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <pre className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                {currentSnippet}
              </pre>
              <button
                onClick={handleCopySnippet}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Copy code snippet"
              >
                {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Response Viewer (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  Live Response Body
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {responseStatus && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${
                      responseStatus === 200 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {responseStatus} OK
                    </span>
                    {responseTimeMs && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Timer className="h-3 w-3 text-cyan-400" />
                        {responseTimeMs}ms
                      </span>
                    )}
                  </div>
                )}

                {responseJson && (
                  <button
                    onClick={handleCopyResponse}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono transition flex items-center gap-1"
                  >
                    {copiedResponse ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>Copy JSON</span>
                  </button>
                )}
              </div>
            </div>

            {responseJson ? (
              <pre className="p-4 rounded-2xl bg-slate-900 border border-slate-800/90 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-[550px] leading-relaxed select-all">
                {responseJson}
              </pre>
            ) : (
              <div className="py-32 text-center text-xs text-slate-500 space-y-2">
                <Terminal className="h-8 w-8 mx-auto text-slate-600" />
                <p>Click "Send API Request" to execute the call against the live server.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Protocol: HTTP/1.1 JSON REST</span>
            <span>Security: Bearer JWT Auth Enabled</span>
          </div>
        </div>

      </div>
    </div>
  );
};
