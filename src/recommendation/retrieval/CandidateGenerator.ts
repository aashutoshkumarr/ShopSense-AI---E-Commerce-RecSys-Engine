import { Product, UserPersona, UserEvent, StructuredIntent, CandidateSourceScore, PipelineConfig } from '../../types';
import { cosineSimilarity } from '../../engine/ingestionService';

export interface RetrievedCandidate {
  product: Product;
  sourceScore: CandidateSourceScore;
}

export interface FusedCandidate {
  product: Product;
  sources: CandidateSourceScore[];
  mergedScore: number;
}

export interface CandidateGenerationResult {
  contentCandidates: RetrievedCandidate[];
  collabCandidates: RetrievedCandidate[];
  sessionCandidates: RetrievedCandidate[];
  trendingCandidates: RetrievedCandidate[];
  fusedCandidates: FusedCandidate[];
  totalRetrieved: number;
  uniqueCount: number;
}

export class CandidateGenerator {
  public generateContentBased(
    user: UserPersona,
    catalog: Product[],
    intent?: StructuredIntent | null
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

    return results.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore).slice(0, 16);
  }

  public generateCollaborative(
    user: UserPersona,
    catalog: Product[]
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

    return results.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore).slice(0, 14);
  }

  public generateSessionBased(
    events: UserEvent[],
    user: UserPersona,
    catalog: Product[]
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

    return results.sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore).slice(0, 12);
  }

  public generateTrending(catalog: Product[]): RetrievedCandidate[] {
    return catalog
      .filter(p => p.status !== 'discontinued' && p.status !== 'hidden')
      .map(prod => {
        const freshnessMultiplier = Math.max(0.7, 1 - (prod.releaseDaysAgo / 300));
        const trendingScore = (prod.popularityScore * 0.6 + prod.historicalCTR * 4.0) * freshnessMultiplier;
        return {
          product: prod,
          sourceScore: {
            source: 'trending_popular' as const,
            rawScore: trendingScore,
            normalizedScore: Math.min(1, Math.max(0.1, trendingScore)),
            reason: `High velocity score: CTR ${(prod.historicalCTR * 100).toFixed(1)}% | Rating ${prod.rating}★`
          }
        };
      })
      .sort((a, b) => b.sourceScore.normalizedScore - a.sourceScore.normalizedScore)
      .slice(0, 10);
  }

  public generate(
    user: UserPersona,
    catalog: Product[],
    sessionEvents: UserEvent[] = [],
    intent?: StructuredIntent | null,
    config?: PipelineConfig
  ): CandidateGenerationResult {
    const weights = config?.weights || {
      contentBased: 0.35,
      collaborative: 0.30,
      sessionBased: 0.20,
      trending: 0.15
    };

    const contentCandidates = this.generateContentBased(user, catalog, intent);
    const collabCandidates = this.generateCollaborative(user, catalog);
    const sessionCandidates = this.generateSessionBased(sessionEvents, user, catalog);
    const trendingCandidates = this.generateTrending(catalog);

    const candidateMap = new Map<string, { product: Product; sources: CandidateSourceScore[] }>();

    const addCandidate = (prod: Product, sourceScore: CandidateSourceScore) => {
      if (!candidateMap.has(prod.id)) {
        candidateMap.set(prod.id, { product: prod, sources: [] });
      }
      candidateMap.get(prod.id)!.sources.push(sourceScore);
    };

    contentCandidates.forEach(c => addCandidate(c.product, c.sourceScore));
    collabCandidates.forEach(c => addCandidate(c.product, c.sourceScore));
    sessionCandidates.forEach(c => addCandidate(c.product, c.sourceScore));
    trendingCandidates.forEach(c => addCandidate(c.product, c.sourceScore));

    const fusedCandidates: FusedCandidate[] = [];

    candidateMap.forEach(({ product, sources }) => {
      let weightedSum = 0;
      let totalWeight = 0;

      for (const src of sources) {
        let weight = 0.25;
        if (src.source === 'content_based') weight = weights.contentBased;
        if (src.source === 'collaborative_filtering') weight = weights.collaborative;
        if (src.source === 'session_based') weight = weights.sessionBased;
        if (src.source === 'trending_popular') weight = weights.trending;

        weightedSum += src.normalizedScore * weight;
        totalWeight += weight;
      }

      const mergedScore = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
      fusedCandidates.push({ product, sources, mergedScore });
    });

    const totalRetrieved =
      contentCandidates.length +
      collabCandidates.length +
      sessionCandidates.length +
      trendingCandidates.length;

    return {
      contentCandidates,
      collabCandidates,
      sessionCandidates,
      trendingCandidates,
      fusedCandidates,
      totalRetrieved,
      uniqueCount: fusedCandidates.length
    };
  }
}

export const candidateGeneratorInstance = new CandidateGenerator();
