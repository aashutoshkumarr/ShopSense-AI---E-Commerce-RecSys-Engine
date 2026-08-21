import { UserReferralProfile, ReferralReferee } from '../types';

const referralStore: Record<string, UserReferralProfile> = {
  'user-dev-alex': {
    userId: 'user-dev-alex',
    referralCode: 'ALEX-PRO-2026',
    referralLink: 'https://shopsense.ai/ref/ALEX-PRO-2026',
    totalReferees: 3,
    completedPurchases: 2,
    totalBonusPointsEarned: 400,
    totalWalletBonusINR: 1000,
    referees: [
      {
        id: 'ref-01',
        name: 'Rohan Sharma',
        email: 'rohan.s@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        signedUpAt: '2026-08-05T10:00:00Z',
        hasPurchased: true,
        firstOrderTotalINR: 18500,
        rewardClaimed: true
      },
      {
        id: 'ref-02',
        name: 'Sneha Roy',
        email: 'sneha.roy@techlab.io',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        signedUpAt: '2026-08-11T14:30:00Z',
        hasPurchased: true,
        firstOrderTotalINR: 6200,
        rewardClaimed: true
      },
      {
        id: 'ref-03',
        name: 'Karan Patel',
        email: 'karan.dev@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        signedUpAt: '2026-08-18T09:15:00Z',
        hasPurchased: false,
        rewardClaimed: false
      }
    ]
  },
  'user-audio-priya': {
    userId: 'user-audio-priya',
    referralCode: 'PRIYA-AUDIO-VIP',
    referralLink: 'https://shopsense.ai/ref/PRIYA-AUDIO-VIP',
    totalReferees: 2,
    completedPurchases: 1,
    totalBonusPointsEarned: 200,
    totalWalletBonusINR: 500,
    referees: [
      {
        id: 'ref-04',
        name: 'Tanvi Mehra',
        email: 'tanvi.m@musicstudio.in',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        signedUpAt: '2026-08-14T16:00:00Z',
        hasPurchased: true,
        firstOrderTotalINR: 24990,
        rewardClaimed: true
      }
    ]
  }
};

export function getReferralProfile(userId: string, userName?: string): UserReferralProfile {
  if (!referralStore[userId]) {
    const slug = (userName || userId).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const code = `${slug}-2026`;
    referralStore[userId] = {
      userId,
      referralCode: code,
      referralLink: `https://shopsense.ai/ref/${code}`,
      totalReferees: 0,
      completedPurchases: 0,
      totalBonusPointsEarned: 0,
      totalWalletBonusINR: 0,
      referees: []
    };
  }
  return referralStore[userId];
}

export function simulateAddReferee(
  userId: string, 
  refereeName: string, 
  email: string
): { profile: UserReferralProfile; referee: ReferralReferee } {
  const profile = getReferralProfile(userId);
  const referee: ReferralReferee = {
    id: `ref-${Date.now()}`,
    name: refereeName,
    email,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    signedUpAt: new Date().toISOString(),
    hasPurchased: true,
    firstOrderTotalINR: 4500,
    rewardClaimed: true
  };

  profile.referees.unshift(referee);
  profile.totalReferees += 1;
  profile.completedPurchases += 1;
  profile.totalBonusPointsEarned += 200;
  profile.totalWalletBonusINR += 500;

  return { profile, referee };
}
