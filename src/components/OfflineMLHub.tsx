import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  GitBranch, 
  BarChart3, 
  Play, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Zap, 
  Sliders, 
  TrendingUp,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OfflineEvaluationReport, MLModelVersion } from '../types';

interface OfflineMLHubProps {
  onDeployModelSuccess?: (version: string) => void;
}

export const OfflineMLHub: React.FC<OfflineMLHubProps> = ({ onDeployModelSuccess }) => {
  const [report, setReport] = useState<OfflineEvaluationReport | null>(null);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainProgress, setRetrainProgress] = useState<number>(0);
  const [currentStepName, setCurrentStepName] = useState<string>('');
  const [trafficSplits, setTrafficSplits] = useState<Record<string, number>>({
    'v2.1-lightgbm-lambdamart': 80,
    'v3.0-hybrid-vector-lambdamart': 20
  });

  const fetchMLData = async () => {
    try {
      const res = await fetch('/api/ml/models');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch ML models:', err);
    }
  };

  useEffect(() => {
    fetchMLData();
  }, []);

  const handleTriggerRetrain = async () => {
    setIsRetraining(true);
    setRetrainProgress(10);
    setCurrentStepName('1. Collecting user & system interaction events...');

    setTimeout(() => {
      setRetrainProgress(30);
      setCurrentStepName('2. Data Cleaning & Session Window Feature Engineering...');
    }, 1200);

    setTimeout(() => {
      setRetrainProgress(60);
      setCurrentStepName('3. Training Multi-Model Candidates (Content, Matrix Factorization, RNN)...');
    }, 2400);

    setTimeout(() => {
      setRetrainProgress(85);
      setCurrentStepName('4. Training LightGBM LambdaMART & Evaluating NDCG@10...');
    }, 3800);

    try {
      const res = await fetch('/api/ml/retrain', { method: 'POST' });
      const data = await res.json();

      setTimeout(() => {
        setRetrainProgress(100);
        setCurrentStepName('5. Model validated & registered to MLflow registry!');
        setIsRetraining(false);
        fetchMLData();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 5000);
    } catch (err) {
      console.error('Retrain error:', err);
      setIsRetraining(false);
    }
  };

  if (!report) {
    return (
      <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <Cpu className="h-8 w-8 animate-spin mx-auto text-cyan-400 mb-3" />
        <p>Loading offline ML pipeline statistics & model registry...</p>
      </div>
    );
  }

  const productionModel = report.models.find(m => m.status === 'production') || report.models[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Top Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              Offline ML Pipeline & Evaluation Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
              MLOps: Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independent offline training orchestrator: Data Collection → Feature Engineering → Candidate Models → Ranking Training → Evaluation (NDCG, Recall, Precision).
          </p>
        </div>

        <button
          onClick={handleTriggerRetrain}
          disabled={isRetraining}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition ${
            isRetraining
              ? 'bg-indigo-900 text-indigo-200 cursor-wait'
              : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/20'
          }`}
        >
          <Play className={`h-4 w-4 ${isRetraining ? 'animate-spin' : 'fill-current'}`} />
          <span>{isRetraining ? 'Training in Progress...' : 'Run Offline Retraining Pipeline'}</span>
        </button>
      </div>

      {/* Retraining Progress Bar (when active) */}
      {isRetraining && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-cyan-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              {currentStepName}
            </span>
            <span className="font-mono text-cyan-400 font-bold">{retrainProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${retrainProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Offline ML Pipeline Flowchart Diagram */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-cyan-400" />
          Offline Pipeline Architecture Flow
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <Database className="h-4 w-4 text-blue-400 mb-1" />
            <span className="font-bold text-white">1. Data Ingestion</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{report.totalTrainingSamples.toLocaleString()} Events</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <Layers className="h-4 w-4 text-teal-400 mb-1" />
            <span className="font-bold text-white">2. Cleaning</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Bot/Dwell Filtering</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <Cpu className="h-4 w-4 text-emerald-400 mb-1" />
            <span className="font-bold text-white">3. Feature Eng.</span>
            <span className="text-[10px] text-slate-400 mt-0.5">6 Vector Features</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <TrendingUp className="h-4 w-4 text-purple-400 mb-1" />
            <span className="font-bold text-white">4. Candidate Models</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Content, CF, RNN</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <Zap className="h-4 w-4 text-indigo-400 mb-1" />
            <span className="font-bold text-white">5. Ranker Training</span>
            <span className="text-[10px] text-slate-400 mt-0.5">LightGBM GBDT</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <Award className="h-4 w-4 text-amber-400 mb-1" />
            <span className="font-bold text-white">6. Evaluation</span>
            <span className="text-[10px] text-slate-400 mt-0.5">NDCG@10 = {productionModel.metrics.ndcgAt10}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 bg-gradient-to-b from-indigo-950/40 to-slate-950 flex flex-col items-center justify-center">
            <CheckCircle className="h-4 w-4 text-emerald-400 mb-1" />
            <span className="font-bold text-cyan-300">7. Production</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Live Serving</span>
          </div>

        </div>
      </div>

      {/* Scorecard Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">NDCG@10</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {productionModel.metrics.ndcgAt10}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">+4.2% vs baseline</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">Precision@10</div>
          <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
            {productionModel.metrics.precisionAt10}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Relevance in top 10</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">Recall@10</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">
            {productionModel.metrics.recallAt10}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Coverage of interests</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">MAP@10</div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">
            {productionModel.metrics.mapAt10}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Mean Average Precision</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">MRR (Reciprocal)</div>
          <div className="text-xl font-bold text-pink-400 font-mono mt-1">
            {productionModel.metrics.mrr}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rank of 1st click</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-mono">P95 Latency</div>
          <div className="text-xl font-bold text-cyan-300 font-mono mt-1">
            {productionModel.metrics.inferenceLatencyP95Ms} ms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sub-50ms SLA</div>
        </div>

      </div>

      {/* Model Registry & A/B Experimentation Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Model Registry List */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              Model Registry & Version Comparison
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {report.models.length} Registered Checkpoints
            </span>
          </h3>

          <div className="space-y-3">
            {report.models.map((model) => {
              const isProd = model.status === 'production';
              const isStaging = model.status === 'staging';

              return (
                <div
                  key={model.id}
                  className={`p-4 rounded-xl border transition ${
                    isProd
                      ? 'bg-slate-950/90 border-cyan-500/40 ring-1 ring-cyan-500/20'
                      : isStaging
                      ? 'bg-slate-950/60 border-purple-500/30'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{model.name}</h4>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-semibold ${
                          isProd
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isStaging
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {model.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({model.version})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{model.architecture}</p>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-400 text-[10px]">NDCG@10:</span>{' '}
                      <strong className="text-emerald-400 font-bold">{model.metrics.ndcgAt10}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/70 text-[10px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block">Precision:</span>
                      <span>{model.metrics.precisionAt10}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Recall:</span>
                      <span>{model.metrics.recallAt10}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">AUC-ROC:</span>
                      <span>{model.metrics.aucRoc}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Latency:</span>
                      <span>{model.metrics.inferenceLatencyP95Ms}ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Feature Importance Breakdown */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              Global Feature Importance (SHAP)
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Aggregate feature contribution calculated across offline evaluation set (18,500 validation interactions).
            </p>

            <div className="space-y-3">
              {report.featureImportance.map((feat) => (
                <div key={feat.feature} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="truncate max-w-[180px]">{feat.feature}</span>
                    <span className="font-mono text-cyan-400 font-bold">{(feat.importance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${feat.importance * 100 * 2.8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-cyan-300 font-semibold block mb-1">A/B Testing Deployment</span>
            Current Live Split: <strong className="text-slate-200">80% v2.1 LightGBM</strong> / <strong className="text-slate-200">20% v3.0 Vector Hybrid</strong>
          </div>
        </div>

      </div>

    </div>
  );
};
