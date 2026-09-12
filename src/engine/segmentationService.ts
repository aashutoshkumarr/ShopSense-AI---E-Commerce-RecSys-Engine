import { 
  CustomerSegmentCluster, 
  SegmentCustomCoupon, 
  PersonaSegmentMapping, 
  Coupon, 
  UserPersona,
  UserEvent 
} from '../types';
import { mockPersonas } from '../data/personas';
import { ALL_COUPONS } from './couponService';
import { CUSTOMER_SEGMENT_CLUSTERS } from './mlIntelligenceService';

// In-memory Segment-Targeted Custom Coupons Store
let segmentCustomCoupons: SegmentCustomCoupon[] = [
  {
    id: 'seg-coup-01',
    segmentId: 'budget_shopper',
    segmentName: 'Budget Shopper',
    coupon: {
      code: 'BUDGETSAVER20',
      title: '20% Flat Discount on Essential Accessories',
      description: 'Exclusive savings on audio, cables, chargers, and keyboards over ₹1,999.',
      discountType: 'percentage',
      discountValue: 20,
      minOrderINR: 1999,
      applicableCategories: ['Accessories', 'Audio', 'Smart Home'],
      expiresAt: '2026-12-31T23:59:59Z',
      usageCount: 540,
      badge: 'Segment Tailored'
    },
    targetUpliftPct: 41.2,
    projectedRevenueINR: 385000,
    activeStatus: true,
    createdAt: '2026-08-15T10:00:00Z',
    redeemedCount: 142
  },
  {
    id: 'seg-coup-02',
    segmentId: 'premium_customer',
    segmentName: 'Premium Customer',
    coupon: {
      code: 'FLAGSHIPVIP5K',
      title: '₹5,000 Instant Concierge Credit + Priority Dispatch',
      description: 'VIP discount on M3 Max Workstations, 5K Retina Displays, and HD 800 S headphones over ₹80,000.',
      discountType: 'flat_inr',
      discountValue: 5000,
      minOrderINR: 80000,
      applicableCategories: ['Laptops', 'Audio', 'Accessories'],
      expiresAt: '2026-12-31T23:59:59Z',
      usageCount: 190,
      badge: 'VIP Elite',
      targetTier: 'Platinum'
    },
    targetUpliftPct: 29.5,
    projectedRevenueINR: 1450000,
    activeStatus: true,
    createdAt: '2026-08-16T12:30:00Z',
    redeemedCount: 38
  },
  {
    id: 'seg-coup-03',
    segmentId: 'window_shopper',
    segmentName: 'Window Shopper',
    coupon: {
      code: 'CARTRECOVERY15',
      title: 'Free Express Air Delivery + 15% First-Cart Voucher',
      description: 'Zero shipping fee + 15% off instant unlock to eliminate checkout hesitation.',
      discountType: 'free_shipping',
      discountValue: 150,
      minOrderINR: 0,
      expiresAt: '2026-12-31T23:59:59Z',
      usageCount: 810,
      badge: 'Abandonment Shield'
    },
    targetUpliftPct: 56.4,
    projectedRevenueINR: 620000,
    activeStatus: true,
    createdAt: '2026-08-17T09:15:00Z',
    redeemedCount: 215
  },
  {
    id: 'seg-coup-04',
    segmentId: 'deal_seeker',
    segmentName: 'Deal Seeker',
    coupon: {
      code: 'FLASHTECH25',
      title: '25% Lightning Rebate on High-Demand Tech',
      description: 'Engineered for price-sensitive techies converting during inventory flash moments.',
      discountType: 'percentage',
      discountValue: 25,
      minOrderINR: 5000,
      applicableCategories: ['Gaming', 'Accessories', 'Smartphones'],
      expiresAt: '2026-12-31T23:59:59Z',
      usageCount: 680,
      badge: 'Flash Drop'
    },
    targetUpliftPct: 48.0,
    projectedRevenueINR: 540000,
    activeStatus: true,
    createdAt: '2026-08-18T14:00:00Z',
    redeemedCount: 168
  }
];

