import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Star, 
  Store, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Zap, 
  Award, 
  Clock 
} from 'lucide-react';
import { BuyBoxResult, BuyBoxListing, Currency } from '../types';

interface BuyBoxSellersSectionProps {
  productId: string;
  currency: Currency;
  onSelectSellerListing?: (listing: BuyBoxListing) => void;
}

export const BuyBoxSellersSection: React.FC<BuyBoxSellersSectionProps> = ({
  productId,
  currency,
  onSelectSellerListing
}) => {
  const [buyBoxData, setBuyBoxData] = useState<BuyBoxResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRepricing, setIsRepricing] = useState<boolean>(false);
  const [showAllSellers, setShowAllSellers] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<BuyBoxListing | null>(null);

  const fetchBuyBox = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/buybox/${productId}`);
      const data: BuyBoxResult = await res.json();
      setBuyBoxData(data);
      if (!selectedListing && data.winner) {
        setSelectedListing(data.winner);
      }
    } catch (err) {
      console.error('Failed to fetch Buy Box details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyBox();
  }, [productId]);

  const handleSimulateReprice = async () => {
    try {
      setIsRepricing(true);
      const res = await fetch('/api/buybox/repricer/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.result) {
        setBuyBoxData(data.result);
        setSelectedListing(data.result.winner);
        if (onSelectSellerListing) onSelectSellerListing(data.result.winner);
      }
    } catch (err) {
      console.error('Repricer error:', err);
    } finally {
      setIsRepricing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
        <span>Evaluating Multi-Merchant Buy Box...</span>
      </div>
    );
  }

  if (!buyBoxData || !buyBoxData.winner) return null;

  const current = selectedListing || buyBoxData.winner;
  const price = currency === 'INR' ? `₹${current.priceINR.toLocaleString()}` : `$${current.priceUSD.toLocaleString()}`;

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
      {/* Header with Winner Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Buy Box Winner</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                Score: {Math.round(current.buyBoxScore * 100)}/100
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Algorithmic Best Price &amp; Dispatch SLA</p>
          </div>
        </div>

        <button
          onClick={handleSimulateReprice}
          disabled={isRepricing}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono border border-slate-800 flex items-center gap-1 transition"
          title="Run dynamic repricer auction simulation"
        >
          <RefreshCw className={`h-3 w-3 ${isRepricing ? 'animate-spin' : ''}`} />
          <span>Simulate Reprice</span>
        </button>
      </div>

      {/* Winning Seller Box */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-white">{current.seller.name}</span>
            {current.seller.badges.map(b => (
              <span key={b} className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 text-[9px] font-mono border border-indigo-500/20">
                {b}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center text-amber-400 font-bold">
              <Star className="h-3 w-3 fill-current mr-0.5" />
              <span>{current.seller.rating}</span>
              <span className="text-slate-500 ml-1 font-normal">({current.seller.positiveFeedbackPct}% positive)</span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <Clock className="h-3 w-3" />
              <span>Delivers in {current.deliveryDays} {current.deliveryDays === 1 ? 'day (Prime)' : 'days'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right font-mono">
            <div className="font-bold text-sm text-white">{price}</div>
            <div className="text-[10px] text-emerald-400">
              {current.shippingCostINR === 0 ? 'FREE Express Delivery' : `+ ₹${current.shippingCostINR} delivery`}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Toggle for Other Sellers */}
      {buyBoxData.competingListings.length > 0 && (
        <div>
          <button
            onClick={() => setShowAllSellers(prev => !prev)}
            className="w-full py-1.5 text-xs text-slate-400 hover:text-white flex items-center justify-between transition"
          >
            <span className="flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-cyan-400" />
              <span>Compare {buyBoxData.totalSellersCount} Other Verified Merchants</span>
            </span>
            {showAllSellers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAllSellers && (
            <div className="mt-2 space-y-2 pt-2 border-t border-slate-800/80 animate-in fade-in">
              {buyBoxData.competingListings.map((listing) => {
                const isCurrent = selectedListing?.seller.id === listing.seller.id;
                const listPrice = currency === 'INR' ? `₹${listing.priceINR.toLocaleString()}` : `$${listing.priceUSD.toLocaleString()}`;

                return (
                  <div 
                    key={listing.seller.id}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between text-xs ${
                      isCurrent 
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">{listing.seller.name}</span>
                        <div className="flex items-center text-amber-400 font-bold text-[10px]">
                          <Star className="h-2.5 w-2.5 fill-current mr-0.5" />
                          {listing.seller.rating}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>ETA: {listing.deliveryDays} days</span>
                        <span>&bull;</span>
                        <span>City: {listing.seller.sellerCity}</span>
                        <span>&bull;</span>
                        <span className="font-mono">Score: {Math.round(listing.buyBoxScore * 100)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono text-xs font-bold text-white">
                        {listPrice}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          if (onSelectSellerListing) onSelectSellerListing(listing);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          isCurrent 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Selected' : 'Choose'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
