import React, { useState, useMemo } from 'react';
import {
  Bike,
  Clock,
  Sparkles,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Flame,
  ArrowLeft,
  ChevronRight,
  Tag,
  Star
} from 'lucide-react';
import { Product, Currency } from '../../types';

interface GroceryHubViewProps {
  allProducts: Product[];
  cartItems: Product[];
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart?: (productId: string) => void;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenLiveTracking: () => void;
  onBackToStorefront: () => void;
}

export const GroceryHubView: React.FC<GroceryHubViewProps> = ({
  allProducts,
  cartItems,
  currency,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  onSelectProduct,
  onOpenLiveTracking,
  onBackToStorefront
}) => {
  const [selectedAisle, setSelectedAisle] = useState<string>('All');
  const [grocerySearch, setGrocerySearch] = useState<string>('');

  // Filter grocery products
  const groceryProducts = useMemo(() => {
    return allProducts.filter(p => p.category === 'Grocery');
  }, [allProducts]);

  // Available aisles
  const aisles = [
    { id: 'All', label: 'All Items', icon: '🛒' },
    { id: 'Dairy, Bread & Eggs', label: 'Dairy, Bread & Eggs', icon: '🥛' },
    { id: 'Fresh Fruits & Vegetables', label: 'Fresh Fruits & Veggies', icon: '🥦' },
    { id: 'Munchies & Snacks', label: 'Munchies & Chips', icon: '🍿' },
    { id: 'Cold Drinks & Juices', label: 'Cold Drinks & Juices', icon: '🥤' },
    { id: 'Instant Food & Staples', label: 'Instant Food & Staples', icon: '🍜' },
    { id: 'Household & Personal Care', label: 'Household Essentials', icon: '🧼' }
  ];

  // Filtered by aisle and search
  const filteredProducts = useMemo(() => {
    return groceryProducts.filter(p => {
      const matchesAisle = selectedAisle === 'All' || p.subCategory?.toLowerCase().includes(selectedAisle.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(selectedAisle.toLowerCase()));
      const matchesSearch = !grocerySearch || p.title.toLowerCase().includes(grocerySearch.toLowerCase()) || p.brand.toLowerCase().includes(grocerySearch.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(grocerySearch.toLowerCase()));
      return matchesAisle && matchesSearch;
    });
  }, [groceryProducts, selectedAisle, grocerySearch]);

  // Cart counts for grocery items
  const groceryCartItems = cartItems.filter(p => p.category === 'Grocery');
  const groceryCartCount = groceryCartItems.length;
  const groceryCartTotal = groceryCartItems.reduce(
    (sum, item) => sum + (currency === 'INR' ? item.priceINR : item.priceUSD),
    0
  );

  const freeDeliveryThreshold = currency === 'INR' ? 199 : 5;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - groceryCartTotal);
  const freeDeliveryProgress = Math.min(100, (groceryCartTotal / freeDeliveryThreshold) * 100);

  // Helper for item quantity in cart
  const getItemQuantity = (productId: string) => {
    return cartItems.filter(item => item.id === productId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      
      {/* 1. Blinkit / Instamart Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            {/* Left: Location & 10 Min Promise */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={onBackToStorefront}
                  className="flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Tech</span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] tracking-wide">
                  <Zap className="h-3 w-3 fill-current" />
                  <span>10 MINS DELIVERY</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>ShopSense Fresh</span>
                <span className="text-emerald-200 text-lg sm:text-xl font-normal">by Instamart</span>
              </h1>
              
              <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
                <span>Delivering to <strong>Koramangala 4th Block</strong> from Indiranagar Dark Store #14</span>
              </div>
            </div>

            {/* Right: Live Tracking Button & Cart Summary */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenLiveTracking}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition backdrop-blur-md shadow-sm cursor-pointer"
              >
                <Bike className="h-4 w-4 animate-bounce text-amber-300" />
                <span>Track Live Order</span>
              </button>

              <button
                onClick={onOpenCart}
                className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {groceryCartCount > 0 ? `${groceryCartCount} Items • ${currency === 'INR' ? `₹${groceryCartTotal}` : `$${groceryCartTotal}`}` : 'View Basket'}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Free Delivery & Guarantee Ticker */}
      <div className="bg-emerald-950 text-emerald-100 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar font-medium">
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Average Delivery Time: <strong>8 mins 45 secs</strong> in Bengaluru</span>
          </div>
          <span className="text-emerald-800 hidden sm:inline">&bull;</span>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Cold-chain maintained below 4°C for dairy &amp; produce</span>
          </div>
          <span className="text-emerald-800 hidden sm:inline">&bull;</span>
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Doorstep replacement if anything is imperfect</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* 3. Search Bar + Aisle Category Pills */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={grocerySearch}
              onChange={(e) => setGrocerySearch(e.target.value)}
              placeholder="Search milk, bread, mangoes, chips, cold drinks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-xs"
            />
            {grocerySearch && (
              <button
                onClick={() => setGrocerySearch('')}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Fast Aisle Navigation Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {aisles.map((aisle) => (
              <button
                key={aisle.id}
                onClick={() => setSelectedAisle(aisle.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedAisle === aisle.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                <span className="text-base">{aisle.icon}</span>
                <span>{aisle.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Fresh Produce & Steals Spotlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-1.5">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                Morning Farm Fresh
              </span>
              <h3 className="text-lg font-black leading-tight">Farm Direct Milk &amp; Breads</h3>
              <p className="text-xs text-emerald-100">Zero preservatives, delivered chilled in under 10 minutes.</p>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedAisle('Dairy, Bread & Eggs')}
                  className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition cursor-pointer"
                >
                  Shop Dairy &rarr;
                </button>
              </div>
            </div>
            <div className="absolute right-2 -bottom-2 text-6xl opacity-30 select-none">🥛</div>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-1.5">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                Crisp &amp; Juicy
              </span>
              <h3 className="text-lg font-black leading-tight">Handpicked Seasonal Fruits</h3>
              <p className="text-xs text-amber-100">Naturally ripened Alphonso Mangoes, Robusta Bananas &amp; more.</p>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedAisle('Fresh Fruits & Vegetables')}
                  className="px-3 py-1.5 rounded-xl bg-white text-orange-950 font-bold text-xs hover:bg-amber-50 transition cursor-pointer"
                >
                  Shop Produce &rarr;
                </button>
              </div>
            </div>
            <div className="absolute right-2 -bottom-2 text-6xl opacity-30 select-none">🥭</div>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10 space-y-1.5">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                Midnight Cravings
              </span>
              <h3 className="text-lg font-black leading-tight">Munchies &amp; Cold Beverages</h3>
              <p className="text-xs text-indigo-100">Artisanal chips, cold pressed juices and ice-cold soft drinks.</p>
              <div className="pt-2">
                <button
                  onClick={() => setSelectedAisle('Munchies & Snacks')}
                  className="px-3 py-1.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition cursor-pointer"
                >
                  Explore Munchies &rarr;
                </button>
              </div>
            </div>
            <div className="absolute right-2 -bottom-2 text-6xl opacity-30 select-none">🍿</div>
          </div>
        </div>

        {/* 5. Product Grid with Blinkit-Style Steppers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedAisle === 'All' ? 'All Quick Essentials' : selectedAisle}</span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {filteredProducts.length} items
              </span>
            </h2>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>⚡ Delivery in 8-10 mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredProducts.map((product) => {
              const qty = getItemQuantity(product.id);
              const price = currency === 'INR' ? product.priceINR : product.priceUSD;
              const originalPrice = currency === 'INR' ? product.originalPriceINR : product.originalPriceUSD;
              const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs hover:shadow-md hover:border-emerald-200 transition flex flex-col justify-between group relative"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Clock className="h-2.5 w-2.5 text-emerald-600" />
                      <span>8 MINS</span>
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-mono font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
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

                  {/* Brand & Title */}
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                      {product.brand}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-emerald-700 transition"
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                    </div>
                  </div>

                  {/* Price & Blinkit On-Card Stepper */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="text-sm sm:text-base font-black font-mono text-slate-950">
                        {currency === 'INR' ? `₹${price}` : `$${price}`}
                      </div>
                      {originalPrice > price && (
                        <div className="text-[11px] line-through text-slate-400 font-mono">
                          {currency === 'INR' ? `₹${originalPrice}` : `$${originalPrice}`}
                        </div>
                      )}
                    </div>

                    {/* Stepper or ADD button */}
                    {qty === 0 ? (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600 font-black text-xs transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Plus className="h-3 w-3" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-2 py-1 shadow-sm">
                        <button
                          onClick={() => onRemoveFromCart && onRemoveFromCart(product.id)}
                          className="hover:opacity-80 transition cursor-pointer"
                          title="Reduce quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono font-black text-xs px-1 select-none">
                          {qty}
                        </span>
                        <button
                          onClick={() => onAddToCart(product)}
                          className="hover:opacity-80 transition cursor-pointer"
                          title="Add more"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. Floating Bottom Quick-Checkout Bar (When grocery items are in cart) */}
      {groceryCartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-200 shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            
            {/* Free Delivery Bar */}
            <div className="flex-1 min-w-[200px] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Bike className="h-4 w-4 text-emerald-600" />
                  <span>{groceryCartCount} {groceryCartCount === 1 ? 'grocery item' : 'grocery items'} in bag</span>
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {freeDeliveryRemaining === 0 ? 'FREE Delivery Unlocked 🎉' : `Add ${currency === 'INR' ? `₹${freeDeliveryRemaining}` : `$${freeDeliveryRemaining}`} for FREE delivery`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>

            {/* Total & Checkout Action */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500">Cart Total</div>
                <div className="text-lg font-black font-mono text-slate-950">
                  {currency === 'INR' ? `₹${groceryCartTotal}` : `$${groceryCartTotal}`}
                </div>
              </div>

              <button
                onClick={onOpenCart}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer"
              >
                <span>Proceed to 10-Min Delivery</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
