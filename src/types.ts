export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rateFromINR: number;
  flag: string;
}

export type UserRole = 'customer' | 'admin' | 'ml_analyst' | 'seller' | 'pharmacy_operator' | 'delivery_partner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  targetPersonaId: string;
  token: string;
  refreshToken: string;
  permissions: string[];
}

export interface ProductSpec {
  [key: string]: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'Laptops' | 'Audio' | 'Smartphones' | 'Smart Home' | 'Gaming' | 'Accessories' | 'Wearables' | string;
  subCategory: string;
  priceINR: number;
  priceUSD: number;
  originalPriceINR: number;
  originalPriceUSD: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  badge?: string;
  tags: string[];
  description: string;
  specs: ProductSpec;
  features: string[];
  popularityScore: number; // 0 to 1
  historicalCTR: number; // e.g. 0.045 = 4.5%
  releaseDaysAgo: number;
  embedding: number[]; // 8-dimensional semantic embedding vector
  source?: 'dummyjson' | 'custom_csv' | 'json' | 'manual' | 'default';
  status?: 'active' | 'hidden' | 'discontinued';
  createdAt?: string;
  updatedAt?: string;
}

export type CandidateSourceType = 'content_based' | 'collaborative_filtering' | 'session_based' | 'trending_popular';

export interface CandidateSourceScore {
  source: CandidateSourceType;
  rawScore: number;
  normalizedScore: number;
  reason: string;
}

export interface ProductFeatureVector {
  semanticSimilarity: number; // 0-1
  userAffinity: number; // 0-1 (brand/category historical match)
  popularityScore: number; // 0-1
  ctrHistorical: number; // 0-1
  priceAffinity: number; // 0-1 (closer to user target/historical basket)
  freshnessScore: number; // 0-1 (decay based on release date)
}

export interface FeatureAttribution {
  featureName: string;
  weight: number;
  value: number;
  contribution: number; // weight * value
  percentage: number; // relative share of final score
}

export interface BusinessRuleResult {
  ruleName: string;
  passed: boolean;
  penaltyOrBoost: number;
  note: string;
}

export interface RecommendationGroundedReason {
  headline: string;
  dominantSignal: 'view_history' | 'wishlist_match' | 'co_purchase' | 'high_affinity' | 'trending_velocity' | 'intent_match';
  explanationText: string;
  confidenceScore: number;
  signalTags: string[];
}

export interface ScoredCandidate {
  product: Product;
  candidateSources: CandidateSourceScore[];
  mergedScore: number;
  features: ProductFeatureVector;
  rankingScore: number;
  featureAttributions: FeatureAttribution[];
  businessRuleResults: BusinessRuleResult[];
  finalScore: number;
  rank: number;
  groundedReason?: RecommendationGroundedReason;
  cacheHit?: boolean;
  filterOutReason?: string;
}

export interface PipelineStageTelemetry {
  stageName: string;
  latencyMs: number;
  itemCountIn: number;
  itemCountOut: number;
  description: string;
  details?: Record<string, any>;
}

export interface PipelineExecutionResult {
  userId: string;
  userPersonaName: string;
  timestamp: string;
  totalLatencyMs: number;
  stages: PipelineStageTelemetry[];
  candidatePools: {
    contentBased: { id: string; title: string; score: number; reason: string }[];
    collaborative: { id: string; title: string; score: number; reason: string }[];
    sessionBased: { id: string; title: string; score: number; reason: string }[];
    trending: { id: string; title: string; score: number; reason: string }[];
  };
  mergedCount: number;
  filteredOutCount: number;
  topKResults: ScoredCandidate[];
  cacheStatus: 'HIT' | 'MISS';
  cacheKey: string;
  activeModelVersion: string;
  activeVariant?: 'Variant A (Hybrid)' | 'Variant B (Hybrid + LightGBM)';
}

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  targetBudgetINR: number;
  targetBudgetUSD: number;
  priceElasticity: 'strict' | 'moderate' | 'flexible';
  preferredCategories: string[];
  preferredBrands: string[];
  historicalViewedIds: string[];
  historicalPurchasedIds: string[];
  cartItemIds: string[];
  wishlistIds: string[];
  embedding: number[];
  categoryAffinities?: Record<string, number>;
}

