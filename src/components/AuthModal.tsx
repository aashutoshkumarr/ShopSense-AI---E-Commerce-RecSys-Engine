import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { AuthUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
  initialError?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialError
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'sso'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ssoOrg, setSsoOrg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setSsoOrg('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Login error: Not registered');
        return;
      }

      setSuccessMessage(`Welcome back, ${data.user.name || 'Shopper'}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
        handleClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage('Connection error. Please check your internet or retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Email and password are required');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed');
        return;
      }

      setSuccessMessage('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(data.user);
        handleClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage('Network error during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Social / Federated SSO Logins
  const handleSocialLogin = async (provider: 'google' | 'orcid' | 'ieee') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setSuccessMessage(`Signed in via ${provider.toUpperCase()}`);
        setTimeout(() => {
          onLoginSuccess(data.user);
          handleClose();
        }, 500);
      } else {
        setErrorMessage(`Failed to authenticate with ${provider}`);
      }
    } catch (err) {
      setErrorMessage(`Unable to connect to ${provider} authentication provider`);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please provide your email to reset password');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || 'Password reset link sent to your email.');
      } else {
        setErrorMessage(data.error || 'Login error: Not registered');
      }
    } catch {
      setErrorMessage('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 text-slate-900 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {mode === 'login' && 'Log in'}
            {mode === 'register' && 'Create account'}
            {mode === 'forgot' && 'Reset password'}
            {mode === 'sso' && 'Single sign-on'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' && 'Access your ShopSense AI Commerce OS account'}
            {mode === 'register' && 'Sign up to start shopping and earning rewards'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
            {mode === 'sso' && 'Sign in using your university or enterprise credentials'}
          </p>
        </div>

        {/* Error Alert Box (Faithful match to reference screenshot) */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {errorMessage}
              {errorMessage.includes('Not registered') && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setMode('register');
                  }}
                  className="block mt-1 font-bold text-rose-900 underline hover:text-rose-950 cursor-pointer"
                >
                  Click here to register with this email
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm font-medium">{successMessage}</div>
          </div>
        )}

        {/* Social / Federated SSO Buttons (Visible on Login & Register modes) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="space-y-2.5 mb-5">
            {/* 1. Log in with Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-sm transition shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              {/* Official Google 'G' 4-color SVG */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{mode === 'login' ? 'Log in with Google' : 'Sign up with Google'}</span>
            </button>

            {/* 2. Log in with ORCID */}
            <button
              type="button"
              onClick={() => handleSocialLogin('orcid')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-sm transition shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              {/* ORCID Green ID Badge SVG */}
              <div className="h-4 w-4 rounded-full bg-[#A6CE39] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                iD
              </div>
              <span>{mode === 'login' ? 'Log in with ORCID' : 'Sign up with ORCID'}</span>
            </button>

            {/* 3. Log in with IEEE */}
            <button
              type="button"
              onClick={() => handleSocialLogin('ieee')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-sm transition shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              {/* IEEE Diamond Blue Emblem SVG */}
              <div className="h-4 w-4 bg-[#00629B] text-white flex items-center justify-center text-[8px] font-bold rotate-45 shrink-0 rounded-[2px]">
                <span className="-rotate-45 font-mono">I</span>
              </div>
              <span>{mode === 'login' ? 'Log in with IEEE' : 'Sign up with IEEE'}</span>
            </button>
          </div>
        )}

        {/* OR Divider */}
        {(mode === 'login' || mode === 'register') && (
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold shrink-0">
              OR
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>
        )}

        {/* Form: Login / Register */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            
            {/* Name Field (Register mode only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-900 text-sm outline-none transition"
                />
              </div>
            )}

            {/* Email Field (With amber focus highlight matching screenshot) */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 text-slate-900 text-sm outline-none transition"
              />
            </div>

            {/* Password Field with Eye Show/Hide Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 text-slate-900 text-sm outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button (Black matching screenshot) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              <span>{mode === 'login' ? 'Log in' : 'Create account'}</span>
            </button>

            {/* Forgot password? Link */}
            {mode === 'login' && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode('forgot');
                  }}
                  className="text-sm font-medium text-slate-700 hover:text-slate-950 underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>
        )}

        {/* Form: Forgot Password View */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 text-slate-900 text-sm outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Send Reset Instructions</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                &larr; Back to Log in
              </button>
            </div>
          </form>
        )}

        {/* Form: SSO Organization View */}
        {mode === 'sso' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Work or University Domain
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/30">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={ssoOrg}
                  onChange={(e) => setSsoOrg(e.target.value)}
                  placeholder="e.g. stanford.edu, amazon.com"
                  className="w-full text-slate-900 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSocialLogin('ieee')}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition shadow-sm cursor-pointer"
            >
              Continue with SSO Gateway
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                &larr; Back to Standard Log in
              </button>
            </div>
          </div>
        )}

        {/* Secondary Divider & Single Sign-On */}
        {mode === 'login' && (
          <>
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold shrink-0">
                OR
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Work / University Single Sign-On link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('sso');
                }}
                className="text-sm font-semibold text-slate-800 hover:text-black transition cursor-pointer"
              >
                Work/university single sign-on
              </button>
            </div>
          </>
        )}

        {/* Footer Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('register');
                }}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Log in
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
