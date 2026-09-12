import React, { useState } from 'react';
import { 
  Store, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Award, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  RefreshCw, 
  Plus, 
  ArrowUpRight, 
  Zap,
  BarChart3,
  ShieldCheck,
  Tag,
  Clock,
  Truck
} from 'lucide-react';
import { Product, Currency } from '../../types';

interface SellerCenterViewProps {
  products: Product[];
  currency: Currency;
  onBackToStorefront: () => void;
}

interface SellerListing {
  id: string;
  productId: string;
  title: string;
  brand: string;
  category: string;
  priceINR: number;
  stockCount: number;
  buyBoxScore: number;
  isBuyBoxWinner: boolean;
  minMarginFloorINR: number;
  fulfillmentType: 'Fulfillment by ShopSense' | 'Merchant Fulfilled';
  salesCount: number;
}

export const SellerCenterView: React.FC<SellerCenterViewProps> = ({
  products,
  currency,
  onBackToStorefront
}) => {
  // Convert catalog products into merchant listings
  const [listings, setListings] = useState<SellerListing[]>(() => {
    return products.slice(0, 10).map((p, idx) => ({
      id: `m-list-${p.id}`,
      productId: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      priceINR: p.priceINR,
      stockCount: p.stockCount,
      buyBoxScore: Math.round((0.85 + (idx % 3) * 0.05) * 100) / 100,
      isBuyBoxWinner: idx % 2 === 0,
      minMarginFloorINR: Math.round(p.priceINR * 0.75),
      fulfillmentType: idx % 2 === 0 ? 'Fulfillment by ShopSense' : 'Merchant Fulfilled',
      salesCount: 42 + idx * 18
    }));
  });

  const [repricingStrategy, setRepricingStrategy] = useState<'aggressive' | 'balanced' | 'profit_max'>('balanced');
  const [isRepricingRunning, setIsRepricingRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<{ headline: string; tags: string[]; suggestedPriceINR: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'repricer' | 'ai_assistant' | 'metrics'>('listings');

  // Handle manual price edit
  const handlePriceChange = (listingId: string, delta: number) => {
    setListings(prev => prev.map(item => {
      if (item.id !== listingId) return item;
      const newPrice = Math.max(item.minMarginFloorINR, item.priceINR + delta);
      return {
        ...item,
        priceINR: newPrice,
        isBuyBoxWinner: newPrice <= item.priceINR ? true : item.isBuyBoxWinner
      };
    }));
  };

  // Run dynamic repricer round
  const handleTriggerRepricer = () => {
    setIsRepricingRunning(true);
    setTimeout(() => {
      setListings(prev => prev.map(item => {
        // Drop price by 2% to win Buy Box if above floor
        const discount = repricingStrategy === 'aggressive' ? 0.04 : repricingStrategy === 'balanced' ? 0.02 : 0.01;
        const targetPrice = Math.max(item.minMarginFloorINR, Math.round(item.priceINR * (1 - discount)));
        return {
          ...item,
          priceINR: targetPrice,
          isBuyBoxWinner: true,
          buyBoxScore: Math.min(0.99, item.buyBoxScore + 0.04)
        };
      }));
      setIsRepricingRunning(false);
    }, 800);
  };

  // AI Listing Optimizer
  const handleGenerateAiListing = () => {
    if (!aiPrompt.trim()) return;
    setAiSuggestions({
      headline: `✨ Verified: ${aiPrompt} — High Performance & Next-Day Dispatch`,
      tags: ['top-rated', 'express-delivery', 'flagship', 'best-value'],
      suggestedPriceINR: 24999
    });
  };

  const totalRevenue = listings.reduce((acc, l) => acc + l.priceINR * l.salesCount, 0);
  const buyBoxWinCount = listings.filter(l => l.isBuyBoxWinner).length;
  const buyBoxWinRate = Math.round((buyBoxWinCount / listings.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              <Store className="h-3.5 w-3.5 text-indigo-400" />
              <span>COMMERCE OS &bull; MERCHANT CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              TechZone Direct Seller Portal
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Automated Buy Box repricing, multi-channel inventory allocation, and AI listing optimization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStorefront}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              Back to Storefront
            </button>
            <button
              onClick={handleTriggerRepricer}
              disabled={isRepricingRunning}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRepricingRunning ? 'animate-spin' : ''}`} />
              <span>{isRepricingRunning ? 'Repricing...' : 'Run Auto-Repricer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total GMV</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">↑ +18.4% this month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Buy Box Win Rate</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{buyBoxWinRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{buyBoxWinCount} of {listings.length} listings winning</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>On-Time Delivery SLA</span>
            <Truck className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">99.4%</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">FastTrack Fulfillment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Cancellation Rate</span>
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">0.3%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Tier 1 Elite Merchant</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'listings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Active Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('repricer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'repricer'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          Buy Box AI Repricer
        </button>
        <button
          onClick={() => setActiveTab('ai_assistant')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'ai_assistant'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          AI Listing Optimizer
        </button>
      </div>

      {/* TAB CONTENT 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Your Catalog Inventory &amp; Buy Box Status</h3>
            <span className="text-xs text-slate-500">Auto-synced with Fulfillment Engine</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Margin Floor</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Buy Box</th>
                  <th className="px-4 py-3">Fulfillment</th>
                  <th className="px-4 py-3 text-right">Quick Reprice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                      {l.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                        {l.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      ₹{l.priceINR.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">
                      ₹{l.minMarginFloorINR.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.stockCount > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {l.stockCount} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.isBuyBoxWinner ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Winner ({Math.round(l.buyBoxScore * 100)}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                          Competitor ({Math.round(l.buyBoxScore * 100)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      {l.fulfillmentType === 'Fulfillment by ShopSense' ? (
                        <span className="text-indigo-600 font-semibold">⚡ Prime (FastTrack)</span>
                      ) : (
                        <span className="text-slate-500">Merchant Hub</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handlePriceChange(l.id, -200)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs"
                          title="Lower price by ₹200"
                        >
                          -₹200
                        </button>
                        <button
                          onClick={() => handlePriceChange(l.id, 200)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs"
                          title="Raise price by ₹200"
                        >
                          +₹200
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: BUY BOX REPRICER */}
      {activeTab === 'repricer' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Automated Algorithmic Repricing Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Maintains Buy Box win rate while strictly protecting merchant profit margin floors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => setRepricingStrategy('aggressive')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                repricingStrategy === 'aggressive'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">Aggressive Match</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">4% Cut</span>
              </div>
              <p className="text-xs text-slate-600">
                Undercuts competitor prices aggressively to capture 95%+ Buy Box share on trending tech SKUs.
              </p>
            </div>

            <div 
              onClick={() => setRepricingStrategy('balanced')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                repricingStrategy === 'balanced'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">Balanced Optimizer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">2% Cut</span>
              </div>
              <p className="text-xs text-slate-600">
                Balances Buy Box probability with profit margins. Recommended for steady volume.
              </p>
            </div>

            <div 
              onClick={() => setRepricingStrategy('profit_max')}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                repricingStrategy === 'profit_max'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">Profit Maximizer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">1% Cut</span>
              </div>
              <p className="text-xs text-slate-600">
                Prioritizes gross margin. Reprices up when competitors stock is depleted.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleTriggerRepricer}
              disabled={isRepricingRunning}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRepricingRunning ? 'animate-spin' : ''}`} />
              <span>Apply Repricing Strategy to All Listings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: AI LISTING OPTIMIZER */}
      {activeTab === 'ai_assistant' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Listing &amp; Catalog Optimizer
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Generates high-converting product headlines, search tags, and competitive pricing analysis.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700">Enter Product Details or Brand/Model:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Studio Headphones ANC Bluetooth 5.2"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                onClick={handleGenerateAiListing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Optimize Listing</span>
              </button>
            </div>
          </div>

          {aiSuggestions && (
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">AI Generated Copy &amp; Metadata:</span>
                <span className="text-[11px] font-mono font-bold text-purple-700">
                  Recommended Price: ₹{aiSuggestions.suggestedPriceINR.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{aiSuggestions.headline}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {aiSuggestions.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-800 text-[10px] font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
