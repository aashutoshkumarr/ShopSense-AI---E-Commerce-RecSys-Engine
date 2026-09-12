import React from 'react';
import { 
  FileText, 
  Layers, 
  Cpu, 
  Database, 
  Bot, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight,
  GitBranch,
  BookOpen,
  Server,
  Code
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Blueprint Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Distributed E-Commerce Recommendation System Architecture
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Production blueprint: Multi-stage online serving, high-precision semantic intent parser, and separate offline ML pipeline.
            </p>
          </div>
        </div>
      </div>

      {/* The Memorization Flow Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 border border-indigo-500/40 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">The Production RecSys Flow (Interview Blueprint)</h3>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto">
          User → Event Tracking → Features → Candidate Generation → Candidate Fusion → Ranking → Business Rules → Top-K Recommendations → User Feedback → Model Training → Improved Recommendations.
        </div>
      </div>

      {/* 3-Column Architecture Split: Online Serving vs Offline ML vs Semantic Intent Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Core Online Live Recommendation Pipeline */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Zap className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">1. Online Live Serving Pipeline</h3>
              <p className="text-[11px] text-slate-400">Sub-50ms real-time request path</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-3 rounded-xl bg-slate-950 border border-blue-900/50">
              <span className="font-bold text-cyan-300 block">A. Candidate Generation</span>
              <p className="text-[11px] text-slate-400 mt-1">Multi-channel retrieval from 10k+ items down to ~100 candidates:</p>
              <ul className="list-disc list-inside text-[10px] text-slate-300 mt-1 space-y-0.5 font-mono">
                <li>Content-Based (Vector Cosine Sim)</li>
                <li>Collaborative Filtering (Item-Item CF)</li>
                <li>Session-Based (Markov / RNN window)</li>
                <li>Trending / Popularity Velocity</li>
              </ul>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-teal-900/50">
              <span className="font-bold text-teal-300 block">B. Candidate Merge & Deduplication</span>
              <p className="text-[11px] text-slate-400 mt-1">Score normalization (Min-Max/Z-score) and channel weighting.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/50">
              <span className="font-bold text-emerald-300 block">C. Online Feature Store Calculation</span>
              <p className="text-[11px] text-slate-400 mt-1">Computes dynamic features (Similarity, User affinity, CTR, Price affinity, Freshness).</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-purple-900/50">
              <span className="font-bold text-purple-300 block">D. Ranking Model (LightGBM)</span>
              <p className="text-[11px] text-slate-400 mt-1">Gradient-Boosted Decision Trees (LambdaMART) predicting engagement likelihood.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-pink-900/50">
              <span className="font-bold text-pink-300 block">E. Business Rules & Diversity (MMR)</span>
              <p className="text-[11px] text-slate-400 mt-1">In-stock enforcement, price bounds, category quotas, and MMR anti-redundancy.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/50">
              <span className="font-bold text-amber-300 block">F. Top-K Results & Redis Cache</span>
              <p className="text-[11px] text-slate-400 mt-1">Serves personalized items with 60s cache TTL to guarantee fast user experience.</p>
            </div>

          </div>
        </div>

        {/* Column 2: Separate Offline ML Pipeline */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">2. Separate Offline ML Pipeline</h3>
              <p className="text-[11px] text-slate-400">Asynchronous batch & event-driven retraining</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">A. User & System Event Collection</span>
              <p className="text-[11px] text-slate-400 mt-1">Kafka/EventStream logging clicks, impressions, dwell time, add-to-cart, orders.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">B. Data Cleaning & Session Windows</span>
              <p className="text-[11px] text-slate-400 mt-1">Bot filtration, dwell thresholding, negative sampling.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">C. Candidate Models Retraining</span>
              <p className="text-[11px] text-slate-400 mt-1">Trains Matrix Factorization, Sentence Transformer embeddings, and Session RNN.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">D. Ranking Model (LightGBM) Training</span>
              <p className="text-[11px] text-slate-400 mt-1">Optimizes pairwise/listwise ranking loss (LambdaMART).</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">E. Offline Evaluation Benchmark</span>
              <p className="text-[11px] text-slate-400 mt-1">Validates Precision@K, Recall@K, NDCG@10, MAP, MRR on holdout interactions.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-800">
              <span className="font-bold text-indigo-300 block">F. Model Registry & A/B Rollout</span>
              <p className="text-[11px] text-slate-400 mt-1">Automated checkpoint registration with canary traffic split.</p>
            </div>

          </div>
        </div>

        {/* Column 3: Decoupled Semantic Intent Layer */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bot className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">3. Decoupled Semantic Intent Layer</h3>
              <p className="text-[11px] text-slate-400">Natural language understanding outside core pipeline</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            
            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/50">
              <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block mb-1">User Input:</span>
              <div className="p-2 rounded bg-slate-900 text-amber-300 font-mono text-xs">
                "Show me a laptop for coding under ₹70,000"
              </div>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/50">
              <span className="font-bold text-indigo-300 block">Semantic NLU Intent Parser</span>
              <p className="text-[11px] text-slate-400 mt-1">Translates unstructured text into structured schema:</p>
              <pre className="p-2 rounded bg-slate-900 text-[10px] text-slate-300 font-mono mt-1 overflow-x-auto">
{`{
  "category": "Laptops",
  "maxPrice": 70000,
  "features": ["16GB RAM", "coding"],
  "useCase": "software_dev"
}`}
              </pre>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/50">
              <span className="font-bold text-cyan-300 block">Search & Recommendation Engine</span>
              <p className="text-[11px] text-slate-400 mt-1">Feeds structured parameters into multi-channel candidate generation & ranking.</p>
            </div>

            <div className="flex justify-center text-slate-500">
              <ArrowDown className="h-4 w-4" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-900/50">
              <span className="font-bold text-emerald-300 block">Ranked Products + Explanations</span>
              <p className="text-[11px] text-slate-400 mt-1">Returns Top-K products with transparent feature attribution & conversational reasoning.</p>
            </div>

          </div>
        </div>

      </div>

      {/* Technology Stack Grid */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="h-4 w-4 text-cyan-400" />
          Production Technology Stack
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase block font-semibold">Frontend</span>
            <div className="font-medium text-slate-200 mt-1">React / Next.js</div>
            <div className="text-[10px] text-slate-500">Tailwind, Zustand</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-purple-400 uppercase block font-semibold">Backend</span>
            <div className="font-medium text-slate-200 mt-1">FastAPI / Express</div>
            <div className="text-[10px] text-slate-500">Pydantic, SQLAlchemy</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block font-semibold">Data & Cache</span>
            <div className="font-medium text-slate-200 mt-1">PostgreSQL + pgvector</div>
            <div className="text-[10px] text-slate-500">Redis (Sub-5ms Cache)</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-amber-400 uppercase block font-semibold">ML & Ranking</span>
            <div className="font-medium text-slate-200 mt-1">LightGBM / implicit</div>
            <div className="text-[10px] text-slate-500">Sentence Transformers</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-pink-400 uppercase block font-semibold">Semantic NLU</span>
            <div className="font-medium text-slate-200 mt-1">NLU Query Engine</div>
            <div className="text-[10px] text-slate-500">Grammar &amp; Constraint Grounding</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-mono text-blue-400 uppercase block font-semibold">Infra</span>
            <div className="font-medium text-slate-200 mt-1">Docker + Celery</div>
            <div className="text-[10px] text-slate-500">GitHub Actions CI/CD</div>
          </div>

        </div>
      </div>

    </div>
  );
};
