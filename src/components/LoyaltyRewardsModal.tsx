import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  ChevronRight, 
  Star, 
  TrendingUp, 
  X, 
  Zap, 
  Flame, 
  ShieldAlert,
  Percent,
  Truck,
  UserCheck
} from 'lucide-react';
import { UserLoyaltyAccount, LoyaltyTierName, LoyaltyTierConfig } from '../types';
import { LOYALTY_TIERS } from '../engine/loyaltyService';

interface LoyaltyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAccountUpdated?: (account: UserLoyaltyAccount) => void;
  onOpenReferralModal?: () => void;
}

export const LoyaltyRewardsModal: React.FC<LoyaltyRewardsModalProps> = ({
  isOpen,
  onClose,
  userId,
  onAccountUpdated,
  onOpenReferralModal
}) => {
  const [account, setAccount] = useState<UserLoyaltyAccount | null>(null);
  const [tiers, setTiers] = useState<Record<LoyaltyTierName, LoyaltyTierConfig> | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [claimingProfile, setClaimingProfile] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchLoyalty = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/loyalty?userId=${userId}`);
      const data = await res.json();
      if (data.account) {
        setAccount(data.account);
        setTiers(data.tiers);
        if (onAccountUpdated) onAccountUpdated(data.account);
      }
    } catch (err) {
      console.error('Failed to fetch loyalty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLoyalty();
    }
  }, [isOpen, userId]);

  const handleClaimDaily = async () => {
    try {
      setClaimingDaily(true);
      const res = await fetch('/api/loyalty/daily-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAccount(data.account);
        if (onAccountUpdated) onAccountUpdated(data.account);
        setActionSuccessMsg('+20 Points Added for Daily Streak!');
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Claim daily failed:', err);
    } finally {
      setClaimingDaily(false);
    }
  };

  const handleClaimProfile = async () => {
    try {
      setClaimingProfile(true);
      const res = await fetch('/api/loyalty/profile-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAccount(data.account);
        if (onAccountUpdated) onAccountUpdated(data.account);
        setActionSuccessMsg('+100 Points Awarded for Tech Profile Completion!');
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Claim profile failed:', err);
    } finally {
      setClaimingProfile(false);
    }
  };

  if (!isOpen) return null;

  const currentTier = account?.currentTier || 'Bronze';
  const tierConfig = (tiers && tiers[currentTier]) || {
    tier: 'Bronze',
    minPoints: 0,
    pointsMultiplier: 1.0,
    freeShippingThresholdINR: 2000,
    discountPerkPct: 0,
    badgeColor: 'from-amber-700 to-amber-900',
    perks: ['1x Base Points', 'Free shipping over ₹2000']
  };

  // Next tier calculation
  const tierProgression: { name: LoyaltyTierName; target: number }[] = [
    { name: 'Bronze', target: 0 },
    { name: 'Silver', target: 500 },
    { name: 'Gold', target: 1500 },
    { name: 'Platinum', target: 5000 }
  ];

  const currentTierIndex = tierProgression.findIndex(t => t.name === currentTier);
  const nextTier = tierProgression[currentTierIndex + 1];
  const pointsToNext = nextTier ? Math.max(0, nextTier.target - (account?.totalPoints || 0)) : 0;
  const progressPct = nextTier 
    ? Math.min(100, Math.round(((account?.totalPoints || 0) / nextTier.target) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              ShopSense Loyalty &amp; Rewards
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold font-mono">
                {currentTier} Member
              </span>
            </h2>
            <p className="text-xs text-slate-400">Earn points on every purchase, review, referral, and daily login.</p>
          </div>
        </div>

        {/* Toast Notification */}
        {actionSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {actionSuccessMsg}
          </div>
        )}

        {/* Tier Hero Card */}
        <div className={`p-5 rounded-2xl bg-gradient-to-r ${tierConfig.badgeColor} text-white shadow-xl mb-6 relative overflow-hidden`}>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 mask-radial-fade pointer-events-none" />
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">Active Membership Tier</span>
              <div className="text-2xl font-black tracking-tight">{currentTier} Tier</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/80">Available Points</span>
              <div className="text-3xl font-black font-mono tracking-tight">{(account?.totalPoints || 0).toLocaleString()} <span className="text-sm font-normal">pts</span></div>
              <div className="text-[11px] text-white/90 font-medium">Worth ₹{Math.round((account?.totalPoints || 0) * 0.1)} Discount at Checkout</div>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="space-y-1.5 pt-2 border-t border-white/20">
              <div className="flex justify-between text-xs text-white/90 font-medium">
                <span>Progress to <strong>{nextTier.name}</strong></span>
                <span>{pointsToNext} pts to unlock {nextTier.name} ({progressPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/30 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Earning Actions Hub */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-400" /> Earn More Points Instantly
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Daily Login Streak */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Daily Login Streak</div>
                  <div className="text-[11px] text-slate-400">+20 pts every 24 hours</div>
                </div>
              </div>
              <button
                onClick={handleClaimDaily}
                disabled={claimingDaily || account?.dailyLoginClaimedToday}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  account?.dailyLoginClaimedToday
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                }`}
              >
                {account?.dailyLoginClaimedToday ? 'Claimed Today' : claimingDaily ? 'Claiming...' : 'Claim +20'}
              </button>
            </div>

            {/* Profile Completion */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Complete Profile</div>
                  <div className="text-[11px] text-slate-400">+100 pts for hardware setup</div>
                </div>
              </div>
              <button
                onClick={handleClaimProfile}
                disabled={claimingProfile || account?.profileCompleted}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  account?.profileCompleted
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md active:scale-95'
                }`}
              >
                {account?.profileCompleted ? 'Completed' : claimingProfile ? 'Verifying...' : 'Claim +100'}
              </button>
            </div>

            {/* Referral Program */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Refer a Colleague</div>
                  <div className="text-[11px] text-slate-400">+200 pts + ₹500 in Wallet</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenReferralModal) onOpenReferralModal();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95"
              >
                Share Code
              </button>
            </div>

            {/* Write a Review */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Review Purchased Tech</div>
                  <div className="text-[11px] text-slate-400">+50 pts per verified review</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-1 rounded border border-purple-800">
                Auto-Awarded
              </span>
            </div>
          </div>
        </div>

        {/* Tier Comparison Matrix */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Loyalty Tier Benefits Comparison
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.entries(LOYALTY_TIERS).map(([tName, tConfig]) => {
              const isCurrent = tName === currentTier;
              return (
                <div 
                  key={tName}
                  className={`p-3 rounded-xl border transition ${
                    isCurrent 
                      ? 'bg-slate-800 border-amber-400/80 shadow-md ring-1 ring-amber-400/50' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{tName}</span>
                    {isCurrent && (
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1 rounded">YOU</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mb-2 font-mono">{tConfig.minPoints}+ pts</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-slate-200 font-medium">⚡ {tConfig.pointsMultiplier}x Points</div>
                    <div className="text-slate-300">
                      🚚 {tConfig.freeShippingThresholdINR === 0 ? 'Free Shipping (All)' : `Free > ₹${tConfig.freeShippingThresholdINR}`}
                    </div>
                    {tConfig.discountPerkPct > 0 && (
                      <div className="text-emerald-400 font-semibold">🎁 {tConfig.discountPerkPct}% VIP Perk</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reward Transaction History */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Points Ledger
          </h3>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {(account?.transactions || []).map((t) => (
              <div 
                key={t.id}
                className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-medium text-slate-200">{t.description}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(t.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className={`font-mono font-bold ${t.points > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {t.points > 0 ? `+${t.points}` : t.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
