import React from 'react';
import { 
  X, 
  GitCompare, 
  ShoppingBag, 
  Star, 
  Check, 
  Zap, 
  Sparkles, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Product, Currency } from '../types';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product) => void;
  currency: Currency;
  onViewProductDetails: (product: Product) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveFromCompare,
  onClearCompare,
  onAddToCart,
  currency,
  onViewProductDetails
}) => {
  if (!isOpen || comparedProducts.length === 0) return null;

  // Collect all unique spec keys across compared products
  const allSpecKeys: string[] = Array.from(
    new Set<string>(
      comparedProducts.flatMap(p => Object.keys(p.specs || {}))
    )
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Hardware Specification Matrix</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/30">
                  {comparedProducts.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct side-by-side engineering comparison across technical specifications, pricing, and stock.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearCompare}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Top Product Cards Grid */}
          <div className={`grid gap-4 ${
            comparedProducts.length === 1 ? 'grid-cols-1' :
            comparedProducts.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-3'
          }`}>
            {comparedProducts.map((p) => {
              const price = currency === 'INR' ? `₹${p.priceINR.toLocaleString()}` : `$${p.priceUSD.toLocaleString()}`;
              const origPrice = currency === 'INR' ? `₹${p.originalPriceINR.toLocaleString()}` : `$${p.originalPriceUSD.toLocaleString()}`;
              const savings = Math.round(((p.originalPriceINR - p.priceINR) / p.originalPriceINR) * 100);

              return (
                <div 
                  key={p.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-slate-700 transition shadow-lg"
                >
                  <button
                    onClick={() => onRemoveFromCompare(p.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition z-10"
                    title="Remove from comparison"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div>
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 mb-3 relative">
                      <img 
                        src={p.imageUrl} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {p.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <span className="text-cyan-400 font-semibold">{p.brand}</span>
                      <span>•</span>
                      <span>{p.category}</span>
                    </div>

                    <h3 
                      onClick={() => onViewProductDetails(p)}
                      className="font-bold text-sm text-white hover:text-cyan-300 cursor-pointer line-clamp-2 transition leading-tight mb-2"
                    >
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center text-amber-400 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-current mr-1" />
                        <span>{p.rating}</span>
                      </div>
                      <span className="text-slate-500 text-xs">({p.reviewCount} reviews)</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 text-xs font-semibold">
                        {p.inStock ? `${p.stockCount} in stock` : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 mb-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-bold text-white font-mono">{price}</span>
                        {savings > 0 && (
                          <span className="ml-2 text-xs text-slate-500 line-through font-mono">
                            {origPrice}
                          </span>
                        )}
                      </div>
                      {savings > 0 && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                          -{savings}%
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(p)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Technical Specs Comparison Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                Technical Specification Diffs
              </h4>
            </div>

            <div className="divide-y divide-slate-800/80">
              {allSpecKeys.map((key: string) => {
                return (
                  <div 
                    key={key} 
                    className="grid grid-cols-1 sm:grid-cols-4 p-3.5 hover:bg-slate-900/40 transition text-xs"
                  >
                    <div className="font-semibold text-slate-400 sm:col-span-1 pr-2 self-center">
                      {key}
                    </div>

                    <div className={`sm:col-span-3 grid gap-4 ${
                      comparedProducts.length === 1 ? 'grid-cols-1' :
                      comparedProducts.length === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {comparedProducts.map((p) => {
                        const val = p.specs ? p.specs[key] : null;
                        return (
                          <div 
                            key={p.id} 
                            className="font-mono text-slate-200 text-xs leading-relaxed"
                          >
                            {val ? (
                              <span className="font-medium text-white">{val}</span>
                            ) : (
                              <span className="text-slate-600 italic">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Product Highlights Row */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
              <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Hardware Highlights & Features
              </h4>
            </div>

            <div className={`p-4 grid gap-4 ${
              comparedProducts.length === 1 ? 'grid-cols-1' :
              comparedProducts.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-3'
            }`}>
              {comparedProducts.map((p) => (
                <div key={p.id} className="space-y-2">
                  <div className="font-semibold text-xs text-slate-300 mb-2 truncate">
                    {p.title}
                  </div>
                  <ul className="space-y-1.5">
                    {p.features?.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-400 leading-snug">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics & Protection Row */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-cyan-400" />
              <span>Free Express Courier Dispatch on orders over ₹2,500</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>7-Day Doorstep Replacement Guarantee & Instant Wallet Refund</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

interface ComparisonDockProps {
  comparedProducts: Product[];
  onOpenCompareModal: () => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export const ComparisonDock: React.FC<ComparisonDockProps> = ({
  comparedProducts,
  onOpenCompareModal,
  onRemove,
  onClear
}) => {
  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] uppercase tracking-wider shrink-0 pl-1">
            <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
            <span>Compare ({comparedProducts.length}/3):</span>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.map(p => (
              <div 
                key={p.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-800/90 border border-slate-700 shrink-0 group"
              >
                <img 
                  src={p.imageUrl} 
                  alt={p.title} 
                  className="w-6 h-6 rounded-md object-cover" 
                />
                <span className="font-semibold text-white max-w-[100px] truncate text-[11px]">
                  {p.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(p.id);
                  }}
                  className="text-slate-400 hover:text-rose-400 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-[11px]"
          >
            Clear
          </button>
          
          <button
            onClick={onOpenCompareModal}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/20 text-xs"
          >
            <span>Compare Specs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
