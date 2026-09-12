import { 
  UserLoyaltyAccount, 
  LoyaltyTierName, 
  LoyaltyTierConfig, 
  RewardTransaction 
} from '../types';

export const LOYALTY_TIERS: Record<LoyaltyTierName, LoyaltyTierConfig> = {
  Bronze: {
    tier: 'Bronze',
    minPoints: 0,
    pointsMultiplier: 1.0,
    freeShippingThresholdINR: 2000,
    discountPerkPct: 0,
    badgeColor: 'from-amber-700 to-amber-900',
    perks: ['Standard 1x Points Earning', 'Free Shipping over ₹2,000', 'Birthday Surprise Coupon']
  },
  Silver: {
    tier: 'Silver',
    minPoints: 500,
    pointsMultiplier: 1.2,
    freeShippingThresholdINR: 1200,
    discountPerkPct: 2,
    badgeColor: 'from-slate-400 to-slate-600',
    perks: ['1.2x Points Boost', 'Free Shipping over ₹1,200', '2% Cashback on Tech items', 'Early Sale Access (12 hrs)']
  },
  Gold: {
    tier: 'Gold',
    minPoints: 1500,
    pointsMultiplier: 1.5,
    freeShippingThresholdINR: 0,
    discountPerkPct: 5,
    badgeColor: 'from-amber-400 to-yellow-600',
    perks: ['1.5x Points Boost', 'Zero-Fee Free Express Shipping on ALL Orders', '5% VIP Instant Discount', 'Dedicated Concierge Priority', 'Priority Returns']
  },
  Platinum: {
    tier: 'Platinum',
    minPoints: 5000,
    pointsMultiplier: 2.0,
    freeShippingThresholdINR: 0,
    discountPerkPct: 10,
    badgeColor: 'from-cyan-400 to-indigo-600',
    perks: ['2.0x Double Points on Everything', 'Free Overnight Delivery', '10% Platinum Perks', 'Concierge Priority Support', 'Beta Hardware Invites']
  }
};

export function calculateTier(points: number): LoyaltyTierName {
  if (points >= 5000) return 'Platinum';
  if (points >= 1500) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
}

// In-memory loyalty storage
const loyaltyStore: Record<string, UserLoyaltyAccount> = {
  'user-dev-alex': {
    userId: 'user-dev-alex',
    currentTier: 'Silver',
    totalPoints: 850,
    lifetimePointsEarned: 1350,
    pointsRedeemed: 500,
    dailyLoginClaimedToday: false,
    profileCompleted: true,
    transactions: [
      {
        id: 'rew-001',
        userId: 'user-dev-alex',
        action: 'purchase',
        points: 450,
        balanceAfter: 850,
        description: 'Earned from Keychron Keyboard Purchase (Order #ord-2026-0801)',
        timestamp: '2026-08-10T10:30:00Z',
        orderId: 'ord-2026-0801'
      },
      {
        id: 'rew-002',
        userId: 'user-dev-alex',
        action: 'profile_completion',
        points: 100,
        balanceAfter: 400,
        description: 'Developer Profile & Tech Stack preferences completed',
        timestamp: '2026-08-01T09:00:00Z'
      }
    ]
  },
  'user-audio-priya': {
    userId: 'user-audio-priya',
    currentTier: 'Gold',
    totalPoints: 2100,
    lifetimePointsEarned: 2400,
    pointsRedeemed: 300,
    dailyLoginClaimedToday: false,
    profileCompleted: true,
    transactions: [
      {
        id: 'rew-003',
        userId: 'user-audio-priya',
        action: 'review',
        points: 50,
        balanceAfter: 2100,
        description: 'Verified 5-Star Review on Sony WH-1000XM5',
        timestamp: '2026-08-12T15:00:00Z'
      }
    ]
  },
  'user-enterprise-vikram': {
    userId: 'user-enterprise-vikram',
    currentTier: 'Platinum',
    totalPoints: 5400,
    lifetimePointsEarned: 6200,
    pointsRedeemed: 800,
    dailyLoginClaimedToday: true,
    profileCompleted: true,
    transactions: [
      {
        id: 'rew-004',
        userId: 'user-enterprise-vikram',
        action: 'purchase',
        points: 1200,
        balanceAfter: 5400,
        description: 'Enterprise Server Rack purchase bonus (2x Platinum multiplier)',
        timestamp: '2026-08-04T12:00:00Z'
      }
    ]
  }
};

