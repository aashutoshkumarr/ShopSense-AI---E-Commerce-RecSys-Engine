import {
  Product,
  UserPersona,
  UserEvent,
  StructuredIntent,
  PipelineConfig,
  PipelineExecutionResult,
  PipelineStageTelemetry,
  ScoredCandidate,
  BusinessRuleResult
} from '../types';
import { dynamicProductCatalog } from '../engine/ingestionService';
import { mockProducts } from '../data/products';
import { CandidateGenerator, candidateGeneratorInstance } from './retrieval/CandidateGenerator';
import { FeatureStore, featureStoreInstance } from './feature-store/FeatureStore';
import { LambdaMARTRanker, lambdaMARTRankerInstance } from './ranking/LambdaMARTRanker';
import { PostRankingPipeline, postRankingPipelineInstance } from './reranking/PostRankingPipeline';
import { RecommendationExplainer, recommendationExplainerInstance } from './explanation/RecommendationExplainer';

export const defaultPipelineConfig: PipelineConfig = {
  weights: {
    contentBased: 0.35,
    collaborative: 0.30,
    sessionBased: 0.20,
    trending: 0.15
  },
  featureWeights: {
    semanticSimilarity: 0.28,
    userAffinity: 0.24,
    popularity: 0.14,
    ctr: 0.12,
    priceAffinity: 0.14,
    freshness: 0.08
  },
  businessRules: {
    filterOutOfStock: true,
    enforcePriceBounds: false,
    priceTolerancePct: 30,
    diversityFactorMMR: 0.40,
    removePurchased: true,
    maxPerCategory: 3,
    boostPromotions: true,
    boostInStockFastDelivery: true
  },
  topK: 8,
  cacheEnabled: true,
  modelVersion: 'v5-hybrid-lightgbm-ranker',
  enableRankingModel: true
};

const recommendationCache = new Map<string, { result: ScoredCandidate[]; expiresAt: number }>();

export class RecommendationService {
  private products: Product[];
  private config: PipelineConfig;

  constructor(
    products: Product[] = dynamicProductCatalog,
    config: PipelineConfig = defaultPipelineConfig,
    private candidateGenerator: CandidateGenerator = candidateGeneratorInstance,
    private featureStore: FeatureStore = featureStoreInstance,
    private ranker: LambdaMARTRanker = lambdaMARTRankerInstance,
    private postPipeline: PostRankingPipeline = postRankingPipelineInstance,
    private explainer: RecommendationExplainer = recommendationExplainerInstance
  ) {
    this.products = products && products.length > 0 ? products : mockProducts;
    this.config = config;
  }

  public setCatalog(products: Product[]) {
    this.products = products;
    recommendationCache.clear();
  }

  public updateConfig(newConfig: Partial<PipelineConfig>) {
    this.config = { ...this.config, ...newConfig };
    recommendationCache.clear();
  }

  public getConfig(): PipelineConfig {
    return { ...this.config };
  }