export type EventType =
  | 'product_view'              // wt 1
  | 'search'                    // wt 2
  | 'recommendation_click'      // wt 3
  | 'product_share'             // wt 4
  | 'wishlist_add'              // wt 5
  | 'product_rating'            // wt 6
  | 'cart_add'                  // wt 7
  | 'add_to_cart'               // wt 7
  | 'purchase'                  // wt 10
  | 'cart_remove'               // wt -2
  | 'recommendation_impression' // wt 0.5
  | 'explain_recommendation_view'
  | 'page_view'
  | 'item_click'
  | 'filter_change';

export interface UserEvent {
  id: string;
  userId: string;
  userName?: string;
  eventType: EventType;
  productId?: string;
  productTitle?: string;
  category?: string;
  brand?: string;
  weight: number;
  searchQuery?: string;
  ratingValue?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StructuredIntent {
  rawQuery: string;
  category?: string;
  subCategory?: string;
  targetBudgetINR?: number;
  targetBudgetUSD?: number;
  brandPreferences: string[];
  requiredFeatures: string[];
  useCase?: string;
  urgencyOrContext?: string;
  confidenceScore: number;
}

export interface PipelineConfig {
  weights: {
    contentBased: number;
    collaborative: number;
    sessionBased: number;
    trending: number;
  };
  featureWeights: {
    semanticSimilarity: number;
    userAffinity: number;
    popularity: number;
    ctr: number;
    priceAffinity: number;
    freshness: number;
  };
  businessRules: {
    filterOutOfStock: boolean;
    enforcePriceBounds: boolean;
    priceTolerancePct: number;
    diversityFactorMMR: number; // 0 to 1
    removePurchased: boolean;
    maxPerCategory: number;
    boostPromotions: boolean;
    boostInStockFastDelivery: boolean;
  };
  topK: number;
  cacheEnabled: boolean;
  modelVersion: string;
  enableRankingModel: boolean;
}

export interface MLModelVersion {
  id: string;
  name: string;
  version: string;
  architecture: string;
  status: 'production' | 'staging' | 'archived';
  trafficPercent: number;
  trainedOnEvents: number;
  lastTrainedDate: string;
  metrics: {
    ndcgAt5: number;
    ndcgAt10: number;
    precisionAt10: number;
    recallAt10: number;
    mapAt10: number;
    mrr: number;
    aucRoc: number;
    ctrPercent: number;
    conversionPercent: number;
    catalogCoveragePercent: number;
    inferenceLatencyP95Ms: number;
  };
}

export interface OfflineEvaluationReport {
  timestamp: string;
  totalTrainingSamples: number;
  validationSamples: number;
  currentModelId: string;
  scorecard: {
    precisionAt10: number;
    recallAt10: number;
    ndcgAt10: number;
    ctrPercent: number;
    conversionPercent: number;
    coveragePercent: number;
    mrr: number;
    inferenceLatencyP95Ms: number;
  };
  models: MLModelVersion[];
  featureImportance: { feature: string; importance: number }[];
  lossHistory: { epoch: number; trainLoss: number; valLoss: number; ndcg: number }[];
}

export interface ABExperimentVariant {
  id: 'variant_a' | 'variant_b';
  name: string;
  description: string;
  modelConfig: string;
  trafficAllocation: number; // e.g. 50%
  impressions: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
  revenueINR: number;
  ctr: number; // clicks / impressions
  cartRate: number; // addToCarts / impressions
  conversionRate: number; // purchases / impressions
  revenuePerSession: number;
}

export interface ABExperiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'active' | 'completed' | 'draft';
  startDate: string;
  totalSessions: number;
  confidenceLevel: number; // e.g. 95%
  pValue: number; // e.g. 0.024
  statisticallySignificant: boolean;
  winnerVariantId?: 'variant_a' | 'variant_b';
  variantA: ABExperimentVariant;
  variantB: ABExperimentVariant;
}

