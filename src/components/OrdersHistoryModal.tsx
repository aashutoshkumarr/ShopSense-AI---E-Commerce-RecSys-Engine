import React, { useState, useEffect } from 'react';
import { 
  PackageCheck, 
  X, 
  Star, 
  CheckCircle2, 
  Truck, 
  Calendar, 
  CreditCard, 
  Sparkles,
  MapPin,
  RefreshCw,
  Clock,
  RotateCcw,
  Ban,
  ArrowRight,
  ShieldCheck,
  Wallet,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, Currency } from '../types';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  userId: string;
  onRatingLogged?: () => void;
  onWalletUpdated?: () => void;
  onOpenReturnWorkflow?: (order: Order) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  currency,
  userId,
  onRatingLogged,
  onWalletUpdated,
  onOpenReturnWorkflow
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${userId}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, userId]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason: 'Customer cancelled from portal'
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionSuccessMsg(data.message);
        fetchOrders();
        if (onWalletUpdated) onWalletUpdated();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    try {
      setReturningId(orderId);
      const res = await fetch('/api/orders/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason: 'Hardware specification mismatch'
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionSuccessMsg(data.message);
        fetchOrders();
        if (onWalletUpdated) onWalletUpdated();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Return order error:', err);
    } finally {
      setReturningId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[88vh] shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Order Intelligence &amp; Fulfillment Tracking
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-xs">
                  {orders.length} Orders
                </span>
              </h2>
              <p className="text-xs text-slate-400">Live multi-carrier dispatch timeline, zero-wait cancellations &amp; returns</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Success Toast */}
        {actionSuccessMsg && (
          <div className="m-4 mb-0 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            {actionSuccessMsg}
          </div>
        )}

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
              <span className="text-xs">Fetching order lifecycle data...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <PackageCheck className="h-10 w-10 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-300">No past orders found</div>
              <p className="text-xs max-w-sm mx-auto">
                Place an order via the Smart Cart to trigger real-time order tracking and wallet refund loops.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const statusSteps = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
              const currentStepIndex = statusSteps.indexOf(order.status);
              const isCancelled = order.status === 'cancelled';
              const isReturned = order.status === 'returned';

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
                >
                  {/* Top Bar: ID, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          isCancelled
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : isReturned
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : order.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono text-cyan-300">Carrier: {order.trackingCarrier || 'BlueDart Express Air'}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-400">AWB: {order.trackingNumber || 'BD7891234'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-white">
                        {currency === 'INR' ? `₹${(order.totalINR || 0).toLocaleString()}` : `$${order.totalUSD || 0}`}
                      </div>
                      {order.walletUsedINR && order.walletUsedINR > 0 ? (
                        <div className="text-[10px] text-emerald-400 font-mono">
                          (₹{order.walletUsedINR.toLocaleString()} via Wallet)
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* 🚚 Live Tracking Stepper */}
                  {!isCancelled && !isReturned && (
                    <div className="py-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
                        {statusSteps.map((step, idx) => (
                          <div 
                            key={step}
                            className={`flex flex-col items-center text-center ${
                              idx <= currentStepIndex ? 'text-cyan-400 font-bold' : 'text-slate-600'
                            }`}
                          >
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs mb-1 border ${
                              idx <= currentStepIndex 
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/40' 
                                : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className="capitalize text-[10px] hidden sm:inline">{step.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Ordered Items List */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200'} 
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 object-cover rounded-lg bg-slate-800"
                          />
                          <div>
                            <div className="text-xs font-semibold text-white line-clamp-1">{item.title}</div>
                            <div className="text-[10px] text-slate-400">Qty: {item.quantity || 1} &bull; {item.brand || 'Tech Pro'}</div>
                          </div>
                        </div>

                        <div className="text-xs font-mono font-bold text-slate-200">
                          ₹{(item.priceINR || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons: Cancel, Return, Exchange */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="line-clamp-1">{order.shippingAddress}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'returned' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {cancellingId === order.id ? 'Refunding...' : 'Cancel & Instant Refund'}
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => {
                            if (onOpenReturnWorkflow) {
                              onOpenReturnWorkflow(order);
                            } else {
                              handleReturnOrder(order.id);
                            }
                          }}
                          disabled={returningId === order.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {returningId === order.id ? 'Processing Return...' : 'Return / Replace Item'}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>All cancellations and approved returns credit 100% funds back to your ShopSense Wallet instantly.</span>
        </div>

      </div>
    </div>
  );
};
