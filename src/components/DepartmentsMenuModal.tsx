import React from 'react';
import { 
  X, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Gamepad2, 
  Home, 
  Apple as Fruit, 
  Tag, 
  HeartPulse, 
  Cable, 
  Watch, 
  RotateCcw, 
  CreditCard, 
  Sparkles, 
  Package, 
  LifeBuoy, 
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { UserPersona } from '../types';

interface DepartmentsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: UserPersona;
  onSelectCategory: (category: string) => void;
  onOpenPay: () => void;
  onOpenSell: () => void;
  onOpenBundles: () => void;
  onOpenOrders: () => void;
  onOpenSupport: () => void;
  onOpenCoupons: () => void;
}

export const DepartmentsMenuModal: React.FC<DepartmentsMenuModalProps> = ({
  isOpen,
  onClose,
  currentPersona,
  onSelectCategory,
  onOpenPay,
  onOpenSell,
  onOpenBundles,
  onOpenOrders,
  onOpenSupport,
  onOpenCoupons
}) => {
  if (!isOpen) return null;

  const categories = [
    { name: 'All', label: 'All Departments', icon: Home, color: 'text-slate-900', bg: 'bg-slate-100' },
    { name: 'Laptops', label: 'Laptops & Workstations', icon: Laptop, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Smartphones', label: 'Smartphones & Foldables', icon: Smartphone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Audio', label: 'Studio Audio & ANC', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Gaming', label: 'Esports & Gaming Gear', icon: Gamepad2, color: 'text-red-600', bg: 'bg-red-50' },
    { name: 'Smart Home', label: 'Smart Home & Living', icon: Home, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Grocery', label: 'Fresh Groceries & Pantry', icon: Fruit, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Bazaar', label: 'Bazaar Crazy Deals (< ₹999)', icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Pharmacy', label: 'Pharmacy & Wellness', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'Accessories', label: 'Pro GaN & Peripherals', icon: Cable, color: 'text-teal-600', bg: 'bg-teal-50' },
    { name: 'Wearables', label: 'Watches & Fitness Bands', icon: Watch, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Pre-Owned', label: 'Pre-Owned (OLX Bazaar)', icon: RotateCcw, color: 'text-violet-600', bg: 'bg-violet-50' }
  ];

  const handleCategoryClick = (catName: string) => {
    onSelectCategory(catName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden animate-slideInRight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
              S
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">ShopSense Super-App</h3>
              <p className="text-xs text-slate-300">
                Hello, {currentPersona.name.split(' ')[0]} &bull; Prime Member
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Services Highlights */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => { onOpenPay(); onClose(); }}
            className="p-3 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center gap-3 text-left transition shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">ShopSense Pay</span>
              <span className="text-[10px] text-slate-400">Wallet & UPI</span>
            </div>
          </button>

          <button
            onClick={() => { onOpenSell(); onClose(); }}
            className="p-3 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-2xl flex items-center gap-3 text-left transition shadow-2xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Sell on ShopSense</span>
              <span className="text-[10px] text-emerald-600 font-semibold">OLX Cash Resale</span>
            </div>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Departments */}
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block mb-3">
              Shop by Department
            </span>
            <div className="space-y-1">
              {categories.map(cat => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
                        {cat.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tools & Shortcuts */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold block mb-3">
              Program Perks & Support
            </span>
            <div className="space-y-1">
              <button
                onClick={() => { onOpenBundles(); onClose(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Smart Bundles</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">12% instant off</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
              </button>

              <button
                onClick={() => { onOpenCoupons(); onClose(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Coupons & Rewards</span>
                    <span className="text-[10px] text-slate-400">Exclusive member savings</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
              </button>

              <button
                onClick={() => { onOpenOrders(); onClose(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">My Orders & Tracking</span>
                    <span className="text-[10px] text-slate-400">Live delivery status</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
              </button>

              <button
                onClick={() => { onOpenSupport(); onClose(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Customer Care 24/7</span>
                    <span className="text-[10px] text-slate-400">Returns & replacements</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            ShopSense AI &bull; Version 2.4 Production Super-App
          </p>
        </div>
      </div>
    </div>
  );
};
