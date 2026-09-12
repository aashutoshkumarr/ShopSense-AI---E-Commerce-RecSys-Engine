import React, { useState } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  ArrowRight, 
  Heart, 
  Lock, 
  CheckCircle2,
  Terminal
} from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onOpenConsole?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenConsole }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 mt-20 border-t border-slate-800">
      
      {/* 1. Value Proposition Highlights Strip */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Free Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Complimentary shipping on orders over ₹1,999</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">2-Year Brand Warranty</h4>
              <p className="text-xs text-slate-400 mt-0.5">100% genuine authorized manufacturer coverage</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Hassle-Free 14-Day Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Instant refunds to wallet or original card</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-cyan-950/60 border border-cyan-700/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Encrypted Checkout</h4>
              <p className="text-xs text-slate-400 mt-0.5">PCI-DSS Level 1 double-entry ledger security</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-slate-950 font-black text-base">
                S
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                ShopSense
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The premium e-commerce destination for high-performance workstations, studio acoustics, and precision mechanical gear.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-2">
                Subscribe For Private Drops &amp; Member Offers
              </h5>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-md">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  {subscribed ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Joined!</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 mt-1.5">
                  Thank you! You have been subscribed to private member releases.
                </p>
              )}
            </div>
          </div>

          {/* Shop Departments */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-white">
              Departments
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              {['Laptops', 'Audio', 'Gaming', 'Smartphones', 'Smart Home', 'Accessories'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory && onSelectCategory(cat)}
                    className="hover:text-white transition"
                  >
                    {cat === 'Gaming' ? 'Mechanical Keyboards' : cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-white">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer transition">Track Your Order</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Returns &amp; Exchanges</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Brand Warranty Portal</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Shipping Guidelines</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Help &amp; FAQs</span></li>
            </ul>
          </div>

          {/* Engineering & Trust */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-white">
              Platform &amp; Trust
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer transition">100% Genuine Authorized Stock</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Fintech Double-Entry Ledger</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Privacy Policy &amp; Terms</span></li>
              {onOpenConsole && (
                <li className="pt-2">
                  <button
                    onClick={onOpenConsole}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-mono transition"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Developer &amp; ML Console</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal & Payment Badges Bar */}
      <div className="border-t border-slate-900 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} ShopSense Commerce, Inc. All rights reserved. Precision-engineered RecSys platform.
          </div>

          {/* Payment Trust Icons */}
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">VISA</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">MASTERCARD</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">UPI</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">APPLE PAY</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">NET BANKING</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
