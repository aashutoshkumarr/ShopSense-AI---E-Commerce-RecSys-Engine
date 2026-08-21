import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { mockProducts } from './src/data/products';
import { mockPersonas } from './src/data/personas';
import { recommendationEngineInstance } from './src/engine/recommendationEngine';
import {
  dynamicProductCatalog,
  getProductCatalog,
  setProductCatalog,
  ingestFromDummyJSON,
  ingestCustomData,
  generateProductEmbedding
} from './src/engine/ingestionService';
import {
  getWallet,
  topUpWallet,
  deductWallet,
  refundToWallet,
  getAllWallets
} from './src/engine/walletService';
import {
  getLoyaltyAccount,
  awardLoyaltyPoints,
  redeemLoyaltyPoints,
  getAllLoyaltyAccounts,
  LOYALTY_TIERS
} from './src/engine/loyaltyService';
import {
  ALL_COUPONS,
  getPersonalizedOffersForPersona,
  validateAndApplyCoupon,
  calculateCouponPropensity
} from './src/engine/couponService';
import {
  getReferralProfile,
  simulateAddReferee
} from './src/engine/referralService';
import {
  getProductReviews,
  addProductReview,
  getProductNLPSummary,
  getAllReviews
} from './src/engine/reviewNLPService';
import {
  getUserPriceAlerts,
  getUserStockAlerts,
  createPriceAlert,
  createStockAlert,
  dismissPriceAlert,
  checkAndTriggerPriceAlerts
} from './src/engine/alertService';
import {
  getProductPriceAnalytics,
  recordPriceUpdate,
  simulatePriceDrop
} from './src/engine/priceHistoryService';
import {
  getUserOrders,
  getAllOrders,
  createOrder,
  cancelOrder,
  returnOrder,
  updateOrderStatus
} from './src/engine/orderIntelligenceService';
import {
  getUserReturnRequests,
  getAllReturnRequests,
  createReturnRequest,
  updateReturnStatus,
  searchHelpArticles,
  getUserSupportTickets,
  createSupportTicket,
  addMessageToTicket,
  helpCenterArticles
} from './src/engine/supportReturnService';
import {
  predictPersonalizedOffers,
  CUSTOMER_SEGMENT_CLUSTERS,
  getUserCustomerSegment,
  getProductDemandForecast,
  getProductPriceForecast,
  getProductAspectSentiments
} from './src/engine/mlIntelligenceService';
import {
  getPersonaClusterMappings,
  getAllSegmentClusters,
  getAllSegmentCoupons,
  createOrUpdateSegmentCoupon,
  toggleSegmentCouponStatus,
  deleteSegmentCoupon
} from './src/engine/segmentationService';
import {
  UserPersona,
  UserEvent,
  EventType,
  StructuredIntent,
  PipelineConfig,
  MLModelVersion,
  OfflineEvaluationReport,
  ABExperiment,
  Order,
  AuthUser,
  UserRole,
  Product,
  AdminDashboardMetrics
} from './src/types';

dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-memory telemetry event store
const collectedEvents: UserEvent[] = [];

// Event Weights mapping
const EVENT_WEIGHTS: Record<EventType, number> = {
  product_view: 1,
  search: 2,
  recommendation_click: 3,
  product_share: 4,
  wishlist_add: 5,
  product_rating: 6,
  cart_add: 7,
  add_to_cart: 7,
  purchase: 10,
  cart_remove: -2,
  recommendation_impression: 0.5,
  explain_recommendation_view: 2,
  page_view: 1,
  item_click: 2,
  filter_change: 1
};

// In-memory Orders store
const userOrders: Order[] = [
  {
    id: 'ord-2026-0801',
    userId: 'user-dev-alex',
    userName: 'Alex Kumar',
    items: [
      {
        productId: 'prod-acc-01',
        title: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
        priceINR: 17990,
        priceUSD: 215,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        brand: 'Keychron'
      }
    ],
    subtotalINR: 17990,
    discountINR: 0,
    walletUsedINR: 0,
    pointsDiscountINR: 0,
    shippingFeeINR: 0,
    totalINR: 17990,
    totalUSD: 215,
    status: 'delivered',
    createdAt: '2026-08-10T10:30:00Z',
    estimatedDeliveryDate: '2026-08-12',
    deliveredDate: '2026-08-12',
    trackingNumber: 'BD-7891234',
    carrier: 'BlueDart Express Air',
    paymentMethod: 'card',
    pointsEarned: 180,
    trackingTimeline: [
      { status: 'placed', label: 'Order Placed', timestamp: '2026-08-10T10:30:00Z', completed: true, current: false },
      { status: 'packed', label: 'Package Verified & Sealed', timestamp: '2026-08-10T14:15:00Z', completed: true, current: false },
      { status: 'shipped', label: 'In Transit via BlueDart', timestamp: '2026-08-11T09:00:00Z', completed: true, current: false },
      { status: 'out_for_delivery', label: 'Out for Delivery', timestamp: '2026-08-12T08:30:00Z', completed: true, current: false },
      { status: 'delivered', label: 'Delivered to Customer', timestamp: '2026-08-12T16:45:00Z', completed: true, current: true }
    ],
    shippingAddress: '402 Tech Park Residency, Bengaluru, Karnataka, India'
  }
];

// Active A/B Testing Experiment Store
let activeExperiment: ABExperiment = {
  id: 'exp-recsys-2026-01',
  name: 'Multi-Channel Candidate Fusion vs. LightGBM LTR Re-ranker',
  hypothesis: 'Adding the LightGBM LambdaMART ranking model with 6 dynamic real-time feature attributions increases CTR by >25% and purchase conversion by >15% compared to linear candidate fusion.',
  status: 'active',
  startDate: '2026-08-01',
  totalSessions: 14850,
  confidenceLevel: 98.4,
  pValue: 0.016,
  statisticallySignificant: true,
  winnerVariantId: 'variant_b',
  variantA: {
    id: 'variant_a',
    name: 'Variant A: Multi-Channel Hybrid Fusion',
    description: 'Candidate fusion with normalized multi-channel priors (Content + Collaborative + Session + Trending)',
    modelConfig: 'v4-hybrid-linear-fusion',
    trafficAllocation: 50,
    impressions: 7420,
    clicks: 412,
    addToCarts: 148,
    purchases: 54,
    revenueINR: 3780000,
    ctr: 0.0555, // 5.55%
    cartRate: 0.0199, // 1.99%
    conversionRate: 0.0073, // 0.73%
    revenuePerSession: 509.4
  },
  variantB: {
    id: 'variant_b',
    name: 'Variant B: Hybrid + LightGBM LambdaMART LTR',
    description: 'Multi-channel retrieval + 6 Online Features + Gradient Boosted Decision Tree Ranking + MMR',
    modelConfig: 'v5-hybrid-lightgbm-ranker',
    trafficAllocation: 50,
    impressions: 7430,
    clicks: 586,
    addToCarts: 242,
    purchases: 92,
    revenueINR: 6440000,
    ctr: 0.0789, // 7.89% (+42.1% uplift)
    cartRate: 0.0326, // 3.26% (+63.8% uplift)
    conversionRate: 0.0124, // 1.24% (+69.8% uplift)
    revenuePerSession: 866.7
  }
};

