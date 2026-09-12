import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Zap, 
  History,
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';
import { UserWallet, WalletTransaction, Currency } from '../types';

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  currency?: Currency;
  onWalletUpdated?: (wallet: UserWallet) => void;
}

export const WalletDrawer: React.FC<WalletDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  currency = 'INR',
  onWalletUpdated
}) => {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(2000);
  const [selectedGateway, setSelectedGateway] = useState<'Stripe Test Mode' | 'Razorpay Sandbox'>('Stripe Test Mode');
  const [processingTopUp, setProcessingTopUp] = useState(false);
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVC, setCardCVC] = useState('424');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wallet?userId=${userId}`);
      const data = await res.json();
      if (data.wallet) {
        setWallet(data.wallet);
        if (onWalletUpdated) onWalletUpdated(data.wallet);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
    }
  }, [isOpen, userId]);

  const handleExecuteTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || topUpAmount <= 0) return;

    try {
      setProcessingTopUp(true);
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amountINR: topUpAmount,
          gateway: selectedGateway,
          gatewayRef: selectedGateway === 'Stripe Test Mode' ? `pi_test_${Date.now()}` : `pay_rzp_${Date.now()}`
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.wallet) {
        setWallet(data.wallet);
        if (onWalletUpdated) onWalletUpdated(data.wallet);
        setTopUpSuccessMsg(`Successfully credited ₹${topUpAmount.toLocaleString()} via ${selectedGateway}!`);
        setTimeout(() => {
          setTopUpSuccessMsg(null);
          setShowTopUpModal(false);
        }, 1800);
      }
    } catch (err) {
      console.error('Top-up failed:', err);
    } finally {
      setProcessingTopUp(false);
    }
  };

  if (!isOpen) return null;

  const filteredTransactions = (wallet?.transactions || []).filter(tx => {
    if (filterType === 'all') return true;
    if (filterType === 'credits') return tx.type === 'topup' || tx.type === 'refund' || tx.type === 'cashback_reward' || tx.type === 'referral_bonus';
    if (filterType === 'debits') return tx.type === 'order_payment';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                ShopSense Wallet
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">Instant checkout &amp; zero-fee refunds</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
              <span>Available Wallet Balance</span>
              <span className="flex items-center gap-1 font-mono text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Test Mode Sandbox
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">
                {currency === 'INR' ? `₹${(wallet?.balanceINR || 0).toLocaleString()}` : `$${(wallet?.balanceUSD || 0).toLocaleString()}`}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({currency === 'INR' ? `$${(wallet?.balanceUSD || 0)} USD` : `₹${(wallet?.balanceINR || 0).toLocaleString()} INR`})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800/80 mb-4">
              <div>
                <span className="text-slate-400 block">Total Deposited</span>
                <span className="font-semibold text-slate-200 font-mono">₹{(wallet?.totalDepositedINR || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Spent / Orders</span>
                <span className="font-semibold text-slate-200 font-mono">₹{(wallet?.totalSpentINR || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowTopUpModal(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-900/40 transition active:scale-[0.98]"
              >
                <PlusCircle className="h-4 w-4" /> Top-Up Balance
              </button>
              <button
                onClick={fetchWallet}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                title="Refresh Balance"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <Zap className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <div className="font-semibold text-slate-200 text-[11px]">1-Click Pay</div>
              <div className="text-[10px] text-slate-400">Zero OTP delay</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <ArrowDownLeft className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <div className="font-semibold text-slate-200 text-[11px]">Instant Refund</div>
              <div className="text-[10px] text-slate-400">Direct to wallet</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <Sparkles className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
              <div className="font-semibold text-slate-200 text-[11px]">Split Payment</div>
              <div className="text-[10px] text-slate-400">Wallet + Card</div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <History className="h-4 w-4 text-cyan-400" /> Transaction Ledger
              </div>
              <div className="flex gap-1">
                {['all', 'credits', 'debits'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-2 py-0.5 rounded text-[10px] capitalize transition ${
                      filterType === tab 
                        ? 'bg-slate-700 text-white font-medium' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No transactions recorded yet.
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.amountINR > 0;
                  return (
                    <div 
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-200 line-clamp-1">
                            {tx.description}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {tx.paymentGateway && (
                              <span className="text-cyan-400 font-mono">[{tx.paymentGateway}]</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xs font-bold font-mono ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {isCredit ? '+' : ''}{currency === 'INR' ? `₹${tx.amountINR.toLocaleString()}` : `$${tx.amountUSD}`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Bal: ₹{tx.balanceAfterINR.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-center text-xs text-slate-400">
          Integrated with Stripe / Razorpay Test Sandbox. No real money processed.
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Top-Up Wallet (Test Mode)</h3>
              </div>
              <button 
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {topUpSuccessMsg ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-sm font-semibold text-white">{topUpSuccessMsg}</div>
                <div className="text-xs text-slate-400">Updating wallet balance ledger...</div>
              </div>
            ) : (
              <form onSubmit={handleExecuteTopUp} className="space-y-4">
                {/* Amount presets */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Select Amount (INR)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                          topUpAmount === amt 
                            ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500' 
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Enter custom amount"
                  />
                </div>

                {/* Gateway Selector */}
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Payment Gateway Sandbox</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGateway('Stripe Test Mode')}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        selectedGateway === 'Stripe Test Mode'
                          ? 'bg-indigo-900/30 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1 text-[11px] text-indigo-300">
                        <CreditCard className="h-3.5 w-3.5" /> Stripe Test
                      </div>
                      <div className="text-[10px] text-slate-400">Cards (4242...)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGateway('Razorpay Sandbox')}
                      className={`p-2 rounded-lg border text-left text-xs transition ${
                        selectedGateway === 'Razorpay Sandbox'
                          ? 'bg-blue-900/30 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1 text-[11px] text-blue-300">
                        <Building className="h-3.5 w-3.5" /> Razorpay
                      </div>
                      <div className="text-[10px] text-slate-400">UPI &amp; Netbanking</div>
                    </button>
                  </div>
                </div>

                {/* Simulated Card form */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-2">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Card Information</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Test Card Pre-filled</span>
                  </div>
                  <input 
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                      placeholder="MM/YY"
                    />
                    <input 
                      type="text"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                      placeholder="CVC"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processingTopUp || topUpAmount <= 0}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
                >
                  {processingTopUp ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Authorizing with {selectedGateway}...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" /> Deposit ₹{topUpAmount.toLocaleString()} to Wallet
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
