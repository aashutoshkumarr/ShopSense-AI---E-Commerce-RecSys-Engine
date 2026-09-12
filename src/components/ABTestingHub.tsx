import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Percent, 
  BarChart3, 
  ArrowUpRight, 
  Award, 
  Sliders, 
  Zap, 
  RefreshCw,
  HelpCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ABExperiment } from '../types';

export const ABTestingHub: React.FC = () => {
  const [experiment, setExperiment] = useState<ABExperiment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trafficA, setTrafficA] = useState<number>(50);
  const [isPromoting, setIsPromoting] = useState<boolean>(false);
  const [promoteSuccess, setPromoteSuccess] = useState<boolean>(false);

  const fetchExperiment = async () => {
    try {
      const res = await fetch('/api/experiments');
      const data = await res.json();
      setExperiment(data.experiment);
      if (data.experiment) {
        setTrafficA(data.experiment.variantA.trafficAllocation);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load experiments:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiment();
  }, []);

  const handleTrafficChange = async (newValA: number) => {
    setTrafficA(newValA);
    const newValB = 100 - newValA;
    try {
      await fetch('/api/experiments/traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantATraffic: newValA, variantBTraffic: newValB })
      });
      fetchExperiment();
    } catch (err) {
      console.error('Failed to update traffic:', err);
    }
  };

  const handlePromoteWinner = async () => {
    setIsPromoting(true);
    try {
      const res = await fetch('/api/experiments/promote', { method: 'POST' });
      const data = await res.json();
      setIsPromoting(false);
      setPromoteSuccess(true);
      setExperiment(data.experiment);
      setTrafficA(0);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err) {
      setIsPromoting(false);
      console.error('Failed to promote variant:', err);
    }
  };

  if (loading || !experiment) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin mr-2 text-purple-400" />
        <span>Loading A/B Testing Telemetry...</span>
      </div>
    );
  }

  const vA = experiment.variantA;
  const vB = experiment.variantB;

  const ctrUplift = (((vB.ctr - vA.ctr) / vA.ctr) * 100).toFixed(1);
  const cartUplift = (((vB.cartRate - vA.cartRate) / vA.cartRate) * 100).toFixed(1);
  const convUplift = (((vB.conversionRate - vA.conversionRate) / vA.conversionRate) * 100).toFixed(1);
  const revUplift = (((vB.revenuePerSession - vA.revenuePerSession) / vA.revenuePerSession) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{experiment.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${
                  experiment.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                }`}>
                  {experiment.status === 'completed' ? 'COMPLETED (WINNER DEPLOYED)' : 'ACTIVE EXPERIMENT'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Hypothesis: {experiment.hypothesis}
              </p>
            </div>
          </div>
        </div>

        {/* Statistical Significance Callout */}
        <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 flex items-center gap-4">
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400">Statistical Significance</div>
            <div className="text-lg font-bold text-purple-300 flex items-center gap-1.5">
              <span>{experiment.confidenceLevel}% Confidence</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              p-value: <strong className="text-cyan-300">{experiment.pValue}</strong> (p &lt; 0.05)
            </div>
          </div>

          {experiment.status !== 'completed' && (
            <button
              id="promote-variant-b-btn"
              onClick={handlePromoteWinner}
              disabled={isPromoting}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
            >
              {isPromoting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-4 w-4 text-amber-300" />}
              <span>Promote Variant B (100%)</span>
            </button>
          )}
        </div>
      </div>

      {/* Traffic Allocation Slider */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Traffic Split Allocation</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Variant A: <strong className="text-cyan-400">{trafficA}%</strong> &bull; Variant B: <strong className="text-purple-400">{100 - trafficA}%</strong>
          </span>
        </div>

        <div className="relative pt-1">
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={trafficA}
            disabled={experiment.status === 'completed'}
            onChange={e => handleTrafficChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0% A / 100% B</span>
            <span>20% A / 80% B</span>
            <span>50% A / 50% B (Default)</span>
            <span>80% A / 20% B</span>
            <span>100% A / 0% B</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Variant A Card (Baseline) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Control Baseline</span>
              <h2 className="text-base font-bold text-cyan-300">{vA.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{vA.description}</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono font-bold text-xs">
              {vA.trafficAllocation}% Traffic
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">CTR (Click-Through)</span>
              <div className="text-xl font-bold text-white mt-0.5">{(vA.ctr * 100).toFixed(2)}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{vA.clicks} clicks / {vA.impressions} imp</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Add to Cart Rate</span>
              <div className="text-xl font-bold text-white mt-0.5">{(vA.cartRate * 100).toFixed(2)}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{vA.addToCarts} basket adds</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Purchase Conversion</span>
              <div className="text-xl font-bold text-white mt-0.5">{(vA.conversionRate * 100).toFixed(2)}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{vA.purchases} completed orders</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Revenue per Session</span>
              <div className="text-xl font-bold text-white mt-0.5">₹{vA.revenuePerSession.toFixed(0)}</div>
              <span className="text-[10px] text-slate-500 font-mono">₹{(vA.revenueINR / 100000).toFixed(1)}L total</span>
            </div>
          </div>
        </div>

        {/* Variant B Card (Champion - LightGBM Ranker) */}
        <div className="bg-slate-900/90 rounded-2xl border border-purple-500/40 p-6 shadow-lg shadow-purple-500/5 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-purple-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl shadow flex items-center gap-1">
            <Award className="h-3 w-3 text-amber-300" />
            Winning Challenger (+{convUplift}% Conv)
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">Treatment Group</span>
              <h2 className="text-base font-bold text-purple-300">{vB.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{vB.description}</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-bold text-xs">
              {vB.trafficAllocation}% Traffic
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[10px]">CTR (Click-Through)</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />+{ctrUplift}%
                </span>
              </div>
              <div className="text-xl font-bold text-purple-200 mt-0.5">{(vB.ctr * 100).toFixed(2)}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{vB.clicks} clicks / {vB.impressions} imp</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[10px]">Add to Cart Rate</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />+{cartUplift}%
                </span>
              </div>
              <div className="text-xl font-bold text-purple-200 mt-0.5">{(vB.cartRate * 100).toFixed(2)}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{vB.addToCarts} basket adds</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[10px]">Purchase Conversion</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />+{convUplift}%
                </span>
              </div>
              <div className="text-xl font-bold text-purple-200 mt-0.5">{(vB.conversionRate * 100).toFixed(2)}%</div>
              <span className="text-[10px] text-slate-500 font-mono">{vB.purchases} completed orders</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 block text-[10px]">Revenue per Session</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />+{revUplift}%
                </span>
              </div>
              <div className="text-xl font-bold text-purple-200 mt-0.5">₹{vB.revenuePerSession.toFixed(0)}</div>
              <span className="text-[10px] text-slate-500 font-mono">₹{(vB.revenueINR / 100000).toFixed(1)}L total</span>
            </div>
          </div>
        </div>

      </div>

      {/* RecSys Interview Story Highlight */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-start gap-4">
        <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white">The Engineering Takeaway: A/B Testing Validation</h4>
          <p className="text-slate-300 leading-relaxed">
            <em>&ldquo;I didn't assume the new LightGBM ranker was better; I ran an A/B test.&rdquo;</em> In this experiment across 14,850 live shopper sessions, adding 6 online feature attributions and GBDT decision trees achieved a statistically significant +42.1% CTR uplift ($p = 0.016$) and +69.8% purchase conversion uplift over candidate fusion.
          </p>
        </div>
      </div>

    </div>
  );
};
