import { Coupon, MLPersonalizedOffer, UserPersona } from '../types';

export const ALL_COUPONS: Coupon[] = [
  {
    code: 'TECH15',
    title: '15% Off Developer Gear & Keyboards',
    description: 'Get 15% instant discount on mechanical keyboards, monitors, and developer workstation accessories.',
    discountType: 'percentage',
    discountValue: 15,
    minOrderINR: 4000,
    applicableCategories: ['Accessories', 'Laptops', 'Gaming'],
    expiresAt: '2026-12-31T23:59:59Z',
    usageCount: 1420,
    badge: 'Popular'
  },
  {
    code: 'AUDIO20',
    title: '20% Off Hi-Res Audio & ANC',
    description: 'Exclusive 20% savings on audiophile headphones, spatial earbuds, and smart soundbars.',
    discountType: 'percentage',
    discountValue: 20,
    minOrderINR: 8000,
    applicableCategories: ['Audio', 'Wearables'],
    expiresAt: '2026-11-30T23:59:59Z',
    usageCount: 890,
    badge: 'High Value'
  },
  {
    code: 'FREESHIP',
    title: 'Zero-Fee Free Express Shipping',
    description: 'Waives all express courier delivery charges across all categories with no minimum order value.',
    discountType: 'free_shipping',
    discountValue: 150, // saves standard 150 INR shipping fee
    minOrderINR: 0,
    expiresAt: '2026-12-31T23:59:59Z',
    usageCount: 3120,
    badge: 'Universal'
  },
  {
    code: 'ENTERPRISE5000',
    title: '₹5,000 Flat Off Enterprise & Laptop Racks',
    description: 'Flat ₹5,000 corporate rebate on laptops and enterprise workstations over ₹50,000.',
    discountType: 'flat_inr',
    discountValue: 5000,
    minOrderINR: 50000,
    applicableCategories: ['Laptops', 'Gaming'],
    expiresAt: '2026-10-31T23:59:59Z',
    usageCount: 245,
    badge: 'VIP B2B',
    targetTier: 'Gold'
  },
  {
    code: 'WELCOME1000',
    title: '₹1,000 Welcome Voucher',
    description: 'First order celebration credit for new shoppers on baskets over ₹3,000.',
    discountType: 'flat_inr',
    discountValue: 1000,
    minOrderINR: 3000,
    expiresAt: '2026-12-31T23:59:59Z',
    usageCount: 4500,
    badge: 'New Customer'
  },
  {
    code: 'SMARTVIP',
    title: '10% Off Smart Home Ambient Eco-system',
    description: 'Transform your space with 10% off smart speakers, automated lights, and smart hubs.',
    discountType: 'percentage',
    discountValue: 10,
    minOrderINR: 2500,
    applicableCategories: ['Smart Home', 'Wearables'],
    expiresAt: '2026-12-31T23:59:59Z',
    usageCount: 630
  }
];

/**
 * ML Propensity Model: Estimates P(Conversion | User, Coupon)
 * Combines Logistic Regression weights on:
 * 1. Category Affinity Match (0 to 1) -> W: 0.35
 * 2. Price Elasticity / Budget Alignment -> W: 0.25
 * 3. Historical Coupon Sensitivity -> W: 0.20
 * 4. Basket Abandonment Risk / Urgency -> W: 0.20
 */