export interface IngestionJob {
  id: string;
  source: 'dummyjson' | 'csv' | 'json' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  itemsFetched: number;
  itemsValidated: number;
  itemsNormalized: number;
  itemsDeduplicated: number;
  embeddingsGenerated: number;
  itemsIndexed: number;
  errors: string[];
  logs: string[];
}

export interface OrderItem {
  productId: string;
  title: string;
  priceINR: number;
  priceUSD: number;
  quantity: number;
  imageUrl: string;
  brand: string;
  category?: string;
}

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  subtotalINR: number;
  discountINR: number;
  walletUsedINR: number;
  pointsDiscountINR: number;
  shippingFeeINR: number;
  totalINR: number;
  totalUSD: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryDate: string;
  deliveredDate?: string;
  trackingNumber: string;
  carrier: string;
  paymentMethod: 'wallet' | 'card' | 'upi' | 'split_wallet_card';
  paymentDetails?: {
    walletAmountINR: number;
    cardAmountINR: number;
    gatewayRef?: string;
  };
  shippingAddress: string;
  couponApplied?: string;
  pointsEarned: number;
  trackingTimeline: OrderTrackingStep[];
  cancelReason?: string;
  returnReason?: string;
}

// 1. Wallet
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'order_payment' | 'refund' | 'cashback_reward' | 'referral_bonus';
  amountINR: number;
  amountUSD: number;
  balanceAfterINR: number;
  balanceAfterUSD: number;
  description: string;
  timestamp: string;
  referenceId?: string; // Order ID, Stripe Payment Intent, etc.
  status: 'succeeded' | 'pending' | 'failed';
  paymentGateway?: 'Stripe Test Mode' | 'Razorpay Sandbox' | 'System Automated';
}

export interface UserWallet {
  userId: string;
  balanceINR: number;
  balanceUSD: number;
  totalDepositedINR: number;
  totalSpentINR: number;
  totalRefundedINR: number;
  updatedAt: string;
  transactions: WalletTransaction[];
}

// 2. Loyalty Points & Tiers
export type LoyaltyTierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyTierConfig {
  tier: LoyaltyTierName;
  minPoints: number;
  pointsMultiplier: number; // 1.0x, 1.2x, 1.5x, 2.0x
  freeShippingThresholdINR: number;
  discountPerkPct: number;
  badgeColor: string;
  perks: string[];
}

export interface RewardTransaction {
  id: string;
  userId: string;
  action: 'purchase' | 'review' | 'referral' | 'daily_login' | 'profile_completion' | 'redemption';
  points: number; // positive or negative
  balanceAfter: number;
  description: string;
  timestamp: string;
  orderId?: string;
}

export interface UserLoyaltyAccount {
  userId: string;
  currentTier: LoyaltyTierName;
  totalPoints: number;
  lifetimePointsEarned: number;
  pointsRedeemed: number;
  dailyLoginClaimedToday: boolean;
  profileCompleted: boolean;
  transactions: RewardTransaction[];
}

// 3. Coupons & ML Personalized Offers
export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat_inr' | 'free_shipping';
  discountValue: number; // e.g. 15 for 15% or 500 for ₹500
  minOrderINR: number;
  applicableCategories?: string[];
  expiresAt: string;
  usageCount: number;
  badge?: string;
  targetTier?: LoyaltyTierName;
}

export interface MLPersonalizedOffer {
  coupon: Coupon;
  targetPersonaId: string;
  conversionPropensity: number; // 0 to 1, e.g. 0.89 = 89%
  mlRationale: string;
  topContributingFeature: string;
  expectedRevenueBoostINR: number;
}

// 4. Referral System
export interface ReferralReferee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  signedUpAt: string;
  hasPurchased: boolean;
  firstOrderTotalINR?: number;
  rewardClaimed: boolean;
}

export interface UserReferralProfile {
  userId: string;
  referralCode: string;
  referralLink: string;
  totalReferees: number;
  completedPurchases: number;
  totalBonusPointsEarned: number;
  totalWalletBonusINR: number;
  referees: ReferralReferee[];
}

