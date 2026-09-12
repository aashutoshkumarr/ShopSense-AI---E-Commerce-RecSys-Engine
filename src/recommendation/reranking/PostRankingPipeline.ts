import { Product, UserPersona, ScoredCandidate, BusinessRuleResult, PipelineConfig, StructuredIntent } from '../../types';
import { cosineSimilarity } from '../../engine/ingestionService';

export interface PostRankingResult {
  topKResults: ScoredCandidate[];
  filteredOutCount: number;
}

export class PostRankingPipeline {
  /**
   * Applies Hard Filters (Stock, Status, Purchased, Price Ceiling, Category Quota)
   * and Soft Policies (Fast Delivery, Promotions, MMR Intra-List Diversity).
   */
  public process(
    candidates: ScoredCandidate[],
    user: UserPersona,
    config: PipelineConfig,
    intent?: StructuredIntent | null
  ): PostRankingResult {
    const rules = config.businessRules;
    const categoryCounts: Record<string, number> = {};
    const selected: ScoredCandidate[] = [];
    let removedCount = 0;

    const purchasedSet = new Set(user.historicalPurchasedIds || []);
    const sortedCandidates = [...candidates].sort((a, b) => b.rankingScore - a.rankingScore);

    for (const item of sortedCandidates) {
      const prod = item.product;
      const ruleResults: BusinessRuleResult[] = [];
      let shouldDrop = false;
      let scoreAdjustment = 0;

      // 1. In-Stock Constraint
      if (rules.filterOutOfStock && (!prod.inStock || prod.stockCount <= 0)) {
        ruleResults.push({ ruleName: 'In-Stock Filter', passed: false, penaltyOrBoost: 0, note: 'Dropped: Out of stock / 0 inventory' });
        shouldDrop = true;
      } else {
        ruleResults.push({ ruleName: 'In-Stock Filter', passed: true, penaltyOrBoost: 0, note: `${prod.stockCount} units available` });
      }

      // 2. Status check (discontinued / hidden)
      if (prod.status === 'discontinued' || prod.status === 'hidden') {
        ruleResults.push({ ruleName: 'Catalog Visibility', passed: false, penaltyOrBoost: 0, note: `Dropped: Status is ${prod.status}` });
        shouldDrop = true;
      }

      // 3. Remove Already Purchased
      if (rules.removePurchased && purchasedSet.has(prod.id)) {
        ruleResults.push({ ruleName: 'Deduplicate Purchased', passed: false, penaltyOrBoost: 0, note: 'Dropped: User already purchased this item' });
        shouldDrop = true;
      }

      // 4. Price Ceiling Limits
      if (rules.enforcePriceBounds && intent?.targetBudgetINR) {
        const maxAllowed = intent.targetBudgetINR * (1 + rules.priceTolerancePct / 100);
        if (prod.priceINR > maxAllowed) {
          ruleResults.push({ ruleName: 'Price Ceiling Limit', passed: false, penaltyOrBoost: 0, note: `Dropped: ₹${prod.priceINR.toLocaleString()} exceeds budget max ₹${Math.round(maxAllowed).toLocaleString()}` });
          shouldDrop = true;
        }
      }

      // 5. Category Quota Constraint
      const currentCatCount = categoryCounts[prod.category] || 0;
      if (currentCatCount >= rules.maxPerCategory) {
        ruleResults.push({ ruleName: 'Category Diversity Quota', passed: false, penaltyOrBoost: 0, note: `Dropped: Exceeds max ${rules.maxPerCategory} items for ${prod.category}` });
        shouldDrop = true;
      }

      // 6. Fast Delivery & In-Stock Boost
      if (rules.boostInStockFastDelivery && prod.inStock && prod.stockCount > 5) {
        scoreAdjustment += 0.03;
        ruleResults.push({ ruleName: 'In-Stock Priority Boost', passed: true, penaltyOrBoost: +0.03, note: 'Boosted +3% for instant dispatch availability' });
      }

      // 7. Promotional Boost
      if (rules.boostPromotions && prod.badge) {
        scoreAdjustment += 0.04;
        ruleResults.push({ ruleName: 'Promotional / Badge Boost', passed: true, penaltyOrBoost: +0.04, note: `Boosted +4% for "${prod.badge}"` });
      }

      // 8. MMR Diversity Penalty
      if (rules.diversityFactorMMR > 0 && selected.length > 0) {
        let maxSimilarityToSelected = 0;
        for (const sel of selected) {
          const sim = cosineSimilarity(prod.embedding, sel.product.embedding);
          if (sim > maxSimilarityToSelected) maxSimilarityToSelected = sim;
        }
        const diversityPenalty = maxSimilarityToSelected * (rules.diversityFactorMMR * 0.15);
        scoreAdjustment -= diversityPenalty;
        ruleResults.push({
          ruleName: 'MMR Intra-List Diversity',
          passed: true,
          penaltyOrBoost: -Math.round(diversityPenalty * 1000) / 1000,
          note: `Penalized redundant similarity (-${(diversityPenalty * 100).toFixed(1)}%)`
        });
      }

      if (shouldDrop) {
        removedCount++;
        continue;
      }

      categoryCounts[prod.category] = currentCatCount + 1;
      const finalScore = Math.max(0.01, Math.min(1.0, item.rankingScore + scoreAdjustment));

      selected.push({
        ...item,
        businessRuleResults: ruleResults,
        finalScore: Math.round(finalScore * 1000) / 1000
      });

      if (selected.length >= config.topK) break;
    }

    selected.sort((a, b) => b.finalScore - a.finalScore);

    return {
      topKResults: selected,
      filteredOutCount: removedCount
    };
  }
}

export const postRankingPipelineInstance = new PostRankingPipeline();
