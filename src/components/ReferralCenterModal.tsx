import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ReferralProfile, UserPersona } from '../types';

interface ReferralCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona?: UserPersona;
  userId?: string;
  userName?: string;
  onReferralSuccess?: () => void;
  onRewardCredited?: () => void;
}

export const ReferralCenterModal: React.FC<ReferralCenterModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  userId,
  userName,
  onReferralSuccess,
  onRewardCredited
}) => {
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const effectiveUserId = currentPersona?.id || userId || 'user-dev-alex';

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/referrals?userId=${effectiveUserId}`);
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen, effectiveUserId]);

  const handleCopyCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (profile?.referralLink) {
      navigator.clipboard.writeText(profile.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName || !friendEmail) return;

    try {
      setSendingInvite(true);
      const res = await fetch('/api/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: effectiveUserId,
          refereeName: friendName,
          email: friendEmail
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setProfile(data.profile);
        setInviteSuccessMsg(`Invitation sent to ${friendName}! +200 Points & ₹500 Wallet Credit simulated!`);
        setFriendName('');
        setFriendEmail('');
        if (onReferralSuccess) onReferralSuccess();
        if (onRewardCredited) onRewardCredited();
        setTimeout(() => setInviteSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to send invite:', err);
    } finally {
      setSendingInvite(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Referral Program
            </h2>
            <p className="text-xs text-slate-400">
              Invite tech colleagues. You get <strong className="text-emerald-400">₹500 Wallet Cash</strong> + <strong className="text-amber-400">200 Points</strong>; they get 15% off!
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {inviteSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            {inviteSuccessMsg}
          </div>
        )}

        {/* Referral Code Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border border-slate-800 p-4 mb-6">
          <div className="text-xs text-slate-400 mb-2">Your Unique Referral Code</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-950 border border-indigo-500/40 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-cyan-300 flex items-center justify-between">
              <span>{profile?.referralCode || 'ALEX-PRO-2026'}</span>
              <span className="text-[11px] font-sans text-slate-400 font-normal">Active</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copiedCode ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Direct link: <span className="font-mono text-[11px] text-slate-300">{profile?.referralLink}</span></span>
            <button
              onClick={handleCopyLink}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              {copiedLink ? 'Copied Link' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="text-lg font-bold text-white font-mono">{profile?.successfulReferralsCount || 0}</div>
            <div className="text-[11px] text-slate-400">Friends Joined</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="text-lg font-bold text-emerald-400 font-mono">₹{(profile?.totalRewardEarnedINR || 0).toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Wallet Cash Won</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80">
            <div className="text-lg font-bold text-amber-400 font-mono">{(profile?.totalPointsEarned || 0).toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Points Credited</div>
          </div>
        </div>

        {/* Send Referral Simulator Form */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 mb-6">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Send className="h-4 w-4 text-cyan-400" /> Send Instant Invitation (Simulator)
          </h3>

          <form onSubmit={handleSendInvite} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Friend / Colleague Name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                required
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="email"
                placeholder="colleague@techcorp.io"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                required
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow transition active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              {sendingInvite ? 'Sending & Crediting Rewards...' : 'Send Invitation & Trigger Rewards Simulation'}
            </button>
          </form>
        </div>

        {/* Referees Pipeline Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Referral Pipeline History
          </h3>
          <div className="space-y-2">
            {(profile?.referredUsers || []).map((ref) => (
              <div 
                key={ref.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200">{ref.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{ref.email}</div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      ref.status === 'rewarded'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {ref.status === 'rewarded' ? 'Purchase Complete' : 'Signed Up'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 font-bold">
                    +₹{ref.rewardPaidINR} &bull; +200 pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
