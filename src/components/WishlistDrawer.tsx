import React from 'react';
import { 
  Heart, 
  X, 
  ShoppingBag, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Layers 
} from 'lucide-react';
import { Product, Currency } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
  currency: Currency;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onMoveToCart,
  currency
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100 z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Saved Wishlist</h2>
              <span className="text-xs text-slate-400 font-mono">
                {wishlistProducts.length} items &bull; Feeds Behavioral Prior (wt +5)
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-500">
              <Heart className="h-10 w-10 mx-auto stroke-1 text-slate-600" />
              <p className="text-sm">Your wishlist is currently empty.</p>
              <p className="text-xs text-slate-600">Click the heart icon on any product to save items and boost your personalized recommendations.</p>
            </div>
          ) : (
            wishlistProducts.map(prod => {
              const price = currency === 'INR' ? `₹${prod.priceINR.toLocaleString()}` : `$${prod.priceUSD.toLocaleString()}`;

              return (
                <div 
                  key={prod.id} 
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group"
                >
                  <img 
                    src={prod.imageUrl} 
                    alt={prod.title} 
                    className="h-14 w-14 rounded-lg object-cover bg-slate-900 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-indigo-400 font-mono block">
                      {prod.brand} &bull; {prod.category}
                    </span>
                    <h4 className="text-xs font-semibold text-white truncate mt-0.5">
                      {prod.title}
                    </h4>
                    <div className="text-xs font-bold text-cyan-300 font-mono mt-1">
                      {price}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                    <button
                      onClick={() => onMoveToCart(prod)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                      title="Move to Active Cart"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      <span>Buy</span>
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(prod.id)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              RecSys Vector Influence:
            </span>
            <span className="text-cyan-300 font-mono font-bold">+18% Cosine Shift</span>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
          >
            Continue Browsing
          </button>
        </div>

      </div>
    </div>
  );
};
