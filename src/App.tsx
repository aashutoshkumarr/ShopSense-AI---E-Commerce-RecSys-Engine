import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  BarChart3,
  Star,
  LayoutGrid,
  List
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
import { ConciergeDrawer } from './components/ConciergeDrawer';
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
import { ToastProvider, useToast } from './components/ToastNotification';
import { ProductComparisonModal, ComparisonDock } from './components/ProductComparisonModal';
import { BenchmarkPlayground } from './components/BenchmarkPlayground';
import { BanditExplorer } from './components/BanditExplorer';
import { EmbeddingSpaceExplorer } from './components/EmbeddingSpaceExplorer';
import { ApiPlayground } from './components/ApiPlayground';
import { StorefrontView } from './features/storefront/StorefrontView';
import { Footer } from './components/Footer';
import { BundleExplorerModal } from './components/BundleExplorerModal';
import { BottomNavBar } from './components/BottomNavBar';
import { DepartmentsMenuModal } from './components/DepartmentsMenuModal';
import { ShopSensePayModal } from './components/ShopSensePayModal';
import { SellProductModal } from './components/SellProductModal';
import { GroceryHubView } from './features/groceries/GroceryHubView';
import { LiveDeliveryTrackerModal } from './features/groceries/LiveDeliveryTrackerModal';
import { BazaarHubView } from './features/bazaar/BazaarHubView';
import { PharmacyHubView } from './features/pharmacy/PharmacyHubView';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { DoctorConsultModal } from './components/DoctorConsultModal';
import { AuthModal } from './components/AuthModal';
import { ObservabilityConsole } from './components/ObservabilityConsole';
import { SellerCenterView } from './features/seller/SellerCenterView';
import { PharmacyOperatorConsole } from './features/pharmacy/PharmacyOperatorConsole';
import { DeliveryPartnerFleetView } from './features/delivery/DeliveryPartnerFleetView';
import { defaultPipelineConfig } from './engine/recommendationEngine';
import { parseNaturalLanguageIntent } from './engine/semanticIntentService';

