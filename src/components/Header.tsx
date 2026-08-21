import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingCart, 
  Sliders, 
  Cpu, 
  Layers, 
  BrainCircuit, 
  FileText, 
  User,
  ChevronDown,
  Zap,
  Bot,
  Heart,
  Package,
  Database,
  GitCompare,
  Activity,
  ShieldCheck,
  PackageCheck,
  Wallet,
  Crown,
  Tag,
  Users,
  Bell,
  BarChart3,
  Headphones,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import { UserPersona, Currency, UserRole } from '../types';

export type MainTabType = 
  | 'storefront' 
  | 'admin_control'
  | 'inspector' 
  | 'offline_ml' 
  | 'architecture' 
  | 'admin_products' 
  | 'admin_ingestion' 
  | 'ab_testing' 
  | 'event_stream';

interface HeaderProps {
  currentPersona: UserPersona;
  allPersonas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  currency: Currency;
  onToggleCurrency: () => void;
  cartCount: number;
  wishlistCount: number;
  ordersCount: number;
  activeRole: UserRole;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onOpenWallet?: () => void;
  onOpenLoyalty?: () => void;
  onOpenCoupons?: () => void;
  onOpenReferral?: () => void;
  onOpenAlerts?: () => void;
  onOpenSupport?: () => void;
  onOpenReturns?: () => void;
  onOpenMLIntelligence?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  allPersonas,
  onSelectPersona,
  activeTab,
  onSelectTab,
  currency,
  onToggleCurrency,
  cartCount,
  wishlistCount,
  ordersCount,
  activeRole,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenChat,
  onOpenSettings,
  onOpenWallet,
  onOpenLoyalty,
  onOpenCoupons,
  onOpenReferral,
  onOpenAlerts,
  onOpenSupport,
  onOpenReturns,
  onOpenMLIntelligence
}) => {
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      
      {/* Top Banner / System Telemetry Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 px-4 py-1 text-xs border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Model: <strong className="font-mono text-cyan-300">hybrid-lgbm-v3 (Variant B)</strong>
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Inference: <strong className="text-cyan-300 font-mono">18ms</strong> (pgvector ANN + GBDT)
          </span>
          {onOpenMLIntelligence && (
            <button
              onClick={onOpenMLIntelligence}
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700 text-cyan-300 text-[10px] font-mono transition"
            >
              <BrainCircuit className="h-3 w-3" />
              <span>ML Engine (Offers/Segments/Forecast)</span>
            </button>
          )}
        </div>

        {/* Currency Switcher & Quick Navigation Shortcuts */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenReturns && (
            <button
              onClick={onOpenReturns}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-[11px] font-mono transition"
              title="Return & Replacement Guarantee"
            >
              <RotateCcw className="h-3 w-3 text-cyan-400" />
              <span className="hidden sm:inline">Returns</span>
            </button>
          )}

          {onOpenSupport && (
            <button
              onClick={onOpenSupport}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-mono transition"
              title="Customer Support & Help Center"
            >
              <Headphones className="h-3 w-3 text-emerald-400" />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}

          {onOpenWallet && (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-[11px] font-mono transition"
              title="ShopSense Wallet"
            >
              <Wallet className="h-3 w-3" />
              <span>Wallet</span>
            </button>
          )}

          {onOpenLoyalty && (
            <button
              onClick={onOpenLoyalty}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-amber-300 text-[11px] font-mono transition"
              title="Loyalty Rewards & Tiers"
            >
              <Crown className="h-3 w-3" />
              <span>Rewards</span>
            </button>
          )}

          {onOpenCoupons && (
            <button
              onClick={onOpenCoupons}
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-[11px] font-mono transition"
              title="Coupons & ML Offers"
            >
              <Tag className="h-3 w-3" />
              <span>Offers</span>
            </button>
          )}

          {onOpenReferral && (
            <button
              onClick={onOpenReferral}
              className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800 text-indigo-300 text-[11px] font-mono transition"
              title="Invite Friends & Earn ₹500"
            >
              <Users className="h-3 w-3" />
              <span>Referral</span>
            </button>
          )}

          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-[11px] font-mono transition"
              title="Price & Stock Trackers"
            >
              <Bell className="h-3 w-3" />
              <span>Alerts</span>
            </button>
          )}

          <button
            id="currency-toggle-btn"
            onClick={onToggleCurrency}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-mono transition"
            title="Toggle Currency (INR / USD)"
          >
            <span>{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onSelectTab('storefront')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ShopSense
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-indigo-500 to-cyan-500 text-[10px] font-black uppercase text-white tracking-widest shadow-sm">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                E-Commerce Recommendation &amp; Fintech Suite
              </p>
            </div>
          </div>
        </div>

        {/* Center: Role-Based Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
          
          {/* Customer Storefront Tab */}
          <button
            id="tab-storefront-btn"
            onClick={() => onSelectTab('storefront')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'storefront'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Storefront
          </button>

          {/* Unified Admin & ML Control Center */}
          <button
            id="tab-admin-control-btn"
            onClick={() => onSelectTab('admin_control')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'admin_control'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
            Admin &amp; ML Control
          </button>

          {/* Pipeline Inspector */}
          <button
            id="tab-inspector-btn"
            onClick={() => onSelectTab('inspector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'inspector'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Pipeline Inspector
          </button>

          {/* Architecture Blueprint tab */}
          <button
            id="tab-architecture-btn"
            onClick={() => onSelectTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'architecture'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Blueprint
          </button>
        </nav>

        {/* Right: Actions, Persona Switcher, Cart, Wishlist, Orders */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              id="persona-switcher-btn"
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition text-left"
            >
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-cyan-400"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-cyan-400 truncate max-w-[90px]">
                  {currentPersona.role}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-slate-800">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Test User Persona
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {allPersonas.map((p) => {
                    const isSelected = p.id === currentPersona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPersona(p);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-800 transition ${
                          isSelected ? 'bg-indigo-950/60 border-l-2 border-cyan-400' : ''
                        }`}
                      >
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="h-8 w-8 rounded-full object-cover mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-medium ${isSelected ? 'text-cyan-300 font-semibold' : 'text-slate-200'}`}>
                              {p.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ₹{(p.targetBudgetINR / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{p.role}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {p.preferredCategories.slice(0, 2).map((c) => (
                              <span key={c} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI Shopping Assistant Button */}
          <button
            id="open-ai-chat-btn"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium text-xs shadow-md shadow-orange-500/20 transition group"
            title="Ask AI Shopping Concierge (Gemini 3.1 Pro High Thinking)"
          >
            <Bot className="h-4 w-4 animate-bounce" />
            <span className="hidden sm:inline">AI Concierge</span>
          </button>

          {/* Wishlist Drawer Button */}
          <button
            id="open-wishlist-btn"
            onClick={onOpenWishlist}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 border border-slate-700 transition"
            title="Wishlist & Saved Items"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Orders History Button */}
          <button
            id="open-orders-btn"
            onClick={onOpenOrders}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 border border-slate-700 transition"
            title="Orders & Past Purchases"
          >
            <PackageCheck className="h-4 w-4" />
            {ordersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                {ordersCount}
              </span>
            )}
          </button>

          {/* Pipeline Sandbox Settings */}
          <button
            id="open-pipeline-settings-btn"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Pipeline Tuning Sandbox"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Cart Drawer Button */}
          <button
            id="open-cart-drawer-btn"
            onClick={onOpenCart}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Shopping Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="lg:hidden border-t border-slate-800 px-2 py-1.5 flex items-center justify-around text-xs bg-slate-950 overflow-x-auto gap-1">
        <button
          onClick={() => onSelectTab('storefront')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${activeTab === 'storefront' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          Store
        </button>
        <button
          onClick={() => onSelectTab('admin_control')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${activeTab === 'admin_control' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          Admin &amp; ML
        </button>
        <button
          onClick={() => onSelectTab('inspector')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${activeTab === 'inspector' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          Inspector
        </button>
        <button
          onClick={() => onSelectTab('architecture')}
          className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${activeTab === 'architecture' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
        >
          Blueprint
        </button>
      </div>

    </header>
  );
};
