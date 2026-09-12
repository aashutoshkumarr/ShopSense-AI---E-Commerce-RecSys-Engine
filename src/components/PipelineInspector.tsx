import React, { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Filter, 
  Zap, 
  Database, 
  TrendingUp, 
  Users, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { PipelineExecutionResult, ScoredCandidate, Currency } from '../types';

interface PipelineInspectorProps {
  pipelineResult: PipelineExecutionResult | null;
  currency: Currency;
  onRefreshPipeline: () => void;
  onSelectCandidate: (candidate: ScoredCandidate) => void;
  onOpenSettings: () => void;
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({
  pipelineResult,
  currency,
  onRefreshPipeline,
  onSelectCandidate,
  onOpenSettings
}) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  if (!pipelineResult) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-cyan-400 mb-3" />
        <p>Loading real-time recommendation pipeline telemetry...</p>
      </div>
    );
  }

  const stages = [
    {
      id: 'candidate_gen',
      name: '1. CANDIDATE GENERATION',
      subtitle: 'Multi-channel retrieval',
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      id: 'candidate_merge',
      name: '2. CANDIDATE MERGE',
      subtitle: 'Deduplication & Union',
      icon: Layers,
      color: 'from-cyan-600 to-teal-600',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      id: 'feature_calc',
      name: '3. FEATURE CALCULATION',
      subtitle: 'Dynamic online features',
      icon: Cpu,
      color: 'from-teal-600 to-emerald-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'ranking_model',
      name: '4. RANKING MODEL',
      subtitle: 'LightGBM LambdaMART',
      icon: Zap,
      color: 'from-indigo-600 to-purple-600',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      id: 'business_rules',
      name: '5. BUSINESS RULES',
      subtitle: 'In-stock, MMR, Quotas',
      icon: Filter,
      color: 'from-purple-600 to-pink-600',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    },
    {
      id: 'top_k_results',
      name: '6. TOP-K & CACHE',
      subtitle: 'Redis cache + Response',
      icon: Database,
      color: 'from-amber-600 to-orange-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Top Header & Execution Telemetry */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Live Recommendation Pipeline Inspector
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
              User: {pipelineResult.userPersonaName}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-medium ${
              pipelineResult.cacheStatus === 'HIT'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              Cache: {pipelineResult.cacheStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-stage candidate scoring, feature engineering attribution, and business rules constraint waterfall.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Total Latency:</span>{' '}
            <strong className="text-cyan-400 font-bold">{pipelineResult.totalLatencyMs} ms</strong>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Sliders className="h-3.5 w-3.5" />
            Tune Parameters
          </button>

          <button
            onClick={onRefreshPipeline}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-medium shadow transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-run Pipeline
          </button>
        </div>
      </div>

      {/* Interactive Step-by-Step Architecture Waterfall Flow */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stage, idx) => {
          const isSelected = selectedStageIdx === idx;
          const StageIcon = stage.icon;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStageIdx(idx)}
              className={`p-3.5 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stage.color} text-white shadow-sm`}>
                    <StageIcon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Step {idx + 1}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-tight">
                  {stage.name.replace(/^\d+\.\s*/, '')}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {stage.subtitle}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-cyan-300">
                <span>Inspect</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Deep Dive Details Panel */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        
        {/* STAGE 1: Candidate Generation Deep Dive */}
        {selectedStageIdx === 0 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Stage 1: Multi-Channel Candidate Generation (Retrieval)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Retrieves initial candidate subsets from 4 independent algorithmic channels to maximize recall.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20">
                Channel Split: 4 Sources
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Channel 1: Content-Based */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-cyan-400">Content-Based</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                    Weight 35%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Cosine similarity against user vector profile & tags.
                </p>
                <div className="space-y-2">
                  {pipelineResult.candidatePools.contentBased.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-slate-900 text-xs border border-slate-800">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span className="truncate max-w-[150px]">{c.title}</span>
                        <span className="font-mono text-cyan-400">{(c.score * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel 2: Collaborative Filtering */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-purple-400">Collaborative Filtering</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">
                    Weight 30%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Item-item co-occurrence matrix & user interaction overlap.
                </p>
                <div className="space-y-2">
                  {pipelineResult.candidatePools.collaborative.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-slate-900 text-xs border border-slate-800">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span className="truncate max-w-[150px]">{c.title}</span>
                        <span className="font-mono text-purple-400">{(c.score * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel 3: Session-Based */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-emerald-400">Session-Based</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                    Weight 20%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Real-time Markov transitions from last 5 session events.
                </p>
                <div className="space-y-2">
                  {pipelineResult.candidatePools.sessionBased.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-slate-900 text-xs border border-slate-800">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span className="truncate max-w-[150px]">{c.title}</span>
                        <span className="font-mono text-emerald-400">{(c.score * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel 4: Trending / Popularity */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-amber-400">Trending / Velocity</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                    Weight 15%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Engagement velocity = CTR × Popularity × Freshness.
                </p>
                <div className="space-y-2">
                  {pipelineResult.candidatePools.trending.map((c) => (
                    <div key={c.id} className="p-2 rounded bg-slate-900 text-xs border border-slate-800">
                      <div className="flex justify-between font-medium text-slate-200">
                        <span className="truncate max-w-[150px]">{c.title}</span>
                        <span className="font-mono text-amber-400">{(c.score * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STAGE 2: Candidate Merge & Deduplication */}
        {selectedStageIdx === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-teal-400" />
                Stage 2: Candidate Merge & Score Normalization
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Merges candidate outputs from all retrieval channels, deduplicates identical product IDs, and aggregates normalized multi-channel scores.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-cyan-400 font-bold">// Merge Aggregation Formula:</div>
              <div>MergedScore(i) = &Sigma; [ ChannelWeight(c) &times; NormalizedScore(i, c) ] / &Sigma; ChannelWeight(c)</div>
              <div className="text-slate-500 text-[11px]">Deduplication Result: {pipelineResult.mergedCount} unique candidate entities passed to Feature Engineering.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pipelineResult.topKResults.map((c) => (
                <div key={c.product.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[180px]">{c.product.title}</span>
                    <span className="font-mono text-teal-300 font-bold">{(c.mergedScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {c.candidateSources.map((s) => (
                      <span key={s.source} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {s.source.replace('_', ' ')}: {(s.normalizedScore * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: Feature Calculation */}
        {selectedStageIdx === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-400" />
                Stage 3: Online Feature Store Vector Calculation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Computes 6 real-time online feature vectors for each candidate passing through the pipeline.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3 text-center">Semantic Sim</th>
                    <th className="p-3 text-center">User Affinity</th>
                    <th className="p-3 text-center">Popularity</th>
                    <th className="p-3 text-center">Hist. CTR</th>
                    <th className="p-3 text-center">Price Match</th>
                    <th className="p-3 text-center">Freshness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono">
                  {pipelineResult.topKResults.map((c) => (
                    <tr key={c.product.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 font-sans font-medium text-slate-200">
                        <div className="truncate max-w-[200px]">{c.product.title}</div>
                        <div className="text-[10px] text-slate-500">{c.product.brand} • {c.product.category}</div>
                      </td>
                      <td className="p-3 text-center text-cyan-400">{(c.features.semanticSimilarity * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-purple-400">{(c.features.userAffinity * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-amber-400">{(c.features.popularityScore * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-emerald-400">{(c.features.ctrHistorical * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-pink-400">{(c.features.priceAffinity * 100).toFixed(0)}%</td>
                      <td className="p-3 text-center text-slate-400">{(c.features.freshnessScore * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAGE 4: Ranking Model Deep Dive */}
        {selectedStageIdx === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Stage 4: Ranking Model (LightGBM LambdaMART)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gradient-Boosted Decision Trees model evaluated per candidate with SHAP feature attribution decomposition.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 font-mono text-xs border border-purple-500/20">
                Model: {pipelineResult.activeModelVersion}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pipelineResult.topKResults.slice(0, 4).map((c, idx) => (
                <div key={c.product.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 font-mono text-xs font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-white truncate max-w-[200px]">
                        {c.product.title}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      Score: {(c.rankingScore * 100).toFixed(1)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-2 font-mono">
                    SHAP Feature Contribution Share:
                  </div>

                  <div className="space-y-1.5">
                    {c.featureAttributions.map((attr) => (
                      <div key={attr.featureName} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-slate-300">
                          <span>{attr.featureName}</span>
                          <span className="font-mono text-slate-400">+{attr.percentage}% (+{attr.contribution.toFixed(3)})</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${Math.min(100, attr.percentage * 2.2)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 5: Business Rules & Re-ranking */}
        {selectedStageIdx === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-pink-400" />
                  Stage 5: Business Rules & Diversity Re-ranking (MMR)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Applies stock verification, price boundaries, intra-list diversity penalties (MMR), category quotas, and promotional boosts.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-pink-500/10 text-pink-300 font-mono text-xs border border-pink-500/20">
                Filtered Out: {pipelineResult.filteredOutCount} items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-xs text-emerald-400 block mb-1">✓ In-Stock Filter</span>
                <p className="text-[11px] text-slate-400">Drops zero-inventory catalog items to prevent cart bounce.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-xs text-cyan-400 block mb-1">✓ Intra-List Diversity (MMR)</span>
                <p className="text-[11px] text-slate-400">Penalizes cosine similarity between consecutive ranked items.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-xs text-purple-400 block mb-1">✓ Category Quota Ceiling</span>
                <p className="text-[11px] text-slate-400">Ensures balanced catalog feed (max 3 items per category).</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h4 className="text-xs font-semibold text-slate-300 font-mono">Applied Rules on Top Candidates:</h4>
              {pipelineResult.topKResults.slice(0, 5).map((c) => (
                <div key={c.product.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-200">{c.product.title}</span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {c.businessRuleResults.map((r, i) => (
                        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          r.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950 text-rose-300'
                        }`}>
                          {r.ruleName}: {r.note}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold text-xs">
                    Score: {(c.finalScore * 100).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 6: Top-K & Redis Cache */}
        {selectedStageIdx === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-amber-400" />
                  Stage 6: Top-K Results & Redis Cache
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Final ranked Top-K products stored in Redis cache with 60-second TTL for sub-5ms subsequent responses.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 font-mono text-xs border border-amber-500/20">
                Key: {pipelineResult.cacheKey}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pipelineResult.topKResults.map((c) => (
                <div 
                  key={c.product.id}
                  onClick={() => onSelectCandidate(c)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold text-[10px]">
                      Rank #{c.rank}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      {(c.finalScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{c.product.title}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {currency === 'INR' ? `₹${c.product.priceINR.toLocaleString()}` : `$${c.product.priceUSD.toLocaleString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
