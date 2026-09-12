import React from 'react';
import {
  Activity,
  Database,
  Sliders,
  GitCompare,
  LayoutGrid,
  List,
  RefreshCw,
  Star,
  ShoppingCart,
  Heart,
  Sparkles,
  Share2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  CheckCircle2,
  Quote,
  X
} from 'lucide-react';
import { Product, ScoredCandidate, UserPersona, Currency } from '../../types';
import { ProductCard } from '../../components/ProductCard';

export interface StorefrontViewProps {
  filteredCandidates: ScoredCandidate[];
  allProducts: Product[];
  currentPersona: UserPersona;
  currency: Currency;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand?: string;
  setSelectedBrand?: (brand: string) => void;
  categories: string[];
  viewMode: 'grid' | 'dense';
  setViewMode: (mode: 'grid' | 'dense') => void;
  isLoadingPipeline: boolean;
  cartItems: Product[];
  wishlistIds: string[];
  comparedProductIds: string[];
  onSelectCandidate: (c: ScoredCandidate) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  onExplainCandidate: (c: ScoredCandidate) => void;
  onToggleCompare: (p: Product) => void;
  onShareProduct: (p: Product) => void;
  onOpenSettings: () => void;
  onOpenCompareModal: () => void;
  onOpenCouponsModal: () => void;
  onOpenLoyaltyModal: () => void;
  onOpenBundlesModal?: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  filteredCandidates,
  allProducts,
  currentPersona,
  currency,
  selectedCategory,
  setSelectedCategory,
  selectedBrand = 'All',
  setSelectedBrand,
  categories,
  viewMode,
  setViewMode,
  isLoadingPipeline,
  cartItems,
  wishlistIds,
  comparedProductIds,
  onSelectCandidate,
  onAddToCart,
  onToggleWishlist,
  onExplainCandidate,
  onToggleCompare,
  onShareProduct,
  onOpenSettings,
  onOpenCompareModal,
  onOpenCouponsModal,
  onOpenLoyaltyModal,
  onOpenBundlesModal
}) => {
  // Visual category thumbnails mapping
  const categoryShowcase = [
    {
      name: 'Laptops',
      title: 'Laptops & Workstations',
      subtitle: 'Intel Core Ultra, M3 Max & Copilot+',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Laptops').length} Models`
    },
    {
      name: 'Smartphones',
      title: 'Flagship Smartphones',
      subtitle: 'Pro Cameras & Zeiss/Leica Optics',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Smartphones').length} Models`
    },
    {
      name: 'Audio',
      title: 'Studio Audio & ANC',
      subtitle: 'Hi-Res Lossless & 60hr Battery',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Audio').length} Models`
    },
    {
      name: 'Smart Home',
      title: 'Smart Home & Living',
      subtitle: 'Dyson, Roborock & Ambient Audio',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Smart Home').length} Items`
    },
    {
      name: 'Grocery',
      title: 'Fresh Groceries & Pantry',
      subtitle: 'Farm A2 Milk & Organic Essentials',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Grocery').length} Items`
    },
    {
      name: 'Bazaar',
      title: 'Bazaar Crazy Prices',
      subtitle: 'Steals & Essentials < ₹999',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Bazaar').length} Items`
    },
    {
      name: 'Pharmacy',
      title: 'Pharmacy & Wellness',
      subtitle: 'Omron, Accu-Chek & Daily Vitamins',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Pharmacy').length} Items`
    },
    {
      name: 'Gaming',
      title: 'Esports & Battlestation',
      subtitle: 'RTX 4090, OLED 240Hz & Consoles',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Gaming').length} Models`
    },
    {
      name: 'Accessories',
      title: 'Pro GaN Power & Gear',
      subtitle: 'Thunderbolt 4 & 4K Studio Monitors',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Accessories').length} Models`
    },
    {
      name: 'Wearables',
      title: 'Wearables & Sports GPS',
      subtitle: 'Apple Ultra & Garmin Sapphire',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      tag: `${allProducts.filter(p => p.category === 'Wearables').length} Models`
    }
  ];

  // Top 3 Spotlight candidates for the "Trending Tech" showcase
  const topTrending = filteredCandidates.slice(0, 3);

  // Unified Brand Selection Handler
  const handleBrandSelect = (brand: string) => {
    const nextBrand = (selectedBrand || 'All').toLowerCase() === brand.toLowerCase() ? 'All' : brand;
    if (setSelectedBrand) {
      setSelectedBrand(nextBrand);
    }
    // When a brand is selected, reset category filter to 'All' so all products of that brand are visible
    if (setSelectedCategory && nextBrand !== 'All') {
      setSelectedCategory('All');
    }
    // Smoothly scroll down to the products catalog
    setTimeout(() => {
      const el = document.getElementById('curated-products-grid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Available categories for the currently selected brand
  const brandCategories = React.useMemo(() => {
    if (!selectedBrand || selectedBrand === 'All') return categories;
    const brandProducts = allProducts.filter(
      p => p.brand.toLowerCase() === selectedBrand.toLowerCase() && p.status !== 'discontinued' && p.status !== 'hidden'
    );
    const catsInBrand = new Set(brandProducts.map(p => p.category));
    return ['All', ...categories.filter(c => c !== 'All' && catsInBrand.has(c))];
  }, [selectedBrand, allProducts, categories]);

  // Total products count for current brand
  const currentBrandTotalCount = React.useMemo(() => {
    if (!selectedBrand || selectedBrand === 'All') return allProducts.length;
    return allProducts.filter(
      p => p.brand.toLowerCase() === selectedBrand.toLowerCase() && p.status !== 'discontinued' && p.status !== 'hidden'
    ).length;
  }, [selectedBrand, allProducts]);

  return (
    <div className="space-y-12">
      
      {/* 1. Official Brand Trust Logos Strip - Interactive & Clickable */}
      <div className="py-4 px-4 sm:px-6 border-y border-slate-200 bg-white rounded-3xl shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Official Brand Partners &bull; 100% Genuine Manufacturer Warranty &bull; Click to View Products
          </span>
          {selectedBrand !== 'All' && setSelectedBrand && (
            <button
              onClick={() => {
                setSelectedBrand('All');
                setSelectedCategory('All');
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-1"
            >
              <span>Reset to All Brands</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-black tracking-wider">
          {[
            'Apple', 'Samsung', 'ASUS', 'Vivo', 'Sony', 'OnePlus', 'Xiaomi', 'Google',
            'Dell', 'Lenovo', 'HP', 'Nothing', 'Razer', 'Bose', 'Sennheiser', 'DJI',
            'Logitech', 'Keychron', 'Anker', 'Dyson', 'Roborock', 'Garmin', 'Amazon', 'Philips'
          ].map((brand) => {
            const isSelected = (selectedBrand || 'All').toLowerCase() === brand.toLowerCase();
            return (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className={`px-3.5 py-1.5 rounded-xl uppercase transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white shadow-xs scale-105 ring-2 ring-indigo-500'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200/70 border border-slate-200/60'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>

        {/* Dynamic active brand status bar right below the logos */}
        {selectedBrand !== 'All' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                Active Brand: {selectedBrand}
              </span>
              <span className="text-slate-500 font-medium text-xs">
                Showing all {currentBrandTotalCount} verified {selectedBrand} product{currentBrandTotalCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('curated-products-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50/70 px-2.5 py-1 rounded-lg border border-indigo-100 transition hover:bg-indigo-100"
              >
                <span>Jump to Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (setSelectedBrand) setSelectedBrand('All');
                  if (setSelectedCategory) setSelectedCategory('All');
                }}
                className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Visual "Shop by Categories" Section (Krist UI Kit Reference) */}
      <div id="shop-by-categories" className="space-y-5 scroll-mt-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              Shop by Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated gear departments matched to your daily workflow
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-xs font-semibold text-slate-900 hover:text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categoryShowcase.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <div
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  if (selectedBrand !== 'All') {
                    const brandHasCategory = allProducts.some(
                      p => p.brand.toLowerCase() === selectedBrand.toLowerCase() && p.category.toLowerCase() === cat.name.toLowerCase()
                    );
                    if (!brandHasCategory && setSelectedBrand) {
                      setSelectedBrand('All');
                    }
                  }
                  const el = document.getElementById('curated-products-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`group cursor-pointer rounded-2xl overflow-hidden border p-2.5 transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-950 bg-slate-50 shadow-sm ring-1 ring-slate-950'
                    : 'border-slate-200 bg-white hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {cat.tag}
                  </span>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                    {cat.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Promotional Campaign Banners (Matching Krist Reference Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1: Studio Acoustics */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[280px] p-8 flex flex-col justify-between group shadow-sm border border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
            alt="Studio Audio Gear"
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider text-amber-300 border border-white/20">
              LOWEST PRICE OF SEASON
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Pure Studio Acoustics <br className="hidden sm:inline" />&amp; Active Noise Cancellation
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Sony WH-1000XM5, AirPods Max &amp; Bose QuietComfort tuned for distraction-free deep work.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <button
              onClick={() => {
                setSelectedCategory('Audio');
                const el = document.getElementById('curated-products-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <span>Shop Audio Gear</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Banner 2: Pro Ergonomic Workstations */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[280px] p-8 flex flex-col justify-between group shadow-sm border border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
            alt="Ergonomic Workstations"
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider text-indigo-300 border border-white/20">
              CURATED SELECTION
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Pro Ergonomic Workstations <br className="hidden sm:inline" />&amp; Mechanical Peripherals
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Keychron Q3 Pro keyboards, BenQ ScreenBars &amp; precision mice engineered for 12hr build sessions.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <button
              onClick={() => {
                setSelectedCategory('Gaming');
                const el = document.getElementById('curated-products-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <span>Explore Workstations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. "Trending Tech 🔥" AI Spotlight Banner (Clean Krist Aesthetic) */}
      {topTrending.length > 0 && (
        <div className="rounded-3xl bg-[#f8fafc] text-slate-900 p-6 sm:p-8 shadow-xs border border-slate-200/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold mb-2 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Trending Recommendations 🔥</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                Top AI-Ranked Matches for Your Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Evaluated in ~2.4ms across 1536-dim semantic embeddings and LightGBM ranking
              </p>
            </div>

            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition flex items-center gap-1.5"
            >
              <Sliders className="h-3.5 w-3.5 text-slate-600" />
              <span>Tune Preferences</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topTrending.map((c) => {
              const p = c.product;
              const formattedPrice = currency === 'INR' ? `₹${p.priceINR.toLocaleString()}` : `$${p.priceUSD.toLocaleString()}`;
              const matchPct = Math.round((c.finalScore || c.rankingScore || 0.8) * 100);

              return (
                <div 
                  key={p.id}
                  onClick={() => onSelectCandidate(c)}
                  className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-bold shadow-xs">
                          #{c.rank} Match
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-mono font-bold border border-slate-200 shadow-xs">
                          {matchPct}% Match
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mb-0.5">
                      {p.brand}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-1 text-amber-500 text-xs mt-2">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="font-bold text-[11px] text-slate-900">{p.rating}</span>
                      <span className="text-slate-400 text-[11px]">({p.reviewCount} verified reviews)</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 font-mono">{formattedPrice}</span>
                      <span className="block text-[10px] text-emerald-700 font-medium">Buy Box Winner &bull; Prime</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(p);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. "Our Curated Products" Section with Filter Tabs */}
      <div id="curated-products-grid" className="space-y-6 pt-2 scroll-mt-24">

        {/* Brand Flagship Showcase Banner */}
        {selectedBrand !== 'All' && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white text-slate-950 font-black text-xl flex items-center justify-center tracking-tight shadow-md shrink-0 border border-slate-200">
                {selectedBrand.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-mono font-bold tracking-wider uppercase">
                    Official Flagship Lineup
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Manufacturer Warranty
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                  {selectedBrand} Official Store
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Showing {filteredCandidates.length} {selectedBrand} product{filteredCandidates.length === 1 ? '' : 's'} &bull; Express Dispatch &bull; 100% Genuine Sealed Units
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-10 shrink-0">
              <button
                onClick={() => {
                  if (setSelectedBrand) setSelectedBrand('All');
                  if (setSelectedCategory) setSelectedCategory('All');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Brand Filter</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
              {selectedBrand !== 'All' ? `${selectedBrand} Products` : 'Curated For Your Setup'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ranked with LambdaMART LTR &bull; Filtered for stock and MMR intra-list diversity
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {brandCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'All' ? (selectedBrand !== 'All' ? `All ${selectedBrand}` : 'All Products') : cat}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle & Comparison */}
          <div className="flex items-center gap-2">
            {comparedProductIds.length > 0 && (
              <button
                onClick={onOpenCompareModal}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold transition border border-indigo-200"
              >
                Compare ({comparedProductIds.length})
              </button>
            )}

            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('dense')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'dense'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Dense Spec Matrix View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Brand Filter Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1 mr-1">
            Filter by Brand:
          </span>
          {[
            'All',
            'Apple',
            'Samsung',
            'ASUS',
            'Vivo',
            'OnePlus',
            'Sony',
            'Xiaomi',
            'Google',
            'Dell',
            'Lenovo',
            'HP',
            'Nothing',
            'Razer',
            'Logitech',
            'Bose',
            'Sennheiser',
            'DJI',
            'Garmin',
            'Microsoft',
            'Keychron',
            'Anker',
            'Dyson',
            'Roborock',
            'Philips',
            'Amazon'
          ].map((brand) => {
            const isSelected = (selectedBrand || 'All').toLowerCase() === brand.toLowerCase();
            return (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {brand === 'All' ? 'All Brands' : brand}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {isLoadingPipeline ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-900" />
            <div className="text-sm font-bold text-slate-800">
              Curating personalized recommendations...
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Matching 1536-dim embeddings, budget targets, and verified review signals
            </p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <p className="text-sm font-medium">
              {selectedBrand !== 'All' && selectedCategory !== 'All'
                ? `No ${selectedBrand} products found in the '${selectedCategory}' category.`
                : selectedBrand !== 'All'
                ? `No products found matching ${selectedBrand}.`
                : 'No verified products matched the current filters.'}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Show All {selectedBrand !== 'All' ? `${selectedBrand} ` : ''}Products
                </button>
              )}
              {selectedBrand !== 'All' && (
                <button
                  onClick={() => {
                    if (setSelectedBrand) setSelectedBrand('All');
                    if (setSelectedCategory) setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                >
                  Show All Brands
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredCandidates.map((candidate) => (
              <ProductCard
                key={candidate.product.id}
                candidate={candidate}
                currency={currency}
                onViewDetails={onSelectCandidate}
                onAddToCart={onAddToCart}
                onExplain={onExplainCandidate}
                onToggleWishlist={() => onToggleWishlist(candidate.product.id)}
                onShareProduct={onShareProduct}
                onToggleCompare={onToggleCompare}
                isAddedToCart={cartItems.some(i => i.id === candidate.product.id)}
                isInWishlist={wishlistIds.includes(candidate.product.id)}
                isCompared={comparedProductIds.includes(candidate.product.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 5. "What Our Customers Say" Testimonials Section */}
      <div className="pt-8 border-t border-slate-200 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Verified Community Feedback
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Trusted by senior engineers, studio creators, and startup founders across India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;The recommendation engine nailed my compiler workflow. Picked the ThinkPad X1 Carbon with 32GB RAM and it arrived next morning in Bengaluru.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
                AN
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Arjun Nair</span>
                <span className="text-[10px] text-slate-500">Staff Backend Engineer &bull; Verified Buyer</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Swapped to the Sony XM5 based on the audio persona match. The Active Noise Cancelling in open office spaces is unparalleled.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                SR
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Sneha Rao</span>
                <span className="text-[10px] text-slate-500">Principal Product Designer &bull; Verified Buyer</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;Frequently Bought Together bundle saved me 12% on the GaN fast charger. Split payment with my wallet balance was seamless.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                VK
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Vikram Kulkarni</span>
                <span className="text-[10px] text-slate-500">Founder @ StackCloud &bull; Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Promotional Banner (Refined Contrast) */}
      <div className="rounded-3xl bg-slate-950 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 text-amber-300 font-bold border border-white/20">
            Ecosystem Special
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Upgrade Your Desk Setup &bull; Instant 12% Bundle Discount
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Select any flagship laptop or workstation and automatically unlock 12% savings on verified co-purchased accessories.
          </p>
        </div>

        <button
          onClick={() => onOpenBundlesModal ? onOpenBundlesModal() : setSelectedCategory('Accessories')}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer active:scale-95"
        >
          Explore Bundles &rarr;
        </button>
      </div>

    </div>
  );
};
