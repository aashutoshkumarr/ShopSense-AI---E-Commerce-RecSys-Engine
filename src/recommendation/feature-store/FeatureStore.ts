import { Product, UserPersona, UserEvent, StructuredIntent, ProductFeatureVector } from '../../types';
import { cosineSimilarity } from '../../engine/ingestionService';

export interface UserFeatures {
  userId: string;
  user_ctr: number;
  purchase_rate: number;
  avg_order_value: number;
  category_affinity: number;
  brand_affinity: number;
  price_sensitivity: number;
  days_since_purchase: number;
}

export interface ItemFeatures {
  productId: string;
  ctr: number;
  conversion_rate: number;
  rating: number;
  inventory: number;
  discount: number;
  popularity: number;
  freshness: number;
}

export interface UserItemFeatures {
  category_match: number;
  brand_match: number;
  price_distance: number;
  historical_views: number;
  historical_purchases: number;
  wishlist_similarity: number;
  cart_similarity: number;
  semantic_similarity: number;
}

export interface SessionFeatures {
  session_intent_category: number;
  session_dwell_decay: number;
  in_session_clicks: number;
}

export interface OnlineFeatureVector {
  user: UserFeatures;
  item: ItemFeatures;
  userItem: UserItemFeatures;
  session: SessionFeatures;
  legacyVector: ProductFeatureVector;
  featureArray: number[];
  featureNames: string[];
}

export class FeatureStore {
  /**
   * Computes the complete feature groups for a given user-item-session interaction.
   */
  public extractFeatures(
    prod: Product,
    user: UserPersona,
    sessionEvents: UserEvent[] = [],
    intent?: StructuredIntent | null
  ): OnlineFeatureVector {
    const semanticSimilarity = cosineSimilarity(user.embedding, prod.embedding);

    let userAffinity = 0.2;
    if (user.preferredCategories?.includes(prod.category)) userAffinity += 0.4;
    if (user.preferredBrands?.includes(prod.brand)) userAffinity += 0.3;
    if (user.categoryAffinities && user.categoryAffinities[prod.category]) {
      userAffinity += user.categoryAffinities[prod.category] * 0.2;
    }
    if (intent?.category && prod.category.toLowerCase().includes(intent.category.toLowerCase())) {
      userAffinity += 0.5;
    }
    userAffinity = Math.min(1, userAffinity);

    const popularityScore = prod.popularityScore;
    const ctrHistorical = Math.min(1, (prod.historicalCTR || 0.05) * 10);

    const targetBudget = intent?.targetBudgetINR || user.targetBudgetINR || 80000;
    let priceAffinity = 0.5;
    if (targetBudget > 0) {
      const priceDiffRatio = Math.abs(prod.priceINR - targetBudget) / targetBudget;
      priceAffinity = Math.exp(-1.8 * Math.pow(priceDiffRatio, 2));
    }

    const freshnessScore = Math.exp(-(prod.releaseDaysAgo || 30) / 120);

    const legacyVector: ProductFeatureVector = {
      semanticSimilarity,
      userAffinity,
      popularityScore,
      ctrHistorical,
      priceAffinity,
      freshnessScore
    };

    const discountPct = prod.originalPriceINR > prod.priceINR
      ? Math.round(((prod.originalPriceINR - prod.priceINR) / prod.originalPriceINR) * 100)
      : 0;

    // User features
    const userFeats: UserFeatures = {
      userId: user.id,
      user_ctr: 0.12,
      purchase_rate: (user.historicalPurchasedIds?.length || 0) / 20,
      avg_order_value: user.targetBudgetINR || 60000,
      category_affinity: userAffinity,
      brand_affinity: user.preferredBrands?.includes(prod.brand) ? 0.9 : 0.2,
      price_sensitivity: (user.targetBudgetINR || 80000) < 50000 ? 0.8 : 0.4,
      days_since_purchase: 14
    };

    // Item features
    const itemFeats: ItemFeatures = {
      productId: prod.id,
      ctr: prod.historicalCTR || 0.05,
      conversion_rate: 0.08,
      rating: prod.rating / 5.0,
      inventory: prod.stockCount || 50,
      discount: discountPct / 100,
      popularity: popularityScore,
      freshness: freshnessScore
    };

    // User x Item features
    const userItemFeats: UserItemFeatures = {
      category_match: user.preferredCategories?.includes(prod.category) ? 1.0 : 0.0,
      brand_match: user.preferredBrands?.includes(prod.brand) ? 1.0 : 0.0,
      price_distance: priceAffinity,
      historical_views: user.historicalViewedIds?.includes(prod.id) ? 1.0 : 0.0,
      historical_purchases: user.historicalPurchasedIds?.includes(prod.id) ? 1.0 : 0.0,
      wishlist_similarity: user.wishlistIds?.includes(prod.id) ? 1.0 : 0.0,
      cart_similarity: user.cartItemIds?.includes(prod.id) ? 1.0 : 0.0,
      semantic_similarity: semanticSimilarity
    };

    // Session features
    const sessionFeats: SessionFeatures = {
      session_intent_category: intent?.category && prod.category.toLowerCase().includes(intent.category.toLowerCase()) ? 1.0 : 0.0,
      session_dwell_decay: sessionEvents.length > 0 ? 0.9 : 0.0,
      in_session_clicks: Math.min(1.0, sessionEvents.length / 10)
    };

    const featureNames = [
      'semantic_similarity',
      'user_affinity',
      'popularity_score',
      'ctr_historical',
      'price_affinity',
      'freshness_score',
      'brand_match',
      'category_match',
      'session_intent'
    ];

    const featureArray = [
      semanticSimilarity,
      userAffinity,
      popularityScore,
      ctrHistorical,
      priceAffinity,
      freshnessScore,
      userItemFeats.brand_match,
      userItemFeats.category_match,
      sessionFeats.session_intent_category
    ];

    return {
      user: userFeats,
      item: itemFeats,
      userItem: userItemFeats,
      session: sessionFeats,
      legacyVector,
      featureArray,
      featureNames
    };
  }
}

export const featureStoreInstance = new FeatureStore();
