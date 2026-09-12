import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recommendationEngineInstance, defaultPipelineConfig, RecommendationEngine } from '../src/engine/recommendationEngine';
import { mockPersonas } from '../src/data/personas';
import { mockProducts } from '../src/data/products';
import { getWallet, topUpWallet, deductWallet, refundToWallet } from '../src/engine/walletService';
import { getLoyaltyAccount, awardLoyaltyPoints, redeemLoyaltyPoints, LOYALTY_TIERS } from '../src/engine/loyaltyService';
import { validateAndApplyCoupon, calculateCouponPropensity, getPersonalizedOffersForPersona, ALL_COUPONS } from '../src/engine/couponService';
import { getUserCustomerSegment, predictPersonalizedOffers } from '../src/engine/mlIntelligenceService';
import { getProductReviews, getProductNLPSummary } from '../src/engine/reviewNLPService';
import { parseNaturalLanguageIntent, generateRecommendationExplanation, generateConciergeDialogue } from '../src/engine/semanticIntentService';

describe('ShopSense RecSys & Recommendation Pipeline Suite', () => {
  const alex = mockPersonas[0]; // Alex Kumar - Software Engineer

  it('should execute multi-stage recommendation pipeline and return ranked candidates', () => {
    const result = recommendationEngineInstance.executePipeline(alex, [], null, true);

    assert.ok(result, 'Pipeline result must exist');
    assert.ok(Array.isArray(result.topKResults), 'Candidates must be an array');
    assert.ok(result.topKResults.length > 0, 'Candidates array must not be empty');
    assert.ok(result.stages.length > 0, 'Stages must be recorded');
    assert.ok(result.totalLatencyMs >= 0, 'Total latency must be non-negative');
    assert.ok(result.mergedCount > 0, 'Merged count must be greater than zero');
  });

  it('should compute valid feature attributions summing to ~100%', () => {
    const result = recommendationEngineInstance.executePipeline(alex, [], null, true);
    const topCandidate = result.topKResults[0];

    assert.ok(topCandidate.featureAttributions, 'Top candidate must have feature attributions');
    assert.ok(topCandidate.featureAttributions.length > 0, 'Feature attributions must have entries');
    const totalPercentage = topCandidate.featureAttributions.reduce((acc, curr) => acc + curr.percentage, 0);
    assert.ok(totalPercentage >= 98 && totalPercentage <= 102, `Attributions should normalize to ~100% (was ${totalPercentage}%)`);
  });

  it('should respect MMR diversity constraints and limit category domination', () => {
    const customConfig = { ...defaultPipelineConfig, topK: 8, businessRules: { ...defaultPipelineConfig.businessRules, maxPerCategory: 3, diversityFactorMMR: 0.6 } };
    const engine = new RecommendationEngine(mockProducts, customConfig);
    const result = engine.executePipeline(alex, [], null, true);

    const categoryCounts: Record<string, number> = {};
    for (const cand of result.topKResults) {
      categoryCounts[cand.product.category] = (categoryCounts[cand.product.category] || 0) + 1;
    }

    for (const [cat, count] of Object.entries(categoryCounts)) {
      assert.ok(count <= 3, `Category ${cat} exceeded maxPerCategory quota of 3 (was ${count})`);
    }
  });

  it('should parse structured intent and boost relevant category candidates', () => {
    const intent = {
      rawQuery: 'mechanical keyboard with tactile switches under 15000',
      category: 'Accessories' as const,
      targetBudgetINR: 15000,
      brandPreferences: ['Keychron', 'Logitech'],
      requiredFeatures: ['mechanical', 'wireless'],
      confidenceScore: 0.95
    };

    const result = recommendationEngineInstance.executePipeline(alex, [], intent, true);
    const topCandidate = result.topKResults[0];
    assert.ok(topCandidate, 'Should return candidate matching intent');
    assert.strictEqual(topCandidate.product.category, 'Accessories', 'Top candidate should match requested category');
  });
});

