import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  TrendingDown, 
  Package, 
  X, 
  Trash2, 
  ShoppingCart, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { PriceAlert, StockAlert, Currency, Product } from '../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currency?: Currency;
  onAddToCart?: (product: Product) => void;
  onSelectProduct?: (productId: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  currency = 'INR',
  onAddToCart,
  onSelectProduct
}) => {
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'price' | 'stock'>('price');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/alerts?userId=${userId}`);
      const data = await res.json();
      if (data) {
        setPriceAlerts(data.priceAlerts || []);
        setStockAlerts(data.stockAlerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen, userId]);

  const handleDismissPriceAlert = async (id: string) => {
    try {
      await fetch(`/api/alerts/price/${id}`, { method: 'DELETE' });
      setPriceAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Price &amp; Stock Alerts
              </h2>
              <p className="text-xs text-slate-400">Real-time inventory &amp; discount trackers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 flex gap-2">
          <button
            onClick={() => setActiveTab('price')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'price'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
            Price Drop Alerts ({priceAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'stock'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
            }`}
          >
            <Package className="h-3.5 w-3.5 text-cyan-400" />
            Back in Stock ({stockAlerts.length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'price' ? (
            priceAlerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No active price drop alerts. Click the alert icon on any product to track price drops!
              </div>
            ) : (
              priceAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border transition space-y-2 ${
                    alert.isTriggered
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={alert.productThumbnail} 
                      alt={alert.productTitle}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white line-clamp-1">
                        {alert.productTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Current: <strong className="text-slate-200">₹{alert.currentPriceINR.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Target: <strong className="text-emerald-400">₹{alert.targetPriceINR.toLocaleString()}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismissPriceAlert(alert.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition"
                      title="Dismiss Alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {alert.isTriggered ? (
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Target Met! Price dropped to ₹{alert.currentPriceINR.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Monitoring product catalog every 60s
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            stockAlerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No active stock notifications.
              </div>
            ) : (
              stockAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={alert.productThumbnail} 
                      alt={alert.productTitle}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white line-clamp-1">
                        {alert.productTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Status: <span className={alert.isBackInStock ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {alert.isBackInStock ? 'Back in Stock!' : 'Awaiting Warehouse Restock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center text-xs text-slate-400">
          Alerts trigger automatically when inventory or pricing updates.
        </div>
      </div>
    </div>
  );
};
