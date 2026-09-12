import React, { useState } from 'react';
import { 
  Bike, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Navigation, 
  Phone, 
  Package, 
  DollarSign, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Store
} from 'lucide-react';

interface DeliveryPartnerFleetViewProps {
  onBackToStorefront: () => void;
}

interface AssignedTrip {
  id: string;
  orderId: string;
  darkStoreName: string;
  darkStoreLocality: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemCount: number;
  slaMinutes: number;
  minutesRemaining: number;
  payoutINR: number;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  customerOtp: string;
}

export const DeliveryPartnerFleetView: React.FC<DeliveryPartnerFleetViewProps> = ({
  onBackToStorefront
}) => {
  const [trips, setTrips] = useState<AssignedTrip[]>([
    {
      id: 'trip-qc-901',
      orderId: 'ord-qc-7812',
      darkStoreName: 'Indiranagar Hub #14',
      darkStoreLocality: 'Indiranagar 100ft Rd',
      customerName: 'Ananya Sharma',
      customerPhone: '+91 98450 12891',
      deliveryAddress: 'Flat 402, Green Glen Layout, Indiranagar, 560038',
      itemCount: 4,
      slaMinutes: 8,
      minutesRemaining: 5,
      payoutINR: 65,
      status: 'OUT_FOR_DELIVERY',
      customerOtp: '4920'
    },
    {
      id: 'trip-qc-902',
      orderId: 'ord-qc-7815',
      darkStoreName: 'Indiranagar Hub #14',
      darkStoreLocality: 'Indiranagar 100ft Rd',
      customerName: 'Karthik Rao',
      customerPhone: '+91 97401 56321',
      deliveryAddress: 'House #18, 12th Main, HAL 2nd Stage, 560008',
      itemCount: 2,
      slaMinutes: 10,
      minutesRemaining: 8,
      payoutINR: 55,
      status: 'ASSIGNED',
      customerOtp: '8104'
    }
  ]);

  const [enteredOtp, setEnteredOtp] = useState<{ [tripId: string]: string }>({});
  const [otpError, setOtpError] = useState<{ [tripId: string]: string }>({});

  const handleAdvanceStatus = (tripId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      if (t.status === 'ASSIGNED') return { ...t, status: 'PICKED_UP' };
      if (t.status === 'PICKED_UP') return { ...t, status: 'OUT_FOR_DELIVERY' };
      return t;
    }));
  };

  const handleVerifyOtpAndDeliver = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const input = (enteredOtp[tripId] || '').trim();
    if (input !== trip.customerOtp) {
      setOtpError(prev => ({ ...prev, [tripId]: 'Invalid 4-digit OTP. Ask customer for correct code.' }));
      return;
    }

    setOtpError(prev => ({ ...prev, [tripId]: '' }));
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      return { ...t, status: 'DELIVERED', minutesRemaining: 0 };
    }));
  };

  const totalEarningsToday = trips.filter(t => t.status === 'DELIVERED').reduce((acc, t) => acc + t.payoutINR, 480);
  const completedCount = trips.filter(t => t.status === 'DELIVERED').length + 8;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-950 p-6 sm:p-8 text-white border border-amber-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
            <Bike className="h-3.5 w-3.5 text-amber-400" />
            <span>QUICK-COMMERCE FLEET &bull; 10-MIN SLA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            FastTrack Rider Partner Console
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Rider Arun V. &bull; Indiranagar Dark Store Hub #14 &bull; Hyperlocal Route Dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStorefront}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            Back to Storefront
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-900/50 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Online &bull; Ready for Dispatch</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Today's Payout</span>
          <p className="text-xl font-bold text-slate-900 mt-1">₹{totalEarningsToday}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Includes ₹80 speed incentive</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Trips Delivered</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{completedCount}</p>
          <p className="text-[11px] text-indigo-600 font-medium">Avg trip time: 7.2 mins</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">On-Time SLA Delivery</span>
          <p className="text-xl font-bold text-slate-900 mt-1">99.8%</p>
          <p className="text-[11px] text-emerald-600 font-medium">Top 5% rider fleet</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Dark Store Base</span>
          <p className="text-xl font-bold text-slate-900 mt-1">Indiranagar #14</p>
          <p className="text-[11px] text-slate-500">Radius: 3.5 km</p>
        </div>
      </div>

      {/* Active Trip Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-amber-500" />
          Active Dark Store Orders ({trips.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map(trip => (
            <div 
              key={trip.id} 
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-5 transition ${
                trip.status === 'DELIVERED' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-500">#{trip.orderId}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono">
                    {trip.itemCount} items
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  trip.status === 'DELIVERED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : trip.status === 'OUT_FOR_DELIVERY'
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {trip.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Location Route */}
              <div className="space-y-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs">
                <div className="flex items-start gap-2.5">
                  <Store className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Pickup Hub</span>
                    <p className="font-bold text-slate-900">{trip.darkStoreName}</p>
                    <p className="text-[11px] text-slate-500">{trip.darkStoreLocality}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-slate-200 pt-2.5">
                  <MapPin className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Dropoff Address</span>
                    <p className="font-bold text-slate-900">{trip.customerName}</p>
                    <p className="text-[11px] text-slate-600">{trip.deliveryAddress}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{trip.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* SLA Timer & Payout */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    {trip.status === 'DELIVERED' ? 'Delivered on time' : `${trip.minutesRemaining} mins left to deliver`}
                  </span>
                </div>

                <div className="font-bold text-slate-900">
                  Payout: <span className="text-emerald-600 font-mono">₹{trip.payoutINR}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {trip.status !== 'DELIVERED' && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  {trip.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleAdvanceStatus(trip.id)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Package className="h-4 w-4" />
                      <span>Confirm Pickup from Hub</span>
                    </button>
                  )}

                  {trip.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleAdvanceStatus(trip.id)}
                      className="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Navigation className="h-4 w-4" />
                      <span>Start Route (Out for Delivery)</span>
                    </button>
                  )}

                  {trip.status === 'OUT_FOR_DELIVERY' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredOtp[trip.id] || ''}
                          onChange={e => setEnteredOtp(prev => ({ ...prev, [trip.id]: e.target.value }))}
                          placeholder={`Enter OTP (${trip.customerOtp})`}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button
                          onClick={() => handleVerifyOtpAndDeliver(trip.id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Verify &amp; Deliver</span>
                        </button>
                      </div>
                      {otpError[trip.id] && (
                        <p className="text-[10px] text-rose-600 font-medium">{otpError[trip.id]}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {trip.status === 'DELIVERED' && (
                <div className="p-2.5 rounded-xl bg-emerald-100/60 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Delivered &bull; ₹{trip.payoutINR} credited to wallet</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