function AppContent() {
  const { showToast } = useToast();
  // Navigation View State
  const [activeTab, setActiveTab] = useState<MainTabType>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam as MainTabType;
    }
    return 'storefront';
  });

  // Role & Session State
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [authUser, setAuthUser] = useState<AuthUser>({
    id: 'usr-01',
    name: 'Alex Kumar',
    email: 'alex.kumar@shopsense.internal',
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
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

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

  // Hardware Comparison & Storefront View Mode
  const [comparedProductIds, setComparedProductIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'dense'>('grid');

  // Fintech & Engagement Modals & Drawers
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState<boolean>(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [appliedCouponFromModal, setAppliedCouponFromModal] = useState<string>('');

  // Super-App Modals & Resale
  const [isBundleExplorerOpen, setIsBundleExplorerOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(4500);

  // Quick-Commerce, Bazaar & Healthcare Modals
  const [isLiveDeliveryOpen, setIsLiveDeliveryOpen] = useState<boolean>(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState<boolean>(false);
  const [isDoctorConsultOpen, setIsDoctorConsultOpen] = useState<boolean>(false);

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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
        : role === 'seller'
        ? ['seller_dashboard', 'manage_listings', 'pricing_tools', 'inventory', 'sales_analytics']
        : role === 'pharmacy_operator'
        ? ['pharmacy_audit', 'verify_prescriptions', 'substitute_review', 'schedule_h_dispatch']
        : role === 'delivery_partner'
        ? ['delivery_trips', 'dark_store_pickup', 'order_status_update', 'live_tracking']
        : ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations']
    }));

    if (role === 'admin' || role === 'ml_analyst') {
      setActiveTab('admin_control');
    } else if (role === 'seller') {
      setActiveTab('seller_center');
    } else if (role === 'pharmacy_operator') {
      setActiveTab('pharmacy_portal');
    } else if (role === 'delivery_partner') {
      setActiveTab('delivery_partner');
    } else {
      setActiveTab('storefront');
    }
  };

  // Handle Authentication Login / Register Success
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    handleSwitchRole(user.role);
    setCurrentPersona(prev => ({
      ...prev,
      id: user.targetPersonaId || user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role
    }));
    showToast({
      title: 'Logged In Successfully',
      message: `Welcome back, ${user.name}! Active in ${user.role} session.`,
      type: 'success'
    });
  };

  // Handle Intent Search submission
  const handleIntentSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setActiveIntent(null);
      fetchRecommendations(null);
      return;
    }

    if (activeTab !== 'storefront') {
      setActiveTab('storefront');
    }

    setIsProcessingIntent(true);
    try {
      let extractedIntent: StructuredIntent = parseNaturalLanguageIntent(searchQuery);
      try {
        const res = await fetch('/api/parse-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.intent) extractedIntent = data.intent;
        }
      } catch (netErr) {
        console.warn('Using local NLP intent parser:', netErr);
      }

      setActiveIntent(extractedIntent);
      trackEvent('search', { query: searchQuery, parsedCategory: extractedIntent.category });
      await fetchRecommendations(extractedIntent);

      setTimeout(() => {
        const el = document.getElementById('curated-products-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to parse intent:', err);
    } finally {
      setIsProcessingIntent(false);
    }
  };

  // Preset sample query click
  const handlePresetQuery = (sampleQuery: string) => {
    setSearchQuery(sampleQuery);
    setIsProcessingIntent(true);
    if (activeTab !== 'storefront') {
      setActiveTab('storefront');
    }

    let extractedIntent: StructuredIntent = parseNaturalLanguageIntent(sampleQuery);

    fetch('/api/parse-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sampleQuery })
    })
      .then(r => r.json())
      .then(d => {
        if (d.intent) extractedIntent = d.intent;
      })
      .catch(() => {})
      .finally(() => {
        setActiveIntent(extractedIntent);
        trackEvent('search', { query: sampleQuery });
        fetchRecommendations(extractedIntent);
        setIsProcessingIntent(false);
        setTimeout(() => {
          const el = document.getElementById('curated-products-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => [...prev, product]);
    showToast({
      title: 'Added to Shopping Bag',
      message: `${product.title} was added to your bag.`,
      type: 'cart',
      actionLabel: 'View Bag',
      onAction: () => setIsCartOpen(true)
    });
    trackEvent('add_to_cart', {
      productId: product.id,
      productTitle: product.title,
      priceINR: product.priceINR,
      category: product.category
    });
  };

  // Remove single quantity from cart
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.id === productId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  // Select product helper for specialized views
  const handleSelectProduct = (product: Product) => {
    const cand = (pipelineResult?.topKResults || []).find(c => c.product.id === product.id) || {
      product,
      rankingScore: 0.92,
      finalScore: 0.92,
      rank: 1,
      candidateSources: [{ source: 'content_based', rawScore: 0.92, normalizedScore: 0.92 }],
      featureAttributions: [],
      businessRuleResults: []
    };
    setSelectedCandidate(cand);
  };

  // Toggle wishlist
  const handleToggleWishlist = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast({
        title: exists ? 'Removed from Wishlist' : 'Saved to Wishlist',
        message: exists
          ? `${product ? product.title : 'Item'} removed from saved list.`
          : `${product ? product.title : 'Item'} saved. Online affinity signal recorded (+5 wt).`,
        type: 'info',
        actionLabel: 'View Wishlist',
        onAction: () => setIsWishlistOpen(true)
      });
      trackEvent('wishlist_add', { productId, action: exists ? 'removed' : 'added' });
      return updated;
    });
  };

  // Share product
  const handleShareProduct = (product: Product) => {
    showToast({
      title: 'Product Link Copied',
      message: `Link for "${product.title}" copied to clipboard. Collaborative graph signal recorded!`,
      type: 'success'
    });
    trackEvent('product_share', { productId: product.id });
  };

  // Hardware comparison handlers
  const handleToggleCompare = (product: Product) => {
    setComparedProductIds(prev => {
      if (prev.includes(product.id)) {
        showToast({
          title: 'Removed from Compare',
          message: `${product.title} removed from spec comparison dock.`,
          type: 'info'
        });
        return prev.filter(id => id !== product.id);
      }
      if (prev.length >= 3) {
        showToast({
          title: 'Comparison Limit (3 Max)',
          message: 'You can compare up to 3 products simultaneously for direct spec matrix diffs.',
          type: 'error'
        });
        return prev;
      }
      showToast({
        title: 'Added to Spec Comparison',
        message: `${product.title} added to compare dock (${prev.length + 1}/3).`,
        type: 'info',
        actionLabel: 'Compare Now',
        onAction: () => setIsCompareModalOpen(true)
      });
      return [...prev, product.id];
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setComparedProductIds(prev => prev.filter(id => id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProductIds([]);
    setIsCompareModalOpen(false);
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

  // Super-App Action Handlers
  const handleTopUpWallet = (amount: number) => {
    setWalletBalance(prev => prev + amount);
    showToast({
      title: 'Wallet Recharged',
      message: `Added ₹${amount.toLocaleString('en-IN')} to ShopSense Pay wallet.`,
      type: 'wallet'
    });
  };

  const handlePublishProduct = (newProduct: Product) => {
    setAllProducts(prev => [newProduct, ...prev]);
    showToast({
      title: '🎉 Pre-Owned Listing Published',
      message: `"${newProduct.title}" is now active in the store! +50 Loyalty points awarded.`,
      type: 'success'
    });
    setSelectedCategory('All');
  };

  const handleAddBundleToCart = (bundleProducts: Product[]) => {
    setCartItems(prev => [...prev, ...bundleProducts]);
    setIsCartOpen(true);
    showToast({
      title: '12% Bundle Discount Applied',
      message: `Added all ${bundleProducts.length} ecosystem items to your shopping bag.`,
      type: 'cart',
      actionLabel: 'View Bag',
      onAction: () => setIsCartOpen(true)
    });
  };

  const handleGoHome = () => {
    setActiveTab('storefront');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setActiveIntent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['All', 'Laptops', 'Audio', 'Smartphones', 'Smart Home', 'Gaming', 'Grocery', 'Bazaar', 'Pharmacy', 'Accessories', 'Wearables', 'Pre-Owned'];

  const filteredCandidates = useMemo(() => {
    // If no category, brand, or search filters are active, show top personalized recommendations
    if (selectedCategory === 'All' && selectedBrand === 'All' && !searchQuery.trim() && !activeIntent) {
      return pipelineResult?.topKResults || [];
    }

    const candidateMap = new Map<string, ScoredCandidate>();
    (pipelineResult?.topKResults || []).forEach(c => candidateMap.set(c.product.id, c));

    // Filter products from catalog
    const matchingProducts = allProducts.filter(p => {
      if (p.status === 'discontinued' || p.status === 'hidden') return false;
      const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchBrand = selectedBrand === 'All' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
      return matchCat && matchBrand;
    });

    const candidates: ScoredCandidate[] = matchingProducts.map((prod, idx) => {
      if (candidateMap.has(prod.id)) {
        return candidateMap.get(prod.id)!;
      }

      let sim = 0.82;
      if (currentPersona?.embedding && prod.embedding) {
        let dot = 0, mA = 0, mB = 0;
        for (let i = 0; i < currentPersona.embedding.length; i++) {
          dot += (currentPersona.embedding[i] || 0) * (prod.embedding[i] || 0);
          mA += (currentPersona.embedding[i] || 0) ** 2;
          mB += (prod.embedding[i] || 0) ** 2;
        }
        sim = (mA && mB) ? Math.max(0.4, dot / (Math.sqrt(mA) * Math.sqrt(mB))) : 0.82;
      }

      const score = Math.round((sim * 0.6 + prod.popularityScore * 0.4) * 1000) / 1000;
      return {
        product: prod,
        rank: idx + 1,
        rankingScore: score,
        finalScore: score,
        features: {
          semanticSimilarity: Math.round(sim * 100) / 100,
          userAffinity: Math.round((prod.popularityScore * 0.9) * 100) / 100,
          popularity: prod.popularityScore,
          historicalCTR: prod.historicalCTR,
          priceAffinity: 0.88,
          freshness: Math.max(0.2, (180 - prod.releaseDaysAgo) / 180)
        },
        sources: [{
          source: 'content_based',
          rawScore: score,
          normalizedScore: score,
          reason: `Catalog filter match for ${prod.brand} in ${prod.category}`
        }],
        businessRuleResults: [
          { ruleName: 'In-Stock Filter', passed: prod.inStock, penaltyOrBoost: 0, note: `${prod.stockCount} in stock` }
        ],
        groundedReason: {
          headline: `${prod.brand} ${prod.category} Match`,
          details: `Verified ${prod.brand} flagship with ${prod.rating}★ rating and express dispatch.`,
          dominantSignal: 'Catalog Verified Match',
          confidence: 0.92
        }
      };
    });

    candidates.sort((a, b) => b.finalScore - a.finalScore);
    candidates.forEach((c, i) => { c.rank = i + 1; });
    return candidates;
  }, [allProducts, pipelineResult, selectedCategory, selectedBrand, searchQuery, activeIntent, currentPersona]);

  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));
  const comparedProducts = allProducts.filter(p => comparedProductIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      
      {/* 1. Developer & ML Role Switcher Bar (Only visible in Engineering Console) */}
      {activeTab !== 'storefront' && (
        <RoleSwitcherBar
          currentUser={authUser}
          onSwitchRole={handleSwitchRole}
          activeRole={activeRole}
        />
      )}

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
        onSelectCurrency={setCurrency}
        cartCount={cartItems.length}
        wishlistCount={wishlistIds.length}
        ordersCount={orderCount}
        activeRole={activeRole}
        authUser={authUser}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedBrand('All');
          if (activeTab !== 'storefront') setActiveTab('storefront');
        }}
        categories={categories}
        onSwitchRole={handleSwitchRole}
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
        onOpenPay={() => setIsPayModalOpen(true)}
        onOpenSell={() => setIsSellModalOpen(true)}
        onOpenBundles={() => setIsBundleExplorerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleIntentSearch}
        isProcessingIntent={isProcessingIntent}
      />

      {/* 3. Main View Router */}
      <main className="flex-1 pb-24">
        
        {/* VIEW 1: STOREFRONT */}
        {activeTab === 'storefront' && (
          <>
            {selectedCategory.toLowerCase() === 'grocery' ? (
              <GroceryHubView
                allProducts={allProducts}
                cartItems={cartItems}
                currency={currency}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onOpenCart={() => setIsCartOpen(true)}
                onSelectProduct={handleSelectProduct}
                onOpenLiveTracking={() => setIsLiveDeliveryOpen(true)}
                onBackToStorefront={() => setSelectedCategory('All')}
              />
            ) : selectedCategory.toLowerCase() === 'bazaar' ? (
              <BazaarHubView
                allProducts={allProducts}
                cartItems={cartItems}
                currency={currency}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
                onSelectProduct={handleSelectProduct}
                onBackToStorefront={() => setSelectedCategory('All')}
              />
            ) : selectedCategory.toLowerCase() === 'pharmacy' ? (
              <PharmacyHubView
                allProducts={allProducts}
                cartItems={cartItems}
                currency={currency}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
                onSelectProduct={handleSelectProduct}
                onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
                onOpenDoctorModal={() => setIsDoctorConsultOpen(true)}
                onBackToStorefront={() => setSelectedCategory('All')}
              />
            ) : (
              <>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
            
            {/* Editorial Hero Showcase (Krist Luxury E-Commerce Aesthetic) */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-100/80 text-slate-900 border border-slate-200/90 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Column: Brand Statement, Editorial Typography & CTAs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-mono font-bold tracking-wider">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>AUTUMN / WINTER 2026 &bull; DTC FLAGSHIP</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
                      Engineered For <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-950">
                        Extraordinary Focus.
                      </span>
                    </h1>
                    
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                      Precision workstations, studio acoustics, and artisanal desk peripherals curated for founders, engineers, and creators.
                    </p>
                  </div>

                  {/* High-Converting Action CTAs */}
                  <div className="flex items-center gap-3.5 flex-wrap pt-1">
                    <a
                      href="#curated-products-grid"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>Shop Collection</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="#shop-by-categories"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm border border-slate-300 shadow-2xs hover:border-slate-400 transition cursor-pointer"
                    >
                      <span>Explore Categories</span>
                    </a>
                  </div>

                  {/* Trust Signal Badges */}
                  <div className="pt-2 flex items-center gap-6 text-xs text-slate-500 font-medium flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-slate-700" />
                      <span>2-Year Brand Warranty</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4 text-slate-700" />
                      <span>Same-Day Dispatch</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>100% Genuine Verified</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Floating Krist Editorial Showcase */}
                <div className="hidden lg:block lg:col-span-5 relative">
                  <div className="relative">
                    {/* Hero Product Visual Showcase Container */}
                    <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xl group">
                      <img
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=85"
                        alt="Sony WH-1000XM5 Studio ANC"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                      {/* Floating Krist Black Tag (Top Right) */}
                      <div className="absolute top-4 right-4 bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider shadow-lg border border-white/10">
                        UPTO 35% OFF
                      </div>

                      {/* Floating Product Highlight Card (Bottom) */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80"
                              alt="Sony WH-1000XM5"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wide text-indigo-600 block">
                              Studio Acoustics
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-950 line-clamp-1">
                              Sony WH-1000XM5 ANC
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-slate-900">4.9</span>
                              <span className="text-slate-400 font-normal">(1.4k reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-black text-slate-950 font-mono block">
                            {currency === 'INR' ? '₹29,990' : '$399'}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            In Stock &bull; Free Ship
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Extracted Intent Filter Bar (When Active from Header Search) */}
            {activeIntent && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-white font-mono font-bold text-[11px]">
                    Search Filter:
                  </span>
                  {activeIntent.category && (
                    <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      Category: <strong className="text-slate-900">{activeIntent.category}</strong>
                    </span>
                  )}
                  {activeIntent.targetBudgetINR && (
                    <span className="text-slate-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Budget: <strong className="text-emerald-700">₹{activeIntent.targetBudgetINR.toLocaleString()}</strong>
                    </span>
                  )}
                  {activeIntent.requiredFeatures && activeIntent.requiredFeatures.length > 0 && (
                    <span className="text-slate-600 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                      Specs: <strong className="text-indigo-600">{activeIntent.requiredFeatures.join(', ')}</strong>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveIntent(null);
                    setSearchQuery('');
                    setSelectedBrand('All');
                    fetchRecommendations(null);
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}

            <StorefrontView
              filteredCandidates={filteredCandidates}
              allProducts={allProducts}
              currentPersona={currentPersona}
              currency={currency}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              categories={categories}
              viewMode={viewMode}
              setViewMode={setViewMode}
              isLoadingPipeline={isLoadingPipeline}
              cartItems={cartItems}
              wishlistIds={wishlistIds}
              comparedProductIds={comparedProductIds}
              onSelectCandidate={setSelectedCandidate}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onExplainCandidate={handleExplainCandidate}
              onToggleCompare={handleToggleCompare}
              onShareProduct={handleShareProduct}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCompareModal={() => setIsCompareModalOpen(true)}
              onOpenCouponsModal={() => setIsCouponsOpen(true)}
              onOpenLoyaltyModal={() => setIsLoyaltyOpen(true)}
              onOpenBundlesModal={() => setIsBundleExplorerOpen(true)}
            />
          </div>
        </>
      )}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedBrand('All');
          const el = document.getElementById('curated-products-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenConsole={() => setActiveTab('inspector')}
      />
    </>
  )}

        {/* VIEW: MERCHANT SELLER CENTER */}
        {activeTab === 'seller_center' && (
          <SellerCenterView
            products={allProducts}
            currency={currency}
            onBackToStorefront={() => {
              setActiveTab('storefront');
              setActiveRole('customer');
            }}
          />
        )}

        {/* VIEW: PHARMACY OPERATOR COMPLIANCE HUB */}
        {activeTab === 'pharmacy_portal' && (
          <PharmacyOperatorConsole
            onBackToStorefront={() => {
              setActiveTab('storefront');
              setActiveRole('customer');
            }}
          />
        )}

        {/* VIEW: DELIVERY PARTNER FLEET CONSOLE */}
        {activeTab === 'delivery_partner' && (
          <DeliveryPartnerFleetView
            onBackToStorefront={() => {
              setActiveTab('storefront');
              setActiveRole('customer');
            }}
          />
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

        {/* VIEW 5: SYSTEMS LATENCY & THROUGHPUT BENCHMARK */}
        {activeTab === 'benchmark' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <BenchmarkPlayground />
          </div>
        )}

        {/* VIEW 6: MULTI-ARMED BANDIT THOMPSON SAMPLING EXPLORER */}
        {activeTab === 'bandit_explorer' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <BanditExplorer />
          </div>
        )}

        {/* VIEW 7: 2D LATENT VECTOR EMBEDDING SPACE MAP */}
        {activeTab === 'embedding_map' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <EmbeddingSpaceExplorer currentPersona={currentPersona} />
          </div>
        )}

        {/* VIEW 8: DEVELOPER API CONSOLE & OPENAPI PLAYGROUND */}
        {activeTab === 'api_playground' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <ApiPlayground />
          </div>
        )}

        {/* VIEW 9: FAANG OBSERVABILITY & DISTRIBUTED TRACING CONSOLE */}
        {activeTab === 'observability' && (
          <ObservabilityConsole />
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
        onOpenConciergeHelp={() => {
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

      {/* Shopping Concierge Drawer */}
      <ConciergeDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPersona={currentPersona}
        currency={currency}
        products={allProducts}
        onAddToCart={handleAddToCart}
        onViewProductById={(prodId) => {
          const cand = (pipelineResult?.topKResults || []).find(c => c.product.id === prodId);
          if (cand) setSelectedCandidate(cand);
          else {
            const p = allProducts.find(prod => prod.id === prodId);
            if (p) {
              setSelectedCandidate({
                product: p,
                rankingScore: 0.9,
                finalScore: 0.9,
                rank: 1,
                candidateSources: [{ source: 'content_based', rawScore: 0.9, normalizedScore: 0.9 }],
                featureAttributions: [],
                businessRuleResults: []
              });
            }
          }
        }}
      />

      {/* Floating Hardware Spec Comparison Dock */}
      <ComparisonDock
        comparedProducts={comparedProducts}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />

      {/* Side-by-Side Product Comparison Matrix Modal */}
      <ProductComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedProducts={comparedProducts}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onAddToCart={handleAddToCart}
        currency={currency}
        onViewProductDetails={(p) => {
          setIsCompareModalOpen(false);
          const cand = (pipelineResult?.topKResults || []).find(c => c.product.id === p.id);
          if (cand) setSelectedCandidate(cand);
          else {
            setSelectedCandidate({
              product: p,
              rankingScore: 0.9,
              finalScore: 0.9,
              rank: 1,
              candidateSources: [{ source: 'content_based', rawScore: 0.9, normalizedScore: 0.9 }],
              featureAttributions: [],
              businessRuleResults: []
            });
          }
        }}
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

      {/* Super-App Modals & Resale */}
      <BundleExplorerModal
        isOpen={isBundleExplorerOpen}
        onClose={() => setIsBundleExplorerOpen(false)}
        allProducts={allProducts}
        currency={currency}
        onAddBundleToCart={handleAddBundleToCart}
        onViewProduct={p => {
          setIsBundleExplorerOpen(false);
          const cand = pipelineResult?.candidates.find(c => c.product.id === p.id);
          if (cand) setSelectedCandidate(cand);
          else {
            setSelectedCandidate({
              product: p,
              rankingScore: 0.9,
              finalScore: 0.9,
              rank: 1,
              candidateSources: [{ source: 'content_based', rawScore: 0.9, normalizedScore: 0.9 }],
              featureAttributions: [],
              businessRuleResults: []
            });
          }
        }}
      />

      <DepartmentsMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPersona={currentPersona}
        onSelectCategory={cat => {
          setSelectedCategory(cat);
          if (activeTab !== 'storefront') setActiveTab('storefront');
          const el = document.getElementById('curated-products-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPay={() => setIsPayModalOpen(true)}
        onOpenSell={() => setIsSellModalOpen(true)}
        onOpenBundles={() => setIsBundleExplorerOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenCoupons={() => setIsCouponsOpen(true)}
      />

      <ShopSensePayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        walletBalance={walletBalance}
        onTopUp={handleTopUpWallet}
        currentPersona={currentPersona}
      />

      <SellProductModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onPublishProduct={handlePublishProduct}
        currentPersona={currentPersona}
      />

      {/* Quick-Commerce Live Delivery Tracker Modal */}
      <LiveDeliveryTrackerModal
        isOpen={isLiveDeliveryOpen}
        onClose={() => setIsLiveDeliveryOpen(false)}
        cartItems={cartItems}
        currency={currency}
      />

      {/* Apollo 24/7 AI Prescription OCR Modal */}
      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        allProducts={allProducts}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Apollo 24/7 Doctor Video Consultation Modal */}
      <DoctorConsultModal
        isOpen={isDoctorConsultOpen}
        onClose={() => setIsDoctorConsultOpen(false)}
        allProducts={allProducts}
        onAddToCart={handleAddToCart}
        currency={currency}
      />

      {/* Modern Authentication & Sign In / Log In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Fixed Super-App Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        cartCount={cartItems.length}
        walletBalance={walletBalance}
        onGoHome={handleGoHome}
        onOpenAccount={() => setIsSettingsOpen(true)}
        onOpenWallet={() => setIsPayModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
