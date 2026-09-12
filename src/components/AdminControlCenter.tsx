import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Database, 
  Wallet, 
  Crown, 
  Tag, 
  MessageSquare, 
  GitCompare, 
  Cpu, 
  Activity, 
  Truck, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Zap, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AdminDashboardMetrics, Currency, Order, UserWallet, UserLoyaltyAccount, Coupon, ProductReview } from '../types';
import { AdminProductManager } from './AdminProductManager';
import { ProductIngestionHub } from './ProductIngestionHub';
import { ABTestingHub } from './ABTestingHub';
import { OfflineMLHub } from './OfflineMLHub';
import { LiveEventStream } from './LiveEventStream';
import { CustomerSegmentationDashboard } from './CustomerSegmentationDashboard';

interface AdminControlCenterProps {
  currency: Currency;
  onRefreshCatalog?: () => void;
  onSelectProductDetails?: (productId: string) => void;
}

export type AdminSubTab = 
  | 'overview' 
  | 'segmentation'
  | 'products' 
  | 'ingestion' 
  | 'orders' 
  | 'wallets' 
  | 'loyalty' 
  | 'coupons' 
  | 'reviews' 
  | 'ab_testing' 
  | 'ml_models' 
  | 'event_stream';

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  currency,
  onRefreshCatalog,
  onSelectProductDetails
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin Data stores
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<UserLoyaltyAccount[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 1. Metrics
      const resM = await fetch('/api/admin/metrics');
      const dataM = await resM.json();
      if (dataM.metrics) setMetrics(dataM.metrics);

      // 2. Orders
      const resO = await fetch('/api/orders?all=true');
      const dataO = await resO.json();
      if (dataO.orders) setOrders(dataO.orders);

      // 3. Wallets
      const resW = await fetch('/api/admin/wallets');
      const dataW = await resW.json();
      if (dataW.wallets) setWallets(dataW.wallets);

      // 4. Loyalty
      const resL = await fetch('/api/admin/loyalty');
      const dataL = await resL.json();
      if (dataL.accounts) setLoyaltyAccounts(dataL.accounts);

      // 5. Coupons
      const resC = await fetch('/api/coupons');
      const dataC = await resC.json();
      if (dataC.coupons) setCoupons(dataC.coupons);

      // 6. Reviews
      const resR = await fetch('/api/reviews');
      const dataR = await resR.json();
      if (dataR.reviews) setReviews(dataR.reviews);

    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      setStatusUpdatingId(orderId);
      const res = await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const navItems: { id: AdminSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'segmentation', label: 'Customer Segmentation & ML Cohorts', icon: Users },
    { id: 'orders', label: 'Live Orders & Dispatch', icon: Truck },
    { id: 'wallets', label: 'Wallets & Gateways', icon: Wallet },
    { id: 'loyalty', label: 'Loyalty Tiers & Points', icon: Crown },
    { id: 'coupons', label: 'Coupons & ML Propensity', icon: Tag },
    { id: 'reviews', label: 'Reviews & NLP Sentiment', icon: MessageSquare },
    { id: 'products', label: 'Products & Inventory', icon: Package },
    { id: 'ingestion', label: 'Data Ingestion & Embeddings', icon: Database },
    { id: 'ab_testing', label: 'A/B Experiments Hub', icon: GitCompare },
    { id: 'ml_models', label: 'ML Models & NDCG Scorecard', icon: Cpu },
    { id: 'event_stream', label: '10-Weight Event Telemetry', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              ShopSense &bull; Admin &amp; ML Control Center
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-semibold">
                SYSTEM OPERATIONAL
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Unified control panel for recommendation models, wallets, loyalty, orders, NLP reviews &amp; A/B tests.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-900/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-View Content */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Executive KPI Scorecard Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            
            {/* Total Revenue */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Gross Merchandise</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {currency === 'INR' ? `₹${(metrics?.totalRevenueINR || 12890000).toLocaleString()}` : `$${(metrics?.totalRevenueUSD || 154371).toLocaleString()}`}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +18.4% vs last period
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Orders Fulfilled</span>
                <Truck className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {(metrics?.totalOrders || orders.length || 268).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                AOV: <strong className="text-cyan-300 font-mono">₹{(metrics?.averageOrderValueINR || 48500).toLocaleString()}</strong>
              </div>
            </div>

            {/* RecSys CTR & Uplift */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>RecSys CTR (Variant B)</span>
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold font-mono text-purple-300">
                {metrics?.recsysClickThroughRatePct || 7.4}%
              </div>
              <div className="text-[10px] text-purple-400 mt-1 font-semibold">
                +{metrics?.activeVariantConversionUpliftPct || 69.8}% A/B Conversion Uplift
              </div>
            </div>

            {/* ML Inference Latency */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>P95 Inference Latency</span>
                <Cpu className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">
                {metrics?.mlModelInferenceLatencyP95Ms || 24} ms
              </div>
              <div className="text-[10px] text-emerald-400 mt-1">
                8-dim ANN Vector Search &bull; pgvector
              </div>
            </div>

            {/* Wallet Total Deposits */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Wallet Deposit Volume</span>
                <Wallet className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                ₹{(metrics?.walletDepositVolumeINR || 450000).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Outstanding: ₹{(metrics?.walletBalanceOutstandingINR || 85000).toLocaleString()}
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Loyalty Points Issued</span>
                <Crown className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">
                {(metrics?.loyaltyPointsIssued || 124000).toLocaleString()} pts
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Redeemed: {(metrics?.loyaltyPointsRedeemed || 32000).toLocaleString()} pts
              </div>
            </div>

            {/* Active Customers */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Active Tech Customers</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {(metrics?.activeUsersCount || 1424).toLocaleString()}
              </div>
              <div className="text-[10px] text-cyan-400 mt-1">
                Across 4 Dynamic Personas
              </div>
            </div>

            {/* Overall Conversion Rate */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Store Conversion Rate</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {metrics?.conversionRatePct || 3.8}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Benchmark: 2.2% SaaS Average
              </div>
            </div>

          </div>

          {/* Quick Sub-Modules Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Orders Preview */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cyan-400" /> Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveSubTab('orders')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Manage All Orders &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {orders.slice(0, 4).map(o => (
                  <div key={o.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{o.userName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({o.id})</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {o.items.length} items &bull; {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-cyan-300">₹{(o.totalINR || 0).toLocaleString()}</div>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Wallets Preview */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-400" /> Customer Wallets &amp; Sandbox
                </h3>
                <button
                  onClick={() => setActiveSubTab('wallets')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View All Wallets &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {wallets.map(w => (
                  <div key={w.userId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{w.userName}</div>
                      <div className="text-[10px] text-slate-400">{w.transactions.length} transactions recorded</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">₹{w.balanceINR.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Deposited: ₹{w.totalDepositedINR.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Orders & Dispatch Management */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Live Multi-Carrier Dispatch Stepper ({orders.length})</h2>
            <span className="text-xs text-slate-400">Advance order fulfillment statuses to test customer tracking timeline</span>
          </div>

          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{order.id}</span>
                      <span className="text-slate-400 font-normal">&bull; Customer: <strong>{order.userName}</strong></span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 uppercase">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Carrier: <strong className="text-slate-200">{order.trackingCarrier}</strong> &bull; Tracking: <span className="font-mono text-cyan-400">{order.trackingNumber}</span> &bull; Address: {order.shippingAddress}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">
                      ₹{(order.totalINR || 0).toLocaleString()}
                    </span>

                    {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'returned' && (
                      <div className="flex gap-1.5">
                        {order.status === 'placed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'packed')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                          >
                            Mark Packed &rarr;
                          </button>
                        )}
                        {order.status === 'packed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                          >
                            Hand to BlueDart (Shipped) &rarr;
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                          >
                            Out for Delivery &rarr;
                          </button>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                          >
                            Confirm Delivery &rarr;
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <div className="font-medium text-slate-300 mb-1">Items in this package:</div>
                  <div className="flex flex-wrap gap-3">
                    {order.items.map((it, i) => (
                      <span key={i} className="text-slate-400 text-[11px]">
                        {it.title} (x{it.quantity || 1}) - <strong className="text-slate-300">₹{(it.priceINR || 0).toLocaleString()}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallets Management */}
      {activeSubTab === 'wallets' && (
        <div className="space-y-4 animate-in fade-in">
          <h2 className="text-base font-bold text-white">Customer Wallets &amp; Payment Ledgers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map(w => (
              <div key={w.userId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{w.userName}</h3>
                    <div className="text-xs text-slate-400 font-mono">User ID: {w.userId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-emerald-400">₹{w.balanceINR.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Available Balance</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300">Recent Transactions ({w.transactions.length})</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                    {w.transactions.map(t => (
                      <div key={t.id} className="p-2 rounded bg-slate-950 flex justify-between">
                        <div>
                          <div className="text-slate-200 text-[11px]">{t.description}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{new Date(t.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div className={`font-mono font-bold ${t.amountINR > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {t.amountINR > 0 ? '+' : ''}₹{t.amountINR.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty Management */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-4 animate-in fade-in">
          <h2 className="text-base font-bold text-white">Loyalty Accounts &amp; Tier Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loyaltyAccounts.map(acc => (
              <div key={acc.userId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{acc.userName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {acc.currentTier} Member
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-amber-400">{acc.totalPoints} pts</div>
                    <div className="text-[10px] text-slate-400">Lifetime: {acc.lifetimePointsEarned} pts</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="p-2 rounded bg-slate-950">
                    <span className="text-slate-400 block text-[10px]">Points Redeemed</span>
                    <span className="font-mono font-bold text-slate-200">{acc.pointsRedeemed} pts</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950">
                    <span className="text-slate-400 block text-[10px]">Daily Login Streak</span>
                    <span className="font-mono font-bold text-emerald-400">{acc.dailyLoginStreak} Days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupons Management */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-4 animate-in fade-in">
          <h2 className="text-base font-bold text-white">Coupons &amp; ML Conversion Propensity Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map(c => (
              <div key={c.code} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
                    {c.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white">{c.title}</div>
                <p className="text-[11px] text-slate-400">{c.description}</p>
                <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Min Order: ₹{c.minOrderINR.toLocaleString()}</span>
                  <span>Times Used: {c.usageCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews & NLP Sentiment Management */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4 animate-in fade-in">
          <h2 className="text-base font-bold text-white">Customer Reviews &amp; Real-Time NLP Sentiments ({reviews.length})</h2>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{r.userName}</span>
                    <span className="text-xs text-slate-400 font-mono">&bull; {r.productId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                    r.sentiment === 'positive'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}>
                    {r.sentiment} ({Math.round(r.sentimentScore * 100)}%)
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{r.title}</div>
                <p className="text-xs text-slate-300">{r.comment}</p>
                <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                  {r.pros.map((p, i) => (
                    <span key={i} className="bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-900">
                      + {p}
                    </span>
                  ))}
                  {r.cons.map((c, i) => (
                    <span key={i} className="bg-rose-950/40 text-rose-300 px-1.5 py-0.5 rounded border border-rose-900">
                      - {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products & Inventory Tab */}
      {activeSubTab === 'products' && (
        <AdminProductManager 
          onRefreshCatalog={onRefreshCatalog || (() => {})} 
          onSelectProductDetails={onSelectProductDetails || (() => {})} 
        />
      )}

      {/* Customer Segmentation & Behavioral Clusters Tab */}
      {activeSubTab === 'segmentation' && (
        <CustomerSegmentationDashboard 
          currency={currency} 
          onRefreshData={fetchAdminData}
        />
      )}

      {/* Ingestion Hub */}
      {activeSubTab === 'ingestion' && (
        <ProductIngestionHub onIngestionComplete={onRefreshCatalog || (() => {})} />
      )}

      {/* A/B Testing Experiments */}
      {activeSubTab === 'ab_testing' && (
        <ABTestingHub />
      )}

      {/* Offline ML Models & NDCG */}
      {activeSubTab === 'ml_models' && (
        <OfflineMLHub />
      )}

      {/* Event Stream */}
      {activeSubTab === 'event_stream' && (
        <LiveEventStream onSelectProduct={onSelectProductDetails || (() => {})} />
      )}

    </div>
  );
};
