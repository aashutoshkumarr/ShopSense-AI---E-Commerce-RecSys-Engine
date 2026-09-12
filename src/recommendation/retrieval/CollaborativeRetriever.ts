import { Product, UserPersona, CandidateSourceScore } from '../../types';
import { RetrievedCandidate } from './ContentRetriever';

export class CollaborativeRetriever {
  public retrieve(
    user: UserPersona,
    catalog: Product[],
    limit: number = 14
  ): RetrievedCandidate[] {
    const results: RetrievedCandidate[] = [];
    const viewedSet = new Set(user.historicalViewedIds || []);

    catalog.forEach(prod => {
      if (prod.status === 'discontinued' || prod.status === 'hidden') return;
      if (viewedSet.has(prod.id)) return;

      let coOccurrenceScore = 0;
      for (const vId of user.historicalViewedIds || []) {
        const viewedProd = catalog.find(p => p.id === vId);
        if (viewedProd) {
          if (viewedProd.category === prod.category) coOccurrenceScore += 0.35;
          if ((viewedProd.category === 'Laptops' && prod.category === 'Accessories') ||
              (viewedProd.category === 'Laptops' && prod.category === 'Audio') ||
              (viewedProd.category === 'Smartphones' && prod.category === 'Wearables') ||
              (viewedProd.category === 'Gaming' && prod.category === 'Accessories')) {
            coOccurrenceScore += 0.45;
          }
        }
      }

      const latentScore = (prod.popularityScore * 0.45) + (coOccurrenceScore * 0.55);

      if (latentScore > 0.30) {
        results.push({
          product: prod,
          sourceScore: {
            source: 'collaborative_filtering',
            rawScore: latentScore,
            normalizedScore: Math.min(1, latentScore),
            reason: `Item-item co-occurrence matrix with viewed items in ${user.role} segment`
          }
        });
      }
    });

    return results.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore).slice(0, limit);
  }
}

export const collaborativeRetrieverInstance = new CollaborativeRetriever();