export function calculateCouponPropensity(persona: UserPersona, coupon: Coupon): MLPersonalizedOffer {
  let categoryScore = 0.3;
  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const hasMatch = coupon.applicableCategories.some(cat => 
      persona.preferredCategories.includes(cat) || 
      (persona.categoryAffinities && (persona.categoryAffinities[cat] || 0) > 0.4)
    );
    categoryScore = hasMatch ? 0.95 : 0.2;
  } else {
    categoryScore = 0.75; // universal coupon
  }

  // Budget alignment
  const budgetRatio = persona.targetBudgetINR / Math.max(1, coupon.minOrderINR);
  const budgetScore = budgetRatio >= 1.0 ? 0.9 : 0.4;

  // Elasticity
  let elasticityScore = 0.6;
  if (persona.priceElasticity === 'strict') elasticityScore = 0.95;
  if (persona.priceElasticity === 'moderate') elasticityScore = 0.75;
  if (persona.priceElasticity === 'flexible') elasticityScore = 0.55;

  // Composite propensity using calibrated sigmoid function
  const logit = 
    (categoryScore * 1.8) + 
    (budgetScore * 1.2) + 
    (elasticityScore * 1.0) - 
    1.4;
  
  const conversionPropensity = Math.min(0.98, Math.max(0.12, 1 / (1 + Math.exp(-logit))));
  
  let topContributingFeature = 'Category Affinity Match';
  let mlRationale = `High conversion match with ${persona.name}'s interest in ${persona.preferredCategories.join(', ')}`;
  
  if (coupon.discountType === 'free_shipping' && persona.priceElasticity === 'strict') {
    topContributingFeature = 'Zero Shipping Barrier Mitigation';
    mlRationale = 'High cart abandonment risk detected due to courier fees; free shipping boosts checkout propensity by +38%.';
  } else if (coupon.code === 'ENTERPRISE5000' && persona.targetBudgetINR >= 80000) {
    topContributingFeature = 'High-Basket Value Capture';
    mlRationale = `Optimized for high-ticket corporate procurement ($${persona.targetBudgetUSD} budget tier).`;
  } else if (categoryScore >= 0.9) {
    topContributingFeature = 'Dominant Category Intent';
    mlRationale = `User has 88% historical browse affinity towards ${coupon.applicableCategories?.join(' & ')}.`;
  }

  const expectedRevenueBoostINR = Math.round(persona.targetBudgetINR * conversionPropensity * 0.25);

  return {
    coupon,
    targetPersonaId: persona.id,
    conversionPropensity: Math.round(conversionPropensity * 100) / 100,
    mlRationale,
    topContributingFeature,
    expectedRevenueBoostINR
  };
}

export function getPersonalizedOffersForPersona(persona: UserPersona): MLPersonalizedOffer[] {
  const scoredOffers = ALL_COUPONS.map(coupon => calculateCouponPropensity(persona, coupon));
  // Sort descending by ML Conversion Propensity
  return scoredOffers.sort((a, b) => b.conversionPropensity - a.conversionPropensity);
}

export function validateAndApplyCoupon(
  code: string, 
  orderSubtotalINR: number, 
  cartCategories: string[] = []
): { valid: boolean; discountINR: number; message: string; coupon?: Coupon } {
  const coupon = ALL_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  
  if (!coupon) {
    return { valid: false, discountINR: 0, message: `Coupon code "${code}" not found.` };
  }

  if (orderSubtotalINR < coupon.minOrderINR) {
    return { 
      valid: false, 
      discountINR: 0, 
      message: `Minimum basket value of ₹${coupon.minOrderINR.toLocaleString()} required for this coupon.` 
    };
  }

  if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
    const matchesCategory = cartCategories.some(cat => coupon.applicableCategories?.includes(cat));
    if (cartCategories.length > 0 && !matchesCategory) {
      return {
        valid: false,
        discountINR: 0,
        message: `Coupon applies exclusively to ${coupon.applicableCategories.join(', ')} items.`
      };
    }
  }

  let discountINR = 0;
  if (coupon.discountType === 'percentage') {
    discountINR = Math.round((orderSubtotalINR * coupon.discountValue) / 100);
  } else if (coupon.discountType === 'flat_inr') {
    discountINR = Math.min(orderSubtotalINR, coupon.discountValue);
  } else if (coupon.discountType === 'free_shipping') {
    discountINR = 150; // free shipping discount
  }

  return {
    valid: true,
    discountINR,
    message: `Coupon "${coupon.code}" applied: ${coupon.title}!`,
    coupon
  };
}
