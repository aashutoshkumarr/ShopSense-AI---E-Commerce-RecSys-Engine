import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, Zap, Layers, Filter } from 'lucide-react';
import { PipelineConfig } from '../types';
import { defaultPipelineConfig } from '../engine/recommendationEngine';

interface PipelineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PipelineConfig;
  onSaveConfig: (newConfig: PipelineConfig) => void;
}

export const PipelineSettingsModal: React.FC<PipelineSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [localConfig, setLocalConfig] = useState<PipelineConfig>(config);

  if (!isOpen) return null;

  const handleReset = () => {
    setLocalConfig(defaultPipelineConfig);
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pipeline Tuning Sandbox</h3>
              <p className="text-[11px] text-slate-400">
                Adjust retrieval channel blend, ranking weights, and diversity penalties in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sliders Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          
          {/* Section 1: Candidate Generation Channel Weights */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                1. Candidate Retrieval Channel Weights
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Total: {(localConfig.weights.contentBased + localConfig.weights.collaborative + localConfig.weights.sessionBased + localConfig.weights.trending).toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Content-Based (Vector Sim)</span>
                  <span className="font-mono text-cyan-400 font-bold">{(localConfig.weights.contentBased * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={localConfig.weights.contentBased}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    weights: { ...localConfig.weights, contentBased: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Collaborative Filtering (CF)</span>
                  <span className="font-mono text-purple-400 font-bold">{(localConfig.weights.collaborative * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={localConfig.weights.collaborative}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    weights: { ...localConfig.weights, collaborative: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Session-Based (Markov)</span>
                  <span className="font-mono text-emerald-400 font-bold">{(localConfig.weights.sessionBased * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={localConfig.weights.sessionBased}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    weights: { ...localConfig.weights, sessionBased: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Trending / Velocity</span>
                  <span className="font-mono text-amber-400 font-bold">{(localConfig.weights.trending * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={localConfig.weights.trending}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    weights: { ...localConfig.weights, trending: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Online Feature Store Importance Weights */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-purple-400" />
              2. Ranking Model Feature Weights
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Semantic Vector Match</span>
                  <span className="font-mono text-cyan-400">{(localConfig.featureWeights.semanticSimilarity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.02"
                  value={localConfig.featureWeights.semanticSimilarity}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    featureWeights: { ...localConfig.featureWeights, semanticSimilarity: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>User Profile & Brand Affinity</span>
                  <span className="font-mono text-purple-400">{(localConfig.featureWeights.userAffinity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.02"
                  value={localConfig.featureWeights.userAffinity}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    featureWeights: { ...localConfig.featureWeights, userAffinity: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Historical CTR</span>
                  <span className="font-mono text-emerald-400">{(localConfig.featureWeights.ctr * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.02"
                  value={localConfig.featureWeights.ctr}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    featureWeights: { ...localConfig.featureWeights, ctr: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Price Proximity Match</span>
                  <span className="font-mono text-pink-400">{(localConfig.featureWeights.priceAffinity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.02"
                  value={localConfig.featureWeights.priceAffinity}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    featureWeights: { ...localConfig.featureWeights, priceAffinity: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Business Constraints & Diversity (MMR) */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-pink-400" />
              3. Business Constraints & Re-Ranking (MMR)
            </span>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Intra-List Diversity Factor (&lambda; MMR)</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {localConfig.businessRules.diversityFactorMMR === 0 ? '0.0 (Pure Relevance)' : localConfig.businessRules.diversityFactorMMR}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.8"
                  step="0.05"
                  value={localConfig.businessRules.diversityFactorMMR}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    businessRules: { ...localConfig.businessRules, diversityFactorMMR: parseFloat(e.target.value) }
                  })}
                  className="w-full accent-amber-400"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Higher diversity penalizes recommending multiple identical items from the same category.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.businessRules.filterOutOfStock}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      businessRules: { ...localConfig.businessRules, filterOutOfStock: e.target.checked }
                    })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Filter Out-of-Stock Items</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.businessRules.removePurchased}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      businessRules: { ...localConfig.businessRules, removePurchased: e.target.checked }
                    })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Remove Previously Purchased</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.businessRules.boostPromotions}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      businessRules: { ...localConfig.businessRules, boostPromotions: e.target.checked }
                    })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Promotional Badge Score Boost (+4%)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.cacheEnabled}
                    onChange={(e) => setLocalConfig({
                      ...localConfig,
                      cacheEnabled: e.target.checked
                    })}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Enable Redis Cache Layer (60s TTL)</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Changes & Re-score
          </button>
        </div>

      </div>
    </div>
  );
};
