import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Sparkles, 
  Copy, 
  Check, 
  BrainCircuit, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  X,
  Zap,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Coupon, MLPersonalizedOffer, UserPersona } from '../types';

interface CouponsOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona?: UserPersona;
  userId?: string;
  onSelectCoupon?: (couponCode: string) => void;
  onApplyCouponToCart?: (couponCode: string) => void;
}

export const CouponsOffersModal: React.FC<CouponsOffersModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  userId,
  onSelectCoupon,
  onApplyCouponToCart
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [personalizedOffers, setPersonalizedOffers] = useState<MLPersonalizedOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const effectiveUserId = currentPersona?.id || userId || 'user-dev-alex';

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/coupons?userId=${effectiveUserId}`);
      const data = await res.json();
      if (data.coupons) {
        setCoupons(data.coupons);
        setPersonalizedOffers(data.personalizedOffers || []);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
    }
  }, [isOpen, effectiveUserId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (code: string) => {
    if (onSelectCoupon) onSelectCoupon(code);
    if (onApplyCouponToCart) onApplyCouponToCart(code);
    onClose();
  };

  if (!isOpen) return null;

  const topOffer = personalizedOffers[0];

  const filteredCoupons = coupons.filter(c => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'percentage') return c.discountType === 'percentage';
    if (selectedFilter === 'flat') return c.discountType === 'flat_inr';
    if (selectedFilter === 'shipping') return c.discountType === 'free_shipping';
    return true;
  });

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
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Coupons &amp; ML Offers Engine
            </h2>
            <p className="text-xs text-slate-400">
              Personalized promotion propensity model tailored for <strong className="text-cyan-300">{currentPersona.name}</strong>
            </p>
          </div>
        </div>

        {/* 🎯 ML Top Personalized Offer Banner */}
        {topOffer && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-xl mb-6 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                <BrainCircuit className="h-4 w-4 text-cyan-400 animate-pulse" /> ML Propensity Recommender
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                {Math.round(topOffer.conversionPropensity * 100)}% Conversion Propensity
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-white mb-1">{topOffer.coupon.title}</div>
                <p className="text-xs text-slate-300 mb-2">{topOffer.coupon.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                    Signal: {topOffer.topContributingFeature}
                  </span>
                  <span className="text-slate-400">
                    Min Basket: ₹{topOffer.coupon.minOrderINR.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                <div className="font-mono text-sm font-bold text-amber-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-amber-400/40">
                  {topOffer.coupon.code}
                </div>
                <button
                  onClick={() => handleApply(topOffer.coupon.code)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-900/40 transition active:scale-95"
                >
                  <Zap className="h-3.5 w-3.5" /> Apply to Cart
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-indigo-500/20 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span><strong>Model Rationale:</strong> {topOffer.mlRationale}</span>
            </div>
          </div>
        )}

        {/* All Coupons List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Available Store Coupons ({filteredCoupons.length})
            </h3>

            <div className="flex gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'percentage', label: '% Off' },
                { id: 'flat', label: 'Flat ₹' },
                { id: 'shipping', label: 'Free Ship' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition ${
                    selectedFilter === tab.id
                      ? 'bg-slate-700 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredCoupons.map(coupon => {
              const mlMatch = personalizedOffers.find(o => o.coupon.code === coupon.code);
              const propensity = mlMatch ? Math.round(mlMatch.conversionPropensity * 100) : 65;

              return (
                <div 
                  key={coupon.code}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-semibold text-white">{coupon.title}</span>
                      {coupon.badge && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-medium border border-rose-500/30">
                          {coupon.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{coupon.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>Min Order: ₹{coupon.minOrderINR.toLocaleString()}</span>
                      <span>•</span>
                      <span>Used {coupon.usageCount} times</span>
                      <span>•</span>
                      <span className="text-indigo-400 font-mono">ML Propensity: {propensity}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                      title="Copy Code"
                    >
                      {copiedCode === coupon.code ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleApply(coupon.code)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
