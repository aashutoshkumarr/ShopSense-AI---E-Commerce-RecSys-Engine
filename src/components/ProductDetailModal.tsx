import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Check, 
  ShoppingBag, 
  HelpCircle, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  RefreshCw,
  TrendingUp,
  Tag,
  Bell,
  CheckCircle2,
  Flame,
  RotateCcw,
  BarChart2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ScoredCandidate, 
  Currency, 
  Product, 
  UserPersona,
  DemandInventoryForecast,
  PriceTrendForecast,
  AspectSentimentScore
} from '../types';
import { ReviewsNLPSection } from './ReviewsNLPSection';
import { PriceHistoryGraph } from './PriceHistoryGraph';

interface ProductDetailModalProps {
  candidate: ScoredCandidate | null;
  currentPersona: UserPersona;
  currency: Currency;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onTrackEvent: (eventType: any, metadata?: any) => void;
  isAddedToCart?: boolean;
  onOpenReturns?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  candidate,
  currentPersona,
  currency,
  onClose,
  onAddToCart,
  onTrackEvent,
  isAddedToCart = false,
  onOpenReturns
}) => {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);
  const [targetAlertPrice, setTargetAlertPrice] = useState<number>(0);
  const [showAlertInput, setShowAlertInput] = useState<boolean>(false);

  // ML Intelligence State for Product
  const [demandForecast, setDemandForecast] = useState<DemandInventoryForecast | null>(null);
  const [priceForecast, setPriceForecast] = useState<PriceTrendForecast | null>(null);
  const [aspectSentiments, setAspectSentiments] = useState<AspectSentimentScore[]>([]);

  useEffect(() => {
    if (candidate?.product?.id) {
      fetchMLProductInsights(candidate.product.id);
    }
  }, [candidate?.product?.id]);

  const fetchMLProductInsights = async (productId: string) => {
    try {
      const [demRes, prcRes, aspRes] = await Promise.all([
        fetch(`/api/ml/products/${productId}/demand-forecast`),
        fetch(`/api/ml/products/${productId}/price-forecast`),
        fetch(`/api/ml/products/${productId}/aspect-sentiments`)
      ]);
      const demData = await demRes.json();
      const prcData = await prcRes.json();
      const aspData = await aspRes.json();

      if (demData.forecast) setDemandForecast(demData.forecast);
      if (prcData.forecast) setPriceForecast(prcData.forecast);
      if (aspData.aspectSentiments) setAspectSentiments(aspData.aspectSentiments);
    } catch (err) {
      console.error('Failed to load product ML intelligence:', err);
    }
  };

  if (!candidate) return null;

  const { product, rankingScore, finalScore, featureAttributions, businessRuleResults, candidateSources } = candidate;

  const price = currency === 'INR' ? `₹${product.priceINR.toLocaleString()}` : `$${product.priceUSD.toLocaleString()}`;
  const originalPrice = currency === 'INR' ? `₹${product.originalPriceINR.toLocaleString()}` : `$${product.originalPriceUSD.toLocaleString()}`;
  const discountPct = Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100);

  const handleCreatePriceAlert = async () => {
    const alertTarget = targetAlertPrice || Math.round(product.priceINR * 0.9);
    try {
      const res = await fetch('/api/alerts/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          targetPriceINR: alertTarget,
          userId: currentPersona.id
        })
      });
      const data = await res.json();
      setAlertSuccessMsg(`Alert active! We'll ping you if ${product.title.slice(0, 20)} drops below ₹${alertTarget.toLocaleString()}`);
      setShowAlertInput(false);
      setTimeout(() => setAlertSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Price alert error:', err);
    }
  };

  const handleCreateStockAlert = async () => {
    try {
      const res = await fetch('/api/alerts/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: currentPersona.id
        })
      });
      const data = await res.json();
      setAlertSuccessMsg(`Stock tracker active! We'll alert you the moment ${product.title.slice(0, 20)} is restocked.`);
      setTimeout(() => setAlertSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Stock alert error:', err);
    }
  };

  const handleFetchAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/explain-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: currentPersona.id,
          candidateScoreData: {
            rankingScore,
            finalScore,
            featureAttributions,
            businessRuleResults
          }
        })
      });
      const data = await res.json();
      setAiExplanation(data.explanation);
      onTrackEvent('explain_recommendation_view', { productId: product.id });
    } catch (err) {
      console.error('Explain failed:', err);
      setAiExplanation('This product was ranked highly due to strong semantic alignment with your tech requirements and brand preferences.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSimulatePurchase = () => {
    setPurchaseSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onTrackEvent('purchase', {
      productId: product.id,
      productTitle: product.title,
      priceINR: product.priceINR,
      category: product.category
    });
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/30">
              Rank #{candidate.rank || 1}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Score: {Math.round((finalScore || 0.85) * 100)}% Match
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Main Product Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="px-2.5 py-1 rounded-md bg-indigo-600/90 text-white font-medium text-xs shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">
                    {product.brand}
                  </span>
                  <span className="text-slate-400 font-mono">{product.category}</span>
                </div>

                <h2 className="text-xl font-bold text-white leading-snug">
                  {product.title}
                </h2>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                  <div className="flex items-center text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 font-bold text-xs">{product.rating}</span>
                  </div>
                  <span className="text-slate-500">({product.reviewCount} verified reviews)</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-medium">
                    {product.inStock ? `${product.stockCount} in stock` : 'Out of stock'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {product.description}
                </p>

                {/* ⚡ Demand & Inventory Sellout Alert Banner */}
                {demandForecast && (
                  <div className={`mt-3 p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                    demandForecast.selloutRiskLevel === 'critical_sellout_imminent'
                      ? 'bg-rose-950/70 border-rose-800/80 text-rose-200'
                      : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-200'
                  }`}>
                    <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold">{demandForecast.alertBannerText}</span>
                      <span className="text-[10px] opacity-80 block">
                        Sales Velocity: {demandForecast.dailyVelocity7d} units/day • Stock: {demandForecast.currentStock} left
                      </span>
                    </div>
                  </div>
                )}

                {/* Price Section */}
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white font-mono">{price}</span>
                    {discountPct > 0 && (
                      <span className="ml-2 text-xs text-slate-500 line-through font-mono">
                        {originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {discountPct > 0 && (
                      <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 font-mono">
                        Save {discountPct}%
                      </span>
                    )}
                    {priceForecast && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        priceForecast.predictedTrend === 'decreasing'
                          ? 'bg-indigo-950 text-cyan-300 border-cyan-800'
                          : priceForecast.predictedTrend === 'increasing'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {priceForecast.predictedTrend === 'decreasing' ? `📉 ${priceForecast.probabilityPct}% Drop Forecast` : `⚖️ ${priceForecast.probabilityPct}% Price Stable`}
                      </span>
                    )}
                  </div>
                </div>

                {/* 🛡️ 7-Day Guarantee & Doorstep Replacement Trust Badge */}
                <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span><strong>7-Day Doorstep Replacement</strong> &amp; Instant Wallet Refund</span>
                  </div>
                  {onOpenReturns && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReturns();
                      }}
                      className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Policy Details
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!product.inStock}
                  className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    isAddedToCart
                      ? 'bg-emerald-600 text-white'
                      : product.inStock
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isAddedToCart ? 'Added to Cart' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleSimulatePurchase}
                  disabled={!product.inStock || purchaseSuccess}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Check className="h-4 w-4" />
                  {purchaseSuccess ? 'Purchased (Event Logged)' : 'Instant Buy'}
                </button>
              </div>

            </div>

          </div>

          {/* 📈 Price History & Market Intelligence (Recharts Analytics) */}
          <PriceHistoryGraph
            productId={product.id}
            currency={currency}
            currentPersona={currentPersona}
            userId={currentPersona?.id}
            onPriceAlertCreated={() => {
              onTrackEvent('price_alert_created', { productId: product.id });
            }}
          />

          {/* Machine Learning Feature Explainability & Attribution Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-900/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Why was this recommended for {currentPersona.name}?</h3>
                  <p className="text-[11px] text-slate-400">
                    Transparent ML feature importance decomposition (SHAP attribution)
                  </p>
                </div>
              </div>

              <button
                onClick={handleFetchAiExplanation}
                disabled={loadingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
              >
                {loadingAi ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>{loadingAi ? 'Synthesizing...' : 'Explain with Gemini AI'}</span>
              </button>
            </div>

            {/* AI Explanation Box */}
            {aiExplanation && (
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-xs text-indigo-200 leading-relaxed animate-in fade-in">
                <span className="font-semibold text-cyan-300 block mb-1">AI Recommendation Context:</span>
                {aiExplanation}
              </div>
            )}

            {/* Attribution Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {featureAttributions?.map((attr) => (
                <div key={attr.featureName} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{attr.featureName}</span>
                    <span className="font-mono text-cyan-400 font-bold">+{attr.percentage}% share</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, attr.percentage * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Candidate Sources & Business Rules Pass List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">Retrieval Channels:</span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateSources?.map((s) => (
                    <span key={s.source} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px]">
                      {s.source.replace('_', ' ')} (Score: {(s.normalizedScore * 100).toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">Business Rules Checked:</span>
                <div className="flex flex-wrap gap-1.5">
                  {businessRuleResults?.map((r, rIdx) => (
                    <span key={rIdx} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 font-mono text-[10px]">
                      ✓ {r.ruleName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Technical Specs Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between">
                  <span className="text-slate-400 font-medium">{key}</span>
                  <span className="text-slate-200 font-mono text-right max-w-[200px]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Key Hardware &amp; Software Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {product.features.map((feat, fIdx) => (
                <div key={fIdx} className="flex items-center gap-2 text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Toast Feedback */}
          {alertSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              {alertSuccessMsg}
            </div>
          )}

          {/* Price & Stock Alert Action Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Bell className="h-4 w-4 text-amber-400" />
              <span>Smart Price &amp; Stock Monitoring</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showAlertInput ? (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input 
                    type="number"
                    placeholder={`Target INR (e.g. ${Math.round(product.priceINR * 0.9)})`}
                    value={targetAlertPrice || ''}
                    onChange={(e) => setTargetAlertPrice(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono w-36 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleCreatePriceAlert}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition active:scale-95"
                  >
                    Set Alert
                  </button>
                  <button
                    onClick={() => setShowAlertInput(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAlertInput(true)}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Bell className="h-3.5 w-3.5" /> Notify on Price Drop
                </button>
              )}

              {!product.inStock && (
                <button
                  onClick={handleCreateStockAlert}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Bell className="h-3.5 w-3.5" /> Back-in-Stock Alert
                </button>
              )}
            </div>
          </div>

          {/* 📊 Granular Aspect-Based Sentiment Breakdown */}
          {aspectSentiments.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Aspect-Based Customer Sentiment
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">NLP Token Extraction</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {aspectSentiments.map((asp, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{asp.aspect}</span>
                      <span className={`font-mono text-[11px] font-bold ${asp.positivePct >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {asp.positivePct}% Positive
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-400 h-full" style={{ width: `${asp.positivePct}%` }} />
                      <div className="bg-slate-700 h-full" style={{ width: `${asp.neutralPct}%` }} />
                      <div className="bg-rose-500 h-full" style={{ width: `${asp.negativePct}%` }} />
                    </div>
                    {asp.sampleQuotes.length > 0 && (
                      <p className="text-[10px] text-slate-400 italic truncate">
                        "{asp.sampleQuotes[0]}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ⭐ AI NLP Reviews & Verified Submissions */}
          <div className="pt-2 border-t border-slate-800">
            <ReviewsNLPSection
              productId={product.id}
              productTitle={product.title}
              userId={currentPersona.id}
              userName={currentPersona.name}
              userAvatar={currentPersona.avatar}
              onReviewSubmitted={() => {
                onTrackEvent('product_rating', { productId: product.id });
              }}
            />
          </div>

        </div>

      </div>
    </div>
  );
};
