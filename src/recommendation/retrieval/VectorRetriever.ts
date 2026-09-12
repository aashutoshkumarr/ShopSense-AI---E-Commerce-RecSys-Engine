import { Product, UserPersona, CandidateSourceScore, StructuredIntent } from '../../types';
import { RetrievedCandidate } from './ContentRetriever';
import { cosineSimilarity } from '../../engine/ingestionService';

export class VectorRetriever {
  public retrieve(
    user: UserPersona,
    catalog: Product[],
    intent?: StructuredIntent | null,
    limit: number = 16
  ): RetrievedCandidate[] {
    const candidates: RetrievedCandidate[] = [];
    const userEmbedding = user.embedding || [];

    for (const prod of catalog) {
      if (prod.status === 'discontinued' || prod.status === 'hidden') continue;

      let sim = 0.5;
      if (prod.embedding && prod.embedding.length > 0 && userEmbedding.length > 0) {
        sim = cosineSimilarity(userEmbedding, prod.embedding);
      } else {
        const userAffinities = user.categoryAffinities || {};
        const catAffinity = userAffinities[prod.category] || 0.4;
        sim = 0.3 + catAffinity * 0.5;
      }

      if (intent?.rawQuery) {
        const queryLower = intent.rawQuery.toLowerCase();
        if (prod.title.toLowerCase().includes(queryLower) || prod.category.toLowerCase().includes(queryLower)) {
          sim = Math.min(0.99, sim + 0.25);
        }
      }

      const normalizedScore = Math.max(0.01, Math.min(0.99, sim));

      candidates.push({
        product: prod,
        sourceScore: {
          source: 'content_based',
          rawScore: sim,
          normalizedScore: Math.round(normalizedScore * 100) / 100,
          reason: `Vector ANN: ${(sim * 100).toFixed(1)}% cosine similarity in latent semantic space`
        }
      });
    }

    candidates.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore);
    return candidates.slice(0, limit);
  }
}

export const vectorRetrieverInstance = new VectorRetriever();
