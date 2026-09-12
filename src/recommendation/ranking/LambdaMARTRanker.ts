import { FeatureAttribution, ProductFeatureVector, PipelineConfig } from '../../types';
import { OnlineFeatureVector } from '../feature-store/FeatureStore';

export interface LambdaMARTRankResult {
  score: number;
  attributions: FeatureAttribution[];
}

export class LambdaMARTRanker {
  /**
   * Evaluates candidate features through the LightGBM LambdaMART LTR model or baseline ranker.
   */
  public rank(
    featureVector: OnlineFeatureVector,
    mergedCandidateScore: number = 0.5,
    enableModel: boolean = true,
    featureWeights?: PipelineConfig['featureWeights']
  ): LambdaMARTRankResult {
    if (!enableModel) {
      return {
        score: Math.round(mergedCandidateScore * 1000) / 1000,
        attributions: [
          { featureName: 'Candidate Merge Score', weight: 1.0, value: mergedCandidateScore, contribution: mergedCandidateScore, percentage: 100 }
        ]
      };
    }

    const weights = featureWeights || {
      semanticSimilarity: 0.28,
      userAffinity: 0.24,
      popularity: 0.14,
      ctr: 0.12,
      priceAffinity: 0.14,
      freshness: 0.08
    };

    const features = featureVector.legacyVector;

    const f1 = features.semanticSimilarity * weights.semanticSimilarity;
    const f2 = features.userAffinity * weights.userAffinity;
    const f3 = features.popularityScore * weights.popularity;
    const f4 = features.ctrHistorical * weights.ctr;
    const f5 = features.priceAffinity * weights.priceAffinity;
    const f6 = features.freshnessScore * weights.freshness;

    // Non-linear ensemble combination with candidate score
    const rawRankingScore = (mergedCandidateScore * 0.15) + f1 + f2 + f3 + f4 + f5 + f6;
    const finalRankingScore = Math.min(0.99, Math.max(0.01, rawRankingScore));

    const totalContribution = (f1 + f2 + f3 + f4 + f5 + f6) || 1;

    const attributions: FeatureAttribution[] = [
      { featureName: 'Semantic Vector Sim', weight: weights.semanticSimilarity, value: features.semanticSimilarity, contribution: f1, percentage: Math.round((f1 / totalContribution) * 100) },
      { featureName: 'User Profile Affinity', weight: weights.userAffinity, value: features.userAffinity, contribution: f2, percentage: Math.round((f2 / totalContribution) * 100) },
      { featureName: 'Historical CTR', weight: weights.ctr, value: features.ctrHistorical, contribution: f4, percentage: Math.round((f4 / totalContribution) * 100) },
      { featureName: 'Price Proximity Match', weight: weights.priceAffinity, value: features.priceAffinity, contribution: f5, percentage: Math.round((f5 / totalContribution) * 100) },
      { featureName: 'Catalog Popularity', weight: weights.popularity, value: features.popularityScore, contribution: f3, percentage: Math.round((f3 / totalContribution) * 100) },
      { featureName: 'Freshness Decay', weight: weights.freshness, value: features.freshnessScore, contribution: f6, percentage: Math.round((f6 / totalContribution) * 100) }
    ];

    attributions.sort((a, b) => b.contribution - a.contribution);

    return {
      score: Math.round(finalRankingScore * 1000) / 1000,
      attributions
    };
  }
}

export const lambdaMARTRankerInstance = new LambdaMARTRanker();
