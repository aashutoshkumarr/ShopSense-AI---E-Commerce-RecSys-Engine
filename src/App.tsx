import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Search, 
  Layers, 
  Cpu, 
  FileText, 
  Filter, 
  ShoppingBag, 
  Zap, 
  RefreshCw, 
  Bot, 
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  Sliders,
  Heart,
  PackageCheck,
  ShieldCheck,
  Package,
  Database,
  GitCompare,
  Activity,
  ChevronRight,
  Info,
  Wallet,
  Crown,
  Tag,
  Users,
  Bell,
  BarChart3
} from 'lucide-react';
import { 
  Product, 
  UserPersona, 
  Currency, 
  PipelineExecutionResult, 
  ScoredCandidate, 
  PipelineConfig, 
  StructuredIntent,
  UserRole,
  AuthUser,
  EventType
} from './types';
import { mockPersonas } from './data/personas';
import { Header, MainTabType } from './components/Header';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { ProductCard } from './components/ProductCard';
import { PipelineInspector } from './components/PipelineInspector';
import { OfflineMLHub } from './components/OfflineMLHub';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { AIChatDrawer } from './components/AIChatDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PipelineSettingsModal } from './components/PipelineSettingsModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { AdminControlCenter } from './components/AdminControlCenter';
import { AdminProductManager } from './components/AdminProductManager';
import { ProductIngestionHub } from './components/ProductIngestionHub';
import { ABTestingHub } from './components/ABTestingHub';
import { MLScorecardHub } from './components/MLScorecardHub';
import { LiveEventStream } from './components/LiveEventStream';
import { WalletDrawer } from './components/WalletDrawer';
import { LoyaltyRewardsModal } from './components/LoyaltyRewardsModal';
import { CouponsOffersModal } from './components/CouponsOffersModal';
import { ReferralCenterModal } from './components/ReferralCenterModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { PersonalizedHomeSections } from './components/PersonalizedHomeSections';
import { CustomerSupportModal } from './components/CustomerSupportModal';
import { ReturnReplaceModal } from './components/ReturnReplaceModal';
import { MLIntelligenceModal } from './components/MLIntelligenceModal';
import { defaultPipelineConfig } from './engine/recommendationEngine';