// 5. NLP Reviews & Ratings
export type SentimentPolarity = 'positive' | 'neutral' | 'negative';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  sentiment: {
    polarity: SentimentPolarity;
    score: number; // -1.0 to +1.0
    confidence: number; // 0-1
    prosExtracted: string[];
    consExtracted: string[];
    keyPhraseMatches: string[];
  };
  helpfulCount: number;
}

export interface ProductNLPSummary {
  productId: string;
  totalReviews: number;
  averageRating: number;
  sentimentDistribution: {
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  topExtractedPros: { tag: string; count: number; mentionPct: number }[];
  topExtractedCons: { tag: string; count: number; mentionPct: number }[];
  editorialSummary: string;
  nlpExecutiveSummary?: string;
  featuredThemes: string[];
}

// 7. Price History & Intelligence
export type PriceHistorySource = 
  | 'catalog_launch' 
  | 'regular_adjustment' 
  | 'flash_deal' 
  | 'festival_sale' 
  | 'competitor_match' 
  | 'price_drop' 
  | 'seasonal_discount' 
  | 'admin_override';

export interface PriceHistoryRecord {
  id: string;
  productId: string;
  priceINR: number;
  priceUSD: number;
  originalPriceINR?: number;
  timestamp: string; // ISO format
  dateLabel: string; // e.g. "Jan 10", "Feb 02"
  source: PriceHistorySource;
  eventDescription?: string;
  isLowest?: boolean;
  isHighest?: boolean;
}

export interface PriceAnalytics {
  productId: string;
  productTitle: string;
  currentPriceINR: number;
  currentPriceUSD: number;
  lowestPriceINR: number;
  lowestPriceUSD: number;
  lowestPriceDate: string;
  highestPriceINR: number;
  highestPriceUSD: number;
  highestPriceDate: string;
  averagePriceINR: number;
  averagePriceUSD: number;
  priceChange30DaysPct: number;
  priceChange90DaysPct: number;
  priceDropTodayPct?: number;
  isBelow90DayAverage: boolean;
  pctDifferenceFromAverage: number; // positive or negative
  dealVerdict: 'great_deal' | 'good_price' | 'fair_price' | 'above_average';
  verdictText: string;
  totalDataPoints: number;
  history: PriceHistoryRecord[];
}

// 8. Price & Stock Alerts
export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  currentPriceINR: number;
  targetPriceINR: number;
  status: 'active' | 'triggered' | 'dismissed';
  createdAt: string;
  triggeredAt?: string;
}

export interface BackInStockAlert {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  status: 'waiting' | 'notified' | 'dismissed';
  createdAt: string;
  notifiedAt?: string;
}

export type StockAlert = BackInStockAlert;
export type ReferralProfile = UserReferralProfile;

// 10. Admin Unified KPIs
export interface AdminDashboardMetrics {
  totalRevenueINR: number;
  totalRevenueUSD: number;
  totalOrders: number;
  averageOrderValueINR: number;
  conversionRatePct: number;
  recsysClickThroughRatePct: number;
  walletDepositVolumeINR: number;
  walletBalanceOutstandingINR: number;
  loyaltyPointsIssued: number;
  loyaltyPointsRedeemed: number;
  activeUsersCount: number;
  mlModelInferenceLatencyP95Ms: number;
  activeVariantConversionUpliftPct: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  thinkingProcess?: string;
  extractedIntent?: StructuredIntent;
  groundingSources?: { title: string; url: string; snippet?: string }[];
  recommendedProductIds?: string[];
  mode?: 'thinking' | 'search_grounded' | 'standard';
}

// ==========================================
// 11. Customer Support, Help Center & Return/Replace Types
// ==========================================
export type ReturnReasonCategory = 
  | 'defective_damaged'
  | 'size_fit_issue'
  | 'wrong_item_received'
  | 'missing_accessories'
  | 'performance_not_as_expected'
  | 'found_better_price'
  | 'no_longer_needed';

export type ReturnResolutionType = 
  | 'refund_wallet'
  | 'refund_original'
  | 'replace_same_item'
  | 'exchange_variant';

