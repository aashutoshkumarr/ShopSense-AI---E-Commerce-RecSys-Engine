import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  BarChart2, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Award, 
  Layers, 
  Sliders,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OfflineEvaluationReport, MLModelVersion } from '../types';

export const MLScorecardHub: React.FC = () => {
  const [report, setReport] = useState<OfflineEvaluationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainProgress, setRetrainProgress] = useState<number>(0);
  const [retrainSuccessMsg, setRetrainSuccessMsg] = useState<string | null>(null);

  const fetchMLData = async () => {
    try {
      const res = await fetch('/api/ml/models');
      const data = await res.json();
      setReport(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load ML models data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMLData();
  }, []);

  const handleTriggerRetrain = async () => {
    setIsRetraining(true);
    setRetrainProgress(0);
    setRetrainSuccessMsg(null);

    const interval = setInterval(() => {
      setRetrainProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    try {
      const res = await fetch('/api/ml/retrain', { method: 'POST' });
      const data = await res.json();

      setTimeout(() => {
        clearInterval(interval);
        setRetrainProgress(100);
        setIsRetraining(false);
        setRetrainSuccessMsg(data.message);
        fetchMLData();

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 2500);
    } catch (err) {
      clearInterval(interval);
      setIsRetraining(false);
      console.error('Retraining failed:', err);
    }
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-purple-400" />
        <span>Loading ML Scorecard &amp; Model Registry...</span>
      </div>
    );
  }

  const sc = report.scorecard;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">ML Model Control Center</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-emerald-500/10 text-emerald-300 border-emerald-500/30 font-semibold">
                  Active Model: hybrid-lgbm-v3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated on {report.totalTrainingSamples.toLocaleString()} behavioral events &bull; 6 Online Feature Attributions &bull; LambdaMART Loss
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            id="trigger-ml-retrain-btn"
            onClick={handleTriggerRetrain}
            disabled={isRetraining}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg transition ${
              isRetraining
                ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20'
            }`}
          >
            {isRetraining ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-purple-300" />
                <span>Retraining GBDT Ranker ({retrainProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Trigger Offline ML Retrain Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Retrain Success Toast */}
      {retrainSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{retrainSuccessMsg}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            DEPLOYED TO PRODUCTION
          </span>
        </div>
      )}

      {/* 6 Key Model Metric Scorecards (Precision@10, Recall@10, NDCG@10, CTR, Conversion, Coverage) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Precision@10 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Precision@10</span>
          <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">{sc.precisionAt10.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">61% top-10 relevance</span>
        </div>

        {/* Recall@10 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Recall@10</span>
          <div className="text-2xl font-bold text-indigo-300 mt-1 font-mono">{sc.recallAt10.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">48% candidate capture</span>
        </div>

        {/* NDCG@10 */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">NDCG@10</span>
          <div className="text-2xl font-bold text-purple-300 mt-1 font-mono">{sc.ndcgAt10.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">Discounted gain</span>
        </div>

        {/* Online CTR */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Online CTR</span>
          <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">{sc.ctrPercent.toFixed(1)}%</div>
          <span className="text-[10px] text-slate-500">+33% vs baseline</span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Conversion</span>
          <div className="text-2xl font-bold text-amber-300 mt-1 font-mono">{sc.conversionPercent.toFixed(1)}%</div>
          <span className="text-[10px] text-slate-500">Purchase rate</span>
        </div>

        {/* Catalog Coverage */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Coverage</span>
          <div className="text-2xl font-bold text-rose-300 mt-1 font-mono">{sc.coveragePercent.toFixed(0)}%</div>
          <span className="text-[10px] text-slate-500">Long-tail catalog</span>
        </div>

      </div>

      {/* Model Versions Evolution Registry Table (v1 Popularity -> v5 Hybrid + Ranker) */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Model Evolution &amp; Architecture Benchmark</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">5 Architecture Generations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Version &amp; Architecture</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Traffic</th>
                <th className="px-4 py-3">NDCG@10</th>
                <th className="px-4 py-3">Precision@10</th>
                <th className="px-4 py-3">CTR %</th>
                <th className="px-4 py-3">Conv %</th>
                <th className="px-4 py-3">Latency (P95)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report.models.map(m => (
                <tr key={m.id} className={`hover:bg-slate-800/40 transition ${m.status === 'production' ? 'bg-purple-950/20' : ''}`}>
                  
                  <td className="px-4 py-3">
                    <div className="font-bold text-white text-xs">{m.name}</div>
                    <div className="text-[11px] text-slate-400 max-w-sm truncate">{m.architecture}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      m.status === 'production'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : m.status === 'staging'
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-medium text-purple-300">
                    {m.trafficPercent}%
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                    {m.metrics.ndcgAt10.toFixed(3)}
                  </td>

                  <td className="px-4 py-3 font-mono text-indigo-300">
                    {m.metrics.precisionAt10.toFixed(3)}
                  </td>

                  <td className="px-4 py-3 font-mono text-emerald-300">
                    {m.metrics.ctrPercent.toFixed(1)}%
                  </td>

                  <td className="px-4 py-3 font-mono text-amber-300">
                    {m.metrics.conversionPercent.toFixed(1)}%
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-400">
                    {m.metrics.inferenceLatencyP95Ms} ms
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance SHAP Weights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-cyan-400" />
              GBDT Feature Importance (Gini Gain)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Online Attributions</span>
          </div>

          <div className="space-y-3 text-xs">
            {report.featureImportance.map(fi => (
              <div key={fi.feature} className="space-y-1">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>{fi.feature}</span>
                  <span className="font-mono text-cyan-300 font-bold">{(fi.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${fi.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Loss & NDCG Convergence Curves */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              LambdaMART Loss &amp; NDCG Convergence
            </h3>
            <span className="text-[10px] font-mono text-slate-400">20 Epochs</span>
          </div>

          <div className="space-y-3 text-xs">
            {report.lossHistory.map(lh => (
              <div key={lh.epoch} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    Epoch {lh.epoch}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Train Loss: <strong className="text-rose-300 font-mono">{lh.trainLoss}</strong> &bull; Val Loss: <strong className="text-amber-300 font-mono">{lh.valLoss}</strong>
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-xs">
                  NDCG: {lh.ndcg}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
