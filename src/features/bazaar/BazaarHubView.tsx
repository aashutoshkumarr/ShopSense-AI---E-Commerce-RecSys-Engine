import React, { useState, useMemo, useEffect } from 'react';
import {
  Tag,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Percent,
  Flame,
  CheckCircle2,
  ArrowLeft,
  Filter,
  Search,
  Star,
  Plus
} from 'lucide-react';
import { Product, Currency } from '../../types';

interface BazaarHubViewProps {
  allProducts: Product[];
  cartItems: Product[];
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onBackToStorefront: () => void;
}

export const BazaarHubView: React.FC<BazaarHubViewProps> = ({
  allProducts,
  cartItems,
  currency,
  onAddToCart,
  onOpenCart,
  onSelectProduct,
  onBackToStorefront
}) => {
  const [selectedPriceTier, setSelectedPriceTier] = useState<number | 'all'>('all');
  const [selectedBazaarCategory, setSelectedBazaarCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Countdown timer simulation for Steal of the Day
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 3,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter Bazaar products
  const bazaarProducts = useMemo(() => {
    return allProducts.filter(p => p.category === 'Bazaar');
  }, [allProducts]);

  // Price Tiers
  const priceTiers = [
    { label: 'All Value Deals', value: 'all', color: 'bg-slate-900 text-white' },
    { label: 'Under ₹99', value: 99, color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { label: 'Under ₹199', value: 199, color: 'bg-orange-100 text-orange-900 border-orange-300' },
    { label: 'Under ₹499', value: 499, color: 'bg-rose-100 text-rose-900 border-rose-300' },
    { label: 'Under ₹999', value: 999, color: 'bg-purple-100 text-purple-900 border-purple-300' }
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return bazaarProducts.filter(p => {
      const price = p.priceINR;
      const matchesPrice = selectedPriceTier === 'all' || price <= selectedPriceTier;
      const matchesCategory = selectedBazaarCategory === 'all' || p.subCategory?.toLowerCase().includes(selectedBazaarCategory.toLowerCase());
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPrice && matchesCategory && matchesSearch;
    });
  }, [bazaarProducts, selectedPriceTier, selectedBazaarCategory, searchQuery]);

  // Bazaar items in cart calculation
  const bazaarCartItems = cartItems.filter(p => p.category === 'Bazaar');
  const bazaarItemCount = bazaarCartItems.length;
  const bazaarCartTotal = bazaarCartItems.reduce(
    (sum, item) => sum + (currency === 'INR' ? item.priceINR : item.priceUSD),
    0
  );

  // Progressive discount computation: 2 items -> 10%, 3+ items -> 15%
  const progressiveDiscountPercent = bazaarItemCount >= 3 ? 15 : bazaarItemCount >= 2 ? 10 : 0;
  const progressiveSavings = Math.round((bazaarCartTotal * progressiveDiscountPercent) / 100);

  return (
    <div className="min-h-screen bg-amber-50/20 pb-28">
      
      {/* 1. Amazon Bazaar Vibrant Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={onBackToStorefront}
                  className="flex items-center gap-1 text-xs font-bold bg-slate-950/15 hover:bg-slate-950/25 px-2.5 py-1 rounded-xl transition cursor-pointer text-slate-950"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Tech Store</span>
                </button>
                <span className="bg-slate-950 text-amber-300 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full">
                  AMAZON BAZAAR VALUE STORE
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-2 text-slate-950">
                <span>ShopSense Bazaar</span>
                <span className="text-white text-lg sm:text-xl font-bold font-sans">Under ₹999 Store</span>
              </h1>

              <p className="text-xs sm:text-sm font-semibold text-amber-950/80">
                Extraordinary value essentials, zero middlemen &bull; Everything direct from verified factories
              </p>
            </div>

            {/* Steal of the Day Live Countdown Timer */}
            <div className="bg-slate-950 text-white p-3.5 sm:p-4 rounded-3xl shadow-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                <Flame className="h-5 w-5 fill-current text-rose-600" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  Flash Sale Ends In
                </div>
                <div className="text-lg sm:text-xl font-black font-mono tracking-widest text-white">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Progressive Multi-Buy Discount Ribbon */}
      <div className="bg-slate-950 text-amber-300 py-2.5 px-4 text-xs font-bold shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Percent className="h-4 w-4 text-amber-400" />
            <span>PROGRESSIVE MULTI-BUY DEAL:</span>
            <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black">Buy 2 Get 10% Extra Off</span>
            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md font-black">Buy 3+ Get 15% Extra Off</span>
          </div>

          {/* Dynamic Active Cart Savings Tracker */}
          {bazaarItemCount > 0 ? (
            <div className="flex items-center gap-2 text-emerald-400 font-mono shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>
                {bazaarItemCount} Bazaar items in cart &bull; Saving {progressiveDiscountPercent}% Extra ({currency === 'INR' ? `₹${progressiveSavings}` : `$${progressiveSavings}`})
              </span>
            </div>
          ) : (
            <span className="text-slate-400 hidden md:inline">Add 2 or more Bazaar items to unlock automatic discount!</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 3. Price-Tier Store Selectors (Under ₹99, ₹199, ₹499, ₹999) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-amber-600" />
              <span>Select Price Store</span>
            </h2>
            <div className="text-xs text-slate-500 font-medium">
              Free Shipping above ₹499 &bull; Cash on Delivery Available
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {priceTiers.map((tier) => {
              const isSelected = selectedPriceTier === tier.value;
              return (
                <button
                  key={String(tier.value)}
                  onClick={() => setSelectedPriceTier(tier.value as any)}
                  className={`p-3.5 rounded-2xl border text-center transition cursor-pointer font-black ${
                    isSelected
                      ? 'bg-slate-950 text-amber-400 border-slate-950 shadow-md ring-2 ring-amber-400'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="text-xs uppercase font-mono font-bold text-slate-400">Store</div>
                  <div className="text-base sm:text-lg">{tier.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Trust Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">ShopSense Quality Tested</h4>
              <p className="text-[11px] text-slate-500">Every batch rigorously inspected before dispatch.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Direct From Source</h4>
              <p className="text-[11px] text-slate-500">Zero distributor markups &bull; Guaranteed lowest price.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">7-Day Doorstep Returns</h4>
              <p className="text-[11px] text-slate-500">Instant UPI refund if not completely satisfied.</p>
            </div>
          </div>
        </div>

        {/* 5. Product Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
              <span>Bazaar Value Catalog</span>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                {filteredProducts.length} deals
              </span>
            </h3>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search budget deals..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredProducts.map((product) => {
              const price = currency === 'INR' ? product.priceINR : product.priceUSD;
              const originalPrice = currency === 'INR' ? product.originalPriceINR : product.originalPriceUSD;
              const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-3.5 shadow-2xs hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between group"
                >
                  {/* Steal Badge */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono font-black text-amber-950 bg-amber-400 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      BAZAAR STEAL
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-mono font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2.5 cursor-pointer flex items-center justify-center"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      {product.brand}
                    </span>
                    <h4
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-amber-700 transition"
                    >
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="text-base sm:text-lg font-black font-mono text-slate-950">
                        {currency === 'INR' ? `₹${price}` : `$${price}`}
                      </div>
                      {originalPrice > price && (
                        <div className="text-[11px] line-through text-slate-400 font-mono">
                          {currency === 'INR' ? `₹${originalPrice}` : `$${originalPrice}`}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onAddToCart(product)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>ADD</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. Floating Bottom Multi-Buy Bar */}
      {bazaarItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-amber-400/30 text-white shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <span>Bazaar Multi-Buy Cart ({bazaarItemCount} items)</span>
              </div>
              <div className="text-sm sm:text-base font-black font-mono">
                Subtotal: {currency === 'INR' ? `₹${bazaarCartTotal}` : `$${bazaarCartTotal}`}
                {progressiveSavings > 0 && (
                  <span className="ml-2 text-emerald-400 font-semibold text-xs">
                    (You save {currency === 'INR' ? `₹${progressiveSavings}` : `$${progressiveSavings}`} extra!)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <span>View Cart &amp; Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