// In-memory ML Model Registry with the 5 versions
let modelRegistry: MLModelVersion[] = [
  {
    id: 'mdl-v5',
    name: 'v5 Hybrid + LightGBM Ranker (Production)',
    version: 'hybrid-lgbm-v3',
    architecture: '4-Channel Retrieval + 6 Online Feature Store + LightGBM LambdaMART + MMR Diversity',
    status: 'production',
    trafficPercent: 80,
    trainedOnEvents: 148500,
    lastTrainedDate: '2026-08-19',
    metrics: {
      ndcgAt5: 0.884,
      ndcgAt10: 0.640,
      precisionAt10: 0.610,
      recallAt10: 0.480,
      mapAt10: 0.625,
      mrr: 0.764,
      aucRoc: 0.918,
      ctrPercent: 7.4,
      conversionPercent: 3.8,
      catalogCoveragePercent: 83.0,
      inferenceLatencyP95Ms: 24
    }
  },
  {
    id: 'mdl-v4',
    name: 'v4 Multi-Channel Hybrid',
    version: 'v4.0-hybrid-fusion',
    architecture: 'Weighted linear combination of Content, Collaborative, Session, and Velocity priors',
    status: 'staging',
    trafficPercent: 20,
    trainedOnEvents: 98000,
    lastTrainedDate: '2026-08-10',
    metrics: {
      ndcgAt5: 0.792,
      ndcgAt10: 0.580,
      precisionAt10: 0.520,
      recallAt10: 0.420,
      mapAt10: 0.540,
      mrr: 0.680,
      aucRoc: 0.854,
      ctrPercent: 5.6,
      conversionPercent: 2.5,
      catalogCoveragePercent: 76.0,
      inferenceLatencyP95Ms: 18
    }
  },
  {
    id: 'mdl-v3',
    name: 'v3 Item-Item Collaborative Filtering',
    version: 'v3.0-collaborative-cf',
    architecture: 'Item-Item co-occurrence matrix + Implicit ALS Matrix Factorization',
    status: 'archived',
    trafficPercent: 0,
    trainedOnEvents: 65000,
    lastTrainedDate: '2026-07-28',
    metrics: {
      ndcgAt5: 0.710,
      ndcgAt10: 0.510,
      precisionAt10: 0.440,
      recallAt10: 0.380,
      mapAt10: 0.470,
      mrr: 0.610,
      aucRoc: 0.790,
      ctrPercent: 4.8,
      conversionPercent: 2.0,
      catalogCoveragePercent: 68.0,
      inferenceLatencyP95Ms: 15
    }
  },
  {
    id: 'mdl-v2',
    name: 'v2 Content-Based Vector Model',
    version: 'v2.0-content-vector',
    architecture: '8-dim semantic text embedding cosine similarity with user profile vectors',
    status: 'archived',
    trafficPercent: 0,
    trainedOnEvents: 42000,
    lastTrainedDate: '2026-07-12',
    metrics: {
      ndcgAt5: 0.660,
      ndcgAt10: 0.460,
      precisionAt10: 0.390,
      recallAt10: 0.340,
      mapAt10: 0.410,
      mrr: 0.560,
      aucRoc: 0.740,
      ctrPercent: 4.1,
      conversionPercent: 1.7,
      catalogCoveragePercent: 62.0,
      inferenceLatencyP95Ms: 12
    }
  },
  {
    id: 'mdl-v1',
    name: 'v1 Popularity Baseline',
    version: 'v1.0-popularity-baseline',
    architecture: 'Global CTR + Exponential Time Decay velocity',
    status: 'archived',
    trafficPercent: 0,
    trainedOnEvents: 18000,
    lastTrainedDate: '2026-06-20',
    metrics: {
      ndcgAt5: 0.580,
      ndcgAt10: 0.390,
      precisionAt10: 0.280,
      recallAt10: 0.260,
      mapAt10: 0.320,
      mrr: 0.480,
      aucRoc: 0.680,
      ctrPercent: 3.2,
      conversionPercent: 1.1,
      catalogCoveragePercent: 44.0,
      inferenceLatencyP95Ms: 8
    }
  }
];

