import React, { useState } from 'react';
import { X, Check, ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Product, Currency } from '../types';

interface BundleExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  currency: Currency;
  onAddBundleToCart: (products: Product[]) => void;
  onViewProduct: (product: Product) => void;
}

interface CuratedBundle {
  id: string;
  name: string;
  badge: string;
  category: string;
  description: string;
  productIds: string[];
}

const CURATED_BUNDLES: CuratedBundle[] = [
  {
    id: 'bundle-exec',
    name: 'Executive Silicon & Pro Desk Setup',
    badge: '12% Instant Savings • Most Popular',
    category: 'Productivity',
    description: 'Designed for elite engineering and leadership. The ultimate MacBook M3 Max paired with a 4K IPS Black display, whisper-quiet MX Master mouse, and 250W GaN power station.',
    productIds: ['prod-lap-06', 'prod-acc-08', 'prod-acc-05', 'prod-acc-07']
  },
  {
    id: 'bundle-esports',
    name: 'Apex Esports 240Hz Battlestation',
    badge: 'Max Frame Rate • Pro Certified',
    category: 'Gaming',
    description: 'Crush competition with zero compromises: i9-14900HX RTX 4090 beast coupled with a 240Hz 4K OLED monitor and low-latency optical switches.',
    productIds: ['prod-lap-09', 'prod-gam-04', 'prod-gam-07', 'prod-gam-08']
  },
  {
    id: 'bundle-creator',
    name: 'Cinema 4K Filmmaking & Studio Kit',
    badge: 'Creator Essential',
    category: 'Media Production',
    description: 'Everything a modern YouTuber or filmmaker needs: full-frame 4K60p 10-bit color, studio-grade broadcast microphone, 32-bit float wireless audio, and pocket gimbal.',
    productIds: ['prod-acc-01', 'prod-acc-15', 'prod-acc-03', 'prod-acc-14']
  },
  {
    id: 'bundle-smart-home',
    name: 'Next-Gen Intelligent Home & Wellness Suite',
    badge: 'Autonomous Luxury',
    category: 'Smart Home',
    description: 'Automate your living space: hands-free 5500Pa robotic cleaning, medical-grade HEPA air purification, immersive spatial audio, and cinematic Neo QLED picture.',
    productIds: ['prod-smh-08', 'prod-smh-07', 'prod-aud-13', 'prod-smh-03']
  },
  {
    id: 'bundle-mobile-trio',
    name: 'Vivo Zeiss Optics & Ecosystem Flagship Trio',
    badge: 'Pro Optics Trio',
    category: 'Mobile Workstation',
    description: 'The complete Zeiss photographic workflow: 200MP APO telephoto flagship, 13-inch Dimensity 9300 workstation tablet, and 55dB lossless ANC earbuds.',
    productIds: ['prod-ph-11', 'prod-acc-17', 'prod-aud-11']
  }
];

export const BundleExplorerModal: React.FC<BundleExplorerModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  currency,
  onAddBundleToCart,
  onViewProduct
}) => {
  const [selectedBundleId, setSelectedBundleId] = useState<string>(CURATED_BUNDLES[0].id);
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatPrice = (inr: number, usd: number) => {
    if (currency === 'USD') return `$${usd.toLocaleString()}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const currentBundle = CURATED_BUNDLES.find(b => b.id === selectedBundleId) || CURATED_BUNDLES[0];
  const bundleProducts = currentBundle.productIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  const totalOriginalINR = bundleProducts.reduce((sum, p) => sum + p.priceINR, 0);
  const totalOriginalUSD = bundleProducts.reduce((sum, p) => sum + p.priceUSD, 0);
  const discountINR = Math.round(totalOriginalINR * 0.12);
  const discountUSD = Math.round(totalOriginalUSD * 0.12);
  const finalPriceINR = totalOriginalINR - discountINR;
  const finalPriceUSD = totalOriginalUSD - discountUSD;

  const handleAdd = () => {
    onAddBundleToCart(bundleProducts);
    setAddedBundleId(currentBundle.id);
    setTimeout(() => setAddedBundleId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Smart Ecosystem Bundles</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-amber-400 text-slate-950">
                  Instant 12% Off
                </span>
              </div>
              <p className="text-xs text-slate-300">
                FAANG-grade affinity co-purchasing engine: unlock verified ecosystem discounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bundle Selection Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100 overflow-x-auto scrollbar-none">
          {CURATED_BUNDLES.map(b => {
            const isSelected = b.id === selectedBundleId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBundleId(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200'
                }`}
              >
                <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{b.name.split('&')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bundle Info Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-2 border border-amber-400/30">
                <Zap className="w-3 h-3 text-amber-400" />
                {currentBundle.badge}
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                {currentBundle.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentBundle.description}
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          {/* Bundle Items Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Included Ecosystem Gear ({bundleProducts.length} Products)
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                100% Brand Certified Genuine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bundleProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 group hover:shadow-md"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white mb-3 border border-slate-100">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-600 font-bold">
                      {product.brand}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5 mb-1 group-hover:text-indigo-600 transition">
                      {product.title}
                    </h5>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between mt-2">
                    <span className="text-xs font-black text-slate-900">
                      {formatPrice(product.priceINR, product.priceUSD)}
                    </span>
                    <button
                      onClick={() => onViewProduct(product)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer / Summary & Checkout */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Total Combined MRP
              </span>
              <span className="text-sm text-slate-400 line-through font-semibold">
                {formatPrice(totalOriginalINR, totalOriginalUSD)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold block flex items-center gap-1">
                <Check className="w-3 h-3" />
                Bundle Discount (12%)
              </span>
              <span className="text-sm font-extrabold text-emerald-600">
                - {formatPrice(discountINR, discountUSD)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[11px] uppercase tracking-wider text-indigo-600 font-bold block">
                Instant Bundle Price
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-950">
                {formatPrice(finalPriceINR, finalPriceUSD)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition w-1/2 sm:w-auto text-center"
            >
              Continue Browsing
            </button>
            <button
              onClick={handleAdd}
              disabled={addedBundleId === currentBundle.id}
              className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg w-1/2 sm:w-auto ${
                addedBundleId === currentBundle.id
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 active:scale-95'
              }`}
            >
              {addedBundleId === currentBundle.id ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Added with 12% Off!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Entire Bundle to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
