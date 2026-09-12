import { Product, UserPersona, CandidateSourceScore, UserEvent } from '../../types';
import { RetrievedCandidate } from './ContentRetriever';

export class SessionRetriever {
  public retrieve(
    events: UserEvent[],
    user: UserPersona,
    catalog: Product[],
    limit: number = 12
  ): RetrievedCandidate[] {
    const results: RetrievedCandidate[] = [];
    if (!events || events.length === 0) {
      return catalog.slice(0, 8).map(prod => ({
        product: prod,
        sourceScore: {
          source: 'session_based',
          rawScore: 0.5,
          normalizedScore: 0.5,
          reason: 'Cold session fallback baseline'
        }
      }));
    }

    const recentEvents = events.slice(-6);
    const categoryCounts: Record<string, number> = {};
    const viewedProductIds = new Set<string>();

    recentEvents.forEach((ev, idx) => {
      const recencyWeight = (idx + 1) / recentEvents.length;
      const eventWeight = Math.abs(ev.weight || 1);
      if (ev.category) {
        categoryCounts[ev.category] = (categoryCounts[ev.category] || 0) + (recencyWeight * eventWeight * 0.2);
      }
      if (ev.productId) viewedProductIds.add(ev.productId);
    });

    catalog.forEach(prod => {
      if (prod.status === 'discontinued' || prod.status === 'hidden') return;

      let sessionScore = 0;
      if (categoryCounts[prod.category]) {
        sessionScore += Math.min(0.65, categoryCounts[prod.category] * 0.35);
      }
      if (viewedProductIds.has(prod.id)) {
        sessionScore += 0.3;
      }

      if (sessionScore > 0.18) {
        results.push({
          product: prod,
          sourceScore: {
            source: 'session_based',
            rawScore: sessionScore,
            normalizedScore: Math.min(1, sessionScore + 0.2),
            reason: `Real-time session transition Markov window (${prod.category} engagement)`
          }
        });
      }
    });

    return results.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore).slice(0, limit);
  }
}

export const sessionRetrieverInstance = new SessionRetriever();
