import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  ArrowRight, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  ReturnRequest, 
  ReturnResolutionType, 
  ReturnReasonCategory, 
  Order, 
  OrderItem, 
  AuthUser,
  Currency 
} from '../types';

interface ReturnReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser;
  currency: Currency;
  preselectedOrder?: Order | null;
  onReturnCreated?: () => void;
  onOpenWallet?: () => void;
}

export const ReturnReplaceModal: React.FC<ReturnReplaceModalProps> = ({
  isOpen,
  onClose,
  authUser,
  currency,
  preselectedOrder,
  onReturnCreated,
  onOpenWallet
}) => {
  const [activeTab, setActiveTab] = useState<'request_new' | 'track_returns'>('request_new');
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  
  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [resolution, setResolution] = useState<ReturnResolutionType>('refund_wallet');
  const [reasonCategory, setReasonCategory] = useState<ReturnReasonCategory>('defective_damaged');
  const [reasonText, setReasonText] = useState('');
  const [comments, setComments] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupSlot, setPickupSlot] = useState<'morning_9_to_1' | 'afternoon_2_to_6' | 'evening_6_to_9'>('morning_9_to_1');
  const [pickupAddress, setPickupAddress] = useState('402 Tech Park Residency, Bengaluru, Karnataka, India');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReturn, setCreatedReturn] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      fetchReturns();
      if (preselectedOrder) {
        setSelectedOrder(preselectedOrder);
        if (preselectedOrder.items.length > 0) {
          setSelectedItem(preselectedOrder.items[0]);
          setWizardStep(2);
        }
      }
    }
  }, [isOpen, preselectedOrder, authUser.targetPersonaId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${authUser.targetPersonaId}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        if (!selectedOrder && data.orders.length > 0) {
          setSelectedOrder(data.orders[0]);
          if (data.orders[0].items.length > 0) {
            setSelectedItem(data.orders[0].items[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const fetchReturns = async () => {
    try {
      const res = await fetch(`/api/returns?userId=${authUser.targetPersonaId}`);
      const data = await res.json();
      if (data.returns) {
        setReturnRequests(data.returns);
      }
    } catch (err) {
      console.error('Failed to load return requests:', err);
    }
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder || !selectedItem) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          userId: authUser.targetPersonaId,
          userName: authUser.name,
          item: selectedItem,
          resolution,
          reasonCategory,
          reasonText: reasonText || `Return request for ${selectedItem.title}`,
          comments,
          pickupDate,
          pickupSlot,
          pickupAddress
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setCreatedReturn(data.returnRequest);
        setReturnRequests([data.returnRequest, ...returnRequests]);
        setWizardStep(5);
        if (onReturnCreated) onReturnCreated();
      }
    } catch (err) {
      console.error('Failed to submit return:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceSimulation = async (returnId: string, nextStatus: any) => {
    try {
      const res = await fetch(`/api/returns/${returnId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setReturnRequests(returnRequests.map(r => r.id === returnId ? data.returnRequest : r));
        if (createdReturn?.id === returnId) {
          setCreatedReturn(data.returnRequest);
        }
      }
    } catch (err) {
      console.error('Failed to advance return simulation:', err);
    }
  };

  if (!isOpen) return null;

  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'out_for_delivery' || o.status === 'placed' || o.status === 'shipped');

  return (
    <div id="return-replace-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="return-replace-modal-card" 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Return & Replacement Center</h2>
                <span className="px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                  7-Day Guarantee
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Doorstep pickup by BlueDart, instant wallet refund, or brand-new unit replacement.
              </p>
            </div>
          </div>

          <button
            id="close-return-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white">
          <button
            id="tab-new-return-request"
            onClick={() => setActiveTab('request_new')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'request_new'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Request Return / Replacement
          </button>

          <button
            id="tab-view-active-returns"
            onClick={() => setActiveTab('track_returns')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'track_returns'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            Active Requests & History ({returnRequests.length})
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'request_new' && (
            <div className="space-y-6">
              {/* Stepper Header */}
              {wizardStep < 5 && (
                <div className="flex items-center justify-between px-2 mb-4">
                  {[
                    { num: 1, label: 'Select Item' },
                    { num: 2, label: 'Resolution' },
                    { num: 3, label: 'Reason' },
                    { num: 4, label: 'Doorstep Pickup' }
                  ].map((s) => {
                    const isPassed = wizardStep > s.num;
                    const isCurr = wizardStep === s.num;
                    return (
                      <div key={s.num} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed ? 'bg-emerald-500 text-white' : isCurr ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                        </div>
                        <span className={`text-xs font-medium hidden sm:inline ${isCurr ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {s.label}
                        </span>
                        {s.num < 4 && <ChevronRight className="w-4 h-4 text-slate-300 mx-1 hidden sm:inline" />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STEP 1: Select Order & Item */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Select Item to Return / Replace</h3>
                    <p className="text-xs text-slate-500">Choose a product from your recent eligible orders.</p>
                  </div>

                  <div className="space-y-3">
                    {deliveredOrders.map((ord) => (
                      <div key={ord.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900">Order #{ord.id}</span>
                            <span className="text-slate-400 ml-2">• Placed on {new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="px-2 py-0.5 font-semibold text-emerald-700 bg-emerald-50 rounded-full text-[10px]">
                            {ord.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {ord.items.map((item) => {
                            const isSelected = selectedOrder?.id === ord.id && selectedItem?.productId === item.productId;
                            return (
                              <div
                                key={item.productId}
                                onClick={() => {
                                  setSelectedOrder(ord);
                                  setSelectedItem(item);
                                }}
                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600'
                                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">{item.title}</div>
                                    <div className="text-[11px] text-slate-500">
                                      Qty: {item.quantity} • ₹{item.priceINR.toLocaleString()} (${item.priceUSD})
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {deliveredOrders.length === 0 && (
                      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-medium">No previous delivered orders available for return.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      id="step1-next-btn"
                      disabled={!selectedItem}
                      onClick={() => setWizardStep(2)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Next: Choose Resolution
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Resolution Type */}
              {wizardStep === 2 && selectedItem && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Choose Resolution for {selectedItem.title}</h3>
                    <p className="text-xs text-slate-500">Select whether you would like an instant refund or a brand-new replacement unit.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Resolution 1: Instant Wallet Refund */}
                    <div
                      id="opt-refund-wallet"
                      onClick={() => setResolution('refund_wallet')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        resolution === 'refund_wallet'
                          ? 'bg-purple-50/70 border-purple-600 ring-2 ring-purple-600/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-100 rounded-full">
                          ⚡ Instant Payout (&lt;2 Mins)
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">Refund to ShopSense Wallet</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Amount: <strong className="text-slate-900">₹{(selectedItem.priceINR * selectedItem.quantity).toLocaleString()}</strong>. Receive +50 bonus Loyalty Points.
                      </p>
                    </div>

                    {/* Resolution 2: Replace with Same Item */}
                    <div
                      id="opt-replace-same"
                      onClick={() => setResolution('replace_same_item')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        resolution === 'replace_same_item'
                          ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 rounded-full">
                          Brand-New Unit
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">Direct Unit Replacement</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        A factory-sealed unit will be dispatched with priority Air Express immediately upon pickup.
                      </p>
                    </div>

                    {/* Resolution 3: Original Payment Method */}
                    <div
                      id="opt-refund-original"
                      onClick={() => setResolution('refund_original')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        resolution === 'refund_original'
                          ? 'bg-slate-100 border-slate-600 ring-2 ring-slate-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          24-48 Business Hours
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">Refund to Original Payment Mode</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Reversed to original UPI or Card. Bank processing takes 1-3 business days.
                      </p>
                    </div>

                    {/* Resolution 4: Exchange Variant */}
                    <div
                      id="opt-exchange-variant"
                      onClick={() => setResolution('exchange_variant')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        resolution === 'exchange_variant'
                          ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-amber-700 font-medium">
                          Size / Color Swap
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">Exchange for Different Variant</div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Swap size, switch switches (e.g. Red to Brown), or choose alternate colorway.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      id="step2-next-btn"
                      onClick={() => setWizardStep(3)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Next: Reason for Return
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Reason Selection */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Why are you returning / replacing?</h3>
                    <p className="text-xs text-slate-500">Your feedback helps our quality assurance and vendor evaluation pipeline.</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'defective_damaged', label: 'Item Defective / Not Functioning Properly', desc: 'Hardware defect, connectivity dropout, or power failure.' },
                      { id: 'size_fit_issue', label: 'Size, Ergonomics or Fit Issue', desc: 'Dimensions, key layout, or physical comfort not suited for setup.' },
                      { id: 'wrong_item_received', label: 'Received Wrong Item / Variant', desc: 'Item received does not match the product page specifications.' },
                      { id: 'missing_accessories', label: 'Missing Cable, Dongle or Accessories', desc: 'Box arrived incomplete without stated accessories.' },
                      { id: 'performance_not_as_expected', label: 'Quality / Audio / Display Not As Expected', desc: 'Does not meet benchmark expectations.' },
                      { id: 'found_better_price', label: 'Found Better Price or No Longer Needed', desc: 'Changed mind within 7-day remorse window.' }
                    ].map((r) => {
                      const isSelected = reasonCategory === r.id;
                      return (
                        <div
                          key={r.id}
                          id={`reason-${r.id}`}
                          onClick={() => {
                            setReasonCategory(r.id as any);
                            setReasonText(r.label);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-600 ring-1 ring-indigo-600'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                            isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{r.label}</div>
                            <div className="text-[11px] text-slate-500">{r.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Additional Comments (Optional)</label>
                    <textarea
                      id="return-comments-input"
                      rows={2}
                      placeholder="e.g. Spacebar stabilizer squeaks when pressed on the right side..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      id="step3-next-btn"
                      onClick={() => setWizardStep(4)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Next: Doorstep Pickup Slot
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Doorstep Pickup Scheduling */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Schedule Doorstep Pickup & Address</h3>
                    <p className="text-xs text-slate-500">A BlueDart logistics agent will arrive at your door to inspect and pick up the package.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Pickup Date
                      </label>
                      <input
                        id="pickup-date-input"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Time Slot
                      </label>
                      <select
                        id="pickup-slot-select"
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value as any)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="morning_9_to_1">Morning (9:00 AM - 1:00 PM)</option>
                        <option value="afternoon_2_to_6">Afternoon (2:00 PM - 6:00 PM)</option>
                        <option value="evening_6_to_9">Evening (6:00 PM - 9:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      Doorstep Pickup Address
                    </label>
                    <input
                      id="pickup-address-input"
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-indigo-900 leading-relaxed">
                      <strong>Checklist before courier arrives:</strong> Keep all original accessories, charger, and manufacturer packaging ready. You will receive an SMS OTP when the courier agent arrives.
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setWizardStep(3)}
                      className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      id="submit-return-request-btn"
                      disabled={isSubmitting}
                      onClick={handleSubmitReturn}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm Return Request'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Success & Live Tracking */}
              {wizardStep === 5 && createdReturn && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">Return Request Submitted Successfully!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      RMA Authorization ID: <strong className="text-slate-900">#{createdReturn.id}</strong> • BlueDart Pickup on <strong className="text-slate-900">{createdReturn.pickupDate}</strong>
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-left space-y-4 max-w-lg mx-auto">
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Live Return Tracking Timeline</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full">
                        {createdReturn.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {createdReturn.trackingTimeline.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            step.completed ? 'bg-emerald-500 text-white' : step.current ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {step.completed ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div className={`text-xs font-semibold ${step.completed || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.label}
                            </div>
                            {step.notes && <div className="text-[10px] text-slate-500">{step.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simulation trigger */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Advance simulation pipeline:</span>
                      <button
                        onClick={() => handleAdvanceSimulation(createdReturn.id, 'inspection_passed')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 rounded-lg transition-colors"
                      >
                        Simulate Hub Inspection & Wallet Credit
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('track_returns')}
                      className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                    >
                      View All Return Requests
                    </button>
                    {onOpenWallet && createdReturn.resolution === 'refund_wallet' && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenWallet();
                        }}
                        className="px-5 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-sm flex items-center gap-1.5"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Check Wallet Balance
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'track_returns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Your Active & Past Return Requests</h3>
                  <p className="text-xs text-slate-500">Track real-time BlueDart pickups, hub inspection results, and refund credits.</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('request_new');
                    setWizardStep(1);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm"
                >
                  + New Return / Replace
                </button>
              </div>

              <div className="space-y-4">
                {returnRequests.map((ret) => (
                  <div key={ret.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={ret.item.imageUrl}
                          alt={ret.item.title}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{ret.item.title}</div>
                          <div className="text-[11px] text-slate-500">
                            RMA #{ret.id} • Order #{ret.orderId} • {ret.reasonText}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          ret.status === 'completed' || ret.status === 'refund_processed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {ret.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                      {ret.trackingTimeline.map((step, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              step.completed ? 'bg-emerald-500 text-white' : step.current ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {step.completed ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold ${step.completed || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                          </div>
                          {step.notes && <p className="text-[9px] text-slate-500 pl-5">{step.notes}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Status Advance simulation buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-[11px] text-slate-600">
                        Refund: <strong>₹{ret.refundAmountINR.toLocaleString()}</strong> ({ret.resolution === 'refund_wallet' ? 'Instant Wallet' : 'Original Payment'})
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdvanceSimulation(ret.id, 'picked_up')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded font-medium text-slate-700"
                        >
                          Mark Picked Up
                        </button>
                        <button
                          onClick={() => handleAdvanceSimulation(ret.id, 'refund_processed')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[10px] rounded font-medium text-emerald-700"
                        >
                          Credit Refund to Wallet
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {returnRequests.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                    <RotateCcw className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No return requests submitted yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Guaranteed Doorstep Pickup &amp; Safe Transit</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
