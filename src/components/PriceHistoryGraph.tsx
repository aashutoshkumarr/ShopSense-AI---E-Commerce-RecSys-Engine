import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Zap, 
  AlertCircle, 
  ShieldCheck, 
  Check, 
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { PriceAnalytics, PriceHistoryRecord, Currency, UserPersona } from '../types';

interface PriceHistoryGraphProps {
  productId: string;
  currency: Currency;
  currentPersona?: UserPersona;
  userId?: string;
  onPriceAlertCreated?: () => void;
}

export const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({
  productId,
  currency,
  currentPersona,
  userId,
  onPriceAlertCreated
}) => {
  const [analytics, setAnalytics] = useState<PriceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | '6M' | 'ALL'>('ALL');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);
  const [isSimulatingDrop, setIsSimulatingDrop] = useState(false);
  const [simulatedMsg, setSimulatedMsg] = useState<string | null>(null);

  const effectiveUserId = currentPersona?.id || userId || 'user-dev-alex';

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}/price-history`);
      const data = await res.json();
      if (data.status === 'success' && data.analytics) {
        setAnalytics(data.analytics);
        // Default target price recommendation: 10% below current price
        const defTarget = Math.round(data.analytics.currentPriceINR * 0.9);
        setTargetPrice(currency === 'INR' ? defTarget : Math.round(data.analytics.currentPriceUSD * 0.9));
      }
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [productId]);

  // Filter history based on selected time range
  const filteredHistory = useMemo(() => {
    if (!analytics || !analytics.history) return [];
    const list = analytics.history;
    if (timeRange === '30D') return list.slice(Math.max(0, list.length - 2));
    if (timeRange === '90D') return list.slice(Math.max(0, list.length - 4));
    if (timeRange === '6M') return list.slice(Math.max(0, list.length - 7));
    return list;
  }, [analytics, timeRange]);

  const formatPrice = (amountINR: number, amountUSD: number) => {
    if (currency === 'INR') {
      return `₹${amountINR.toLocaleString()}`;
    }
    return `$${amountUSD.toLocaleString()}`;
  };

  const handleSetAlert = async (customPrice?: number) => {
    if (!analytics) return;
    const finalTargetINR = customPrice || (currency === 'INR' ? Number(targetPrice) : Math.round(Number(targetPrice) * 83));
    if (!finalTargetINR || finalTargetINR <= 0) return;

    try {
      setIsAlertSubmitting(true);
      const res = await fetch('/api/alerts/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          targetPriceINR: finalTargetINR,
          userId: effectiveUserId
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        const displayVal = currency === 'INR' ? `₹${finalTargetINR.toLocaleString()}` : `$${Math.round(finalTargetINR / 83).toLocaleString()}`;
        setAlertSuccessMsg(`Price Alert Active! We'll alert you if price drops below ${displayVal}`);
        if (onPriceAlertCreated) onPriceAlertCreated();
        setTimeout(() => setAlertSuccessMsg(null), 4500);
      }
    } catch (err) {
      console.error('Set alert error:', err);
    } finally {
      setIsAlertSubmitting(false);
    }
  };

  const handleSimulateDrop = async (pct: number = 10) => {
    try {
      setIsSimulatingDrop(true);
      const res = await fetch(`/api/products/${productId}/simulate-price-drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercentage: pct })
      });
      const data = await res.json();
      if (data.status === 'success' && data.analytics) {
        setAnalytics(data.analytics);
        const displayNew = currency === 'INR' ? `₹${data.analytics.currentPriceINR.toLocaleString()}` : `$${data.analytics.currentPriceUSD.toLocaleString()}`;
        setSimulatedMsg(`Price dropped ${pct}% to ${displayNew}! ${data.triggeredAlerts?.length || 0} active alerts triggered.`);
        setTimeout(() => setSimulatedMsg(null), 5000);
      }
    } catch (err) {
      console.error('Simulate price drop error:', err);
    } finally {
      setIsSimulatingDrop(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-800 rounded-lg"></div>
        <div className="h-40 bg-slate-900/60 rounded-xl"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const currentPriceDisplay = formatPrice(analytics.currentPriceINR, analytics.currentPriceUSD);
  const lowestPriceDisplay = formatPrice(analytics.lowestPriceINR, analytics.lowestPriceUSD);
  const highestPriceDisplay = formatPrice(analytics.highestPriceINR, analytics.highestPriceUSD);
  const avgPriceDisplay = formatPrice(analytics.averagePriceINR, analytics.averagePriceUSD);

  const avgValue = currency === 'INR' ? analytics.averagePriceINR : analytics.averagePriceUSD;
  const isDrop = analytics.priceChange30DaysPct < 0;

  return (
    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 shadow-xl text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingDown className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Price History &amp; Market Intelligence</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              Self-Maintained Tracker
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-month price trend and verified automated price drops.
          </p>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['30D', '90D', '6M', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Deal Recommendation Banner */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
        analytics.isBelow90DayAverage
          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
          : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
      }`}>
        <div className="mt-0.5 shrink-0">
          {analytics.isBelow90DayAverage ? (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="inline-flex rounded-full h-3 w-3 bg-amber-500 shrink-0"></span>
          )}
        </div>
        <div className="text-xs space-y-0.5 flex-1">
          <div className="font-bold flex items-center gap-2">
            <span>
              {analytics.isBelow90DayAverage
                ? `🟢 Current price is ${Math.abs(analytics.pctDifferenceFromAverage)}% below the 90-day average (${avgPriceDisplay})`
                : `🟡 Current price is ${analytics.pctDifferenceFromAverage}% above the 90-day average (${avgPriceDisplay})`}
            </span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed font-sans text-slate-300">
            {analytics.verdictText}
          </p>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* Current Price */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Current Price</span>
          <div className="text-base font-bold text-white font-mono">{currentPriceDisplay}</div>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {isDrop ? (
              <span className="text-emerald-400 flex items-center font-bold">
                <ArrowDownRight className="h-3 w-3" /> {Math.abs(analytics.priceChange30DaysPct)}% (30d)
              </span>
            ) : (
              <span className="text-amber-400 flex items-center font-bold">
                <ArrowUpRight className="h-3 w-3" /> +{analytics.priceChange30DaysPct}% (30d)
              </span>
            )}
          </div>
        </div>

        {/* Lowest Price */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Lowest Price</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
              Record Low
            </span>
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono">{lowestPriceDisplay}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            on {analytics.lowestPriceDate}
          </div>
        </div>

        {/* Highest Price */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Highest Price</span>
          <div className="text-base font-bold text-slate-300 font-mono">{highestPriceDisplay}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            on {analytics.highestPriceDate}
          </div>
        </div>

        {/* Average Price */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">90-Day Average</span>
          <div className="text-base font-bold text-indigo-300 font-mono">{avgPriceDisplay}</div>
          <div className="text-[10px] text-slate-400">
            {analytics.totalDataPoints} checkpoints
          </div>
        </div>

      </div>

      {/* Chart Canvas */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-3 w-3 text-cyan-400" /> Price Trajectory
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Price
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="h-0.5 w-3 bg-indigo-400 border border-dashed"></span> 90d Average
            </span>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredHistory}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis 
                dataKey="dateLabel" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => currency === 'INR' ? `₹${(val / 1000).toFixed(0)}k` : `$${val}`}
              />

              <Tooltip content={<CustomTooltip currency={currency} avgINR={analytics.averagePriceINR} avgUSD={analytics.averagePriceUSD} />} />

              {/* Reference line for 90-day Average */}
              <ReferenceLine 
                y={currency === 'INR' ? analytics.averagePriceINR : analytics.averagePriceUSD} 
                stroke="#818cf8" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
              />

              <Area
                type="monotone"
                dataKey={currency === 'INR' ? 'priceINR' : 'priceUSD'}
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#priceGradient)"
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {alertSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{alertSuccessMsg}</span>
        </div>
      )}

      {simulatedMsg && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{simulatedMsg}</span>
        </div>
      )}

      {/* Interactive Price Alert Setup & Simulation Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Automated Price Drop Alert</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Quick target:</span>
            {[-5, -10, -15].map((pct) => {
              const targetVal = currency === 'INR' 
                ? Math.round(analytics.currentPriceINR * (1 + pct / 100))
                : Math.round(analytics.currentPriceUSD * (1 + pct / 100));
              return (
                <button
                  key={pct}
                  onClick={() => {
                    setTargetPrice(targetVal);
                    handleSetAlert(currency === 'INR' ? targetVal : targetVal * 83);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-mono border border-amber-500/20 transition active:scale-95"
                >
                  {pct}% ({currency === 'INR' ? `₹${targetVal.toLocaleString()}` : `$${targetVal}`})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
              {currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={`Alert target (e.g. ${currency === 'INR' ? Math.round(analytics.currentPriceINR * 0.9) : Math.round(analytics.currentPriceUSD * 0.9)})`}
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={() => handleSetAlert()}
            disabled={isAlertSubmitting || !targetPrice}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shrink-0"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{isAlertSubmitting ? 'Activating...' : 'Set Price Alert'}</span>
          </button>

          <button
            onClick={() => handleSimulateDrop(10)}
            disabled={isSimulatingDrop}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
            title="Simulate a 10% price cut to test live chart update and notification triggers"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Simulate Price Drop (-10%)</span>
          </button>
        </div>
      </div>

    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: Currency;
  avgINR: number;
  avgUSD: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, currency, avgINR, avgUSD }) => {
  if (active && payload && payload.length) {
    const data: PriceHistoryRecord = payload[0].payload;
    const priceVal = currency === 'INR' ? data.priceINR : data.priceUSD;
    const avgVal = currency === 'INR' ? avgINR : avgUSD;
    const diff = priceVal - avgVal;
    const diffPct = ((diff / avgVal) * 100).toFixed(1);

    return (
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1.5 max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 text-slate-400">
          <span className="font-bold text-white">{data.dateLabel}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
            {data.source.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <span className="text-slate-400">Recorded Price:</span>
          <span className="text-sm font-bold text-white font-mono">
            {currency === 'INR' ? `₹${data.priceINR.toLocaleString()}` : `$${data.priceUSD.toLocaleString()}`}
          </span>
        </div>

        {data.eventDescription && (
          <div className="text-[11px] text-slate-300 italic">
            "{data.eventDescription}"
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span>vs 90d Average:</span>
          <span className={`font-mono font-bold ${diff <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {diff <= 0 ? `${diffPct}% (Below Avg)` : `+${diffPct}% (Above Avg)`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};
