import { Product } from '../../../types';
import { mockProducts } from '../../../data/products';
import { generateProductEmbedding } from '../../../engine/ingestionService';

export interface HybridSearchResult {
  product: Product;
  lexicalScore: number;
  lexicalRank: number;
  vectorScore: number;
  vectorRank: number;
  rrfScore: number; // Reciprocal Rank Fusion
}

export class HybridSearchService {
  /**
   * Computes BM25-style lexical keyword match score.
   */
  public computeLexicalScore(product: Product, queryTokens: string[]): number {
    if (queryTokens.length === 0) return 0.5;

    let score = 0;
    const titleLower = product.title.toLowerCase();
    const brandLower = product.brand.toLowerCase();
    const categoryLower = product.category.toLowerCase();
    const tagsLower = product.tags.map(t => t.toLowerCase()).join(' ');
    const descLower = product.description.toLowerCase();

    for (const token of queryTokens) {
      if (titleLower.includes(token)) score += 3.0;
      if (brandLower.includes(token)) score += 2.5;
      if (categoryLower.includes(token)) score += 2.0;
      if (tagsLower.includes(token)) score += 1.5;
      if (descLower.includes(token)) score += 0.5;
    }

    return parseFloat(score.toFixed(3));
  }

  /**
   * Computes cosine similarity between two normalized 8D embedding vectors.
   */
  public computeCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0.5;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0.5;
    const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
    return parseFloat(Math.max(0, Math.min(1, (sim + 1) / 2)).toFixed(3));
  }

  /**
   * Performs hybrid search combining BM25 lexical matching and Vector Cosine similarity
   * using Reciprocal Rank Fusion (RRF) with constant k=60.
   */
  public executeHybridSearch(params: {
    query: string;
    category?: string;
    maxPriceINR?: number;
    limit?: number;
  }): HybridSearchResult[] {
    const query = (params.query || '').trim().toLowerCase();
    const queryTokens = query.split(/\s+/).filter(t => t.length > 1);
    const limit = params.limit || 20;

    // Filter candidate products by base constraints
    let pool = mockProducts;
    if (params.category && params.category !== 'All') {
      pool = pool.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params.maxPriceINR) {
      pool = pool.filter(p => p.priceINR <= params.maxPriceINR!);
    }

    // 1. Synthesize Query Vector Embedding
    const queryVector = generateProductEmbedding(query, params.category || 'General', [], query, params.maxPriceINR || 50000);

    // 2. Compute Lexical Scores & Ranks
    const lexicalScored = pool.map(p => ({
      product: p,
      lexicalScore: this.computeLexicalScore(p, queryTokens)
    })).sort((a, b) => b.lexicalScore - a.lexicalScore);

    const lexicalRankMap = new Map<string, number>();
    lexicalScored.forEach((item, idx) => {
      lexicalRankMap.set(item.product.id, idx + 1);
    });

    // 3. Compute Vector Scores & Ranks
    const vectorScored = pool.map(p => ({
      product: p,
      vectorScore: this.computeCosineSimilarity(queryVector, p.embedding || [])
    })).sort((a, b) => b.vectorScore - a.vectorScore);

    const vectorRankMap = new Map<string, number>();
    vectorScored.forEach((item, idx) => {
      vectorRankMap.set(item.product.id, idx + 1);
    });

    // 4. Reciprocal Rank Fusion (RRF)
    const k = 60; // Standard TREC RRF smoothing factor
    const results: HybridSearchResult[] = pool.map(p => {
      const lRank = lexicalRankMap.get(p.id) || pool.length;
      const vRank = vectorRankMap.get(p.id) || pool.length;
      const lScore = lexicalScored.find(s => s.product.id === p.id)?.lexicalScore || 0;
      const vScore = vectorScored.find(s => s.product.id === p.id)?.vectorScore || 0;

      const rrfScore = (1 / (k + lRank)) + (1 / (k + vRank));

      return {
        product: p,
        lexicalScore: lScore,
        lexicalRank: lRank,
        vectorScore: vScore,
        vectorRank: vRank,
        rrfScore: parseFloat(rrfScore.toFixed(5))
      };
    });

    return results.sort((a, b) => b.rrfScore - a.rrfScore).slice(0, limit);
  }
}

export const hybridSearchServiceInstance = new HybridSearchService();