export function App() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<MainTabType>('storefront');

  // Role & Session State
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [authUser, setAuthUser] = useState<AuthUser>({
    id: 'usr-01',
    name: 'Alex Kumar',
    email: 'alex.kumar@recsys.ai',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'user-dev-alex',
    token: 'mock_jwt_token_2026',
    refreshToken: 'mock_refresh_token_2026',
    permissions: ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations']
  });

  // User & Currency
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(mockPersonas[0]);
  const [currency, setCurrency] = useState<Currency>('INR');

  // Search & Intent NLP
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessingIntent, setIsProcessingIntent] = useState<boolean>(false);
  const [activeIntent, setActiveIntent] = useState<StructuredIntent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Data & Pipeline State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(null);
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>(defaultPipelineConfig);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState<boolean>(true);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-aud-01', 'prod-lap-03']);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  // Orders State
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [orderCount, setOrderCount] = useState<number>(1);

  // Fintech & Engagement Modals & Drawers
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState<boolean>(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [appliedCouponFromModal, setAppliedCouponFromModal] = useState<string>('');

  // Customer Support, Returns & ML Intelligence State
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [preselectedReturnOrder, setPreselectedReturnOrder] = useState<any>(null);
  const [isMLIntelligenceOpen, setIsMLIntelligenceOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [selectedCandidate, setSelectedCandidate] = useState<ScoredCandidate | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [explainCandidate, setExplainCandidate] = useState<ScoredCandidate | null>(null);
  const [explainText, setExplainText] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Fetch initial products and recommendations
  const fetchRecommendations = useCallback(async (customIntent?: StructuredIntent | null, currentConfig?: PipelineConfig) => {
    setIsLoadingPipeline(true);
    try {
      const configToUse = currentConfig || pipelineConfig;
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentPersona.id,
          intent: customIntent !== undefined ? customIntent : activeIntent,
          config: configToUse
        })
      });
      const data: PipelineExecutionResult = await res.json();
      setPipelineResult(data);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoadingPipeline(false);
    }
  }, [currentPersona.id, activeIntent, pipelineConfig]);

  // Initial load
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        if (d.products) setAllProducts(d.products);
      })
      .catch(console.error);

    fetchRecommendations();
  }, [fetchRecommendations]);

  // Track user event helper
  const trackEvent = async (eventType: EventType, metadata: Record<string, any> = {}) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentPersona.id,
          eventType,
          productId: metadata.productId,
          productTitle: metadata.productTitle,
          ratingValue: metadata.ratingValue,
          metadata
        })
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  };

  // Switch active role
  const handleSwitchRole = (role: UserRole) => {
    setActiveRole(role);
    setAuthUser(prev => ({
      ...prev,
      role,
      permissions: role === 'admin'
        ? ['products', 'categories', 'inventory', 'users', 'recommendation_analytics', 'experiments', 'model_versions']
        : role === 'ml_analyst'
        ? ['model_metrics', 'experiments', 'recommendation_performance', 'training_runs']
        : ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations']
    }));

    if (role === 'admin' || role === 'ml_analyst') {
      setActiveTab('admin_control');
    } else {
      setActiveTab('storefront');
    }
  };

  // Handle Intent Search submission
  const handleIntentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setActiveIntent(null);
      fetchRecommendations(null);
      return;
    }

    setIsProcessingIntent(true);
    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      const extractedIntent: StructuredIntent = data.intent;
      setActiveIntent(extractedIntent);
      trackEvent('search', { query: searchQuery, parsedCategory: extractedIntent.category });
      await fetchRecommendations(extractedIntent);
    } catch (err) {
      console.error('Failed to parse intent:', err);
    } finally {
      setIsProcessingIntent(false);
    }
  };

  // Preset quick prompt click
  const handlePresetQuery = (prompt: string) => {
    setSearchQuery(prompt);
    setIsProcessingIntent(true);
    fetch('/api/parse-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: prompt })
    })
      .then(r => r.json())
      .then(d => {
        setActiveIntent(d.intent);
        trackEvent('search', { query: prompt });
        fetchRecommendations(d.intent);
      })
      .catch(console.error)
      .finally(() => setIsProcessingIntent(false));
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => [...prev, product]);
    trackEvent('add_to_cart', {
      productId: product.id,
      productTitle: product.title,
      priceINR: product.priceINR,
      category: product.category
    });
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      trackEvent('wishlist_add', { productId, action: exists ? 'removed' : 'added' });
      return updated;
    });
  };

  // Open explanation modal
  const handleExplainCandidate = async (candidate: ScoredCandidate) => {
    setExplainCandidate(candidate);
    setIsExplaining(true);
    setExplainText(null);

    try {
      const res = await fetch('/api/explain-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: candidate.product.id,
          userId: currentPersona.id,
          candidateScoreData: {
            rankingScore: candidate.rankingScore,
            finalScore: candidate.finalScore,
            featureAttributions: candidate.featureAttributions,
            businessRuleResults: candidate.businessRuleResults
          }
        })
      });
      const data = await res.json();
      setExplainText(data.explanation);
      trackEvent('explain_recommendation_view', { productId: candidate.product.id });
    } catch (err) {
      setExplainText('Ranked top-tier based on semantic intent similarity, category affinity, and positive collaborative filtering signals.');
    } finally {
      setIsExplaining(false);
    }
  };

  const categories = ['All', 'Laptops', 'Audio', 'Smartphones', 'Smart Home', 'Gaming', 'Accessories', 'Wearables'];

  const filteredCandidates = (pipelineResult?.topKResults || []).filter(c => {
    if (selectedCategory === 'All') return true;
    return c.product.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      
      {/* 1. Fast Role Switcher Bar (Customer, Admin, ML/Analyst) */}
      <RoleSwitcherBar
        currentUser={authUser}
        onSwitchRole={handleSwitchRole}
        activeRole={activeRole}
      />

      {/* 2. Top Universal App Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentPersona={currentPersona}
        allPersonas={mockPersonas}
        onSelectPersona={p => {
          setCurrentPersona(p);
          handleSwitchRole(activeRole);
        }}
        currency={currency}
        onToggleCurrency={() => setCurrency(prev => prev === 'INR' ? 'USD' : 'INR')}
        cartCount={cartItems.length}
        wishlistCount={wishlistIds.length}
        ordersCount={orderCount}
        activeRole={activeRole}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onOpenCoupons={() => setIsCouponsOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenReturns={() => {
          setPreselectedReturnOrder(null);
          setIsReturnModalOpen(true);
        }}
        onOpenMLIntelligence={() => setIsMLIntelligenceOpen(true)}
      />

      {/* 3. Main View Router */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: STOREFRONT */}
        {activeTab === 'storefront' && (
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
            
            {/* Natural Language Intent Search & Persona Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-slate-800 p-6 md:p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-8 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Personalized for {currentPersona.name} ({currentPersona.role})
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Budget Target: {currency === 'INR' ? `₹${currentPersona.targetBudgetINR.toLocaleString()}` : `$${currentPersona.targetBudgetUSD.toLocaleString()}`}
                  </span>
                  <span className="text-xs text-purple-300 font-mono">
                    &bull; Active Ranker: LightGBM GBDT (Variant B)
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  High-Precision AI Recommendation Engine
                </h1>
                
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Decoupled architecture: Natural language queries parse into structured JSON constraints &rarr; Multi-channel candidate generation (Content + Collaborative + Session + Trending) &rarr; Online LightGBM LambdaMART ranking &rarr; Inventory &amp; MMR business rules.
                </p>

                {/* Natural Language Intent Search Input */}
                <form onSubmit={handleIntentSearch} className="pt-2">
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400">
                      <Search className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Try natural language: "I need a laptop for Java, React and Python under ₹70,000" or "Sony ANC headphones"'
                      className="w-full pl-11 pr-32 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={isProcessingIntent}
                      className="absolute right-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                    >
                      {isProcessingIntent ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Parsing Intent...</span>
                        </>
                      ) : (
                        <>
                          <span>AI Search</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Preset NL queries */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Quick Prompts:</span>
                  {[
                    "Laptop for Java, React & Python under ₹70,000",
                    "Mechanical keyboard with tactile switches",
                    "Noise cancelling headphones for travel",
                    "Smart home ambient lighting setup"
                  ].map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handlePresetQuery(prompt)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Extracted Intent Pill (When Active) */}
                {activeIntent && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-cyan-500/40 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                        Structured Intent Extracted:
                      </span>
                      {activeIntent.category && (
                        <span className="text-slate-300">Category: <strong className="text-white">{activeIntent.category}</strong></span>
                      )}
                      {activeIntent.targetBudgetINR && (
                        <span className="text-slate-300">Max Budget: <strong className="text-emerald-400">₹{activeIntent.targetBudgetINR.toLocaleString()}</strong></span>
                      )}
                      {activeIntent.requiredFeatures && activeIntent.requiredFeatures.length > 0 && (
                        <span className="text-slate-300">Specs: <strong className="text-cyan-300">{activeIntent.requiredFeatures.join(', ')}</strong></span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveIntent(null);
                        setSearchQuery('');
                        fetchRecommendations(null);
                      }}
                      className="text-slate-400 hover:text-white underline text-[11px]"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 🌟 Dynamic Personalized Home Sections (Spotlight, Because You Viewed, ML Offers) */}
            <PersonalizedHomeSections
              currentPersona={currentPersona}
              userId={currentPersona.id}
              currency={currency}
              onSelectProduct={(p) => {
                const cand = (pipelineResult?.topKResults || []).find(c => c.product.id === p.id);
                if (cand) setSelectedCandidate(cand);
                else {
                  setSelectedCandidate({
                    product: p,
                    rankingScore: 0.95,
                    finalScore: 0.95,
                    rank: 1,
                    candidateSources: [{ source: 'content_based', rawScore: 0.9, normalizedScore: 0.9 }],
                    featureAttributions: [{ featureName: 'Category Affinity', value: 0.9, weight: 0.4, percentage: 40 }],
                    businessRuleResults: [{ ruleName: 'InStockCheck', passed: true, scoreModifier: 1 }]
                  });
                }
              }}
              onAddToCart={handleAddToCart}
              onOpenCouponsModal={() => setIsCouponsOpen(true)}
              onOpenLoyaltyModal={() => setIsLoyaltyOpen(true)}
            />

            {/* Category Filter Pills */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Showing <strong className="text-white">{filteredCandidates.length}</strong> top-ranked candidates
              </div>
            </div>

            {/* Recommended Products Grid */}
            {isLoadingPipeline ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
                <div className="text-sm font-semibold text-slate-300">
                  Executing 4-Stage Candidate Retrieval &amp; Online GBDT Ranking...
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  pgvector ANN &bull; Collaborative Matrix Factorization &bull; MMR Diversity Boost
                </p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-900/50 rounded-3xl border border-slate-800">
                <p className="text-sm">No candidates matched the current category filter.</p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Show All Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredCandidates.map(candidate => (
                  <ProductCard
                    key={candidate.product.id}
                    candidate={candidate}
                    currency={currency}
                    isWishlisted={wishlistIds.includes(candidate.product.id)}
                    isAddedToCart={cartItems.some(i => i.id === candidate.product.id)}
                    onSelect={() => setSelectedCandidate(candidate)}
                    onAddToCart={() => handleAddToCart(candidate.product)}
                    onToggleWishlist={() => handleToggleWishlist(candidate.product.id)}
                    onExplain={() => handleExplainCandidate(candidate)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: UNIFIED ADMIN & ML CONTROL CENTER */}
        {(activeTab === 'admin_control' || activeTab === 'admin_products' || activeTab === 'admin_ingestion' || activeTab === 'ab_testing' || activeTab === 'offline_ml' || activeTab === 'event_stream') && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <AdminControlCenter
              currency={currency}
              onRefreshCatalog={() => {
                fetch('/api/products')
                  .then(r => r.json())
                  .then(d => { if (d.products) setAllProducts(d.products); });
                fetchRecommendations();
              }}
              onSelectProductDetails={(prodId) => {
                const cand = (pipelineResult?.topKResults || []).find(c => c.product.id === prodId);
                if (cand) setSelectedCandidate(cand);
              }}
            />
          </div>
        )}

        {/* VIEW 3: PIPELINE INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {pipelineResult ? (
              <PipelineInspector
                pipelineResult={pipelineResult}
                currency={currency}
                currentPersona={currentPersona}
                onSelectProduct={(candidate) => setSelectedCandidate(candidate)}
              />
            ) : (
              <div className="py-20 text-center text-slate-400">Loading pipeline telemetry...</div>
            )}
          </div>
        )}

        {/* VIEW 4: ARCHITECTURE BLUEPRINT */}
        {activeTab === 'architecture' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <ArchitectureDiagram />
          </div>
        )}

      </main>

      {/* Cart Drawer with Split Wallet Pay & Co-Purchases */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currency={currency}
        currentPersona={currentPersona}
        onRemoveItem={id => setCartItems(prev => prev.filter(i => i.id !== id))}
        onAddToCart={handleAddToCart}
        onClearCart={() => setCartItems([])}
        onOrderPlaced={(newOrder) => {
          setOrderCount(prev => prev + 1);
          fetchRecommendations();
        }}
        onOpenCouponsModal={() => setIsCouponsOpen(true)}
        onOpenWalletDrawer={() => setIsWalletOpen(true)}
        initialCouponCode={appliedCouponFromModal}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={id => setWishlistIds(prev => prev.filter(wId => wId !== id))}
        onMoveToCart={prod => {
          handleAddToCart(prod);
          setWishlistIds(prev => prev.filter(wId => wId !== prod.id));
        }}
        currency={currency}
      />

      {/* Orders History & Live Tracking Modal */}
      <OrdersHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currency={currency}
        userId={currentPersona.id}
        onRatingLogged={() => fetchRecommendations()}
        onWalletUpdated={() => {}}
        onOpenReturnWorkflow={(ord) => {
          setPreselectedReturnOrder(ord);
          setIsOrdersOpen(false);
          setIsReturnModalOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      {selectedCandidate && (
        <ProductDetailModal
          candidate={selectedCandidate}
          currency={currency}
          currentPersona={currentPersona}
          onClose={() => setSelectedCandidate(null)}
          onAddToCart={handleAddToCart}
          onTrackEvent={trackEvent}
          isAddedToCart={cartItems.some(i => i.id === selectedCandidate.product.id)}
          onOpenReturns={() => setIsReturnModalOpen(true)}
        />
      )}

      {/* Customer Support & Help Center Modal */}
      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        authUser={authUser}
        onOpenAIChat={() => {
          setIsSupportOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* Return & Replacement Workflow Hub */}
      <ReturnReplaceModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setPreselectedReturnOrder(null);
        }}
        authUser={authUser}
        currency={currency}
        preselectedOrder={preselectedReturnOrder}
        onReturnCreated={() => {
          fetchRecommendations();
        }}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Machine Learning Intelligence Engine Modal */}
      <MLIntelligenceModal
        isOpen={isMLIntelligenceOpen}
        onClose={() => setIsMLIntelligenceOpen(false)}
        authUser={authUser}
        persona={currentPersona}
        allProducts={allProducts}
        onOpenCoupons={() => setIsCouponsOpen(true)}
      />

      {/* Wallet Drawer */}
      <WalletDrawer
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        userId={currentPersona.id}
        userName={currentPersona.name}
        currency={currency}
      />

      {/* Loyalty Rewards Modal */}
      <LoyaltyRewardsModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        userId={currentPersona.id}
      />

      {/* Coupons & ML Offers Modal */}
      <CouponsOffersModal
        isOpen={isCouponsOpen}
        onClose={() => setIsCouponsOpen(false)}
        currentPersona={currentPersona}
        userId={currentPersona.id}
        onSelectCoupon={(code) => {
          setAppliedCouponFromModal(code);
          setIsCartOpen(true);
        }}
      />

      {/* Referral Center Modal */}
      <ReferralCenterModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        currentPersona={currentPersona}
        userId={currentPersona.id}
        userName={currentPersona.name}
        onRewardCredited={() => {}}
      />

      {/* Price & Stock Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        userId={currentPersona.id}
        currency={currency}
        onAddToCart={handleAddToCart}
        onSelectProduct={(prodId) => {
          const cand = (pipelineResult?.topKResults || []).find(c => c.product.id === prodId);
          if (cand) setSelectedCandidate(cand);
        }}
      />

      {/* Transparent Attribution Modal */}
      {explainCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Transparent Signal Attribution</h3>
              </div>
              <button
                onClick={() => setExplainCandidate(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <img src={explainCandidate.product.imageUrl || explainCandidate.product.thumbnail} alt={explainCandidate.product.title} className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-xs text-white truncate">{explainCandidate.product.title}</h4>
                <div className="text-[11px] text-cyan-400 font-mono">Rank #{explainCandidate.rank} &bull; Match {Math.round(explainCandidate.finalScore * 100)}%</div>
              </div>
            </div>

            {isExplaining ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Evaluating LightGBM feature weights...</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed">
                {explainText}
              </div>
            )}

            {/* Online Feature Attribution Breakdown */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Top GBDT Feature Weights:
              </span>
              <div className="space-y-1.5">
                {(explainCandidate.featureAttributions || []).slice(0, 4).map(attr => (
                  <div key={attr.featureName} className="flex justify-between text-xs p-1.5 rounded bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300">{attr.featureName}</span>
                    <span className="font-mono text-cyan-300 font-bold">+{attr.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplainCandidate(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Concierge Drawer */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPersona={currentPersona}
        currency={currency}
      />

      {/* Pipeline Sandbox Settings */}
      <PipelineSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={pipelineConfig}
        onSaveConfig={newCfg => {
          setPipelineConfig(newCfg);
          fetchRecommendations(activeIntent, newCfg);
        }}
      />

    </div>
  );
}

export default App;