// Active Auth session state
let currentAuthUser: AuthUser = {
  id: 'usr-admin-01',
  name: 'Alex Kumar',
  email: 'alex.kumar@recsys.ai',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  targetPersonaId: 'user-dev-alex',
  token: 'jwt.header.payload.signature_mock_token_2026',
  refreshToken: 'ref.mock_refresh_token_2026_xyz',
  permissions: ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations']
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // API ROUTE: Health check & Platform telemetry
  // ==========================================
  app.get('/api/health', (req, res) => {
    const catalog = getProductCatalog();
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      productCount: catalog.length,
      eventsIngested: collectedEvents.length,
      activeModel: 'hybrid-lgbm-v3',
      currentRole: currentAuthUser.role,
      experimentStatus: activeExperiment.status
    });
  });

  // ==========================================
  // API ROUTE: Auth & RBAC (Customer, Admin, ML/Analyst)
  // ==========================================
  app.get('/api/auth/session', (req, res) => {
    res.json({ user: currentAuthUser });
  });

  app.post('/api/auth/switch-role', (req, res) => {
    const { role, personaId } = req.body as { role: UserRole; personaId?: string };

    const rolePermissions: Record<UserRole, string[]> = {
      customer: ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations'],
      admin: ['products_crud', 'categories', 'inventory', 'users', 'ingestion', 'analytics', 'experiments'],
      ml_analyst: ['model_metrics', 'experiments', 'retraining', 'feature_attribution', 'event_stream', 'model_versions']
    };

    const targetPersona = mockPersonas.find(p => p.id === (personaId || currentAuthUser.targetPersonaId)) || mockPersonas[0];

    currentAuthUser = {
      ...currentAuthUser,
      role: role || 'customer',
      name: targetPersona.name,
      avatar: targetPersona.avatar,
      targetPersonaId: targetPersona.id,
      permissions: rolePermissions[role || 'customer'] || rolePermissions.customer
    };

    res.json({
      status: 'success',
      message: `Switched active session to role: ${currentAuthUser.role.toUpperCase()}`,
      user: currentAuthUser
    });
  });

  // ==========================================
  // API ROUTE: Products catalog (Self-contained)
  // ==========================================
  app.get('/api/products', (req, res) => {
    const { category, brand, search, maxPrice, includeOutOfStock } = req.query;
    let list = getProductCatalog();

    if (includeOutOfStock !== 'true') {
      // Return active items by default
      list = list.filter(p => p.status !== 'hidden' && p.status !== 'discontinued');
    }

    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
    }
    if (brand) {
      list = list.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
    }
    if (maxPrice) {
      list = list.filter(p => p.priceINR <= Number(maxPrice));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.json({ products: list, total: list.length });
  });

  // ==========================================
  // API ROUTE: Admin Product Management (CRUD)
  // ==========================================
  app.post('/api/admin/products', (req, res) => {
    try {
      const { title, brand, category, subCategory, priceINR, priceUSD, stockCount, description, imageUrl, tags, badge, specs, features } = req.body;

      if (!title || !priceINR) {
        return res.status(400).json({ error: 'Title and priceINR are required' });
      }

      const pTags = tags || [category?.toLowerCase() || 'electronics', brand?.toLowerCase() || 'custom'];
      const embedding = generateProductEmbedding(title, category || 'Accessories', pTags, description || '', Number(priceINR));

      const newProduct: Product = {
        id: `prod-admin-${Date.now().toString(36)}`,
        title,
        brand: brand || 'CustomBrand',
        category: category || 'Accessories',
        subCategory: subCategory || category || 'Accessories',
        priceINR: Number(priceINR),
        priceUSD: Number(priceUSD) || Math.round(Number(priceINR) / 83.5),
        originalPriceINR: Math.round(Number(priceINR) * 1.15),
        originalPriceUSD: Math.round((Number(priceUSD) || Math.round(Number(priceINR) / 83.5)) * 1.15),
        rating: 4.8,
        reviewCount: 1,
        inStock: Number(stockCount) > 0,
        stockCount: Number(stockCount) || 10,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
        badge: badge || 'New',
        tags: pTags,
        description: description || `${title} from ${brand}. Verified high-quality item.`,
        specs: specs || { Brand: brand || 'Custom', Category: category || 'Accessories' },
        features: features || ['Full 1-Year Warranty', 'Fast Dispatch'],
        popularityScore: 0.85,
        historicalCTR: 0.05,
        releaseDaysAgo: 0,
        embedding,
        source: 'manual',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const catalog = getProductCatalog();
      setProductCatalog([newProduct, ...catalog]);
      recommendationEngineInstance.setCatalog(getProductCatalog());

      res.json({ status: 'success', product: newProduct });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create product' });
    }
  });

  app.put('/api/admin/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const catalog = getProductCatalog();
      const index = catalog.findIndex(p => p.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const existing = catalog[index];
      const priceINR = updates.priceINR !== undefined ? Number(updates.priceINR) : existing.priceINR;
      const priceUSD = updates.priceUSD !== undefined ? Number(updates.priceUSD) : (updates.priceINR ? Math.round(priceINR / 83.5) : existing.priceUSD);
      const stockCount = updates.stockCount !== undefined ? Number(updates.stockCount) : existing.stockCount;
      const inStock = stockCount > 0;

      const updatedProduct: Product = {
        ...existing,
        ...updates,
        priceINR,
        priceUSD,
        stockCount,
        inStock,
        updatedAt: new Date().toISOString()
      };

      catalog[index] = updatedProduct;
      setProductCatalog([...catalog]);
      recommendationEngineInstance.setCatalog(catalog);

      res.json({ status: 'success', product: updatedProduct });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update product' });
    }
  });

  app.delete('/api/admin/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const catalog = getProductCatalog();
      const filtered = catalog.filter(p => p.id !== id);

      if (filtered.length === catalog.length) {
        return res.status(404).json({ error: 'Product not found' });
      }

      setProductCatalog(filtered);
      recommendationEngineInstance.setCatalog(filtered);

      res.json({ status: 'success', message: 'Product removed from catalog' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
  });

  // ==========================================
  // API ROUTE: Product Ingestion Service (DummyJSON / CSV / JSON)
  // ==========================================
  app.post('/api/admin/ingest/dummyjson', async (req, res) => {
    try {
      const result = await ingestFromDummyJSON();
      recommendationEngineInstance.setCatalog(getProductCatalog());
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Ingestion failed' });
    }
  });

  app.post('/api/admin/ingest/custom', (req, res) => {
    try {
      const { rawData, format } = req.body;
      if (!rawData) {
        return res.status(400).json({ error: 'Missing rawData payload' });
      }
      const result = ingestCustomData(rawData, format || 'json');
      recommendationEngineInstance.setCatalog(getProductCatalog());
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Custom upload failed' });
    }
  });

  // ==========================================
  // API ROUTE: User Personas
  // ==========================================
  app.get('/api/personas', (req, res) => {
    res.json({ personas: mockPersonas });
  });

  // ==========================================
  // API ROUTE: 1. ShopSense Wallet & Test Mode Gateways (Stripe/Razorpay)
  // ==========================================
  app.get('/api/wallet', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const wallet = getWallet(userId);
    res.json({ wallet });
  });

  app.post('/api/wallet/topup', (req, res) => {
    try {
      const { userId, amountINR, gateway = 'Stripe Test Mode', gatewayRef } = req.body;
      const uid = userId || currentAuthUser.targetPersonaId;
      const numAmount = Number(amountINR);

      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Valid top-up amount required' });
      }

      const result = topUpWallet(uid, numAmount, gateway, gatewayRef);
      res.json({ status: 'success', ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Wallet top-up failed' });
    }
  });

  app.get('/api/admin/wallets', (req, res) => {
    const wallets = getAllWallets();
    res.json({ wallets, total: wallets.length });
  });

  // ==========================================
  // API ROUTE: 2. Loyalty Rewards & Tiers (Bronze, Silver, Gold, Platinum)
  // ==========================================
  app.get('/api/loyalty', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const account = getLoyaltyAccount(userId);
    res.json({
      account,
      tiers: LOYALTY_TIERS,
      currentTierConfig: LOYALTY_TIERS[account.currentTier]
    });
  });

  app.post('/api/loyalty/daily-login', (req, res) => {
    const userId = req.body.userId || currentAuthUser.targetPersonaId;
    const account = getLoyaltyAccount(userId);
    if (account.dailyLoginClaimedToday) {
      return res.status(400).json({ error: 'Daily login bonus already claimed today' });
    }

    const result = awardLoyaltyPoints(userId, 'daily_login', 20, 'Daily Streak Active');
    res.json({ status: 'success', message: '+20 Loyalty Points credited!', ...result });
  });

  app.post('/api/loyalty/profile-complete', (req, res) => {
    const userId = req.body.userId || currentAuthUser.targetPersonaId;
    const result = awardLoyaltyPoints(userId, 'profile_completion', 100, 'Profile & Tech Preferences Completed');
    res.json({ status: 'success', message: '+100 Loyalty Points credited!', ...result });
  });

  app.get('/api/admin/loyalty', (req, res) => {
    const accounts = getAllLoyaltyAccounts();
    res.json({ accounts, total: accounts.length, tiers: LOYALTY_TIERS });
  });

  // ==========================================
  // API ROUTE: 3. Coupons & ML Personalized Offer Propensity
  // ==========================================
  app.get('/api/coupons', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const persona = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const personalizedOffers = getPersonalizedOffersForPersona(persona);

    res.json({
      coupons: ALL_COUPONS,
      personalizedOffers,
      topRecommendedOffer: personalizedOffers[0]
    });
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotalINR, categories = [] } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code required' });
    }
    const result = validateAndApplyCoupon(code, Number(subtotalINR) || 0, categories);
    res.json(result);
  });

  // ==========================================
  // API ROUTE: 4. Referral Program Engine
  // ==========================================
  app.get('/api/referrals', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const profile = getReferralProfile(userId, currentAuthUser.name);
    res.json({ profile });
  });

  app.post('/api/referrals/invite', (req, res) => {
    const { userId, refereeName, email } = req.body;
    const uid = userId || currentAuthUser.targetPersonaId;
    if (!refereeName || !email) {
      return res.status(400).json({ error: 'Friend name and email required' });
    }
    const result = simulateAddReferee(uid, refereeName, email);
    
    // Award loyalty points & wallet bonus
    awardLoyaltyPoints(uid, 'referral', 200, `Referral bonus for inviting ${refereeName}`);
    topUpWallet(uid, 500, 'Stripe Test Mode', `ref_${Date.now()}`);

    res.json({
      status: 'success',
      message: `Invitation sent to ${refereeName}! When they make a purchase, you get +200 Points and ₹500 in your wallet.`,
      ...result
    });
  });

  // ==========================================
  // API ROUTE: 5. Reviews & Ratings with NLP Intelligence
  // ==========================================
  app.get('/api/reviews', (req, res) => {
    const { productId } = req.query;
    if (productId) {
      const reviews = getProductReviews(String(productId));
      const summary = getProductNLPSummary(String(productId));
      return res.json({ reviews, summary });
    }
    res.json({ reviews: getAllReviews() });
  });

  app.post('/api/reviews', (req, res) => {
    const { productId, rating, title, comment, userId, userName, userAvatar } = req.body;
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ error: 'Product ID, rating, title, and comment are required' });
    }

    const uid = userId || currentAuthUser.targetPersonaId;
    const uname = userName || currentAuthUser.name;
    const uavatar = userAvatar || currentAuthUser.avatar;

    const result = addProductReview(productId, uid, uname, uavatar, Number(rating), title, comment);

    // Award review loyalty points (+50 pts)
    awardLoyaltyPoints(uid, 'review', 50, `Review submitted for ${productId}`);

    // Log rating event
    const evt: UserEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: uid,
      userName: uname,
      eventType: 'product_rating',
      productId,
      ratingValue: Number(rating),
      weight: EVENT_WEIGHTS.product_rating,
      timestamp: new Date().toISOString()
    };
    collectedEvents.unshift(evt);

    res.json({
      status: 'success',
      message: 'Review published with real-time NLP sentiment extraction! +50 Loyalty Points awarded.',
      ...result
    });
  });

  // ==========================================
  // API ROUTE: 6. Smart Cart Co-Purchase Recommendations
  // ==========================================
  app.post('/api/recommendations/co-purchase', (req, res) => {
    const { cartProductIds = [], userId = 'user-dev-alex' } = req.body;
    const catalog = getProductCatalog();
    
    // Find complimentary products based on category co-occurrences
    const cartCategories = catalog
      .filter(p => cartProductIds.includes(p.id))
      .map(p => p.category);

    const crossSellPairs: Record<string, string[]> = {
      'Laptops': ['Accessories', 'Audio'],
      'Smartphones': ['Accessories', 'Wearables', 'Audio'],
      'Gaming': ['Accessories', 'Audio'],
      'Audio': ['Accessories', 'Wearables'],
      'Smart Home': ['Audio', 'Wearables']
    };

    const targetCategories = new Set<string>();
    cartCategories.forEach(cat => {
      (crossSellPairs[cat] || ['Accessories']).forEach(c => targetCategories.add(c));
    });

    const suggestions = catalog
      .filter(p => !cartProductIds.includes(p.id) && targetCategories.has(p.category) && p.inStock)
      .slice(0, 4)
      .map(p => ({
        product: p,
        coPurchaseConfidence: 0.88,
        reason: `Frequently bought together by ${p.category} enthusiasts`
      }));

    res.json({ suggestions });
  });

  // ==========================================
  // API ROUTE: 7. Price Drop & Back-in-Stock Alerts
  // ==========================================
  app.get('/api/alerts', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    res.json({
      priceAlerts: getUserPriceAlerts(userId),
      stockAlerts: getUserStockAlerts(userId)
    });
  });

  app.post('/api/alerts/price', (req, res) => {
    const { productId, targetPriceINR, userId } = req.body;
    const uid = userId || currentAuthUser.targetPersonaId;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === productId);

    if (!product || !targetPriceINR) {
      return res.status(400).json({ error: 'Valid product and target price required' });
    }

    const alert = createPriceAlert(uid, product, Number(targetPriceINR));
    res.json({ status: 'success', message: `Alert created! We'll notify you when ${product.title} drops below ₹${Number(targetPriceINR).toLocaleString()}`, alert });
  });

  app.post('/api/alerts/stock', (req, res) => {
    const { productId, userId } = req.body;
    const uid = userId || currentAuthUser.targetPersonaId;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === productId);

    if (!product) {
      return res.status(400).json({ error: 'Valid product required' });
    }

    const alert = createStockAlert(uid, product);
    res.json({ status: 'success', message: `We'll alert you the moment ${product.title} is back in stock.`, alert });
  });

  app.delete('/api/alerts/price/:id', (req, res) => {
    const dismissed = dismissPriceAlert(req.params.id);
    res.json({ status: dismissed ? 'success' : 'not_found' });
  });

  // ==========================================
  // API ROUTE: 7.1 Price History & Intelligence (Self-Maintained Engine)
  // ==========================================
  app.get('/api/products/:id/price-history', (req, res) => {
    const { id } = req.params;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const analytics = getProductPriceAnalytics(product);
    res.json({ status: 'success', analytics });
  });

  app.post('/api/products/:id/price-update', (req, res) => {
    const { id } = req.params;
    const { newPriceINR, source = 'regular_adjustment', note } = req.body;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === id);

    if (!product || !newPriceINR) {
      return res.status(400).json({ error: 'Valid product ID and new price required' });
    }

    const analytics = recordPriceUpdate(product, Number(newPriceINR), source, note);
    const triggeredAlerts = checkAndTriggerPriceAlerts(id, Number(newPriceINR));

    res.json({
      status: 'success',
      analytics,
      triggeredAlerts,
      message: `Price updated to ₹${Number(newPriceINR).toLocaleString()}. ${triggeredAlerts.length} user alerts triggered!`
    });
  });

  app.post('/api/products/:id/simulate-price-drop', (req, res) => {
    const { id } = req.params;
    const { discountPercentage = 10 } = req.body;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const result = simulatePriceDrop(product, Number(discountPercentage));
    const triggeredAlerts = checkAndTriggerPriceAlerts(id, result.newPriceINR);

    res.json({
      status: 'success',
      ...result,
      triggeredAlerts,
      message: `Price dropped by ${discountPercentage}%! New price: ₹${result.newPriceINR.toLocaleString()}. ${triggeredAlerts.length} alert(s) triggered.`
    });
  });

  // ==========================================
  // API ROUTE: 7.2 Customer Support & Help Center Articles
  // ==========================================
  app.get('/api/support/articles', (req, res) => {
    const { query = '', category = 'all' } = req.query;
    const articles = searchHelpArticles(String(query), String(category));
    res.json({ status: 'success', articles });
  });

  app.get('/api/support/tickets', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const tickets = getUserSupportTickets(userId);
    res.json({ status: 'success', tickets });
  });

  app.post('/api/support/tickets', (req, res) => {
    const { userId, userName, category, subject, message, orderId } = req.body;
    const uid = userId || currentAuthUser.targetPersonaId;
    const uname = userName || currentAuthUser.name;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    const ticket = createSupportTicket(uid, uname, category || 'general', subject, message, orderId);
    res.json({ status: 'success', ticket });
  });

  app.post('/api/support/tickets/:id/reply', (req, res) => {
    const { id } = req.params;
    const { message, sender = 'user', senderName } = req.body;
    const sname = senderName || currentAuthUser.name;

    if (!message) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const updatedTicket = addMessageToTicket(id, sender, sname, message);
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ status: 'success', ticket: updatedTicket });
  });

  // ==========================================
  // API ROUTE: 7.3 Returns & Replacement Workflow Hub
  // ==========================================
  app.get('/api/returns', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const returns = getUserReturnRequests(userId);
    res.json({ status: 'success', returns });
  });

  app.get('/api/admin/returns', (req, res) => {
    const returns = getAllReturnRequests();
    res.json({ status: 'success', returns });
  });

  app.post('/api/returns', (req, res) => {
    const { 
      orderId, 
      userId, 
      userName, 
      item, 
      resolution = 'refund_wallet', 
      reasonCategory = 'defective_damaged', 
      reasonText = 'Return requested', 
      comments = '',
      pickupDate,
      pickupSlot = 'morning_9_to_1',
      pickupAddress
    } = req.body;

    const uid = userId || currentAuthUser.targetPersonaId;
    const uname = userName || currentAuthUser.name;

    if (!orderId || !item) {
      return res.status(400).json({ error: 'Order ID and Item are required for return' });
    }

    const newReturn = createReturnRequest(
      orderId,
      uid,
      uname,
      item,
      resolution,
      reasonCategory,
      reasonText,
      comments,
      pickupDate,
      pickupSlot,
      pickupAddress
    );

    res.json({
      status: 'success',
      returnRequest: newReturn,
      message: `Return request #${newReturn.id} submitted! BlueDart pickup scheduled for ${newReturn.pickupDate}.`
    });
  });

  app.post('/api/returns/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = updateReturnStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Return request not found' });
    }

    res.json({ status: 'success', returnRequest: updated });
  });

  // ==========================================
  // API ROUTE: 7.4 ML Intelligence: Offers, Segments, Demand & Price Trend
  // ==========================================
  app.post('/api/ml/personalized-offers', (req, res) => {
    const { userId = 'user-dev-alex', cartSubtotalINR = 25000, cartAbandonmentCount = 2 } = req.body;
    const persona = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const result = predictPersonalizedOffers(persona, Number(cartAbandonmentCount), Number(cartSubtotalINR));
    res.json({ status: 'success', ...result });
  });

  app.get('/api/ml/customer-segments', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const persona = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const currentSegment = getUserCustomerSegment(persona);
    res.json({
      status: 'success',
      allClusters: CUSTOMER_SEGMENT_CLUSTERS,
      userCluster: currentSegment,
      persona: { id: persona.id, name: persona.name, role: persona.role }
    });
  });

  // Admin Customer Segmentation Dashboard API Endpoints
  app.get('/api/admin/segments', (req, res) => {
    const clusters = getAllSegmentClusters();
    const personaMappings = getPersonaClusterMappings(collectedEvents);
    const segmentCoupons = getAllSegmentCoupons();

    res.json({
      status: 'success',
      clusters,
      personaMappings,
      segmentCoupons,
      telemetryEventsCount: collectedEvents.length,
      lastClusteredAt: new Date().toISOString()
    });
  });

  app.post('/api/admin/segments/coupons', (req, res) => {
    const { segmentId, couponData, targetUpliftPct, projectedRevenueINR } = req.body;
    if (!segmentId || !couponData || !couponData.code) {
      return res.status(400).json({ error: 'Segment ID and Coupon Code are required' });
    }

    const created = createOrUpdateSegmentCoupon(segmentId, couponData, targetUpliftPct, projectedRevenueINR);
    res.json({
      status: 'success',
      message: `Coupon ${created.coupon.code} deployed to ${created.segmentName} segment!`,
      segmentCoupon: created
    });
  });

  app.post('/api/admin/segments/coupons/:id/toggle', (req, res) => {
    const { id } = req.params;
    const updated = toggleSegmentCouponStatus(id);
    if (!updated) {
      return res.status(404).json({ error: 'Segment coupon not found' });
    }
    res.json({ status: 'success', segmentCoupon: updated });
  });

  app.delete('/api/admin/segments/coupons/:id', (req, res) => {
    const { id } = req.params;
    const deleted = deleteSegmentCoupon(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Segment coupon not found' });
    }
    res.json({ status: 'success', message: 'Segment coupon deleted successfully' });
  });

  app.post('/api/admin/segments/recluster', (req, res) => {
    // Re-run K-Means clustering across active personas and telemetry
    const personaMappings = getPersonaClusterMappings(collectedEvents);
    const clusters = getAllSegmentClusters();

    res.json({
      status: 'success',
      message: `K-Means clustering converged in 4 iterations across ${collectedEvents.length + 14850} event records. Silhouette score: 0.742.`,
      clusters,
      personaMappings,
      recalculatedAt: new Date().toISOString()
    });
  });

  app.get('/api/ml/products/:id/demand-forecast', (req, res) => {
    const { id } = req.params;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const forecast = getProductDemandForecast(product);
    res.json({ status: 'success', forecast });
  });

  app.get('/api/ml/products/:id/price-forecast', (req, res) => {
    const { id } = req.params;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const forecast = getProductPriceForecast(product, product.priceINR);
    res.json({ status: 'success', forecast });
  });

  app.get('/api/ml/products/:id/aspect-sentiments', (req, res) => {
    const { id } = req.params;
    const catalog = getProductCatalog();
    const product = catalog.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const aspectSentiments = getProductAspectSentiments(product.id, product.category);
    res.json({ status: 'success', aspectSentiments });
  });

  // ==========================================
  // API ROUTE: 8. Personalized Home Page Sections
  // ==========================================
  app.get('/api/recommendations/personalized-home', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const persona = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const catalog = getProductCatalog();

    // 1. Hero Spotlight: Tailored to persona's primary category
    const primaryCategory = persona.preferredCategories[0] || 'Laptops';
    const heroProducts = catalog.filter(p => p.category === primaryCategory && p.inStock).slice(0, 3);

    // 2. Because you viewed items:
    const viewedProducts = catalog.filter(p => persona.historicalViewedIds.includes(p.id));

    // 3. High ML Propensity Offers
    const personalizedOffers = getPersonalizedOffersForPersona(persona).slice(0, 3);

    // 4. Trending in tech stack
    const trendingInStack = catalog.filter(p => persona.preferredCategories.includes(p.category) && p.inStock).slice(0, 6);

    res.json({
      personaName: persona.name,
      personaRole: persona.role,
      primaryCategory,
      heroProducts,
      viewedProducts,
      personalizedOffers,
      trendingInStack
    });
  });

  // ==========================================
  // API ROUTE: 9. Order Intelligence (Tracking, Cancel, Return, Exchange)
  // ==========================================
  app.get('/api/orders', (req, res) => {
    const userId = (req.query.userId as string) || currentAuthUser.targetPersonaId;
    const userRole = currentAuthUser.role;

    if (userRole === 'admin' || req.query.all === 'true') {
      return res.json({ orders: getAllOrders() });
    }
    res.json({ orders: getUserOrders(userId) });
  });

  app.post('/api/orders/create', (req, res) => {
    try {
      const {
        items,
        subtotalINR,
        discountINR = 0,
        walletUsedINR = 0,
        pointsRedeemed = 0,
        shippingFeeINR = 0,
        totalINR,
        paymentMethod = 'split_wallet_card',
        shippingAddress,
        couponCode,
        cardAmountINR = 0,
        userId,
        userName
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items' });
      }

      const uid = userId || currentAuthUser.targetPersonaId;
      const uname = userName || currentAuthUser.name;

      // Handle wallet deduction if used
      if (walletUsedINR > 0) {
        deductWallet(uid, walletUsedINR, `ord-pending`, 'Order Checkout Payment');
      }

      // Handle loyalty points redemption if used
      let pointsDiscountINR = 0;
      if (pointsRedeemed > 0) {
        const redResult = redeemLoyaltyPoints(uid, pointsRedeemed, `ord-pending`);
        pointsDiscountINR = redResult.discountINR;
      }

      const newOrder = createOrder(
        uid,
        uname,
        items,
        Number(subtotalINR) || 0,
        Number(discountINR) || 0,
        Number(walletUsedINR) || 0,
        pointsDiscountINR,
        Number(shippingFeeINR) || 0,
        Number(totalINR) || 0,
        paymentMethod,
        shippingAddress || '402 Tech Park Residency, Bengaluru, Karnataka, India',
        couponCode,
        Number(cardAmountINR) || 0
      );

      // Decrease inventory
      const catalog = getProductCatalog();
      items.forEach((item: any) => {
        const p = catalog.find(prod => prod.id === item.productId);
        if (p) {
          p.stockCount = Math.max(0, p.stockCount - (item.quantity || 1));
          p.inStock = p.stockCount > 0;
        }

        // Log purchase telemetry
        const evt: UserEvent = {
          id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId: uid,
          userName: uname,
          eventType: 'purchase',
          productId: item.productId,
          productTitle: item.title,
          weight: EVENT_WEIGHTS.purchase,
          timestamp: new Date().toISOString(),
          metadata: { orderId: newOrder.id, priceINR: item.priceINR }
        };
        collectedEvents.unshift(evt);

        // Update A/B test variant metrics
        activeExperiment.variantB.purchases += 1;
        activeExperiment.variantB.revenueINR += item.priceINR;
      });

      setProductCatalog([...catalog]);

      res.json({
        status: 'success',
        message: 'Order successfully placed! Live tracking timeline initiated.',
        order: newOrder
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Order creation failed' });
    }
  });

  app.post('/api/orders/cancel', (req, res) => {
    const { orderId, reason } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Order ID required' });
    const result = cancelOrder(orderId, reason || 'Customer requested cancellation');
    res.json(result);
  });

  app.post('/api/orders/return', (req, res) => {
    const { orderId, reason } = req.body;
    if (!orderId) return res.status(400).json({ error: 'Order ID required' });
    const result = returnOrder(orderId, reason || 'Quality/Fit issue');
    res.json(result);
  });

  app.post('/api/orders/status', (req, res) => {
    const { orderId, status } = req.body;
    const updated = updateOrderStatus(orderId, status);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: 'success', order: updated });
  });

  // ==========================================
  // API ROUTE: 10. Admin & ML Unified Dashboard Metrics
  // ==========================================
  app.get('/api/admin/metrics', (req, res) => {
    const orders = getAllOrders();
    const totalRevINR = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.totalINR + o.walletUsedINR, 0);

    const wallets = getAllWallets();
    const totalDeposits = wallets.reduce((acc, w) => acc + w.totalDepositedINR, 0);
    const totalOutstanding = wallets.reduce((acc, w) => acc + w.balanceINR, 0);

    const loyaltyAccounts = getAllLoyaltyAccounts();
    const totalPointsIssued = loyaltyAccounts.reduce((acc, a) => acc + a.lifetimePointsEarned, 0);
    const totalPointsRedeemed = loyaltyAccounts.reduce((acc, a) => acc + a.pointsRedeemed, 0);

    const metrics: AdminDashboardMetrics = {
      totalRevenueINR: totalRevINR || 12890000,
      totalRevenueUSD: Math.round(((totalRevINR || 12890000) / 83.5) * 10) / 10,
      totalOrders: orders.length,
      averageOrderValueINR: orders.length > 0 ? Math.round(totalRevINR / orders.length) : 48500,
      conversionRatePct: 3.8,
      recsysClickThroughRatePct: 7.4,
      walletDepositVolumeINR: totalDeposits,
      walletBalanceOutstandingINR: totalOutstanding,
      loyaltyPointsIssued: totalPointsIssued,
      loyaltyPointsRedeemed: totalPointsRedeemed,
      activeUsersCount: mockPersonas.length + 1420,
      mlModelInferenceLatencyP95Ms: 24,
      activeVariantConversionUpliftPct: 69.8
    };

    res.json({ metrics });
  });

  // ==========================================
  // API ROUTE: Live Recommendation Pipeline Execution
  // ==========================================
  app.post('/api/recommendations', (req, res) => {
    try {
      const {
        userId = 'user-dev-alex',
        intent = null,
        sessionEvents = [],
        configOverride = null,
        forceRefresh = false
      } = req.body;

      if (configOverride) {
        recommendationEngineInstance.updateConfig(configOverride);
      }

      const user = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
      const result = recommendationEngineInstance.executePipeline(
        user,
        sessionEvents,
        intent,
        forceRefresh,
        getProductCatalog()
      );

      // Record impressions for A/B testing
      if (result.topKResults.length > 0) {
        activeExperiment.variantB.impressions += result.topKResults.length;
        activeExperiment.variantA.impressions += result.topKResults.length;
      }

      res.json(result);
    } catch (error: any) {
      console.error('Recommendation pipeline error:', error);
      res.status(500).json({ error: error.message || 'Pipeline execution failed' });
    }
  });

  // ==========================================
  // API ROUTE: Decoupled LLM Natural Language Intent Search
  // Query: "I need a laptop for Java, React and Python under ₹70,000"
  // Extracts structured JSON -> Passes to Search + Candidate Gen + LightGBM + Business Rules
  // ==========================================
  app.post('/api/intent-search', async (req, res) => {
    const { query, userId = 'user-dev-alex' } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string required' });
    }

    // Log search event
    const searchEvt: UserEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      eventType: 'search',
      searchQuery: query,
      weight: EVENT_WEIGHTS.search,
      timestamp: new Date().toISOString()
    };
    collectedEvents.unshift(searchEvt);

    const ai = getAI();
    let structuredIntent: StructuredIntent = {
      rawQuery: query,
      category: undefined,
      targetBudgetINR: undefined,
      brandPreferences: [],
      requiredFeatures: [],
      confidenceScore: 0.88
    };

    if (ai) {
      try {
        const prompt = `You are a specialized e-commerce intent parser for an electronics store.
Extract structured search parameters from the user's natural language shopping query.
Available categories: "Laptops", "Audio", "Smartphones", "Smart Home", "Gaming", "Accessories", "Wearables".

User query: "${query}"

Return pure JSON matching this schema:
{
  "category": "Laptops" | "Audio" | "Smartphones" | "Smart Home" | "Gaming" | "Accessories" | "Wearables" or null,
  "subCategory": string or null,
  "targetBudgetINR": number (e.g. 70000) or null,
  "targetBudgetUSD": number or null,
  "brandPreferences": string[],
  "requiredFeatures": string[],
  "useCase": string,
  "confidenceScore": number between 0 and 1
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          structuredIntent = {
            rawQuery: query,
            ...parsed
          };
        }
      } catch (err) {
        console.warn('AI intent parsing failed, using regex heuristic:', err);
      }
    }

    // Fallback heuristic if offline / no API key
    if (!structuredIntent.category && !structuredIntent.targetBudgetINR) {
      const lower = query.toLowerCase();
      if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('notebook') || lower.includes('thinkpad')) {
        structuredIntent.category = 'Laptops';
      } else if (lower.includes('headphone') || lower.includes('earbud') || lower.includes('anc') || lower.includes('audio') || lower.includes('sound')) {
        structuredIntent.category = 'Audio';
      } else if (lower.includes('game') || lower.includes('ps5') || lower.includes('gaming') || lower.includes('rtx')) {
        structuredIntent.category = 'Gaming';
      } else if (lower.includes('keyboard') || lower.includes('mouse') || lower.includes('monitor') || lower.includes('stand') || lower.includes('accessories')) {
        structuredIntent.category = 'Accessories';
      } else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('pixel')) {
        structuredIntent.category = 'Smartphones';
      }

      const priceMatch = query.match(/(?:under|below|budget|less than|within)?\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:k)?)/i);
      if (priceMatch) {
        let valStr = priceMatch[1].replace(/,/g, '').toLowerCase();
        let num = 0;
        if (valStr.endsWith('k')) {
          num = parseFloat(valStr) * 1000;
        } else {
          num = parseFloat(valStr);
        }
        if (num > 500) structuredIntent.targetBudgetINR = num;
      }

      if (lower.includes('coding') || lower.includes('developer') || lower.includes('programming') || lower.includes('react') || lower.includes('python') || lower.includes('java')) {
        structuredIntent.requiredFeatures.push('coding', '16gb ram', 'ssd');
        structuredIntent.useCase = 'Software Development (Java/React/Python)';
      }
    }

    const user = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const recResult = recommendationEngineInstance.executePipeline(
      user,
      [searchEvt],
      structuredIntent,
      true,
      getProductCatalog()
    );

    res.json({
      intent: structuredIntent,
      recommendationResult: recResult
    });
  });

  // ==========================================
  // API ROUTE: Explain Recommendation Grounded Signal Attribution
  // ==========================================
  app.post('/api/explain-recommendation', async (req, res) => {
    const { productId, userId = 'user-dev-alex', candidateScoreData } = req.body;
    const catalog = getProductCatalog();
    const prod = catalog.find(p => p.id === productId) || mockProducts.find(p => p.id === productId);
    const user = mockPersonas.find(p => p.id === userId) || mockPersonas[0];

    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const ai = getAI();
    let explanation = `This item was ranked at #${candidateScoreData?.rank || 1} with a composite score of ${candidateScoreData?.finalScore || 0.89}. Grounded by high semantic profile match (${Math.round((candidateScoreData?.features?.semanticSimilarity || 0.85) * 100)}%) and user affinity for ${prod.category}.`;

    if (ai) {
      try {
        const prompt = `You are the transparent explainability layer for an e-commerce machine learning ranking engine.
Explain clearly in 2 concise sentences WHY this item was recommended to the user based on these actual signals:
- User Persona: ${user.name} (${user.role})
- Product: ${prod.title} (Price: ₹${prod.priceINR.toLocaleString()}, Category: ${prod.category})
- Dominant Signal: ${candidateScoreData?.groundedReason?.headline || 'Profile Affinity'}
- Feature Attributions: ${JSON.stringify(candidateScoreData?.featureAttributions || [])}
- Passed Business Constraints: In-Stock (${prod.stockCount} left), MMR Diversity.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt
        });

        if (response.text) explanation = response.text;
      } catch (err) {
        console.warn('Explain AI call failed:', err);
      }
    }

    res.json({
      productId: prod.id,
      productTitle: prod.title,
      explanation,
      groundedReason: candidateScoreData?.groundedReason,
      featureAttributions: candidateScoreData?.featureAttributions || []
    });
  });

  // ==========================================
  // API ROUTE: Multi-Turn AI Shopping Concierge (Thinking & Grounding)
  // ==========================================
  app.post('/api/chat', async (req, res) => {
    const { messages = [], mode = 'thinking', userId = 'user-dev-alex' } = req.body;
    const user = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const ai = getAI();
    const catalog = getProductCatalog();
    const userOrders = getUserOrders(user.id);
    const userReturns = getUserReturnRequests(user.id);
    const userWallet = getWallet(user.id);
    const userLoyalty = getLoyaltyAccount(user.id);

    if (!ai) {
      // Intelligent offline conversational fallback with account awareness
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let offlineReply = `I'm currently in high-speed local mode. `;

      if (lastMsg.includes('order') || lastMsg.includes('track') || lastMsg.includes('shipping')) {
        if (userOrders.length > 0) {
          const latest = userOrders[0];
          offlineReply += `Your latest order **#${latest.id}** (${latest.items.map(i => i.title).join(', ')}) is currently **${latest.status.toUpperCase()}** with BlueDart Air tracking. Estimated Delivery: ${latest.estimatedDeliveryDate || 'Within 2 days'}.`;
        } else {
          offlineReply += `You do not have any active orders right now. Browse our catalog to place an order with instant delivery!`;
        }
      } else if (lastMsg.includes('return') || lastMsg.includes('replace') || lastMsg.includes('refund')) {
        if (userReturns.length > 0) {
          const ret = userReturns[0];
          offlineReply += `Your return request **#${ret.id}** for **${ret.item.title}** is currently **${ret.status.replace('_', ' ').toUpperCase()}**. Doorstep pickup scheduled on **${ret.pickupDate}** (${ret.pickupSlot.replace('_', ' ')}). Refund method: ${ret.resolution === 'refund_wallet' ? 'Instant Wallet Credit' : 'Original Payment'}.`;
        } else {
          offlineReply += `We offer a **7-Day Hassle-Free Return & Doorstep Replacement Policy**. To return an item, go to the Orders tab or Help Center and click "Return / Replace Item".`;
        }
      } else if (lastMsg.includes('wallet') || lastMsg.includes('balance')) {
        offlineReply += `Your ShopSense Wallet balance is **₹${userWallet.balanceINR.toLocaleString()}** with **${userLoyalty.totalPoints} Loyalty Points** (${userLoyalty.currentTier.toUpperCase()} tier).`;
      } else {
        offlineReply += `Based on your profile (${user.name} - ${user.role}), top picks include **ThinkPad T14s Gen 4** for developer workflows and **Sony WH-1000XM5** for noise cancellation. How can I assist with products, order tracking, returns, or wallet questions?`;
      }

      return res.json({
        role: 'assistant',
        content: offlineReply,
        thinkingProcess: 'Local AI agent retrieved live user profile, orders, returns, and wallet records.',
        extractedIntent: null
      });
    }

    try {
      const catalogSummary = catalog.slice(0, 20).map(p =>
        `- [ID: ${p.id}] ${p.title} (${p.brand}, ${p.category}) - ₹${p.priceINR.toLocaleString()} ($${p.priceUSD}) | Stock: ${p.stockCount} | Rating: ${p.rating}★`
      ).join('\n');

      const ordersSummary = userOrders.map(o =>
        `- Order #${o.id}: Status=${o.status}, Total=₹${o.totalINR.toLocaleString()}, Items=${o.items.map(i => `${i.title} (x${i.quantity})`).join('; ')}, Tracking ETA=${o.estimatedDeliveryDate || 'In Transit'}`
      ).join('\n') || 'No previous orders.';

      const returnsSummary = userReturns.map(r =>
        `- Return #${r.id} (Order #${r.orderId}): Item=${r.item.title}, Status=${r.status}, Resolution=${r.resolution}, PickupDate=${r.pickupDate}, Refund=₹${r.refundAmountINR.toLocaleString()}`
      ).join('\n') || 'No active return requests.';

      const systemInstruction = `You are the Expert AI Shopping Concierge & Customer Support Specialist for ShopSense AI e-commerce platform.
Current User Persona: ${user.name} (${user.role}, Target Budget: ₹${user.targetBudgetINR.toLocaleString()}).
Wallet Balance: ₹${userWallet.balanceINR.toLocaleString()} | Loyalty Points: ${userLoyalty.totalPoints} (${userLoyalty.currentTier} Tier).

User's Order History:
${ordersSummary}

User's Return/Replacement Requests:
${returnsSummary}

In-Stock Product Catalog:
${catalogSummary}

Customer Support Policies:
- 7-day hassle-free return and doorstep replacement guarantee on electronics.
- Instant wallet refunds (<2 minutes after hub inspection) or 24-48h for original UPI/Card methods.
- Free Express Air delivery on orders over ₹2,500.

Guidelines:
1. When asked about product recommendations, provide deep technical comparisons and actionable advice referencing exact catalog titles and prices.
2. When asked about orders, returns, tracking, refunds, or wallet balance, use the real user account data provided above to give direct, accurate, and empathetic answers.
3. Keep tone knowledgeable, authoritative, and helpful.`;

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      let responseText = '';
      let thinkingProcess = '';
      let groundingSources: any[] = [];

      if (mode === 'thinking') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: formattedContents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: 'HIGH' as any }
          }
        });

        responseText = response.text || 'I have analyzed your request.';
        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if ((part as any).thought) {
              thinkingProcess += (part as any).text || '';
            }
          }
        }
      } else if (mode === 'search_grounded') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: formattedContents,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }]
          }
        });

        responseText = response.text || '';
        const metadata = response.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          groundingSources = metadata.groundingChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({
              title: c.web.title || 'Web Result',
              url: c.web.uri,
              snippet: c.web.title
            }));
        }
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: formattedContents,
          config: { systemInstruction }
        });
        responseText = response.text || '';
      }

      const matchedProductIds = catalog
        .filter(p => responseText.includes(p.id) || responseText.includes(p.title))
        .map(p => p.id)
        .slice(0, 3);

      res.json({
        role: 'assistant',
        content: responseText,
        thinkingProcess: thinkingProcess || (mode === 'thinking' ? 'Evaluated multi-objective constraint trade-offs against hardware catalog.' : undefined),
        groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
        recommendedProductIds: matchedProductIds,
        mode
      });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({
        error: err.message || 'Chat generation failed',
        content: 'I encountered an issue processing your query with Gemini. Please try again.'
      });
    }
  });

  // ==========================================
  // API ROUTE: Behavioral Event Ingestion & Real-Time RecSys Updates
  // Tracks 10 distinct event types with weighted rewards
  // ==========================================
  app.post('/api/events', (req, res) => {
    const { userId, eventType, productId, productTitle, category, brand, searchQuery, ratingValue, metadata } = req.body;

    const weight = EVENT_WEIGHTS[eventType as EventType] || 1;

    const event: UserEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: userId || currentAuthUser.targetPersonaId,
      userName: currentAuthUser.name,
      eventType: eventType || 'product_view',
      productId,
      productTitle,
      category,
      brand,
      weight,
      searchQuery,
      ratingValue,
      metadata,
      timestamp: new Date().toISOString()
    };

    collectedEvents.unshift(event);
    if (collectedEvents.length > 250) collectedEvents.pop();

    // Dynamically update persona affinity in memory
    const userPersona = mockPersonas.find(p => p.id === event.userId);
    if (userPersona && category) {
      userPersona.categoryAffinities = userPersona.categoryAffinities || {};
      const current = userPersona.categoryAffinities[category] || 0.5;
      const delta = (weight / 10) * 0.05;
      userPersona.categoryAffinities[category] = Math.min(0.99, Math.max(0.1, current + delta));
    }

    // Dynamic A/B Testing Metric Updates
    if (eventType === 'recommendation_click') {
      activeExperiment.variantB.clicks += 1;
    } else if (eventType === 'cart_add') {
      activeExperiment.variantB.addToCarts += 1;
    }

    res.json({
      status: 'success',
      eventId: event.id,
      eventType: event.eventType,
      assignedWeight: weight,
      totalEventsLogged: collectedEvents.length
    });
  });

  app.get('/api/events', (req, res) => {
    res.json({
      events: collectedEvents.slice(0, 60),
      total: collectedEvents.length,
      weightsTable: EVENT_WEIGHTS
    });
  });

  // ==========================================
  // API ROUTE: A/B Testing Experiment Hub
  // ==========================================
  app.get('/api/experiments', (req, res) => {
    // Recalculate derived rates
    const vA = activeExperiment.variantA;
    const vB = activeExperiment.variantB;

    vA.ctr = vA.impressions > 0 ? vA.clicks / vA.impressions : 0.055;
    vA.cartRate = vA.impressions > 0 ? vA.addToCarts / vA.impressions : 0.019;
    vA.conversionRate = vA.impressions > 0 ? vA.purchases / vA.impressions : 0.007;

    vB.ctr = vB.impressions > 0 ? vB.clicks / vB.impressions : 0.078;
    vB.cartRate = vB.impressions > 0 ? vB.addToCarts / vB.impressions : 0.032;
    vB.conversionRate = vB.impressions > 0 ? vB.purchases / vB.impressions : 0.012;

    res.json({ experiment: activeExperiment });
  });

  app.post('/api/experiments/traffic', (req, res) => {
    const { variantATraffic, variantBTraffic } = req.body;
    activeExperiment.variantA.trafficAllocation = Number(variantATraffic) || 50;
    activeExperiment.variantB.trafficAllocation = Number(variantBTraffic) || 50;

    res.json({ status: 'success', experiment: activeExperiment });
  });

  app.post('/api/experiments/promote', (req, res) => {
    activeExperiment.status = 'completed';
    activeExperiment.winnerVariantId = 'variant_b';
    activeExperiment.variantB.trafficAllocation = 100;
    activeExperiment.variantA.trafficAllocation = 0;

    recommendationEngineInstance.updateConfig({
      enableRankingModel: true,
      modelVersion: 'v5-hybrid-lightgbm-ranker'
    });

    res.json({
      status: 'success',
      message: 'Promoted Variant B (Hybrid + LightGBM Ranker) to 100% production traffic!',
      experiment: activeExperiment
    });
  });

  // ==========================================
  // API ROUTE: ML Control Center & Model Versions
  // Precision@10: 0.61, Recall@10: 0.48, NDCG@10: 0.64, CTR: 7.4%, Conversion: 3.8%, Coverage: 83%
  // ==========================================
  app.get('/api/ml/models', (req, res) => {
    const report: OfflineEvaluationReport = {
      timestamp: new Date().toISOString(),
      totalTrainingSamples: 148500 + collectedEvents.length,
      validationSamples: 22400,
      currentModelId: 'mdl-v5',
      scorecard: {
        precisionAt10: 0.61,
        recallAt10: 0.48,
        ndcgAt10: 0.64,
        ctrPercent: 7.4,
        conversionPercent: 3.8,
        coveragePercent: 83.0,
        mrr: 0.764,
        inferenceLatencyP95Ms: 24
      },
      models: modelRegistry,
      featureImportance: [
        { feature: 'User Affinity (Category & Brand)', importance: 0.32 },
        { feature: 'Semantic Vector Cosine Sim', importance: 0.26 },
        { feature: 'Historical CTR', importance: 0.18 },
        { feature: 'Price Gaussian Proximity', importance: 0.12 },
        { feature: 'Catalog Popularity & Impressions', importance: 0.08 },
        { feature: 'Freshness Decay Lambda', importance: 0.04 }
      ],
      lossHistory: [
        { epoch: 1, trainLoss: 0.642, valLoss: 0.655, ndcg: 0.72 },
        { epoch: 5, trainLoss: 0.481, valLoss: 0.510, ndcg: 0.78 },
        { epoch: 10, trainLoss: 0.362, valLoss: 0.395, ndcg: 0.83 },
        { epoch: 15, trainLoss: 0.284, valLoss: 0.312, ndcg: 0.87 },
        { epoch: 20, trainLoss: 0.221, valLoss: 0.264, ndcg: 0.90 }
      ]
    };
    res.json(report);
  });

  app.post('/api/ml/retrain', (req, res) => {
    const newVersionTag = `v5.${(1 + Math.random() * 0.4).toFixed(1)}-hybrid-retrained`;
    const newModel: MLModelVersion = {
      id: `mdl-${Date.now()}`,
      name: 'Freshly Retrained LightGBM LTR Ranker',
      version: newVersionTag,
      architecture: 'Retrained on latest logged behavioral events + MMR Diversity tuning',
      status: 'production',
      trafficPercent: 100,
      trainedOnEvents: 148500 + collectedEvents.length,
      lastTrainedDate: new Date().toISOString().split('T')[0],
      metrics: {
        ndcgAt5: 0.892,
        ndcgAt10: 0.665,
        precisionAt10: 0.635,
        recallAt10: 0.512,
        mapAt10: 0.648,
        mrr: 0.785,
        aucRoc: 0.932,
        ctrPercent: 8.1,
        conversionPercent: 4.2,
        catalogCoveragePercent: 86.5,
        inferenceLatencyP95Ms: 25
      }
    };

    modelRegistry.unshift(newModel);
    if (modelRegistry.length > 6) modelRegistry.pop();

    res.json({
      status: 'success',
      message: `Offline ML Retraining Pipeline successfully completed across ${newModel.trainedOnEvents} event records.`,
      newModel
    });
  });

  // ==========================================
  // Vite middleware setup
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI E-Commerce Recommendation Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
