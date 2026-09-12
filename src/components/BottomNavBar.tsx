import React from 'react';
import { Home, User, Wallet, ShoppingCart, Menu, Sparkles } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  cartCount: number;
  walletBalance: number;
  onGoHome: () => void;
  onOpenAccount: () => void;
  onOpenWallet: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onOpenChat: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  cartCount,
  walletBalance,
  onGoHome,
  onOpenAccount,
  onOpenWallet,
  onOpenCart,
  onOpenMenu,
  onOpenChat
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] transition-all">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-around h-16 sm:h-18">
          
          {/* 1. Home */}
          <button
            onClick={onGoHome}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-all relative ${
              activeTab === 'storefront' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5 mb-0.5 transition-transform active:scale-90" />
              {activeTab === 'storefront' && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-indigo-600 rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          </button>

          {/* 2. You (Account / Profile) */}
          <button
            onClick={onOpenAccount}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs text-slate-500 hover:text-slate-900 transition-all font-medium active:scale-95"
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight mt-0.5">You</span>
          </button>

          {/* 3. Wallet (Pay & Passbook) */}
          <button
            onClick={onOpenWallet}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs text-slate-500 hover:text-slate-900 transition-all font-medium relative active:scale-95"
          >
            <div className="relative">
              <Wallet className="w-5 h-5 mb-0.5" />
              {walletBalance > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-emerald-500 text-white rounded-full text-[8px] font-black">
                  ₹{(walletBalance / 1000).toFixed(0)}k
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Wallet</span>
          </button>

          {/* 4. Cart with Live Count Badge */}
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs text-slate-500 hover:text-slate-900 transition-all font-medium relative active:scale-95"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-0.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Cart</span>
          </button>

          {/* 5. Menu (All Departments / Categories / Services) */}
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs text-slate-500 hover:text-slate-900 transition-all font-medium active:scale-95"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
          </button>

          {/* 6. Concierge (Rufus AI Assistant) */}
          <button
            onClick={onOpenChat}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-all font-bold group"
          >
            <div className="relative p-1.5 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 text-orange-600 font-extrabold">Concierge</span>
          </button>

        </div>
      </div>
    </div>
  );
};