// Helper to calculate RFM and map personas to K-Means clusters
export function getPersonaClusterMappings(events: UserEvent[] = []): PersonaSegmentMapping[] {
  return mockPersonas.map(persona => {
    // Determine dynamic RFM from persona metadata and event stream
    const userEvents = events.filter(e => e.userId === persona.id);
    const hasPurchases = userEvents.some(e => e.eventType === 'purchase');
    
    let assignedSegmentId: CustomerSegmentCluster['segmentId'] = 'frequent_buyer';
    let confidenceScore = 0.88;
    let recencyDays = 2;
    let orderCount = 4;
    let lifetimeSpendINR = 68000;

    if (persona.id === 'user-budget-sneha') {
      assignedSegmentId = 'budget_shopper';
      confidenceScore = 0.94;
      recencyDays = 3;
      orderCount = 3;
      lifetimeSpendINR = 18500;
    } else if (persona.id === 'user-dev-alex') {
      assignedSegmentId = 'premium_customer';
      confidenceScore = 0.92;
      recencyDays = 1;
      orderCount = 6;
      lifetimeSpendINR = 245000;
    } else if (persona.id === 'user-audio-priya') {
      assignedSegmentId = 'premium_customer';
      confidenceScore = 0.91;
      recencyDays = 2;
      orderCount = 5;
      lifetimeSpendINR = 189000;
    } else if (persona.id === 'user-gamer-kabir') {
      assignedSegmentId = 'deal_seeker';
      confidenceScore = 0.89;
      recencyDays = 1;
      orderCount = 7;
      lifetimeSpendINR = 135000;
    } else if (persona.id === 'user-student-riya') {
      assignedSegmentId = 'window_shopper';
      confidenceScore = 0.86;
      recencyDays = 4;
      orderCount = 1;
      lifetimeSpendINR = 4500;
    } else if (persona.id === 'user-smarthome-rohit') {
      assignedSegmentId = 'frequent_buyer';
      confidenceScore = 0.87;
      recencyDays = 2;
      orderCount = 5;
      lifetimeSpendINR = 82000;
    }

    // Available coupons matching this persona's segment
    const matchedCouponsCount = segmentCustomCoupons.filter(
      sc => sc.segmentId === assignedSegmentId && sc.activeStatus
    ).length;

    return {
      personaId: persona.id,
      personaName: persona.name,
      personaRole: persona.role,
      personaAvatar: persona.avatar,
      assignedSegmentId,
      confidenceScore,
      rfm: {
        recencyDays,
        orderCount: orderCount + (hasPurchases ? 1 : 0),
        lifetimeSpendINR
      },
      dominantCategory: persona.preferredCategories[0] || 'Electronics',
      lastActiveDate: new Date(Date.now() - recencyDays * 86400000).toISOString().split('T')[0],
      activeCouponsAvailable: matchedCouponsCount + 2
    };
  });
}

export function getAllSegmentClusters(): CustomerSegmentCluster[] {
  return CUSTOMER_SEGMENT_CLUSTERS;
}

export function getAllSegmentCoupons(): SegmentCustomCoupon[] {
  return segmentCustomCoupons;
}

export function createOrUpdateSegmentCoupon(
  segmentId: CustomerSegmentCluster['segmentId'],
  couponData: Partial<Coupon>,
  targetUpliftPct: number = 35,
  projectedRevenueINR: number = 450000
): SegmentCustomCoupon {
  const segment = CUSTOMER_SEGMENT_CLUSTERS.find(s => s.segmentId === segmentId);
  const segmentName = segment?.name || 'Target Segment';
  const code = (couponData.code || `SEG-${Date.now().toString(36)}`).toUpperCase();

  const newCoupon: Coupon = {
    code,
    title: couponData.title || `${segmentName} Personalized Reward`,
    description: couponData.description || `Special incentive for ${segmentName} members.`,
    discountType: couponData.discountType || 'percentage',
    discountValue: Number(couponData.discountValue) || 15,
    minOrderINR: Number(couponData.minOrderINR) || 2000,
    applicableCategories: couponData.applicableCategories || ['Laptops', 'Audio', 'Accessories'],
    expiresAt: couponData.expiresAt || new Date(Date.now() + 90 * 86400000).toISOString(),
    usageCount: 0,
    badge: couponData.badge || 'Segment Tailored',
    targetTier: couponData.targetTier
  };

  // Add to global coupon store if not exists
  const existingIdx = ALL_COUPONS.findIndex(c => c.code.toUpperCase() === code);
  if (existingIdx >= 0) {
    ALL_COUPONS[existingIdx] = newCoupon;
  } else {
    ALL_COUPONS.unshift(newCoupon);
  }

  const segmentCoupon: SegmentCustomCoupon = {
    id: `seg-coup-${Date.now()}`,
    segmentId,
    segmentName,
    coupon: newCoupon,
    targetUpliftPct: Number(targetUpliftPct) || 35,
    projectedRevenueINR: Number(projectedRevenueINR) || 450000,
    activeStatus: true,
    createdAt: new Date().toISOString(),
    redeemedCount: 0
  };

  segmentCustomCoupons.unshift(segmentCoupon);
  return segmentCoupon;
}

export function toggleSegmentCouponStatus(id: string): SegmentCustomCoupon | null {
  const found = segmentCustomCoupons.find(s => s.id === id);
  if (found) {
    found.activeStatus = !found.activeStatus;
    return found;
  }
  return null;
}

export function deleteSegmentCoupon(id: string): boolean {
  const initialLen = segmentCustomCoupons.length;
  segmentCustomCoupons = segmentCustomCoupons.filter(s => s.id !== id);
  return segmentCustomCoupons.length < initialLen;
}
