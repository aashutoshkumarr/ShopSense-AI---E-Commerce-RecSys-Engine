import { Product, UserPersona, CandidateSourceScore, StructuredIntent } from '../../types';
import { cosineSimilarity } from '../../engine/ingestionService';

export interface RetrievedCandidate {
  product: Product;
  sourceScore: CandidateSourceScore;
}

export class ContentRetriever {
  public retrieve(
    user: UserPersona,
    catalog: Product[],
    intent?: StructuredIntent | null,
    limit: number = 16
  ): RetrievedCandidate[] {
    const results: RetrievedCandidate[] = [];

    catalog.forEach(prod => {
      if (prod.status === 'discontinued' || prod.status === 'hidden') return;

      const sim = cosineSimilarity(user.embedding, prod.embedding);
      let matchCount = 0;
      if (user.preferredCategories?.includes(prod.category)) matchCount += 0.2;
      if (user.preferredBrands?.includes(prod.brand)) matchCount += 0.15;

      if (user.categoryAffinities && user.categoryAffinities[prod.category]) {
        matchCount += user.categoryAffinities[prod.category] * 0.25;
      }

      if (user.wishlistIds && user.wishlistIds.length > 0) {
        for (const wId of user.wishlistIds) {
          const wProd = catalog.find(p => p.id === wId);
          if (wProd) {
            const wSim = cosineSimilarity(wProd.embedding, prod.embedding);
            if (wSim > 0.8) matchCount += 0.18;
          }
        }
      }

      if (intent) {
        if (intent.category && prod.category.toLowerCase().includes(intent.category.toLowerCase())) {
          matchCount += 0.35;
        }
        if (intent.brandPreferences?.some(b => prod.brand.toLowerCase().includes(b.toLowerCase()))) {
          matchCount += 0.25;
        }
        if (intent.requiredFeatures && intent.requiredFeatures.length > 0) {
          const featureMatches = intent.requiredFeatures.filter(f =>
            prod.tags.some(t => t.toLowerCase().includes(f.toLowerCase())) ||
            prod.description.toLowerCase().includes(f.toLowerCase())
          );
          matchCount += featureMatches.length * 0.12;
        }
      }

      const rawScore = Math.min(1, sim + matchCount);
      if (rawScore > 0.38) {
        results.push({
          product: prod,
          sourceScore: {
            source: 'content_based',
            rawScore,
            normalizedScore: rawScore,
            reason: `Semantic profile vector cosine sim: ${sim.toFixed(2)} + ${prod.category} preference match`
          }
        });
      }
    });

    return results.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore).slice(0, limit);
  }
}

export const contentRetrieverInstance = new ContentRetriever();
