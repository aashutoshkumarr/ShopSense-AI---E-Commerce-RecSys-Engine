import { Product, CandidateSourceScore } from '../../types';
import { RetrievedCandidate } from './ContentRetriever';

export class TrendingRetriever {
  public retrieve(catalog: Product[], limit: number = 10): RetrievedCandidate[] {
    return catalog
      .filter(p => p.status !== 'discontinued' && p.status !== 'hidden')
      .map(prod => {
        const freshnessMultiplier = Math.max(0.7, 1 - (prod.releaseDaysAgo / 300));
        const trendingScore = (prod.popularityScore * 0.6 + (prod.historicalCTR || 0.05) * 4.0) * freshnessMultiplier;
        return {
          product: prod,
          sourceScore: {
            source: 'trending_popular' as const,
            rawScore: trendingScore,
            normalizedScore: Math.min(1, Math.max(0.1, trendingScore)),
            reason: `High velocity score: CTR ${((prod.historicalCTR || 0.05) * 100).toFixed(1)}% | Rating ${prod.rating}★`
          }
        };
      })
      .sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore)
      .slice(0, limit);
  }
}

export const trendingRetrieverInstance = new TrendingRetriever();
