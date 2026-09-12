import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Bike,
  Package,
  ShoppingBag,
  Bell,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Product, Currency } from '../../types';

interface LiveDeliveryTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  currency: Currency;
}

export const LiveDeliveryTrackerModal: React.FC<LiveDeliveryTrackerModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency
}) => {
  const [etaSeconds, setEtaSeconds] = useState<number>(470); // ~7 mins 50s
  const [activeStage, setActiveStage] = useState<number>(3); // 1: Confirmed, 2: Packed, 3: On The Way, 4: At Door
  const [deliveryInstruction, setDeliveryInstruction] = useState<'door' | 'bell' | 'call'>('door');
  const [showCallPrompt, setShowCallPrompt] = useState<boolean>(false);

  // Countdown timer simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaSeconds(prev => (prev > 10 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(etaSeconds / 60);
  const seconds = etaSeconds % 60;
  const etaString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Default grocery items if cart has none
  const groceryItems = cartItems.filter(i => i.category === 'Grocery').length > 0
    ? cartItems.filter(i => i.category === 'Grocery')
    : [
        { id: 'sample-1', title: 'Amul Taaza Homogenised Toned Milk (1 Litre)', priceINR: 74, priceUSD: 1, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&auto=format&fit=crop&q=80' },
        { id: 'sample-2', title: 'Britannia 100% Whole Wheat Bread (400g)', priceINR: 55, priceUSD: 1, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=80' },
        { id: 'sample-3', title: 'Fresh Robusta Bananas (Pack of 6)', priceINR: 48, priceUSD: 1, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=120&auto=format&fit=crop&q=80' }
      ];

  const totalAmount = groceryItems.reduce((acc, item) => acc + (currency === 'INR' ? item.priceINR : item.priceUSD), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with 10-min delivery badge */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Bike className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Live Delivery Tracking</h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  10-Min Express
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">Order #SS-GROC-9824 • Indiranagar Dark Store #14</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition cursor-pointer text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Big ETA Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                Estimated Arrival
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
                <span>{etaString}</span>
                <span className="text-sm font-semibold text-slate-500 font-sans">mins</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">Rider is 1.2 km away on 100ft Road</p>
            </div>

            {/* Doorstep Delivery OTP */}
            <div className="bg-white px-4 py-3 rounded-2xl border border-emerald-300 shadow-sm text-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">
                Delivery OTP
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700 tracking-widest mt-0.5">
                7492
              </div>
              <span className="text-[10px] text-slate-500">Share with rider at door</span>
            </div>
          </div>

          {/* Animated Route Map Visual Simulator */}
          <div className="relative rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 p-4 shadow-inner text-white">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Map Road SVG */}
            <div className="relative h-40 w-full flex items-center justify-between px-6 sm:px-12">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <path
                  d="M 60 80 Q 200 30, 360 80 T 560 80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="8 8"
                  className="animate-pulse"
                />
              </svg>

              {/* Node 1: Dark Store Hub */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold mt-2 text-emerald-300">Dark Store #14</span>
                <span className="text-[9px] text-slate-400 font-mono">Indiranagar</span>
              </div>

              {/* Node 2: Rider Moving Icon */}
              <div className="relative z-10 flex flex-col items-center text-center animate-bounce" style={{ animationDuration: '2s' }}>
                <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <Bike className="h-7 w-7" />
                </div>
                <span className="text-[11px] font-extrabold mt-1 text-amber-300">Rajesh Kumar</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">⚡ In Transit</span>
              </div>

              {/* Node 3: Customer Doorstep */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-indigo-400" />
                </div>
                <span className="text-[11px] font-bold mt-2 text-indigo-300">Your Doorstep</span>
                <span className="text-[9px] text-slate-400 font-mono">Koramangala 4th Blk</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>📍 Live GPS Ping: 5 seconds ago</span>
              <span className="text-emerald-400 font-mono font-bold">Speed: 28 km/h</span>
            </div>
          </div>

          {/* 4-Stage Progress Pipeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
              Order Milestones
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className={`p-3 rounded-2xl border text-center transition ${activeStage >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${activeStage >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
                <div className="text-xs font-bold">Confirmed</div>
                <div className="text-[10px] text-slate-500 font-mono">10:42 AM</div>
              </div>

              <div className={`p-3 rounded-2xl border text-center transition ${activeStage >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <CheckCircle2 className={`h-5 w-5 mx-auto mb-1 ${activeStage >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
                <div className="text-xs font-bold">Packed</div>
                <div className="text-[10px] text-slate-500 font-mono">10:44 AM (Bag #2)</div>
              </div>

              <div className={`p-3 rounded-2xl border text-center transition ${activeStage >= 3 ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400/40' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <Bike className={`h-5 w-5 mx-auto mb-1 ${activeStage >= 3 ? 'text-amber-600 animate-pulse' : 'text-slate-300'}`} />
                <div className="text-xs font-extrabold">On The Way</div>
                <div className="text-[10px] text-amber-800 font-mono font-bold">Picked at 10:45 AM</div>
              </div>

              <div className={`p-3 rounded-2xl border text-center transition ${activeStage >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <MapPin className={`h-5 w-5 mx-auto mb-1 ${activeStage >= 4 ? 'text-emerald-600' : 'text-slate-300'}`} />
                <div className="text-xs font-bold">Doorstep</div>
                <div className="text-[10px] text-slate-500 font-mono">~10:52 AM</div>
              </div>
            </div>
          </div>

          {/* Delivery Partner Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Rajesh Kumar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">Rajesh Kumar</h4>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900">
                    ★ 4.9 (1,850+ deliveries)
                  </span>
                </div>
                <p className="text-xs text-slate-500">Hero Electric Photon &bull; KA 01 EQ 4429</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Vaccinated &bull; Temp: 98.2°F Normal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCallPrompt(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Call Rider</span>
              </button>
            </div>
          </div>

          {showCallPrompt && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span>Connecting masked call to Rajesh Kumar (+91 98801 XXXXX)...</span>
              <button
                onClick={() => setShowCallPrompt(false)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Delivery Instructions Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700">Delivery Instructions for Rider:</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setDeliveryInstruction('door')}
                className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                  deliveryInstruction === 'door'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                🚪 Leave at door
              </button>
              <button
                onClick={() => setDeliveryInstruction('bell')}
                className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                  deliveryInstruction === 'bell'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                🔔 Ring doorbell
              </button>
              <button
                onClick={() => setDeliveryInstruction('call')}
                className={`p-2.5 rounded-xl border text-center font-medium transition cursor-pointer ${
                  deliveryInstruction === 'call'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                📞 Call upon arrival
              </button>
            </div>
          </div>

          {/* Items In This Bag */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Items in Bag ({groceryItems.length}):</span>
              <span className="text-xs font-bold font-mono text-slate-900">
                Total: {currency === 'INR' ? `₹${totalAmount}` : `$${totalAmount}`}
              </span>
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden max-h-36 overflow-y-auto">
              {groceryItems.map((item, idx) => (
                <div key={item.id + idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={item.imageUrl} alt={item.title} className="w-8 h-8 rounded-lg object-cover bg-slate-100" />
                    <span className="font-medium text-slate-800 line-clamp-1">{item.title}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {currency === 'INR' ? `₹${item.priceINR}` : `$${item.priceUSD}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Need help? <span className="text-emerald-700 font-bold cursor-pointer hover:underline">Instant Chat with Dark Store Support</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
