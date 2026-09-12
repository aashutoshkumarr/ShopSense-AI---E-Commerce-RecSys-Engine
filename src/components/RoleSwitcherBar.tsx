import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Cpu, 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  Lock, 
  Terminal,
  Layers,
  ShoppingBag,
  Sliders
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';

interface RoleSwitcherBarProps {
  currentUser: AuthUser;
  onSwitchRole: (role: UserRole) => void;
  activeRole: UserRole;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSwitchRole,
  activeRole
}) => {
  return (
    <div className="bg-slate-950 border-b border-slate-800 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Role Switcher Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1.5 mr-1 text-[11px] uppercase tracking-wider">
            <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
            RBAC Mode:
          </span>

          {/* Customer Role */}
          <button
            id="role-customer-btn"
            onClick={() => onSwitchRole('customer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              activeRole === 'customer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>Customer</span>
            {activeRole === 'customer' && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>}
          </button>

          {/* Seller Role */}
          <button
            id="role-seller-btn"
            onClick={() => onSwitchRole('seller')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              activeRole === 'seller'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
            <span>Seller</span>
            {activeRole === 'seller' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>}
          </button>

          {/* Pharmacy Operator Role */}
          <button
            id="role-pharmacy-btn"
            onClick={() => onSwitchRole('pharmacy_operator')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              activeRole === 'pharmacy_operator'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pharmacy</span>
            {activeRole === 'pharmacy_operator' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          {/* Delivery Partner Role */}
          <button
            id="role-delivery-btn"
            onClick={() => onSwitchRole('delivery_partner')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              activeRole === 'delivery_partner'
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-orange-400" />
            <span>Delivery</span>
            {activeRole === 'delivery_partner' && <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>}
          </button>

          {/* Admin Role */}
          <button
            id="role-admin-btn"
            onClick={() => onSwitchRole('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              activeRole === 'admin'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Admin</span>
            {activeRole === 'admin' && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>}
          </button>

          {/* ML / Analyst Role */}
          <button
            id="role-ml-btn"
            onClick={() => onSwitchRole('ml_analyst')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
              activeRole === 'ml_analyst'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>ML / Analyst</span>
            {activeRole === 'ml_analyst' && <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>}
          </button>
        </div>

        {/* Right: Active Role Capabilities / Permissions Badge */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-500">Access Scope:</span>
            {activeRole === 'customer' && (
              <span className="text-slate-300 flex items-center gap-1">
                Browse &bull; Search &bull; Cart &bull; Wishlist &bull; Orders &bull; Personalization
              </span>
            )}
            {activeRole === 'seller' && (
              <span className="text-amber-300 flex items-center gap-1">
                Listings &bull; Buy Box AI &bull; Margin Floors &bull; AI Listing Optimizer
              </span>
            )}
            {activeRole === 'pharmacy_operator' && (
              <span className="text-emerald-300 flex items-center gap-1">
                Prescription Audit &bull; Schedule H Dispensing &bull; Reg: KA-PH-39402
              </span>
            )}
            {activeRole === 'delivery_partner' && (
              <span className="text-orange-300 flex items-center gap-1">
                Dark Store Pickup &bull; 10-Min SLA Route &bull; Doorstep OTP Verification
              </span>
            )}
            {activeRole === 'admin' && (
              <span className="text-indigo-300 flex items-center gap-1">
                Catalog CRUD &bull; Ingestion (DummyJSON/CSV) &bull; Stock &amp; Price &bull; Analytics
              </span>
            )}
            {activeRole === 'ml_analyst' && (
              <span className="text-purple-300 flex items-center gap-1">
                A/B Testing &bull; Model Registry &bull; NDCG@10 &bull; Event Stream &bull; Training Runs
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono text-[10px] text-slate-300">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>JWT Auth: Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
