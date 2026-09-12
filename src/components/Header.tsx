import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle, 
  Terminal,
  ArrowLeft,
  Truck,
  Shield,
  Search,
  RefreshCw,
  LogIn,
  LogOut
} from 'lucide-react';
import { UserPersona, Currency, UserRole, AuthUser } from '../types';

export type MainTabType = 
  | 'storefront' 
  | 'seller_center'
  | 'pharmacy_portal'
  | 'delivery_partner'
  | 'admin_control' 
  | 'inspector' 
  | 'offline_ml' 
  | 'architecture' 
  | 'admin_products' 
  | 'admin_ingestion' 
  | 'ab_testing' 
  | 'event_stream' 
  | 'benchmark' 
  | 'bandit_explorer' 
  | 'embedding_map' 
  | 'observability'
  | 'api_playground';

interface HeaderProps {
  currentPersona: UserPersona;
  allPersonas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  currency: Currency;
  onToggleCurrency: () => void;
  onSelectCurrency?: (currency: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  ordersCount: number;
  activeRole: UserRole;
  authUser?: AuthUser;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  categories?: string[];
  onSwitchRole?: (role: UserRole) => void;
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
  onOpenPay?: () => void;
  onOpenSell?: () => void;
  onOpenBundles?: () => void;
  onOpenAuth?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  isProcessingIntent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  allPersonas,
  onSelectPersona,
  activeTab,
  onSelectTab,
  currency,
  onToggleCurrency,
  onSelectCurrency,
  cartCount,
  wishlistCount,
  ordersCount,
  activeRole,
  authUser,
  selectedCategory = 'All',
  onSelectCategory,
  categories = ['All', 'Laptops', 'Audio', 'Smartphones', 'Smart Home', 'Gaming', 'Grocery', 'Bazaar', 'Pharmacy', 'Accessories', 'Wearables'],
  onSwitchRole,
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
  onOpenMLIntelligence,
  onOpenPay,
  onOpenSell,
  onOpenBundles,
  onOpenAuth,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  isProcessingIntent
}) => {
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  // Close persona menu when tapping or clicking outside, or pressing Escape
  useEffect(() => {
    if (!personaMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setPersonaMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPersonaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [personaMenuOpen]);

  const isStorefront = activeTab === 'storefront';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 shadow-2xs">
      
      {/* 1. Sincere Luxury Announcement & Utility Services Bar */}
      <div className="bg-slate-50 px-4 py-1.5 text-xs border-b border-slate-200/70 flex items-center justify-between text-slate-500">
        
        {/* Left: Customer Promises */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
            <Truck className="h-3 w-3 text-slate-900" />
            <span>Free Express Delivery on orders over ₹1,999</span>
          </div>
          <span className="text-slate-300 hidden md:inline">&bull;</span>
          <div className="hidden md:flex items-center gap-1.5 text-slate-600">
            <Shield className="h-3 w-3 text-emerald-600" />
            <span>2-Year Official Brand Warranty</span>
          </div>
          <span className="text-slate-300 hidden lg:inline">&bull;</span>
          <span className="hidden lg:inline text-slate-500">⚡ 24hr Dispatch &amp; Doorstep Setup</span>
        </div>

        {/* Right: Quick Utilities + Developer & ML Console Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
          {onOpenOrders && (
            <button
              onClick={onOpenOrders}
              className="hover:text-slate-900 text-slate-600 transition hidden sm:flex items-center gap-1 font-medium"
            >
              <span>Orders</span>
              {ordersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 font-mono text-[10px] font-bold">
                  {ordersCount}
                </span>
              )}
            </button>
          )}

          {onOpenReturns && (
            <button
              onClick={onOpenReturns}
              className="hover:text-slate-900 text-slate-600 transition hidden sm:inline font-medium"
            >
              Returns
            </button>
          )}

          {onOpenSupport && (
            <button
              onClick={onOpenSupport}
              className="hover:text-slate-900 text-slate-600 transition hidden sm:inline font-medium"
            >
              Help &amp; Support
            </button>
          )}

          {onOpenWallet && (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-medium transition"
              title="ShopSense Wallet"
            >
              <Wallet className="h-3 w-3 text-emerald-600" />
              <span>Wallet: ₹4,500</span>
            </button>
          )}

          {/* Multi-Currency Global Selector */}
          <div className="relative flex items-center">
            <select
              value={currency}
              onChange={(e) => onSelectCurrency ? onSelectCurrency(e.target.value as Currency) : onToggleCurrency()}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-mono text-[11px] font-bold transition cursor-pointer outline-none"
              title="Select Global Store Currency"
            >
              <option value="INR">🇮🇳 ₹ INR</option>
              <option value="USD">🇺🇸 $ USD</option>
              <option value="EUR">🇪🇺 € EUR</option>
              <option value="GBP">🇬🇧 £ GBP</option>
              <option value="AED">🇦🇪 AED</option>
              <option value="JPY">🇯🇵 ¥ JPY</option>
            </select>
          </div>

          {/* Developer & ML Console Quick Access Button */}
          {isStorefront && (
            <button
              onClick={() => onSelectTab('admin_control')}
              className="hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-cyan-300 font-mono text-[11px] font-semibold transition cursor-pointer shadow-xs"
              title="Open Unified Admin, ML Engine & RecSys Observability Console"
            >
              <Terminal className="h-3 w-3 text-cyan-400" />
              <span>Developer &amp; ML Console</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* When in developer inspection console, show clean Return to Store button */}
          {!isStorefront && (
            <button
              onClick={() => onSelectTab('storefront')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-white transition font-medium text-[11px] shadow-sm cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Storefront</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Clean Brand Logo */}
        <div 
          onClick={() => onSelectTab('storefront')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="h-10 w-10 rounded-2xl bg-slate-950 p-0.5 shadow-sm group-hover:scale-105 transition flex items-center justify-center">
            <span className="font-black text-white text-lg">S</span>
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-slate-950 group-hover:text-indigo-600 transition">
              ShopSense
            </span>
          </div>
        </div>

        {/* Center: Spacious, Functional Search Bar (When in Storefront) */}
        {isStorefront && onSearchSubmit && onSearchQueryChange ? (
          <form 
            onSubmit={onSearchSubmit} 
            className="flex-1 max-w-xl mx-2 sm:mx-6 relative min-w-[200px]"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search gear, specs, budget (e.g. 'coding laptop under ₹1,00,000')..."
                className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchQueryChange('')}
                  className="absolute right-16 text-slate-400 hover:text-slate-700 text-sm font-bold px-1.5 cursor-pointer"
                  title="Clear search"
                >
                  &times;
                </button>
              )}
              <button
                type="submit"
                disabled={isProcessingIntent}
                className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                {isProcessingIntent ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>
          </form>
        ) : !isStorefront ? (
          /* Engineering Tabs when viewing developer platform */
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectTab('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'inspector'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              Pipeline (2.4ms)
            </button>
            <button
              onClick={() => onSelectTab('offline_ml')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'offline_ml' || activeTab === 'ab_testing'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
              Model Registry
            </button>
            <button
              onClick={() => onSelectTab('bandit_explorer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'bandit_explorer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BrainCircuit className="h-3.5 w-3.5 text-purple-600" />
              Thompson Bandit
            </button>
            <button
              onClick={() => onSelectTab('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              Benchmark
            </button>
            <button
              onClick={() => onSelectTab('embedding_map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'embedding_map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-cyan-600" />
              2D Vector Map
            </button>
            <button
              onClick={() => onSelectTab('admin_control')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'admin_control'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-amber-600" />
              Catalog &amp; Repricer
            </button>
            <button
              onClick={() => onSelectTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'architecture'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-slate-600" />
              Blueprint
            </button>
            <button
              onClick={() => onSelectTab('observability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'observability'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-rose-500" />
              Observability
            </button>
          </nav>
        ) : null}

        {/* Right Actions: Ask Concierge, User Profile, Wishlist, Cart */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Shopping Concierge Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition shadow-2xs group cursor-pointer"
            title="Ask AI Shopping Concierge & Hardware Specialist"
          >
            <Sparkles className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Ask Concierge</span>
          </button>

          {/* Sell on ShopSense (OLX Style) Button */}
          {onOpenSell && (
            <button
              onClick={onOpenSell}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs transition shadow-2xs group cursor-pointer"
              title="Sell Your Pre-Owned Item (OLX Style)"
            >
              <span className="text-xs">🔄</span>
              <span>Sell (OLX)</span>
            </button>
          )}

          {/* Sign In / Authentication Button (Only when not authenticated) */}
          {onOpenAuth && (!authUser || (authUser as any).isGuest) && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition shadow-2xs group cursor-pointer active:scale-95"
              title="Sign in or create an account"
            >
              <LogIn className="h-3.5 w-3.5 text-slate-200 group-hover:scale-110 transition-transform" />
              <span>Sign In</span>
            </button>
          )}

          {/* User Account Menu (Clean Customer Account, No Debug Jargon!) */}
          <div ref={personaMenuRef} className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-left cursor-pointer"
            >
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = (e.target as HTMLElement).nextElementSibling;
                  if (fb) (fb as HTMLElement).style.display = 'flex';
                }}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300"
              />
              <div 
                style={{ display: 'none' }}
                className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white text-xs font-bold items-center justify-center ring-1 ring-slate-300 select-none shrink-0"
              >
                {currentPersona.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[90px]">
                  Prime Member
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-slate-900">
                
                {/* Customer Account Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentPersona.avatar}
                      alt={currentPersona.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {currentPersona.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        alex.kumar@shopsense.internal
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Wallet Credits:</span>
                    <span className="font-mono text-emerald-700 font-bold">₹4,500</span>
                  </div>
                </div>

                {/* Customer Account Quick Links */}
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setPersonaMenuOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium transition cursor-pointer"
                  >
                    <Package className="h-4 w-4 text-slate-500" />
                    <span>My Orders &amp; Tracking</span>
                    {ordersCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-800">
                        {ordersCount}
                      </span>
                    )}
                  </button>

                  {onOpenReturns && (
                    <button
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenReturns();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium transition cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 text-slate-500" />
                      <span>Returns &amp; Replacements</span>
                    </button>
                  )}

                  {onOpenWallet && (
                    <button
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenWallet();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium transition cursor-pointer"
                    >
                      <Wallet className="h-4 w-4 text-emerald-600" />
                      <span>ShopSense Wallet (₹4,500)</span>
                    </button>
                  )}

                  {onOpenCoupons && (
                    <button
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenCoupons();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium transition cursor-pointer"
                    >
                      <Tag className="h-4 w-4 text-rose-500" />
                      <span>Coupons &amp; Offers</span>
                    </button>
                  )}

                  {onOpenAlerts && (
                    <button
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenAlerts();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium transition cursor-pointer"
                    >
                      <Bell className="h-4 w-4 text-amber-500" />
                      <span>Price &amp; Stock Alerts</span>
                    </button>
                  )}

                  {onOpenSupport && (
                    <button
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenSupport();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium transition cursor-pointer"
                    >
                      <HelpCircle className="h-4 w-4 text-indigo-500" />
                      <span>Help &amp; Customer Support</span>
                    </button>
                  )}

                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        setPersonaMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-900 font-semibold border-t border-slate-100 transition cursor-pointer"
                    >
                      <LogIn className="h-4 w-4 text-slate-700" />
                      <span>Log In with Password / SSO</span>
                    </button>
                  )}
                </div>

                {/* Switch Demo Customer Account (Clean, no debugging labels) */}
                <div className="border-t border-slate-100 pt-2 pb-1 px-3">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Demo Shopper Accounts
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto py-1">
                    {allPersonas.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPersona(p);
                          setPersonaMenuOpen(false);
                        }}
                        title={`${p.name} (${p.role})`}
                        className={`p-1 rounded-xl border transition cursor-pointer ${
                          p.id === currentPersona.id
                            ? 'border-slate-950 bg-slate-100 ring-1 ring-slate-950'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <img src={p.avatar} alt={p.name} className="h-6 w-6 rounded-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-rose-600 transition cursor-pointer"
            title="Wishlist & Saved Items"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white transition shadow-sm cursor-pointer"
            title="Shopping Bag"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2.5. Amazon-Style Super-App Quick Services Strip */}
      {isStorefront && (
        <div className="bg-slate-50/90 border-t border-slate-200/60 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
            {/* Pay Tile */}
            {onOpenPay && (
              <button
                onClick={onOpenPay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-300 text-amber-950 transition cursor-pointer shrink-0"
              >
                <div className="w-4 h-4 rounded-sm bg-amber-400 flex items-center justify-center text-slate-950 font-black text-[9px]">
                  pay
                </div>
                <span>Pay</span>
              </button>
            )}

            {/* Grocery Fresh Tile */}
            <button
              onClick={() => onSelectCategory && onSelectCategory('Grocery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                selectedCategory.toLowerCase() === 'grocery'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950'
              }`}
            >
              <span className="text-xs">🥦</span>
              <span>Groceries &bull; Fresh</span>
            </button>

            {/* Bazaar Crazy Prices Tile */}
            <button
              onClick={() => onSelectCategory && onSelectCategory('Bazaar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                selectedCategory.toLowerCase() === 'bazaar'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-950'
              }`}
            >
              <span className="text-xs">🏷️</span>
              <span>Bazaar &bull; Under ₹999</span>
            </button>

            {/* Pharmacy Tile */}
            <button
              onClick={() => onSelectCategory && onSelectCategory('Pharmacy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                selectedCategory.toLowerCase() === 'pharmacy'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-950'
              }`}
            >
              <span className="text-xs">💊</span>
              <span>Pharmacy</span>
            </button>

            {/* Bundles (-12%) Tile */}
            {onOpenBundles && (
              <button
                onClick={onOpenBundles}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 transition cursor-pointer shrink-0"
              >
                <span className="text-xs">⚡</span>
                <span className="text-purple-900 font-extrabold">Explore Bundles (-12%)</span>
              </button>
            )}

            {/* Sell on ShopSense (OLX) Tile */}
            {onOpenSell && (
              <button
                onClick={onOpenSell}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 transition cursor-pointer shrink-0 ml-auto"
              >
                <span className="text-xs">🔄</span>
                <span className="text-indigo-700 font-extrabold">Sell &amp; Earn Cash (OLX)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Category Navigation Strip (Dedicated Spacious Row) */}
      {isStorefront && (
        <div className="border-t border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'All' ? 'All Tech' : cat}
                </button>
              );
            })}

            {onOpenCoupons && (
              <button
                onClick={onOpenCoupons}
                className="px-3 py-1.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition flex items-center gap-1 font-bold whitespace-nowrap ml-auto cursor-pointer"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>🔥 Exclusive Deals</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Search Dropdown Bar */}
      {mobileSearchOpen && isStorefront && onSearchSubmit && onSearchQueryChange && (
        <div className="lg:hidden p-3 border-t border-slate-200 bg-slate-50 animate-in fade-in">
          <form 
            onSubmit={(e) => { 
              onSearchSubmit(e); 
              setMobileSearchOpen(false); 
            }} 
            className="relative flex items-center"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search gear, specs, budget..."
              className="w-full pl-10 pr-20 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Category / Console Tab Strip */}
      <div className="md:hidden border-t border-slate-200 px-3 py-1.5 flex items-center gap-2 overflow-x-auto text-xs bg-white">
        {isStorefront ? (
          categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory && onSelectCategory(cat)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600'
              }`}
            >
              {cat === 'All' ? 'All Tech' : cat}
            </button>
          ))
        ) : (
          <>
            <button
              onClick={() => onSelectTab('storefront')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold whitespace-nowrap"
            >
              ← Store
            </button>
            <button
              onClick={() => onSelectTab('inspector')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'inspector' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => onSelectTab('offline_ml')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'offline_ml' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              Registry
            </button>
            <button
              onClick={() => onSelectTab('admin_control')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${activeTab === 'admin_control' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              Admin
            </button>
          </>
        )}
      </div>

    </header>
  );
};
