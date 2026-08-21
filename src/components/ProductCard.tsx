import React, { useState } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Eye, 
  HelpCircle, 
  Check, 
  Zap, 
  Layers, 
  Heart, 
  Share2, 
  Sparkles,
  Info,
  Clock,
  Truck,
  TrendingDown
} from 'lucide-react';
import { Product, ScoredCandidate, Currency } from '../types';

interface ProductCardProps {
  candidate: ScoredCandidate;
  currency: Currency;
  onViewDetails: (candidate: ScoredCandidate) => void;
  onAddToCart: (product: Product) => void;
  onExplain: (candidate: ScoredCandidate) => void;
  onToggleWishlist?: (product: Product) => void;
  onShareProduct?: (product: Product) => void;
  isAddedToCart?: boolean;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  candidate,
  currency,
  onViewDetails,
  onAddToCart,
  onExplain,
  onToggleWishlist,
  onShareProduct,
  isAddedToCart = false,
  isInWishlist = false
}) => {
  const { product, rankingScore, finalScore, featureAttributions, candidateSources, rank, groundedReason } = candidate;

  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const price = currency === 'INR' ? `₹${product.priceINR.toLocaleString()}` : `$${product.priceUSD.toLocaleString()}`;
  const originalPrice = currency === 'INR' ? `₹${product.originalPriceINR.toLocaleString()}` : `$${product.originalPriceUSD.toLocaleString()}`;
  const discountPct = Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100);

  // Top feature attribution
  const topAttribution = featureAttributions && featureAttributions.length > 0 ? featureAttributions[0] : null;

  // Match score percentage
  const matchPct = Math.round((finalScore || rankingScore || 0.8) * 100);

  // Color for match percentage
  const getMatchBadgeColor = (pct: number) => {
    if (pct >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (pct >= 70) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
    if (onShareProduct) onShareProduct(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Media & Tags Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Top Left Badges: Rank & Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {rank && rank <= 3 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
              <Zap className="h-2.5 w-2.5 fill-current" />
              Rank #{rank}
            </span>
          )}

          {product.badge && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-sm text-white font-medium text-[10px] border border-indigo-400/30">
              {product.badge}
            </span>
          )}
        </div>

        {/* Top Right Quick Actions: Wishlist, Share, Match Score */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={handleWishlist}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist (Signal wt 5)"}
              className={`p-1.5 rounded-full backdrop-blur-md transition ${
                isInWishlist
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-900/80 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 border border-slate-700/80'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              title="Share product link (Signal wt 4)"
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700/80 backdrop-blur-md transition"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold backdrop-blur-md shadow-sm ${getMatchBadgeColor(matchPct)}`}>
            {matchPct}% Match
          </span>
        </div>

        {/* Candidate Sources Attribution (Bottom of Image) */}
        <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between text-[10px]">
          <div className="flex gap-1 flex-wrap">
            {candidateSources?.map((src) => {
              let label = 'Content';
              let color = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50';
              if (src.source === 'collaborative_filtering') {
                label = 'Collab CF';
                color = 'bg-purple-950/80 text-purple-300 border-purple-700/50';
              } else if (src.source === 'session_based') {
                label = 'Session';
                color = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
              } else if (src.source === 'trending_popular') {
                label = 'Trending';
                color = 'bg-amber-950/80 text-amber-300 border-amber-700/50';
              }

              return (
                <span key={src.source} className={`px-1.5 py-0.5 rounded-md border text-[9px] font-mono font-medium backdrop-blur-md ${color}`}>
                  {label}
                </span>
              );
            })}
          </div>

          {topAttribution && (
            <span className="text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
              +{topAttribution.percentage}% {topAttribution.featureName.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          
          {/* Grounded Recommendation Reason Callout */}
          {groundedReason && (
            <div 
              onClick={() => onExplain(candidate)}
              className="mb-2.5 p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-950/70 border border-indigo-500/30 cursor-pointer transition flex items-start gap-1.5 group/reason"
              title="Click to view full transparency breakdown"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-cyan-300 block">{groundedReason.headline}</span>
                <span className="text-slate-400 line-clamp-1 text-[10px]">{groundedReason.explanationText}</span>
              </div>
            </div>
          )}

          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-indigo-400 tracking-wide uppercase text-[10px]">
              {product.brand}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{product.category}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(candidate)}
            className="text-sm font-semibold text-slate-100 hover:text-cyan-300 transition cursor-pointer line-clamp-2 leading-snug"
          >
            {product.title}
          </h3>

          {/* Rating & Stock status */}
          <div className="flex items-center justify-between mt-1.5 text-xs text-slate-300">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="ml-1 font-bold text-[11px]">{product.rating}</span>
              <span className="text-slate-500 text-[11px] ml-1">({product.reviewCount})</span>
            </div>

            {/* In-Stock Indicator */}
            <div>
              {product.stockCount <= 0 || !product.inStock ? (
                <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                  Out of Stock
                </span>
              ) : product.stockCount <= 4 ? (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> Only {product.stockCount} left
                </span>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <Truck className="h-2.5 w-2.5" /> Fast Dispatch
                </span>
              )}
            </div>
          </div>

          {/* Tags preview */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action Area */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white font-mono">
                {price}
              </span>
              {discountPct > 0 && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  {originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(candidate);
                }}
                className="text-[10px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition"
                title="View 180-day price trend and history"
              >
                <TrendingDown className="h-3 w-3" /> Price History
              </button>
              {discountPct > 0 && (
                <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 font-mono">
                  {discountPct}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => onExplain(candidate)}
              className="col-span-2 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1 group/btn"
              title="Explain ranking attributions with AI"
            >
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span>Signals</span>
            </button>

            <button
              id={`add-cart-btn-${product.id}`}
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock || product.stockCount <= 0}
              className={`col-span-3 py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow ${
                !product.inStock || product.stockCount <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : isAddedToCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/20'
              }`}
            >
              {isAddedToCart ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {copiedShare && (
        <div className="absolute inset-x-0 bottom-0 py-1 bg-cyan-600 text-slate-950 text-[11px] font-bold text-center animate-in fade-in">
          Link Copied &bull; Signal Logged!
        </div>
      )}
    </div>
  );
};
