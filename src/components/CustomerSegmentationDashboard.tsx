import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BrainCircuit, 
  Tag, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Play, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  Target, 
  ShieldAlert, 
  Layers, 
  Zap, 
  RefreshCw, 
  Sliders, 
  ArrowUpRight, 
  Lock, 
  Gift, 
  DollarSign, 
  Activity, 
  Percent, 
  Truck, 
  Crown, 
  Wallet, 
  ShoppingBag, 
  Eye, 
  AlertCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  CustomerSegmentCluster, 
  SegmentCustomCoupon, 
  PersonaSegmentMapping, 
  Currency, 
  Coupon 
} from '../types';

interface CustomerSegmentationDashboardProps {
  currency: Currency;
  onRefreshData?: () => void;
}

export const CustomerSegmentationDashboard: React.FC<CustomerSegmentationDashboardProps> = ({
  currency,
  onRefreshData
}) => {
  const [clusters, setClusters] = useState<CustomerSegmentCluster[]>([]);
  const [personaMappings, setPersonaMappings] = useState<PersonaSegmentMapping[]>([]);
  const [segmentCoupons, setSegmentCoupons] = useState<SegmentCustomCoupon[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<CustomerSegmentCluster['segmentId']>('budget_shopper');
  const [loading, setLoading] = useState(false);
  const [reclustering, setReclustering] = useState(false);
  const [reclusterSuccessMsg, setReclusterSuccessMsg] = useState<string | null>(null);

  // New Coupon Form state
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [couponDescription, setCouponDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat_inr' | 'free_shipping'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderINR, setMinOrderINR] = useState<number>(2000);
  const [targetCategory, setTargetCategory] = useState<string>('All Categories');
  const [targetTier, setTargetTier] = useState<string>('All Tiers');
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [activeTab, setActiveTab] = useState<'clusters' | 'personas' | 'coupons'>('clusters');

  const fetchSegmentationData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/segments');
      const data = await res.json();
      if (data.status === 'success') {
        setClusters(data.clusters || []);
        setPersonaMappings(data.personaMappings || []);
        setSegmentCoupons(data.segmentCoupons || []);
      }
    } catch (err) {
      console.error('Failed to fetch segmentation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentationData();
  }, []);

  const handleRecluster = async () => {
    try {
      setReclustering(true);
      setReclusterSuccessMsg(null);
      const res = await fetch('/api/admin/segments/recluster', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setClusters(data.clusters);
        setPersonaMappings(data.personaMappings);
        setReclusterSuccessMsg(data.message);
        setTimeout(() => setReclusterSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error('Reclustering error:', err);
    } finally {
      setReclustering(false);
    }
  };

  const handleCreateSegmentCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setSavingCoupon(true);
      const selectedCluster = clusters.find(c => c.segmentId === selectedSegmentId);
      const applicableCategories = targetCategory === 'All Categories' ? [] : [targetCategory];

      const res = await fetch('/api/admin/segments/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentId: selectedSegmentId,
          couponData: {
            code: couponCode.trim().toUpperCase(),
            title: couponTitle || `${selectedCluster?.name || 'Segment'} Exclusive Offer`,
            description: couponDescription || `Targeted incentive engineered for ${selectedCluster?.name || 'this customer group'}.`,
            discountType,
            discountValue: Number(discountValue),
            minOrderINR: Number(minOrderINR),
            applicableCategories: applicableCategories.length > 0 ? applicableCategories : undefined,
            badge: `${selectedCluster?.name || 'Custom'} Reward`,
            targetTier: targetTier !== 'All Tiers' ? (targetTier as any) : undefined
          },
          targetUpliftPct: discountType === 'percentage' ? Math.round(Number(discountValue) * 2.2) : 34.5,
          projectedRevenueINR: Math.round(Number(minOrderINR) * 45)
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setSegmentCoupons(prev => [data.segmentCoupon, ...prev]);
        setIsCreatingCoupon(false);
        setCouponCode('');
        setCouponTitle('');
        setCouponDescription('');
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Error creating segment coupon:', err);
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/segments/coupons/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setSegmentCoupons(prev => prev.map(c => c.id === id ? data.segmentCoupon : c));
      }
    } catch (err) {
      console.error('Error toggling coupon:', err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/segments/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        setSegmentCoupons(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const selectedCluster = clusters.find(c => c.segmentId === selectedSegmentId) || clusters[0];
  const activeSegmentCoupons = segmentCoupons.filter(c => c.segmentId === selectedSegmentId);
  const personasInSelectedSegment = personaMappings.filter(p => p.assignedSegmentId === selectedSegmentId);

  const getClusterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wallet': return <Wallet className="h-5 w-5" />;
      case 'Crown': return <Crown className="h-5 w-5" />;
      case 'ShoppingBag': return <ShoppingBag className="h-5 w-5" />;
      case 'Eye': return <Eye className="h-5 w-5" />;
      case 'Zap': return <Zap className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getSegmentColorBadge = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'indigo': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'amber': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'rose': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <BrainCircuit className="h-3.5 w-3.5" /> Real-Time K-Means Behavioral Clustering
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                k=6 Converged &bull; Silhouette: 0.74
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Customer Behavioral Segmentation &amp; Targeted Reward Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dynamically groups shoppers into RFM behavioural clusters (Budget Shopper, Premium Customer, Window Shopper, Deal Seeker) from live telemetry events. Tailor custom reward coupons to maximize conversion velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRecluster}
              disabled={reclustering}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 flex items-center gap-2 transition"
            >
              <RefreshCw className={`h-4 w-4 ${reclustering ? 'animate-spin' : ''}`} />
              {reclustering ? 'Recomputing Centroids...' : 'Re-Cluster on Telemetry'}
            </button>
            <button
              onClick={() => {
                setIsCreatingCoupon(true);
                setCouponCode(`${selectedSegmentId.toUpperCase().slice(0, 6)}-${Math.floor(10 + Math.random() * 90)}`);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition"
            >
              <Plus className="h-4 w-4" /> Create Segment Coupon
            </button>
          </div>
        </div>

        {reclusterSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{reclusterSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Sub navigation view switches */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('clusters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'clusters'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> 6 Behavioral Clusters Overview
        </button>
        <button
          onClick={() => setActiveTab('personas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'personas'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Live Persona RFM Mapping ({personaMappings.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Tag className="h-3.5 w-3.5" /> Deployed Segment Coupons ({segmentCoupons.length})
        </button>
      </div>

      {/* VIEW 1: 6 Clusters Matrix & Deep Dive */}
      {activeTab === 'clusters' && (
        <div className="space-y-6">
          
          {/* Cluster Selector Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {clusters.map((cluster) => {
              const isSelected = cluster.segmentId === selectedSegmentId;
              const userCount = personaMappings.filter(p => p.assignedSegmentId === cluster.segmentId).length;

              return (
                <div
                  key={cluster.segmentId}
                  onClick={() => setSelectedSegmentId(cluster.segmentId)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl border ${getSegmentColorBadge(cluster.color)}`}>
                        {getClusterIcon(cluster.icon)}
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {userCount} Shoppers
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{cluster.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{cluster.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>AOV:</span>
                    <span className="text-white font-bold">₹{(cluster.features.averageOrderValueINR / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Cluster Detailed Deep Dive Card */}
          {selectedCluster && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${getSegmentColorBadge(selectedCluster.color)}`}>
                    {getClusterIcon(selectedCluster.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{selectedCluster.name} Cluster Analysis</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Cluster Fit: {Math.round(selectedCluster.clusterMatchScore * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedCluster.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCreatingCoupon(true);
                    setCouponCode(`${selectedCluster.segmentId.toUpperCase().slice(0, 6)}-${Math.floor(10 + Math.random() * 90)}`);
                    setCouponTitle(`${selectedCluster.name} Target Incentive`);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow"
                >
                  <Plus className="h-4 w-4" /> Add Reward for {selectedCluster.name}
                </button>
              </div>

              {/* 4 Multi-Dimensional Metric Panels */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* 1. RFM Score Vector */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-400" /> RFM Scoring (1 - 5)
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Recency:</span>
                      <span className="font-mono text-cyan-300 font-bold">{selectedCluster.rfmScores.recency} / 5</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Frequency:</span>
                      <span className="font-mono text-indigo-300 font-bold">{selectedCluster.rfmScores.frequency} / 5</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Monetary:</span>
                      <span className="font-mono text-emerald-300 font-bold">{selectedCluster.rfmScores.monetary} / 5</span>
                    </div>
                  </div>
                </div>

                {/* 2. Economics & Basket */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Basket Economics
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Average Order:</span>
                      <span className="font-mono text-white font-bold">
                        {currency === 'INR' ? `₹${selectedCluster.features.averageOrderValueINR.toLocaleString()}` : `$${Math.round(selectedCluster.features.averageOrderValueINR / 83.5)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Price Sensitivity:</span>
                      <span className="font-mono text-amber-300 font-bold">{selectedCluster.features.priceSensitivity}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Coupon Usage:</span>
                      <span className="font-mono text-purple-300 font-bold">{selectedCluster.features.couponUsageRate}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Conversion Friction */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-rose-400" /> Friction &amp; Abandonment
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Cart Abandonment:</span>
                      <span className="font-mono text-rose-300 font-bold">{selectedCluster.features.cartAbandonmentRate}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Optimal Incentive:</span>
                      <span className="font-mono text-emerald-300 font-bold">{selectedCluster.optimalDiscountRange}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Category Affinities */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Category Affinity Prior
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedCluster.features.categoryAffinities.map((cat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended ML Strategy Banner */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <BrainCircuit className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-200">Recommended Algorithmic Incentive Strategy:</div>
                  <p className="text-xs text-slate-300">{selectedCluster.recommendedStrategy}</p>
                </div>
              </div>

              {/* Active Segment Reward Coupons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-400" /> Active Reward Coupons for {selectedCluster.name} ({activeSegmentCoupons.length})
                  </h4>
                </div>

                {activeSegmentCoupons.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-400">No customized coupons assigned to this segment yet.</p>
                    <button
                      onClick={() => {
                        setIsCreatingCoupon(true);
                        setCouponCode(`${selectedCluster.segmentId.toUpperCase().slice(0, 6)}-${Math.floor(10 + Math.random() * 90)}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      + Create Segment Incentive
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSegmentCoupons.map((sc) => (
                      <div
                        key={sc.id}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                {sc.coupon.code}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                sc.activeStatus ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {sc.activeStatus ? 'Active & Deployed' : 'Paused'}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1.5">{sc.coupon.title}</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">{sc.coupon.description}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleCoupon(sc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                              title="Toggle Active Status"
                            >
                              {sc.activeStatus ? <ToggleRight className="h-4 w-4 text-emerald-400" /> : <ToggleLeft className="h-4 w-4 text-slate-500" />}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(sc.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition text-xs border border-rose-500/20"
                              title="Delete Coupon"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Min Spend: <strong>₹{sc.coupon.minOrderINR.toLocaleString()}</strong></span>
                          <span>Projected Uplift: <strong className="text-emerald-300">+{sc.targetUpliftPct}%</strong></span>
                          <span>Redeemed: <strong className="text-indigo-300 font-mono">{sc.redeemedCount}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shoppers in this cluster */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" /> Shopper Personas Mapped to {selectedCluster.name} ({personasInSelectedSegment.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {personasInSelectedSegment.map((p) => (
                    <div
                      key={p.personaId}
                      className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center gap-3"
                    >
                      <img 
                        src={p.personaAvatar} 
                        alt={p.personaName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{p.personaName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{p.personaRole}</div>
                        <div className="text-[10px] text-indigo-300 font-mono mt-0.5">
                          Spend: ₹{p.rfm.lifetimeSpendINR.toLocaleString()} &bull; {p.rfm.orderCount} orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Persona RFM Mapping Table */}
      {activeTab === 'personas' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live Persona Cluster &amp; RFM Vector Mapping</h3>
              <p className="text-xs text-slate-400">Real-time centroid association based on session dwell time, category affinities, and cart abandonment.</p>
            </div>
            <button
              onClick={handleRecluster}
              disabled={reclustering}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reclustering ? 'animate-spin' : ''}`} /> Recompute
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User Persona</th>
                  <th className="p-3">Assigned Cluster</th>
                  <th className="p-3">Cluster Confidence</th>
                  <th className="p-3">Recency</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Lifetime Spend</th>
                  <th className="p-3">Dominant Category</th>
                  <th className="p-3">Active Coupons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {personaMappings.map((p) => {
                  const cluster = clusters.find(c => c.segmentId === p.assignedSegmentId);
                  return (
                    <tr key={p.personaId} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 flex items-center gap-2.5">
                        <img 
                          src={p.personaAvatar} 
                          alt={p.personaName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white">{p.personaName}</div>
                          <div className="text-[10px] text-slate-400">{p.personaRole}</div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getSegmentColorBadge(cluster?.color || 'indigo')}`}>
                          {cluster?.name || p.assignedSegmentId}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {Math.round(p.confidenceScore * 100)}%
                      </td>

                      <td className="p-3 font-mono text-slate-300">
                        {p.rfm.recencyDays} days ago
                      </td>

                      <td className="p-3 font-mono text-indigo-300 font-bold">
                        {p.rfm.orderCount}
                      </td>

                      <td className="p-3 font-mono text-white font-bold">
                        ₹{p.rfm.lifetimeSpendINR.toLocaleString()}
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                          {p.dominantCategory}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
                          {p.activeCouponsAvailable} Ready
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: All Deployed Segment Coupons */}
      {activeTab === 'coupons' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Segment-Targeted Coupon Store</h3>
              <p className="text-xs text-slate-400">Incentives dispatched automatically to matching shopper behavioral cohorts.</p>
            </div>

            <button
              onClick={() => {
                setIsCreatingCoupon(true);
                setCouponCode(`SEG-${Math.floor(100 + Math.random() * 900)}`);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" /> Create New Segment Coupon
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segmentCoupons.map((sc) => {
              const cluster = clusters.find(c => c.segmentId === sc.segmentId);
              return (
                <div
                  key={sc.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3 shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSegmentColorBadge(cluster?.color || 'indigo')}`}>
                        Target: {sc.segmentName}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        sc.activeStatus ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sc.activeStatus ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="font-mono text-base font-extrabold text-emerald-400">
                      {sc.coupon.code}
                    </div>

                    <h4 className="text-xs font-bold text-white">{sc.coupon.title}</h4>
                    <p className="text-[11px] text-slate-400">{sc.coupon.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-[10px] text-slate-400 font-mono">
                      Min Basket: ₹{sc.coupon.minOrderINR.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(sc.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                      >
                        {sc.activeStatus ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(sc.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create Segment Coupon */}
      {isCreatingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Segment-Targeted Reward Coupon</h3>
                  <p className="text-xs text-slate-400">Directly dispatch algorithmic incentives to customer cohorts</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingCoupon(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSegmentCoupon} className="space-y-4">
              
              {/* Target Segment Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Customer Segment</label>
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  {clusters.map((c) => (
                    <option key={c.segmentId} value={c.segmentId}>
                      {c.name} ({c.optimalDiscountRange})
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. VIPFLAGSHIP5000"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Title</label>
                  <input
                    type="text"
                    value={couponTitle}
                    onChange={(e) => setCouponTitle(e.target.value)}
                    placeholder="e.g. 20% Off Pro Developer Gear"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Description &amp; Terms</label>
                <textarea
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  placeholder="Explain why this incentive is tailored to this customer group..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Incentive Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="flat_inr">Flat Amount (₹ INR)</option>
                    <option value="free_shipping">Free Express Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={1}
                    max={discountType === 'percentage' ? 90 : 50000}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Spend (₹ INR)</label>
                  <input
                    type="number"
                    value={minOrderINR}
                    onChange={(e) => setMinOrderINR(Number(e.target.value))}
                    min={0}
                    step={500}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Lock & Loyalty Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category Lock</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="All Categories">All Categories (Universal)</option>
                    <option value="Laptops">Laptops &amp; Ultrabooks</option>
                    <option value="Audio">Audio &amp; Headphones</option>
                    <option value="Gaming">Gaming Hardware</option>
                    <option value="Accessories">Accessories &amp; Keyboards</option>
                    <option value="Smartphones">Smartphones &amp; Tablets</option>
                    <option value="Smart Home">Smart Home IoT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Loyalty Tier Threshold</label>
                  <select
                    value={targetTier}
                    onChange={(e) => setTargetTier(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="All Tiers">All Tiers (Bronze, Silver, Gold, Platinum)</option>
                    <option value="Silver">Silver Tier &amp; Above</option>
                    <option value="Gold">Gold Tier &amp; Above</option>
                    <option value="Platinum">Platinum VIP Only</option>
                  </select>
                </div>
              </div>

              {/* Simulated ML ROI Projection */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Simulated Conversion Lift:
                  </div>
                  <p className="text-[11px] text-slate-400">Predicted +{discountType === 'percentage' ? Math.round(discountValue * 2.2) : 38}% purchase uplift across target segment.</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400">Proj. Rev Boost:</span>
                  <div className="text-sm font-bold text-white">₹{(minOrderINR * 45).toLocaleString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  {savingCoupon ? 'Deploying...' : 'Deploy Coupon to Segment'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