describe('Customer Behavioral RFM Segmentation & Targeting Suite', () => {
  const alex = mockPersonas[0];

  it('should compute valid customer segment clusters and assign personas accurately', () => {
    const segmentAlex = getUserCustomerSegment(alex);
    assert.ok(segmentAlex, 'Alex segment must exist');
    assert.ok(segmentAlex.segmentId, 'Segment ID must be defined');
    assert.ok(segmentAlex.rfmScores, 'RFM composite scores must be present');
    assert.ok(segmentAlex.recommendedStrategy, 'Recommended strategy must be suggested');
  });

  it('should predict targeted personalized offers based on cluster profile', () => {
    const mlOffers = predictPersonalizedOffers(alex);
    assert.ok(mlOffers, 'Offer predictions must exist');
    assert.ok(Array.isArray(mlOffers.predictions), 'Predictions must be an array');
    assert.ok(mlOffers.predictions.length > 0, 'At least one prediction must be returned');
    assert.ok(mlOffers.selectedBestOffer, 'A selected best offer must be identified');
    assert.ok(mlOffers.selectedBestOffer.conversionProbabilityPct >= 0, 'Conversion probability must be non-negative');

    const personaOffers = getPersonalizedOffersForPersona(alex);
    assert.ok(Array.isArray(personaOffers), 'Persona offers must be an array');
    assert.ok(personaOffers.length > 0, 'Offers must be generated');
    assert.ok(personaOffers[0].coupon, 'Offer must contain a valid coupon');
    assert.ok(personaOffers[0].conversionPropensity >= 0 && personaOffers[0].conversionPropensity <= 1, 'Propensity must be normalized');
  });
});

describe('Fintech Wallet & Double-Entry Ledger Suite', () => {
  const testUser = `user-test-${Date.now()}`;

  it('should maintain atomic wallet top-up and balance integrity', () => {
    const initialWallet = getWallet(testUser);
    const initialBalance = initialWallet.balanceINR;
    const topUpAmount = 2500;

    const result = topUpWallet(testUser, topUpAmount, 'Razorpay Sandbox', 'pay_test_topup_1');
    assert.strictEqual(result.success, true, 'Top up should succeed');
    assert.strictEqual(result.wallet.balanceINR, initialBalance + topUpAmount, 'Balance must increase by exact top-up amount');
    assert.strictEqual(result.transaction.type, 'topup', 'Transaction type must be recorded as topup');
  });

  it('should properly deduct funds when sufficient balance is present', () => {
    const wallet = getWallet(testUser);
    const balBefore = wallet.balanceINR;
    const deductAmt = 1000;

    const deductRes = deductWallet(testUser, deductAmt, 'ord-test-01', 'Test purchase deduction');
    assert.strictEqual(deductRes.success, true, 'Deduction should succeed with sufficient balance');
    assert.strictEqual(deductRes.amountDeductedINR, deductAmt, 'Deducted amount must equal requested amount');
    assert.strictEqual(deductRes.remainingOrderINR, 0, 'Remaining order balance should be zero');
    assert.strictEqual(deductRes.wallet.balanceINR, balBefore - deductAmt, 'Balance must decrease by exact deduction amount');
  });

  it('should support partial deduction when requested amount exceeds available balance', () => {
    const wallet = getWallet(testUser);
    const currentBalance = wallet.balanceINR;
    const overdraftAmount = currentBalance + 5000;

    const partialRes = deductWallet(testUser, overdraftAmount, 'ord-test-partial', 'Attempted partial deduction');
    assert.strictEqual(partialRes.success, true, 'Deduction succeeds partially');
    assert.strictEqual(partialRes.amountDeductedINR, currentBalance, 'Deducts all available funds');
    assert.strictEqual(partialRes.remainingOrderINR, 5000, 'Remaining balance is accurately calculated');
    assert.strictEqual(partialRes.wallet.balanceINR, 0, 'Wallet balance is now zero');

    // Attempting further deduction on zero balance fails
    const zeroRes = deductWallet(testUser, 100, 'ord-test-zero', 'Zero balance attempt');
    assert.strictEqual(zeroRes.success, false, 'Deduction on empty wallet returns false');
  });

  it('should process instant refund with accurate ledger attribution', () => {
    const wallet = getWallet(testUser);
    const balBefore = wallet.balanceINR;
    const refundAmt = 500;

    const refunded = refundToWallet(testUser, refundAmt, 'ret-test-01', 'Verified doorstep return refund');
    assert.strictEqual(refunded.success, true, 'Refund should succeed');
    assert.strictEqual(refunded.wallet.balanceINR, balBefore + refundAmt, 'Refund must credit balance accurately');
    assert.strictEqual(refunded.transaction.type, 'refund', 'Transaction must record refund type');
  });
});

