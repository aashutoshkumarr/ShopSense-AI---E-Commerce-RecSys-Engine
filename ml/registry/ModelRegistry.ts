import { MLModelVersion } from '../../src/types';

export interface ModelRegistrationPayload {
  name: string;
  version: string;
  architecture: string;
  trainedOnEvents: number;
  hyperparameters?: Record<string, any>;
  metrics: {
    ndcgAt5: number;
    ndcgAt10: number;
    precisionAt10: number;
    recallAt10: number;
    mapAt10: number;
    mrr: number;
    aucRoc: number;
    ctrPercent: number;
    conversionPercent: number;
    catalogCoveragePercent: number;
    inferenceLatencyP95Ms: number;
  };
}

export interface PromotionGatingCriteria {
  minNDCG10: number;
  minMRR: number;
  maxLatencyP95Ms: number;
  minCatalogCoverage: number;
}

export const DEFAULT_GATING_CRITERIA: PromotionGatingCriteria = {
  minNDCG10: 0.60,
  minMRR: 0.70,
  maxLatencyP95Ms: 50,
  minCatalogCoverage: 75.0
};

export class ModelRegistry {
  private models: Map<string, MLModelVersion> = new Map();

  constructor() {
    // Seed default models into registry
    this.register({
      name: 'v5 Hybrid + LightGBM Ranker',
      version: 'hybrid-lgbm-v3',
      architecture: '4-Channel Retrieval + Feature Store + LightGBM LambdaMART GBDT + MMR Diversity',
      trainedOnEvents: 148500,
      metrics: {
        ndcgAt5: 0.884,
        ndcgAt10: 0.640,
        precisionAt10: 0.610,
        recallAt10: 0.480,
        mapAt10: 0.625,
        mrr: 0.764,
        aucRoc: 0.918,
        ctrPercent: 7.4,
        conversionPercent: 3.8,
        catalogCoveragePercent: 83.0,
        inferenceLatencyP95Ms: 24
      }
    }, 'production', 80);

    this.register({
      name: 'v4 Multi-Channel Hybrid',
      version: 'v4.0-hybrid-fusion',
      architecture: 'Weighted linear combination of Content, Collaborative, Session, and Velocity priors',
      trainedOnEvents: 98000,
      metrics: {
        ndcgAt5: 0.792,
        ndcgAt10: 0.580,
        precisionAt10: 0.520,
        recallAt10: 0.420,
        mapAt10: 0.540,
        mrr: 0.680,
        aucRoc: 0.854,
        ctrPercent: 5.6,
        conversionPercent: 2.5,
        catalogCoveragePercent: 76.0,
        inferenceLatencyP95Ms: 18
      }
    }, 'staging', 20);

    this.register({
      name: 'v3 Item-Item Collaborative Filtering',
      version: 'v3.0-collaborative-cf',
      architecture: 'Item-Item co-occurrence matrix + Implicit ALS Matrix Factorization',
      trainedOnEvents: 65000,
      metrics: {
        ndcgAt5: 0.710,
        ndcgAt10: 0.510,
        precisionAt10: 0.440,
        recallAt10: 0.380,
        mapAt10: 0.470,
        mrr: 0.610,
        aucRoc: 0.790,
        ctrPercent: 4.8,
        conversionPercent: 2.0,
        catalogCoveragePercent: 68.0,
        inferenceLatencyP95Ms: 15
      }
    }, 'archived', 0);
  }

  public register(
    payload: ModelRegistrationPayload,
    initialStage: 'staging' | 'production' | 'archived' = 'staging',
    initialTraffic: number = 0
  ): MLModelVersion {
    const id = `mdl-${Date.now()}-${payload.version}`;
    const model: MLModelVersion = {
      id,
      name: payload.name,
      version: payload.version,
      architecture: payload.architecture,
      status: initialStage,
      trafficPercent: initialTraffic,
      trainedOnEvents: payload.trainedOnEvents,
      lastTrainedDate: new Date().toISOString().split('T')[0],
      metrics: payload.metrics
    };

    this.models.set(payload.version, model);
    return model;
  }

  public getModel(version: string): MLModelVersion | undefined {
    return this.models.get(version);
  }

  public getAllModels(): MLModelVersion[] {
    return Array.from(this.models.values());
  }

  public getActiveProductionModel(): MLModelVersion | undefined {
    return Array.from(this.models.values()).find(m => m.status === 'production');
  }

  /**
   * Evaluates quality metrics against gating criteria before promoting model to Staging/Production
   */
  public promote(
    version: string,
    targetStage: 'staging' | 'production' | 'archived',
    trafficPct: number = 0,
    criteria: PromotionGatingCriteria = DEFAULT_GATING_CRITERIA
  ): { success: boolean; message: string; model?: MLModelVersion; violations?: string[] } {
    const model = this.models.get(version);
    if (!model) {
      return { success: false, message: `Model "${version}" not found in registry.` };
    }

    if (targetStage === 'production') {
      const violations: string[] = [];

      if (model.metrics.ndcgAt10 < criteria.minNDCG10) {
        violations.push(`NDCG@10 (${model.metrics.ndcgAt10}) is below minimum SLA threshold (${criteria.minNDCG10})`);
      }
      if (model.metrics.mrr < criteria.minMRR) {
        violations.push(`MRR (${model.metrics.mrr}) is below minimum SLA threshold (${criteria.minMRR})`);
      }
      if (model.metrics.inferenceLatencyP95Ms > criteria.maxLatencyP95Ms) {
        violations.push(`P95 Latency (${model.metrics.inferenceLatencyP95Ms}ms) exceeds maximum allowable SLA (${criteria.maxLatencyP95Ms}ms)`);
      }
      if (model.metrics.catalogCoveragePercent < criteria.minCatalogCoverage) {
        violations.push(`Catalog Coverage (${model.metrics.catalogCoveragePercent}%) is below minimum threshold (${criteria.minCatalogCoverage}%)`);
      }

      if (violations.length > 0) {
        return {
          success: false,
          message: `Model promotion rejected by automated Quality Gating SLA.`,
          violations
        };
      }

      // Demote current production model
      for (const m of this.models.values()) {
        if (m.status === 'production' && m.version !== version) {
          m.status = 'staging';
          m.trafficPercent = 100 - trafficPct;
        }
      }
    }

    model.status = targetStage;
    model.trafficPercent = trafficPct;

    return {
      success: true,
      message: `Model "${version}" successfully promoted to ${targetStage} (Traffic: ${trafficPct}%).`,
      model
    };
  }
}

export const modelRegistryInstance = new ModelRegistry();
