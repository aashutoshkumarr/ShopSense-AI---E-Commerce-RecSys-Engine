import React from 'react';
import { PipelineExecutionResult, PipelineConfig } from '../../types';
import { PipelineInspector } from '../../components/PipelineInspector';

export interface RecommendationPanelViewProps {
  pipelineResult: PipelineExecutionResult | null;
  config: PipelineConfig;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const RecommendationPanelView: React.FC<RecommendationPanelViewProps> = ({
  pipelineResult,
  config,
  onRefresh,
  onOpenSettings
}) => {
  if (!pipelineResult) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm">No pipeline execution telemetry available. Execute recommendations on Storefront.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PipelineInspector
        pipelineResult={pipelineResult}
        config={config}
        onRefresh={onRefresh}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};
