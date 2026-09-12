import React, { useState } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Eye, 
  Check, 
  Zap, 
  Heart, 
  Share2, 
  Sparkles,
  Info,
  Clock,
  Truck,
  TrendingDown,
  GitCompare
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
  onToggleCompare?: (product: Product) => void;
  isAddedToCart?: boolean;
  isInWishlist?: boolean;
  isCompared?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  candidate,
  currency,
  onViewDetails,
  onAddToCart,
  onExplain,
  onToggleWishlist,
  onShareProduct,
  onToggleCompare,
  isAddedToCart = false,
  isInWishlist = false,
  isCompared = false
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
      className="group relative bg-white rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs p-3.5"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          loading="lazy"
          referrerPolicy="no-referrer"
          onClick={() => onViewDetails(candidate)}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {rank && rank <= 3 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
              <Zap className="h-2.5 w-2.5 fill-current text-amber-400" />
              Rank #{rank}
            </span>
          )}

          {discountPct > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-xs">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Top Right Actions (Wishlist, Compare) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {onToggleCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              title={isCompared ? "Remove from comparison" : "Compare specs"}
              className={`p-2 rounded-full backdrop-blur-md shadow-xs transition ${
                isCompared
                  ? 'bg-slate-950 text-white'
                  : 'bg-white/95 text-slate-600 hover:text-slate-950 border border-slate-100'
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={handleWishlist}
            title={isInWishlist ? "Saved to wishlist" : "Add to wishlist"}
            className={`p-2 rounded-full backdrop-blur-md shadow-xs transition ${
              isInWishlist
                ? 'bg-rose-600 text-white'
                : 'bg-white/95 text-slate-500 hover:text-rose-600 border border-slate-100'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Match Percentage Chip (Bottom Right of Image) */}
        <div className="absolute bottom-2 right-2.5 z-10">
          <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 text-[10px] font-mono font-bold shadow-xs">
            {matchPct}% Match
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-bold tracking-wider uppercase text-slate-500">
              {product.brand}
            </span>
            <span>{product.category}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(candidate)}
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer line-clamp-1 leading-snug"
          >
            {product.title}
          </h3>

          {/* Rating & Stock */}
          <div className="flex items-center justify-between mt-1 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="ml-1 font-bold text-[11px] text-slate-900">{product.rating}</span>
              <span className="text-slate-400 text-[11px] ml-1">({product.reviewCount})</span>
            </div>

            <div>
              {product.stockCount <= 0 || !product.inStock ? (
                <span className="text-[10px] font-medium text-rose-600">Out of Stock</span>
              ) : product.stockCount <= 4 ? (
                <span className="text-[10px] font-medium text-amber-600">Only {product.stockCount} left</span>
              ) : (
                <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                  <Truck className="h-2.5 w-2.5" /> Prime 1-Day
                </span>
              )}
            </div>
          </div>

          {/* Grounded Recommendation Reason */}
          {groundedReason && (
            <div 
              onClick={() => onExplain(candidate)}
              className="mt-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer transition hover:border-slate-300 flex items-center gap-1.5"
              title="Click to view full transparency attribution breakdown"
            >
              <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-600 truncate">
                {groundedReason.headline}
              </span>
            </div>
          )}
        </div>

        {/* Price & Action Area */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-950 font-mono">
                {price}
              </span>
              {discountPct > 0 && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {originalPrice}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(candidate);
              }}
              className="text-[11px] font-semibold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-0.5"
            >
              <Eye className="h-3 w-3" />
              <span>Details</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-1.5">
            <button
              onClick={() => onExplain(candidate)}
              className="col-span-2 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1"
              title="View feature weights &amp; tree attributions"
            >
              <Info className="h-3 w-3 text-slate-600" />
              <span>Why Rec?</span>
            </button>

            <button
              id={`add-cart-btn-${product.id}`}
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock || product.stockCount <= 0}
              className={`col-span-3 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs ${
                !product.inStock || product.stockCount <= 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isAddedToCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 hover:bg-slate-800 text-white'
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
        <div className="absolute inset-x-0 bottom-0 py-1 bg-slate-900 text-white text-[11px] font-bold text-center animate-in fade-in">
          Link Copied &bull; Event Recorded
        </div>
      )}
    </div>
  );
};
