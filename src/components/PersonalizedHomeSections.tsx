import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Tag, 
  TrendingUp, 
  Eye, 
  Zap, 
  ArrowRight, 
  Layers, 
  Flame,
  Award,
  Crown
} from 'lucide-react';
import { UserPersona, Product, MLPersonalizedOffer, Currency } from '../types';

interface PersonalizedHomeSectionsProps {
  currentPersona?: UserPersona;
  userId?: string;
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenCouponsModal: () => void;
  onOpenLoyaltyModal?: () => void;
}

export const PersonalizedHomeSections: React.FC<PersonalizedHomeSectionsProps> = ({
  currentPersona,
  userId,
  currency,
  onSelectProduct,
  onAddToCart,
  onOpenCouponsModal,
  onOpenLoyaltyModal
}) => {
  const [data, setData] = useState<{
    personaName: string;
    personaRole: string;
    primaryCategory: string;
    heroProducts: Product[];
    viewedProducts: Product[];
    personalizedOffers: MLPersonalizedOffer[];
    trendingInStack: Product[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveUserId = currentPersona?.id || userId || 'user-dev-alex';

  const fetchHomeSections = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recommendations/personalized-home?userId=${effectiveUserId}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch home sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeSections();
  }, [effectiveUserId]);

  if (!data) return null;

  const topOffer = data.personalizedOffers[0];
  const spotlightProduct = data.heroProducts[0];

  return (
    <div className="space-y-8 mb-8">
      
      {/* 🧠 Persona-Tailored Hero Spotlight */}
      {spotlightProduct && (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-6 lg:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1">
                  <BrainCircuit className="h-3.5 w-3.5" /> Tailored for {currentPersona?.name || data.personaName || 'Shopper'} ({currentPersona?.role || data.personaRole || 'Personalized'})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-mono border border-purple-500/30">
                  Affinity: {data.primaryCategory}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Recommended Spotlight: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">{spotlightProduct.title}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {spotlightProduct.description}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {currency === 'INR' ? `₹${spotlightProduct.priceINR.toLocaleString()}` : `$${spotlightProduct.priceUSD}`}
                </div>
                <button
                  onClick={() => onAddToCart(spotlightProduct)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/50 flex items-center gap-2 transition active:scale-95"
                >
                  <Zap className="h-4 w-4" /> Add to Cart (Fast Checkout)
                </button>
                <button
                  onClick={() => onSelectProduct(spotlightProduct)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Inspect Embeddings
                </button>
              </div>
            </div>

            {/* Product Image preview */}
            <div 
              onClick={() => onSelectProduct(spotlightProduct)}
              className="cursor-pointer group relative shrink-0"
            >
              <img 
                src={spotlightProduct.thumbnail} 
                alt={spotlightProduct.title}
                referrerPolicy="no-referrer"
                className="w-56 h-56 sm:w-64 sm:h-64 object-cover rounded-2xl border-2 border-indigo-500/40 shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Score: {(spotlightProduct.rating).toFixed(1)} ⭐
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 ML Propensity Offer Teaser Bar */}
      {topOffer && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Personalized ML Coupon for You: <strong>{topOffer.coupon.code}</strong></span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  {Math.round(topOffer.conversionPropensity * 100)}% Propensity
                </span>
              </div>
              <p className="text-[11px] text-slate-300">{topOffer.coupon.title} &bull; {topOffer.mlRationale}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCouponsModal}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition active:scale-95"
            >
              View Personalized Offers <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 👁️ "Because You Viewed" Section */}
      {data.viewedProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Because You Viewed Products in Your History
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Session Memory Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.viewedProducts.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="cursor-pointer group p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 shadow-md flex flex-col justify-between"
              >
                <div>
                  <img 
                    src={p.thumbnail} 
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover rounded-xl bg-slate-800 mb-2.5 group-hover:scale-[1.02] transition-transform"
                  />
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-cyan-300 transition">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">{p.category}</div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="font-mono text-xs font-bold text-white">
                    {currency === 'INR' ? `₹${p.priceINR.toLocaleString()}` : `$${p.priceUSD}`}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(p);
                    }}
                    className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition text-xs"
                    title="Add to Cart"
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
