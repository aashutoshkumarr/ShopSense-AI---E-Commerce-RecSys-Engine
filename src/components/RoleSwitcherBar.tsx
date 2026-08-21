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