export type ReturnStatus = 
  | 'requested'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'inspection_passed'
  | 'refund_processed'
  | 'replacement_shipped'
  | 'completed'
  | 'cancelled';

export interface ReturnTrackingStep {
  step: ReturnStatus;
  label: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
  notes?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  item: OrderItem;
  resolution: ReturnResolutionType;
  reasonCategory: ReturnReasonCategory;
  reasonText: string;
  comments?: string;
  refundAmountINR: number;
  refundAmountUSD: number;
  pickupDate: string;
  pickupSlot: 'morning_9_to_1' | 'afternoon_2_to_6' | 'evening_6_to_9';
  pickupAddress: string;
  status: ReturnStatus;
  trackingTimeline: ReturnTrackingStep[];
  createdAt: string;
  updatedAt: string;
  replacementOrderId?: string;
  walletRefundId?: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: 'orders' | 'returns_refunds' | 'shipping_delivery' | 'wallet_payments' | 'rewards_loyalty' | 'account_security';
  categoryLabel: string;
  summary: string;
  content: string;
  keywords: string[];
  helpfulCount: number;
  views: number;
  featured?: boolean;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'support_agent' | 'automated_assistant';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  orderId?: string;
  category: 'return_replacement' | 'order_tracking' | 'payment_refund' | 'product_inquiry' | 'general';
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved';
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ==========================================
// 12. ML Intelligence: Offers, Segments, Demand & Price Forecasting
// ==========================================
export interface MLOfferPrediction {
  offerId: string;
  offerName: string;
  offerType: 'discount_10' | 'free_shipping' | 'coupon_500' | 'cashback_15' | 'points_2x';
  description: string;
  conversionProbabilityPct: number; // e.g. 68%
  expectedRevenueINR: number;
  expectedAOV_INR: number;
  featuresEvaluated: {
    name: string;
    value: string | number;
    weightPct: number;
    impact: 'positive' | 'neutral' | 'negative';
  }[];
  isBestOffer: boolean;
  badge: string;
}

export interface CustomerSegmentCluster {
  segmentId: 'budget_shopper' | 'premium_customer' | 'frequent_buyer' | 'window_shopper' | 'deal_seeker' | 'inactive_churn_risk';
  name: string;
  icon: string;
  color: string;
  description: string;
  clusterMatchScore: number; // 0-1
  rfmScores: {
    recency: number; // 1-5
    frequency: number; // 1-5
    monetary: number; // 1-5
  };
  features: {
    averageOrderValueINR: number;
    priceSensitivity: 'High' | 'Medium' | 'Low';
    couponUsageRate: string;
    categoryAffinities: string[];
    cartAbandonmentRate: string;
  };
  recommendedStrategy: string;
  optimalDiscountRange: string;
}

export interface SegmentCustomCoupon {
  id: string;
  segmentId: 'budget_shopper' | 'premium_customer' | 'frequent_buyer' | 'window_shopper' | 'deal_seeker' | 'inactive_churn_risk';
  segmentName: string;
  coupon: Coupon;
  targetUpliftPct: number;
  projectedRevenueINR: number;
  activeStatus: boolean;
  createdAt: string;
  redeemedCount: number;
}

export interface PersonaSegmentMapping {
  personaId: string;
  personaName: string;
  personaRole: string;
  personaAvatar: string;
  assignedSegmentId: 'budget_shopper' | 'premium_customer' | 'frequent_buyer' | 'window_shopper' | 'deal_seeker' | 'inactive_churn_risk';
  confidenceScore: number;
  rfm: { recencyDays: number; orderCount: number; lifetimeSpendINR: number };
  dominantCategory: string;
  lastActiveDate: string;
  activeCouponsAvailable: number;
}

export interface DemandInventoryForecast {
  productId: string;
  productTitle: string;
  category: string;
  currentStock: number;
  dailyVelocity7d: number;
  dailyVelocity30d: number;
  predictedDemandNext7d: number;
  estimatedDaysToStockout: number;
  selloutRiskLevel: 'critical_sellout_imminent' | 'high_velocity' | 'moderate' | 'healthy_inventory';
  alertBannerText: string;
  recommendRestockUnits: number;
  seasonalityMultiplier: number;
}

export interface PriceTrendForecast {
  productId: string;
  currentPriceINR: number;
  predictedTrend: 'decreasing' | 'increasing' | 'stable';
  probabilityPct: number; // e.g. 72%
  horizonDays: number; // e.g. 7 days
  expectedDeltaPct: number; // e.g. -8.5%
  confidenceScore: number; // 0-1
  forecastExplanation: string;
  modelType: 'ARIMA_LSTM_Ensemble' | 'Prophet_XGBoost_Hybrid';
}

export interface AspectSentimentScore {
  aspect: string; // e.g. 'Battery Life', 'Thermals / Heating', 'Display', 'Build Quality', 'Performance', 'Value for Money'
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  sentiment: 'positive' | 'negative' | 'mixed';
  mentionCount: number;
  sampleQuotes: string[];
}

// ==========================================
// 🏆 FAANG FLAGSHIP EXTENSIONS
// ==========================================

export interface Seller {
  id: string;
  name: string;
  rating: number; // 1-5
  reviewCount: number;
  fulfillmentType: 'PRIME_EXPRESS' | 'MERCHANT_STANDARD' | 'SAME_DAY_LOCAL';
  badges: string[];
  dispatchTimeHours: number;
  sellerCity: string;
  positiveFeedbackPct: number;
}

export interface BuyBoxListing {
  seller: Seller;
  priceINR: number;
  priceUSD: number;
  originalPriceINR: number;
  shippingCostINR: number;
  inStock: boolean;
  stockCount: number;
  deliveryDays: number;
  buyBoxScore: number;
  isWinner: boolean;
  repricerStrategy: 'MATCH_LOWEST' | 'UNDERCUT_50' | 'MAX_MARGIN' | 'STATIC';
}

export interface BuyBoxResult {
  productId: string;
  productTitle: string;
  winner: BuyBoxListing;
  competingListings: BuyBoxListing[];
  totalSellersCount: number;
  priceSpreadINR: number;
  lastRepricedAt: string;
}

export interface BanditArm {
  id: string;
  name: string;
  category: string;
  alpha: number; // successes + 1
  beta: number;  // failures + 1
  pulls: number;
  rewards: number;
  estimatedCtr: number;
  variance: number;
  lastSampledValue?: number;
}

export interface BanditTelemetry {
  totalRounds: number;
  cumulativeReward: number;
  cumulativeRegret: number;
  explorationRate: number; // 0.0 - 1.0
  arms: BanditArm[];
  regretHistory: { round: number; cumulativeRegret: number; empiricalCtr: number }[];
}

export interface BenchmarkConfig {
  concurrency: number;
  totalRequests: number;
  cacheEnabled: boolean;
  diversityEnabled: boolean;
}

export interface BenchmarkStageMetric {
  stageName: string;
  latencyMs: number;
  pctOfTotal: number;
  p99Ms: number;
  itemCount: number;
}

export interface BenchmarkReport {
  timestamp: string;
  config: BenchmarkConfig;
  totalDurationMs: number;
  throughputQps: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  p99Ms: number;
  minMs: number;
  maxMs: number;
  cacheHitRatePct: number;
  stages: BenchmarkStageMetric[];
  latencyHistogram: { bin: string; count: number }[];
  cpuUsagePct: number;
  memoryHeapMb: number;
}

export interface ProductBundle {
  id: string;
  primaryProduct: Product;
  bundleProducts: Product[];
  totalOriginalPriceINR: number;
  bundlePriceINR: number;
  savingsINR: number;
  savingsPct: number;
  coPurchaseConfidence: number; // 0 - 1.0
  bundleTag: string;
}

export interface ProjectedEmbeddingPoint {
  id: string;
  title: string;
  category: string;
  brand: string;
  priceINR: number;
  rating: number;
  x: number; // PCA/t-SNE 2D projected x (-100 to 100)
  y: number; // PCA/t-SNE 2D projected y (-100 to 100)
  imageUrl: string;
  cosineSimilarityToUser?: number;
}

