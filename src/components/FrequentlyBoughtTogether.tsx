import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Check, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProductBundle, Product, Currency } from '../types';

interface FrequentlyBoughtTogetherProps {
  primaryProduct: Product;
  currency: Currency;
  onAddBundleToCart: (products: Product[]) => void;
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  primaryProduct,
  currency,
  onAddBundleToCart
}) => {
  const [bundle, setBundle] = useState<ProductBundle | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([primaryProduct.id]);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/bundles/${primaryProduct.id}`)
      .then(r => r.json())
      .then((data: ProductBundle) => {
        setBundle(data);
        const allIds = [data.primaryProduct.id, ...data.bundleProducts.map(p => p.id)];
        setSelectedProductIds(allIds);
      })
      .catch(console.error);
  }, [primaryProduct.id]);

  if (!bundle || bundle.bundleProducts.length === 0) return null;

  const allBundleProducts = [bundle.primaryProduct, ...bundle.bundleProducts];
  const activeProducts = allBundleProducts.filter(p => selectedProductIds.includes(p.id));

  const totalRawPrice = activeProducts.reduce((sum, p) => sum + p.priceINR, 0);
  const isAllSelected = selectedProductIds.length === allBundleProducts.length;
  // Apply 12% bundle discount if 2 or more products are selected
  const hasBundleDiscount = activeProducts.length >= 2;
  const bundleDiscountPct = hasBundleDiscount ? 12 : 0;
  const bundleDiscountINR = Math.round(totalRawPrice * (bundleDiscountPct / 100));
  const finalBundlePriceINR = totalRawPrice - bundleDiscountINR;

  const priceStr = currency === 'INR' ? `₹${finalBundlePriceINR.toLocaleString()}` : `$${Math.round(finalBundlePriceINR / 85).toLocaleString()}`;
  const origStr = currency === 'INR' ? `₹${totalRawPrice.toLocaleString()}` : `$${Math.round(totalRawPrice / 85).toLocaleString()}`;
  const savingsStr = currency === 'INR' ? `₹${bundleDiscountINR.toLocaleString()}` : `$${Math.round(bundleDiscountINR / 85).toLocaleString()}`;

  const toggleProduct = (productId: string) => {
    if (productId === primaryProduct.id) return; // primary product cannot be unchecked
    setSelectedProductIds(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleAddBundle = () => {
    onAddBundleToCart(activeProducts);
    setAddedSuccess(true);
    confetti({
      particleCount: 60,
      spread: 65,
      origin: { y: 0.8 }
    });
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Frequently Bought Together
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30">
                Save 12% Instant
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Co-purchased ecosystem items with combined bundle discount</p>
          </div>
        </div>
      </div>

      {/* Visual Product Thumbnails Row with Plus Connectors */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2">
        {allBundleProducts.map((prod, idx) => {
          const isChecked = selectedProductIds.includes(prod.id);
          const isPrimary = prod.id === primaryProduct.id;

          return (
            <React.Fragment key={prod.id}>
              {idx > 0 && (
                <div className="h-7 w-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                </div>
              )}

              <div 
                onClick={() => !isPrimary && toggleProduct(prod.id)}
                className={`relative p-2 rounded-2xl border transition shrink-0 cursor-pointer w-28 sm:w-32 flex flex-col items-center text-center ${
                  isChecked 
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/10' 
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 mb-1.5 relative">
                  <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                  {isPrimary && (
                    <span className="absolute bottom-0 inset-x-0 py-0.5 bg-indigo-600/90 text-white text-[8px] font-bold uppercase tracking-wider">
                      This Item
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-semibold text-white line-clamp-1 w-full">
                  {prod.title}
                </div>
                <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                  ₹{prod.priceINR.toLocaleString()}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Checkbox list and Bundle Price summary */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Checkbox selection */}
        <div className="space-y-1.5 text-xs">
          {allBundleProducts.map(prod => {
            const isChecked = selectedProductIds.includes(prod.id);
            const isPrimary = prod.id === primaryProduct.id;

            return (
              <label 
                key={prod.id} 
                className={`flex items-center gap-2 cursor-pointer select-none ${isPrimary ? 'cursor-default' : ''}`}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  disabled={isPrimary}
                  onChange={() => toggleProduct(prod.id)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span className={isChecked ? 'text-slate-200' : 'text-slate-500 line-through'}>
                  <strong className="text-white">{isPrimary ? 'This item:' : ''}</strong> {prod.title} ({currency === 'INR' ? `₹${prod.priceINR.toLocaleString()}` : `$${prod.priceUSD}`})
                </span>
              </label>
            );
          })}
        </div>

        {/* Pricing & Add Button */}
        <div className="flex items-center gap-4 self-end md:self-center shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">
              Total ({activeProducts.length} items):
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white font-mono">{priceStr}</span>
              {hasBundleDiscount && (
                <span className="text-xs text-slate-500 line-through font-mono">{origStr}</span>
              )}
            </div>
            {hasBundleDiscount && (
              <div className="text-[10px] font-semibold text-emerald-400 font-mono">
                Bundle Savings: {savingsStr} ({bundleDiscountPct}% OFF)
              </div>
            )}
          </div>

          <button
            onClick={handleAddBundle}
            disabled={addedSuccess}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
              addedSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-extrabold shadow-orange-500/20'
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Bundle Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Add Bundle to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
