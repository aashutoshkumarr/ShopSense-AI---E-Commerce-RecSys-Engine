import React from 'react';
import { ABTestingHub } from '../../components/ABTestingHub';
import { modelRegistryInstance } from '../../../ml/registry/ModelRegistry';
import { modelMonitorInstance } from '../../../ml/monitoring/ModelMonitor';
import { ShieldCheck, ArrowUpRight, Cpu } from 'lucide-react';

export const ExperimentsHubView: React.FC = () => {
  const models = modelRegistryInstance.getAllModels();
  const monitorReport = modelMonitorInstance.evaluateModelHealth();

  return (
    <div className="space-y-6">
      {/* Model Registry Header Strip */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Production Model Registry</h3>
            <p className="text-xs text-slate-400">
              {models.length} Registered Model Architectures &bull; Active: <span className="text-emerald-400 font-mono font-semibold">hybrid-lgbm-v3</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Health: {monitorReport.overallHealth}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <span>SLA: {monitorReport.latencyStatus.p95LatencyMs}ms (P95 &lt; 50ms)</span>
          </div>
        </div>
      </div>

      {/* Embedded A/B Experiment Hub */}
      <ABTestingHub />
    </div>
  );
};