export function getLoyaltyAccount(userId: string): UserLoyaltyAccount {
  if (!loyaltyStore[userId]) {
    loyaltyStore[userId] = {
      userId,
      currentTier: 'Bronze',
      totalPoints: 120,
      lifetimePointsEarned: 120,
      pointsRedeemed: 0,
      dailyLoginClaimedToday: false,
      profileCompleted: false,
      transactions: [
        {
          id: `rew-init-${Date.now()}`,
          userId,
          action: 'profile_completion',
          points: 120,
          balanceAfter: 120,
          description: 'Welcome Sign-up Bonus',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }
  return loyaltyStore[userId];
}

export function awardLoyaltyPoints(
  userId: string,
  action: 'purchase' | 'review' | 'referral' | 'daily_login' | 'profile_completion',
  basePoints: number,
  description: string,
  orderId?: string
): { account: UserLoyaltyAccount; pointsAwarded: number; newTier: LoyaltyTierName; leveledUp: boolean } {
  const account = getLoyaltyAccount(userId);
  const oldTier = account.currentTier;
  const tierConfig = LOYALTY_TIERS[oldTier];

  // Apply tier multiplier for purchases
  const multiplier = action === 'purchase' ? tierConfig.pointsMultiplier : 1.0;
  const pointsAwarded = Math.round(basePoints * multiplier);

  account.totalPoints += pointsAwarded;
  account.lifetimePointsEarned += pointsAwarded;

  if (action === 'daily_login') {
    account.dailyLoginClaimedToday = true;
  }
  if (action === 'profile_completion') {
    account.profileCompleted = true;
  }

  const newTier = calculateTier(account.totalPoints);
  const leveledUp = newTier !== oldTier && account.totalPoints >= LOYALTY_TIERS[newTier].minPoints;
  account.currentTier = newTier;

  const transaction: RewardTransaction = {
    id: `rew-${Date.now()}`,
    userId,
    action,
    points: pointsAwarded,
    balanceAfter: account.totalPoints,
    description: `${description} (${multiplier}x Tier boost)`,
    timestamp: new Date().toISOString(),
    orderId
  };

  account.transactions.unshift(transaction);
  return { account, pointsAwarded, newTier, leveledUp };
}

export function redeemLoyaltyPoints(
  userId: string,
  pointsToRedeem: number,
  orderId: string
): { success: boolean; discountINR: number; discountUSD: number; account: UserLoyaltyAccount; transaction?: RewardTransaction } {
  const account = getLoyaltyAccount(userId);
  
  if (pointsToRedeem <= 0 || account.totalPoints < pointsToRedeem) {
    return { success: false, discountINR: 0, discountUSD: 0, account };
  }

  // 100 points = ₹10 (0.10 INR per point)
  const discountINR = Math.round(pointsToRedeem * 0.1);
  const discountUSD = Math.round((discountINR / 83.5) * 100) / 100;

  account.totalPoints -= pointsToRedeem;
  account.pointsRedeemed += pointsToRedeem;
  account.currentTier = calculateTier(account.totalPoints);

  const transaction: RewardTransaction = {
    id: `rew-red-${Date.now()}`,
    userId,
    action: 'redemption',
    points: -pointsToRedeem,
    balanceAfter: account.totalPoints,
    description: `Redeemed ${pointsToRedeem} points for ₹${discountINR} off Order #${orderId}`,
    timestamp: new Date().toISOString(),
    orderId
  };

  account.transactions.unshift(transaction);
  return { success: true, discountINR, discountUSD, account, transaction };
}

export function getAllLoyaltyAccounts(): UserLoyaltyAccount[] {
  return Object.values(loyaltyStore);
}