describe('Loyalty Tier Points & Promotion Engine Suite', () => {
  const loyaltyUser = `user-loyalty-${Date.now()}`;

  it('should award loyalty points and upgrade tiers correctly', () => {
    const account = getLoyaltyAccount(loyaltyUser);
    assert.strictEqual(account.currentTier, 'Bronze', 'New account starts at Bronze');

    const updated = awardLoyaltyPoints(loyaltyUser, 'purchase', 400, 'Big tech order points');
    // Account starts with 120 initial welcome points + 400 = 520 points (>= 500 points for Silver)
    assert.strictEqual(updated.newTier, 'Silver', 'Tier must promote to Silver upon crossing 500 points');
    assert.strictEqual(updated.account.currentTier, 'Silver', 'Account tier must update to Silver');
    assert.strictEqual(updated.pointsAwarded, 400, 'Awarded points must match base points * multiplier');
  });

  it('should validate and calculate coupon discounts with order bounds', () => {
    const couponCode = 'TECH15';
    const orderValue = 5000;
    const result = validateAndApplyCoupon(couponCode, orderValue, ['Accessories']);

    assert.strictEqual(result.valid, true, 'Coupon must be valid for qualifying order');
    assert.strictEqual(result.discountINR, 750, '15% of 5000 should equal 750 discount');
    assert.strictEqual(result.coupon?.code, 'TECH15', 'Matched coupon code should be TECH15');
  });
});

describe('NLP Sentiment & Review Analysis Suite', () => {
  it('should synthesize aspect sentiments and extract pros and cons correctly', () => {
    const testProductId = 'prod-lap-01'; // ThinkPad T14s
    const summary = getProductNLPSummary(testProductId);

    assert.ok(summary, 'NLP summary must exist for catalog product');
    assert.ok(summary.totalReviews > 0, 'Product must have reviews');
    assert.ok(summary.editorialSummary, 'Editorial summary must be synthesized');
    assert.ok(summary.sentimentDistribution.positivePct >= 0, 'Positive sentiment percentage must be computed');
    assert.ok(Array.isArray(summary.topExtractedPros), 'Extracted pros must be an array');
    assert.ok(Array.isArray(summary.topExtractedCons), 'Extracted cons must be an array');
  });
});

describe('Semantic NLU Intent & Concierge Dialogue Suite', () => {
  const alex = mockPersonas[0];

  it('should parse natural language queries into structured intent parameters with accurate budget extraction', () => {
    const intent = parseNaturalLanguageIntent('mechanical keyboard with tactile switches under 15000');

    assert.strictEqual(intent.category, 'Accessories', 'Category should resolve to Accessories');
    assert.strictEqual(intent.targetBudgetINR, 15000, 'Budget should be extracted as 15000 INR');
    assert.ok(intent.requiredFeatures.includes('mechanical switches'), 'Features should include mechanical switches');
    assert.ok(intent.confidenceScore >= 0.8, 'Confidence score should be >= 0.8');
  });

  it('should extract lakh and k format budgets accurately from natural language', () => {
    const laptopIntent = parseNaturalLanguageIntent('developer laptop for coding under 1.5 lakh');
    assert.strictEqual(laptopIntent.category, 'Laptops', 'Category should resolve to Laptops');
    assert.strictEqual(laptopIntent.targetBudgetINR, 150000, '1.5 lakh should convert to 150000 INR');

    const audioIntent = parseNaturalLanguageIntent('wireless anc headphones under 25k');
    assert.strictEqual(audioIntent.category, 'Audio', 'Category should resolve to Audio');
    assert.strictEqual(audioIntent.targetBudgetINR, 25000, '25k should convert to 25000 INR');
  });

  it('should generate transparent grounded recommendation explanations', () => {
    const prod = mockProducts[0];
    const mockScoreData = {
      rank: 1,
      finalScore: 0.94,
      features: { semanticSimilarity: 0.92, userAffinity: 0.88 },
      groundedReason: { headline: 'High Developer Profile Match' }
    };

    const explanation = generateRecommendationExplanation(prod, alex, mockScoreData);
    assert.ok(explanation.includes('Ranked #1'), 'Explanation should state the rank');
    assert.ok(explanation.includes('High Developer Profile Match'), 'Explanation should include the grounded reason headline');
    assert.ok(explanation.includes('92%'), 'Explanation should include the semantic similarity attribution');
  });

  it('should generate contextual concierge responses with order, return, and comparison awareness', () => {
    const dialogue = generateConciergeDialogue({
      messages: [{ role: 'user', content: 'Compare ThinkPad vs MacBook' }],
      mode: 'thinking',
      user: alex,
      userOrders: [],
      userReturns: [],
      userWallet: { balanceINR: 8500, balanceUSD: 102, totalDepositedINR: 15000, totalSpentINR: 6500 },
      userLoyalty: { totalPoints: 850, currentTier: 'Silver' },
      catalog: mockProducts
    });

    assert.ok(dialogue.content.includes('ThinkPad T14s'), 'Dialogue should include ThinkPad comparison');
    assert.ok(dialogue.content.includes('MacBook Pro'), 'Dialogue should include MacBook comparison');
    assert.ok(dialogue.recommendedProductIds.length >= 2, 'Should recommend both compared product IDs');
    assert.ok(dialogue.thinkingProcess.length > 0, 'Should include reasoning process');
  });
});
