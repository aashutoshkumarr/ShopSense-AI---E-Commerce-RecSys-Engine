import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Wallet, 
  Crown, 
  Tag, 
  ShoppingBag, 
  X, 
  ExternalLink 
} from 'lucide-react';

export type ToastType = 'success' | 'info' | 'wallet' | 'loyalty' | 'coupon' | 'cart' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const duration = toast.durationMs || 4000;
    const newToast: ToastItem = { ...toast, id };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // max 5 visible

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
      case 'wallet':
        return <Wallet className="h-5 w-5 text-amber-400 shrink-0" />;
      case 'loyalty':
        return <Crown className="h-5 w-5 text-yellow-400 shrink-0" />;
      case 'coupon':
        return <Tag className="h-5 w-5 text-purple-400 shrink-0" />;
      case 'cart':
        return <ShoppingBag className="h-5 w-5 text-cyan-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-indigo-400 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-emerald-500/40 bg-slate-900/95 text-emerald-300';
      case 'wallet': return 'border-amber-500/40 bg-slate-900/95 text-amber-300';
      case 'loyalty': return 'border-yellow-500/40 bg-slate-900/95 text-yellow-300';
      case 'coupon': return 'border-purple-500/40 bg-slate-900/95 text-purple-300';
      case 'cart': return 'border-cyan-500/40 bg-slate-900/95 text-cyan-300';
      case 'error': return 'border-rose-500/40 bg-slate-900/95 text-rose-300';
      default: return 'border-indigo-500/40 bg-slate-900/95 text-indigo-300';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Fixed Toast Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${getBorderColor(t.type)}`}
          >
            {getIcon(t.type)}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white leading-tight">
                {t.title}
              </div>
              {t.message && (
                <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {t.message}
                </div>
              )}
              {t.actionLabel && t.onAction && (
                <button
                  onClick={() => {
                    t.onAction?.();
                    removeToast(t.id);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  <span>{t.actionLabel}</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
