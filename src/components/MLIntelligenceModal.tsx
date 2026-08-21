import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Target, 
  Users, 
  TrendingUp, 
  Percent, 
  Sparkles, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Layers, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Flame,
  ThumbsUp,
  ThumbsDown,
  ShoppingBag
} from 'lucide-react';
import { 
  AuthUser, 
  UserPersona, 
  Product, 
  MLOfferPrediction, 
  CustomerSegmentCluster, 
  DemandInventoryForecast, 
  PriceTrendForecast, 
  AspectSentimentScore 
} from '../types';

interface MLIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser;
  persona: UserPersona;
  allProducts: Product[];
  onOpenCoupons: () => void;
}

export const MLIntelligenceModal: React.FC<MLIntelligenceModalProps> = ({
  isOpen,
  onClose,
  authUser,
  persona,
  allProducts,
  onOpenCoupons
}) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'segmentation' | 'demand' | 'price_forecast' | 'aspect_sentiment'>('offers');
  
  // Offers state
  const [offerPredictions, setOfferPredictions] = useState<MLOfferPrediction[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState(25000);
  const [abandonmentCount, setAbandonmentCount] = useState(2);

  // Segmentation state
  const [allClusters, setAllClusters] = useState<CustomerSegmentCluster[]>([]);
  const [userCluster, setUserCluster] = useState<CustomerSegmentCluster | null>(null);

  // Demand state
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-acc-01');
  const [demandForecast, setDemandForecast] = useState<DemandInventoryForecast | null>(null);
  const [priceForecast, setPriceForecast] = useState<PriceTrendForecast | null>(null);
  const [aspectSentiments, setAspectSentiments] = useState<AspectSentimentScore[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchOfferPredictions();
      fetchCustomerSegments();
      if (allProducts.length > 0) {
        const initialProd = allProducts[0];
        setSelectedProductId(initialProd.id);
        fetchProductIntelligence(initialProd.id);
      }
    }
  }, [isOpen, persona.id, cartSubtotal, abandonmentCount]);

  const fetchOfferPredictions = async () => {
    try {
      const res = await fetch('/api/ml/personalized-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: persona.id,
          cartSubtotalINR: cartSubtotal,
          cartAbandonmentCount: abandonmentCount
        })
      });
      const data = await res.json();
      if (data.predictions) {
        setOfferPredictions(data.predictions);
      }
    } catch (err) {
      console.error('Failed to load offer predictions:', err);
    }
  };

  const fetchCustomerSegments = async () => {
    try {
      const res = await fetch(`/api/ml/customer-segments?userId=${persona.id}`);
      const data = await res.json();
      if (data.allClusters) {
        setAllClusters(data.allClusters);
        setUserCluster(data.userCluster);
      }
    } catch (err) {
      console.error('Failed to load customer segments:', err);
    }
  };

  const fetchProductIntelligence = async (pId: string) => {
    try {
      const [demRes, prcRes, aspRes] = await Promise.all([
        fetch(`/api/ml/products/${pId}/demand-forecast`),
        fetch(`/api/ml/products/${pId}/price-forecast`),
        fetch(`/api/ml/products/${pId}/aspect-sentiments`)
      ]);

      const demData = await demRes.json();
      const prcData = await prcRes.json();
      const aspData = await aspRes.json();

      if (demData.forecast) setDemandForecast(demData.forecast);
      if (prcData.forecast) setPriceForecast(prcData.forecast);
      if (aspData.aspectSentiments) setAspectSentiments(aspData.aspectSentiments);
    } catch (err) {
      console.error('Failed to load product intelligence:', err);
    }
  };

  const handleSelectProduct = (pId: string) => {
    setSelectedProductId(pId);
    fetchProductIntelligence(pId);
  };

  if (!isOpen) return null;

  const selectedProduct = allProducts.find(p => p.id === selectedProductId) || allProducts[0];

  return (
    <div id="ml-intelligence-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="ml-intelligence-modal-card" 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Machine Learning Intelligence Engine</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 rounded-full border border-emerald-500/30">
                  Live Production Model
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Personalized offer conversion probabilities, K-Means customer segmentation, demand velocity, and price forecasting.
              </p>
            </div>
          </div>

          <button
            id="close-ml-hub-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold">
          <button
            id="tab-ml-offers"
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'offers'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Percent className="w-4 h-4" />
            1. Personalized Offers ML
          </button>

          <button
            id="tab-ml-segmentation"
            onClick={() => setActiveTab('segmentation')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'segmentation'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            2. Customer Segmentation
          </button>

          <button
            id="tab-ml-demand"
            onClick={() => setActiveTab('demand')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'demand'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            3. Demand / Stockout Forecast
          </button>

          <button
            id="tab-ml-price-forecast"
            onClick={() => setActiveTab('price_forecast')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'price_forecast'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            4. Price Intelligence
          </button>

          <button
            id="tab-ml-aspect-sentiment"
            onClick={() => setActiveTab('aspect_sentiment')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all ${
              activeTab === 'aspect_sentiment'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            5. Aspect Sentiments
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: Personalized Offers / Rewards ML */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              {/* Persona Context Banner */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-900">Current Target Persona: {persona.name}</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-200/60 text-indigo-800 rounded-full">
                      {persona.role}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    ML features: Target Budget ₹{persona.targetBudgetINR.toLocaleString()}, Preferred: {persona.preferredCategories.join(', ')}.
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="text-slate-600 font-medium">Simulate Cart Subtotal:</label>
                  <select
                    value={cartSubtotal}
                    onChange={(e) => setCartSubtotal(Number(e.target.value))}
                    className="p-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold text-indigo-950"
                  >
                    <option value={8500}>₹8,500 (Accessories Basket)</option>
                    <option value={25000}>₹25,000 (Mid-Range)</option>
                    <option value={75000}>₹75,000 (Flagship Laptop)</option>
                  </select>
                </div>
              </div>

              {/* Conversion Probability Rankings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Model Output: Predicted Conversion Probability &amp; Expected Revenue
                  </h3>
                  <span className="text-xs text-slate-500">Sorted by Expected Value</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {offerPredictions.map((off) => (
                    <div
                      key={off.offerId}
                      className={`p-4 rounded-xl border transition-all ${
                        off.isBestOffer
                          ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            off.isBestOffer ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            <Percent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{off.offerName}</span>
                              {off.isBestOffer && (
                                <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300">
                                  ★ ML Recommended Choice
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{off.description}</div>
                          </div>
                        </div>

                        {/* Conversion Probability Meter */}
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="text-lg font-extrabold text-slate-900">
                              {off.conversionProbabilityPct}%
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Conversion Propensity</div>
                          </div>

                          <div className="w-24 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                off.conversionProbabilityPct >= 60 ? 'bg-emerald-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${off.conversionProbabilityPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Feature Evaluated Attribution Tags */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Feature Signals:</span>
                          {off.featuresEvaluated.map((f, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                              {f.name}: <strong>{f.value}</strong> ({f.weightPct}%)
                            </span>
                          ))}
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          Exp. Revenue: <strong>₹{off.expectedRevenueINR.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Customer Behavioral Segmentation */}
          {activeTab === 'segmentation' && (
            <div className="space-y-6">
              {/* User Current Cluster Header */}
              {userCluster && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-4">
                  <div className="p-3 bg-purple-600 text-white rounded-xl shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-purple-950">
                        Assigned Behavioral Cluster: {userCluster.name}
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-200 text-purple-800 rounded-full">
                        {Math.round(userCluster.clusterMatchScore * 100)}% Cluster Confidence
                      </span>
                    </div>
                    <p className="text-xs text-purple-800 mt-1">{userCluster.description}</p>
                    <div className="mt-2 text-xs text-purple-900 bg-purple-100/70 p-2 rounded-lg font-medium">
                      🎯 <strong>Recommended Strategic Action:</strong> {userCluster.recommendedStrategy}
                    </div>
                  </div>
                </div>
              )}

              {/* 6 K-Means Behavioral Clusters */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  K-Means Behavioral Cluster Taxonomy (6 Segments)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allClusters.map((cluster) => {
                    const isCurrent = userCluster?.segmentId === cluster.segmentId;
                    return (
                      <div
                        key={cluster.segmentId}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/30 shadow-sm'
                            : 'bg-white border-slate-200 opacity-90 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900">{cluster.name}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-full">
                              Active User
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">{cluster.description}</p>

                        <div className="space-y-1.5 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Price Sensitivity:</span>
                            <strong className="text-slate-800">{cluster.features.priceSensitivity}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Avg. Basket AOV:</span>
                            <strong className="text-slate-800">₹{cluster.features.averageOrderValueINR.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Coupon Usage:</span>
                            <strong className="text-slate-800">{cluster.features.couponUsageRate}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Optimal Incentive:</span>
                            <strong className="text-indigo-600">{cluster.optimalDiscountRange}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Demand & Inventory Forecast */}
          {activeTab === 'demand' && (
            <div className="space-y-6">
              {/* Product Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Select Product to Audit:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.brand} • {p.category}) — ₹{p.priceINR.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {demandForecast && (
                <div className="space-y-4">
                  {/* Urgent Sellout Banner */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    demandForecast.selloutRiskLevel === 'critical_sellout_imminent'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    <Flame className="w-6 h-6 text-rose-600 shrink-0" />
                    <div>
                      <div className="text-sm font-bold">{demandForecast.alertBannerText}</div>
                      <div className="text-xs opacity-90 mt-0.5">
                        Based on actual 7-day velocity ({demandForecast.dailyVelocity7d} units/day) against current inventory of {demandForecast.currentStock} units.
                      </div>
                    </div>
                  </div>

                  {/* Velocity Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-extrabold text-slate-900">{demandForecast.currentStock}</div>
                      <div className="text-xs text-slate-500 mt-1">Current Stock</div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-extrabold text-indigo-600">{demandForecast.dailyVelocity7d}</div>
                      <div className="text-xs text-slate-500 mt-1">Daily Sales Velocity</div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-extrabold text-rose-600">{demandForecast.estimatedDaysToStockout} Days</div>
                      <div className="text-xs text-slate-500 mt-1">Est. Days to Stockout</div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-2xl font-extrabold text-emerald-600">+{demandForecast.recommendRestockUnits} Units</div>
                      <div className="text-xs text-slate-500 mt-1">Recommended Re-order</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Price Intelligence Time-Series Forecast */}
          {activeTab === 'price_forecast' && (
            <div className="space-y-6">
              {/* Product Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Select Product for Time-Series Forecast:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} — ₹{p.priceINR.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {priceForecast && (
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {priceForecast.predictedTrend === 'decreasing' ? '📉 Price Drop Predicted' : priceForecast.predictedTrend === 'increasing' ? '📈 Price Hike Predicted' : '⚖️ Stable Pricing Window'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Model: {priceForecast.modelType} • Confidence Score: {Math.round(priceForecast.confidenceScore * 100)}%
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-extrabold text-indigo-600">
                        {priceForecast.probabilityPct}% Probability
                      </div>
                      <div className="text-[10px] text-slate-400">Next {priceForecast.horizonDays}-Day Horizon</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed">
                    💡 <strong>AI Explanation:</strong> {priceForecast.forecastExplanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Aspect-Based Review Sentiment */}
          {activeTab === 'aspect_sentiment' && (
            <div className="space-y-6">
              {/* Product Selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Select Product for Aspect Breakdown:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Extracted Aspect Sentiment Vectors
                  </h3>
                  <span className="text-xs text-slate-500">NLP Token Parsing</span>
                </div>

                <div className="space-y-3">
                  {aspectSentiments.map((asp, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{asp.aspect}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({asp.mentionCount} mentions)</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-emerald-600">{asp.positivePct}% Positive</span>
                          {asp.negativePct > 0 && <span className="text-rose-600">• {asp.negativePct}% Negative</span>}
                        </div>
                      </div>

                      {/* Bar Visualizer */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full" style={{ width: `${asp.positivePct}%` }} />
                        <div className="bg-slate-300 h-full" style={{ width: `${asp.neutralPct}%` }} />
                        <div className="bg-rose-500 h-full" style={{ width: `${asp.negativePct}%` }} />
                      </div>

                      {/* Sample Quotes */}
                      <div className="pt-2 text-[11px] text-slate-500 flex flex-wrap gap-2">
                        {asp.sampleQuotes.map((q, qIdx) => (
                          <span key={qIdx} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded italic text-slate-600">
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ML Models: Collaborative Filtering, K-Means Clustering, ARIMA/LSTM Time-Series, Aspect-NLP</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close ML Hub
          </button>
        </div>
      </div>
    </div>
  );
};