  public executePipeline(
    user: UserPersona,
    sessionEvents: UserEvent[] = [],
    intent?: StructuredIntent | null,
    forceRefresh: boolean = false,
    catalogOverride?: Product[]
  ): PipelineExecutionResult {
    const startTime = performance.now();
    const stages: PipelineStageTelemetry[] = [];
    const activeCatalog = catalogOverride || (dynamicProductCatalog.length > 0 ? dynamicProductCatalog : this.products);

    const cacheKey = `rec:${user.id}:${this.config.modelVersion}:${this.config.enableRankingModel ? 'lgbm' : 'baseline'}:${intent ? intent.rawQuery : 'default'}`;
    const cached = recommendationCache.get(cacheKey);

    if (this.config.cacheEnabled && !forceRefresh && cached && cached.expiresAt > Date.now()) {
      return {
        userId: user.id,
        userPersonaName: user.name,
        timestamp: new Date().toISOString(),
        totalLatencyMs: Math.round(performance.now() - startTime + 2),
        stages: [
          {
            stageName: 'Redis Cache Lookup',
            latencyMs: 1.8,
            itemCountIn: 0,
            itemCountOut: cached.result.length,
            description: `Cache HIT on key "${cacheKey}" (TTL remaining: ${Math.round((cached.expiresAt - Date.now()) / 1000)}s)`
          }
        ],
        candidatePools: { contentBased: [], collaborative: [], sessionBased: [], trending: [] },
        mergedCount: cached.result.length,
        filteredOutCount: 0,
        topKResults: cached.result.map(c => ({ ...c, cacheHit: true })),
        cacheStatus: 'HIT',
        cacheKey,
        activeModelVersion: this.config.modelVersion,
        activeVariant: this.config.enableRankingModel ? 'Variant B (Hybrid + LightGBM)' : 'Variant A (Hybrid)'
      };
    }

    // ==========================================
    // STAGE 1: CANDIDATE GENERATION
    // ==========================================
    const s1Start = performance.now();
    const candGen = this.candidateGenerator.generate(user, activeCatalog, sessionEvents, intent, this.config);
    const s1End = performance.now();

    stages.push({
      stageName: '1. Candidate Generation',
      latencyMs: Math.round((s1End - s1Start) * 10) / 10,
      itemCountIn: activeCatalog.length,
      itemCountOut: candGen.totalRetrieved,
      description: `Retrieved ${candGen.contentCandidates.length} Content-based, ${candGen.collabCandidates.length} Collaborative, ${candGen.sessionCandidates.length} Session-based, ${candGen.trendingCandidates.length} Trending`,
      details: {
        contentCount: candGen.contentCandidates.length,
        collaborativeCount: candGen.collabCandidates.length,
        sessionCount: candGen.sessionCandidates.length,
        trendingCount: candGen.trendingCandidates.length
      }
    });

    // ==========================================
    // STAGE 2: CANDIDATE MERGE & DEDUPLICATION
    // ==========================================
    const s2Start = performance.now();
    const fused = candGen.fusedCandidates;
    const s2End = performance.now();

    stages.push({
      stageName: '2. Candidate Merge & Deduplication',
      latencyMs: Math.round((s2End - s2Start) * 10) / 10,
      itemCountIn: candGen.totalRetrieved,
      itemCountOut: fused.length,
      description: `Merged multi-channel candidates into ${fused.length} unique candidates with score normalization`
    });

    // ==========================================
    // STAGE 3: FEATURE STORE CALCULATION
    // ==========================================
    const s3Start = performance.now();
    const candidatesWithFeatures = fused.map(item => {
      const featVector = this.featureStore.extractFeatures(item.product, user, sessionEvents, intent);
      return {
        ...item,
        features: featVector.legacyVector,
        onlineFeatures: featVector
      };
    });
    const s3End = performance.now();

    stages.push({
      stageName: '3. Feature Store & Attributions',
      latencyMs: Math.round((s3End - s3Start) * 10) / 10,
      itemCountIn: fused.length,
      itemCountOut: candidatesWithFeatures.length,
      description: 'Calculated 6 dynamic online features (Cosine Sim, User Affinity, Popularity, CTR, Price Affinity, Freshness)'
    });

    // ==========================================
    // STAGE 4: RANKING MODEL (LightGBM LambdaMART LTR or Baseline)
    // ==========================================
    const s4Start = performance.now();
    const isRankingModelEnabled = this.config.enableRankingModel !== false;

    const rankedCandidates: ScoredCandidate[] = candidatesWithFeatures.map(item => {
      const rankRes = this.ranker.rank(
        item.onlineFeatures,
        item.mergedScore,
        isRankingModelEnabled,
        this.config.featureWeights
      );

      const groundedReason = this.explainer.explain(
        item.product,
        user,
        item.sources,
        item.features,
        sessionEvents,
        intent
      );

      return {
        product: item.product,
        candidateSources: item.sources,
        mergedScore: item.mergedScore,
        features: item.features,
        rankingScore: rankRes.score,
        featureAttributions: rankRes.attributions,
        businessRuleResults: [] as BusinessRuleResult[],
        finalScore: rankRes.score,
        rank: 0,
        groundedReason
      };
    });
    const s4End = performance.now();

    stages.push({
      stageName: '4. LightGBM LambdaMART Ranker',
      latencyMs: Math.round((s4End - s4Start) * 10) / 10,
      itemCountIn: candidatesWithFeatures.length,
      itemCountOut: rankedCandidates.length,
      description: isRankingModelEnabled
        ? 'Computed GBDT ensemble rank scores and TreeSHAP attribution percentages'
        : 'Baseline ranking without GBDT tree scoring'
    });

    // ==========================================
    // STAGE 5: BUSINESS RULES & POST-RANKING PIPELINE
    // ==========================================
    const s5Start = performance.now();
    const postRes = this.postPipeline.process(rankedCandidates, user, this.config, intent);
    const s5End = performance.now();

    stages.push({
      stageName: '5. Business Rules & Post-Filtering',
      latencyMs: Math.round((s5End - s5Start) * 10) / 10,
      itemCountIn: rankedCandidates.length,
      itemCountOut: postRes.topKResults.length,
      description: `Evaluated inventory filters, price limits, and MMR diversity (${postRes.filteredOutCount} removed)`
    });

    // ==========================================
    // STAGE 6: TOP-K SLICING
    // ==========================================
    const s6Start = performance.now();
    const topKResults = postRes.topKResults.map((candidate, idx) => ({
      ...candidate,
      rank: idx + 1
    }));
    const s6End = performance.now();

    stages.push({
      stageName: '6. Diversity Reranking & Top-K Slicing',
      latencyMs: Math.round((s6End - s6Start) * 10) / 10,
      itemCountIn: topKResults.length,
      itemCountOut: topKResults.length,
      description: `Final ${topKResults.length} recommendations formatted with explainability tags`
    });

    // Update Cache
    if (this.config.cacheEnabled) {
      recommendationCache.set(cacheKey, {
        result: topKResults,
        expiresAt: Date.now() + 60 * 1000
      });
    }

    const totalLatency = Math.round(performance.now() - startTime);

    return {
      userId: user.id,
      userPersonaName: user.name,
      timestamp: new Date().toISOString(),
      totalLatencyMs: totalLatency,
      stages,
      candidatePools: {
        contentBased: candGen.contentCandidates.map(c => ({
          id: c.product.id,
          title: c.product.title,
          score: c.sourceScore.normalizedScore,
          reason: c.sourceScore.reason
        })),
        collaborative: candGen.collabCandidates.map(c => ({
          id: c.product.id,
          title: c.product.title,
          score: c.sourceScore.normalizedScore,
          reason: c.sourceScore.reason
        })),
        sessionBased: candGen.sessionCandidates.map(c => ({
          id: c.product.id,
          title: c.product.title,
          score: c.sourceScore.normalizedScore,
          reason: c.sourceScore.reason
        })),
        trending: candGen.trendingCandidates.map(c => ({
          id: c.product.id,
          title: c.product.title,
          score: c.sourceScore.normalizedScore,
          reason: c.sourceScore.reason
        }))
      },
      mergedCount: fused.length,
      filteredOutCount: postRes.filteredOutCount,
      topKResults,
      cacheStatus: 'MISS',
      cacheKey,
      activeModelVersion: this.config.modelVersion,
      activeVariant: this.config.enableRankingModel ? 'Variant B (Hybrid + LightGBM)' : 'Variant A (Hybrid)'
    };
  }
}

export const recommendationServiceInstance = new RecommendationService();
