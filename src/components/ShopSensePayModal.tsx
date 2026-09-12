import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  QrCode, 
  PlusCircle, 
  ArrowUpRight, 
  Gift, 
  Zap, 
  Smartphone, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Receipt,
  Car,
  Tv,
  Building2,
  Lock,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  History,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { UserPersona } from '../types';
import { 
  upiPaymentServiceInstance, 
  LinkedBankAccount, 
  RECENT_PAYEES, 
  MOCK_BILL_PROVIDERS, 
  BillProvider,
  UPITransaction 
} from '../engine/upiPaymentService';

interface ShopSensePayModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onTopUp: (amount: number) => void;
  currentPersona: UserPersona;
}

type PayViewMode = 'home' | 'scan_qr' | 'send_money' | 'pay_bills' | 'rewards' | 'check_balance' | 'pin_screen';

export const ShopSensePayModal: React.FC<ShopSensePayModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onTopUp,
  currentPersona
}) => {
  const [viewMode, setViewMode] = useState<PayViewMode>('home');
  const [banks, setBanks] = useState<LinkedBankAccount[]>(upiPaymentServiceInstance.getLinkedBanks());
  const [selectedBank, setSelectedBank] = useState<LinkedBankAccount>(upiPaymentServiceInstance.getPrimaryBank());
  const [paymentSource, setPaymentSource] = useState<'wallet' | 'bank'>('bank');
  
  // Send money state
  const [recipientInput, setRecipientInput] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNote, setTransferNote] = useState<string>('');
  
  // UPI PIN Dialog state
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinTargetAction, setPinTargetAction] = useState<'transfer' | 'balance' | 'bill'>('transfer');
  const [pinError, setPinError] = useState<string>('');
  
  // Balance check result state
  const [checkedBalanceResult, setCheckedBalanceResult] = useState<number | null>(null);
  
  // Bills state
  const [selectedBiller, setSelectedBiller] = useState<BillProvider | null>(null);
  const [consumerIdentifier, setConsumerIdentifier] = useState<string>('');
  const [billAmount, setBillAmount] = useState<number>(0);

  // Success screen state
  const [lastTransaction, setLastTransaction] = useState<UPITransaction | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Scratch card state
  const [scratchReward, setScratchReward] = useState<number>(45);
  const [isScratched, setIsScratched] = useState<boolean>(false);

  // Quick top-up state
  const [customTopUp, setCustomTopUp] = useState<string>('1000');
  const [toastMessage, setToastMessage] = useState<string>('');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSelectPayee = (payee: typeof RECENT_PAYEES[0]) => {
    setRecipientInput(payee.handle);
    setRecipientName(payee.name);
    setViewMode('send_money');
  };

  const handleOpenPinScreen = (action: 'transfer' | 'balance' | 'bill') => {
    setEnteredPin('');
    setPinError('');
    setPinTargetAction(action);
    setViewMode('pin_screen');
  };

  const handlePinSubmit = () => {
    if (enteredPin.length < selectedBank.pinLength) {
      setPinError(`Please enter your complete ${selectedBank.pinLength}-digit UPI PIN`);
      return;
    }

    if (pinTargetAction === 'balance') {
      const res = upiPaymentServiceInstance.getAccountBalance(selectedBank.id, enteredPin);
      if (res.success && res.balanceINR !== undefined) {
        setCheckedBalanceResult(res.balanceINR);
        setViewMode('check_balance');
      } else {
        setPinError(res.error || 'Incorrect UPI PIN');
      }
    } else if (pinTargetAction === 'transfer') {
      const amt = parseFloat(transferAmount);
      const res = upiPaymentServiceInstance.executeTransfer({
        paymentSource,
        bankId: selectedBank.id,
        pin: enteredPin,
        amountINR: amt,
        recipientName: recipientName || recipientInput,
        recipientHandle: recipientInput,
        recipientType: recipientInput.includes('@') ? 'upi_id' : 'contact',
        note: transferNote
      });

      if (res.success && res.transaction) {
        setLastTransaction(res.transaction);
        setIsSuccessModalOpen(true);
        setViewMode('home');
        setTransferAmount('');
        setTransferNote('');
        setRecipientInput('');
      } else {
        setPinError(res.error || 'Payment failed');
      }
    } else if (pinTargetAction === 'bill') {
      const res = upiPaymentServiceInstance.executeTransfer({
        paymentSource,
        bankId: selectedBank.id,
        pin: enteredPin,
        amountINR: billAmount,
        recipientName: selectedBiller?.name || 'Bharat BillPay',
        recipientHandle: `bbps.${selectedBiller?.id}@npci`,
        recipientType: 'biller',
        note: `Bill Payment - ${consumerIdentifier}`
      });

      if (res.success && res.transaction) {
        setLastTransaction(res.transaction);
        setIsSuccessModalOpen(true);
        setViewMode('home');
        setSelectedBiller(null);
        setConsumerIdentifier('');
      } else {
        setPinError(res.error || 'Bill payment failed');
      }
    }
  };

  const handleScratch = () => {
    if (!isScratched) {
      setIsScratched(true);
      onTopUp(scratchReward);
      showToast(`🎉 Cashback of ₹${scratchReward} added to your Wallet!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Strip with GPay aesthetic */}
        <div className="bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {viewMode !== 'home' ? (
                <button
                  onClick={() => setViewMode('home')}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-black text-xs text-indigo-200">
                  ₹
                </div>
              )}
              <div>
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>ShopSense Pay</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                    UPI 2.0
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300 font-mono">
                  {currentPersona.name.toLowerCase().replace(/\s+/g, '')}@shopsense
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Balance Snapshot */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 block">
                Total Accessible Funds
              </span>
              <div className="text-2xl font-black text-white mt-0.5 flex items-baseline gap-2">
                <span>₹{(walletBalance + selectedBank.balanceINR).toLocaleString('en-IN')}</span>
                <span className="text-xs font-normal text-slate-400">
                  (Wallet ₹{walletBalance.toLocaleString('en-IN')} + Bank ₹{selectedBank.balanceINR.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
            <button
              onClick={() => handleOpenPinScreen('balance')}
              className="text-xs text-indigo-300 hover:text-white font-bold flex items-center gap-1 underline cursor-pointer"
            >
              Check Bank Bal
            </button>
          </div>
        </div>

        {/* VIEW 1: GOOGLE PAY STYLE HOME DASHBOARD */}
        {viewMode === 'home' && (
          <div className="p-5 space-y-6">
            
            {/* 6 Quick Action Circles (Google Pay layout) */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <button
                onClick={() => setViewMode('scan_qr')}
                className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 transition cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-1.5">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Scan any QR</span>
                <span className="text-[10px] text-slate-400">Shop / UPI QR</span>
              </button>

              <button
                onClick={() => {
                  setRecipientInput('');
                  setRecipientName('');
                  setViewMode('send_money');
                }}
                className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 transition cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-1.5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Pay Contacts</span>
                <span className="text-[10px] text-slate-400">Mobile / UPI ID</span>
              </button>

              <button
                onClick={() => setViewMode('pay_bills')}
                className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 transition cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-1.5">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Pay Bills</span>
                <span className="text-[10px] text-slate-400">Power & Mobile</span>
              </button>
            </div>

            {/* People & Recent Payees Strip */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  People &amp; Frequent Payees
                </span>
                <span className="text-[11px] font-semibold text-indigo-600">Instant UPI</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                {RECENT_PAYEES.map((payee) => (
                  <button
                    key={payee.handle}
                    onClick={() => handleSelectPayee(payee)}
                    className="flex flex-col items-center shrink-0 w-16 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-indigo-600 transition shadow-xs mb-1">
                      <img src={payee.avatar} alt={payee.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">
                      {payee.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Linked Bank Accounts (Switch Active Bank) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-900">Linked Bank Accounts</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">NPCI Verified</span>
              </div>

              <div className="space-y-2">
                {banks.map((b) => {
                  const isChosen = selectedBank.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBank(b);
                        upiPaymentServiceInstance.setPrimaryBank(b.id);
                        setBanks([...upiPaymentServiceInstance.getLinkedBanks()]);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChosen
                          ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                          : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{b.bankLogo}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{b.bankName}</h4>
                            {b.isPrimary && (
                              <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-500">{b.accountNumberMasked} &bull; {b.accountType}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">₹{b.balanceINR.toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-emerald-600 font-medium">Active UPI</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rewards & Scratch Card Teaser */}
            <div 
              onClick={() => setViewMode('rewards')}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between cursor-pointer shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                  🎁
                </div>
                <div>
                  <h4 className="text-xs font-black">Google Pay Rewards &amp; Scratch Cards</h4>
                  <p className="text-[11px] text-white/90">
                    {isScratched ? `You unlocked ₹${scratchReward} cashback!` : 'Tap to scratch your rewards card'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80" />
            </div>

            {/* Quick Wallet Add Funds */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-2">Instant Wallet Top-Up</span>
              <div className="flex items-center gap-2">
                {[500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => {
                      onTopUp(amt);
                      showToast(`₹${amt} added to ShopSense Wallet!`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SEND MONEY TO CONTACT / UPI ID */}
        {viewMode === 'send_money' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900">Send Money via UPI</h3>
              <p className="text-xs text-slate-500">Pay directly from your linked bank account or wallet</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Recipient Mobile Number or UPI ID
                </label>
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="e.g. 9820144821 or friend@okhdfc"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Enter Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-base">₹</span>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full pl-8 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xl font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Add a Note (Optional)
                </label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="What is this for? e.g. Lunch, Rent"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Payment Source Radio */}
              <div className="pt-2 border-t border-slate-200">
                <label className="text-[11px] font-bold text-slate-700 block mb-2">
                  Paying From:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-indigo-600 bg-indigo-50/50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="paySource" 
                        checked={paymentSource === 'bank'} 
                        onChange={() => setPaymentSource('bank')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900">{selectedBank.bankName}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{selectedBank.accountNumberMasked}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">₹{selectedBank.balanceINR.toLocaleString('en-IN')}</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300">
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="paySource" 
                        checked={paymentSource === 'wallet'} 
                        onChange={() => setPaymentSource('wallet')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900">ShopSense Wallet</span>
                        <span className="text-[10px] text-slate-500 block">Instant 0-step checkout</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">₹{walletBalance.toLocaleString('en-IN')}</span>
                  </label>
                </div>
              </div>

              <button
                disabled={!recipientInput.trim() || !transferAmount || parseFloat(transferAmount) <= 0}
                onClick={() => handleOpenPinScreen('transfer')}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-sm cursor-pointer mt-4 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to Pay ₹{transferAmount || '0'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: SCAN ANY QR CODE */}
        {viewMode === 'scan_qr' && (
          <div className="p-5 text-center space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Scan Any UPI QR Code</h3>
              <p className="text-xs text-slate-500">Pay any merchant or person via BharatQR / UPI</p>
            </div>

            <div className="relative aspect-square max-w-xs mx-auto rounded-3xl bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-4 border-slate-900 shadow-inner">
              <div className="absolute inset-x-8 top-12 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
              <QrCode className="w-36 h-36 text-white/90" />
              <span className="text-[11px] font-mono text-emerald-400 mt-4 font-bold animate-pulse">
                Camera Active &bull; Align QR in frame
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">Or Test With Sample QR Code:</span>
              <button
                onClick={() => {
                  setRecipientInput('starbucks.mumbai@okhdfc');
                  setRecipientName('Starbucks Coffee');
                  setTransferAmount('390');
                  setViewMode('send_money');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simulate Scan: "Starbucks Coffee ₹390"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: PAY BILLS & RECHARGE */}
        {viewMode === 'pay_bills' && (
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Bharat BillPay (BBPS) &amp; Recharges</h3>
              <p className="text-xs text-slate-500">Pay electricity, recharge mobile 5G, and recharge toll FASTag</p>
            </div>

            {!selectedBiller ? (
              <div className="space-y-2.5">
                {MOCK_BILL_PROVIDERS.map((biller) => (
                  <div
                    key={biller.id}
                    onClick={() => {
                      setSelectedBiller(biller);
                      setConsumerIdentifier(biller.sampleIdentifier);
                      setBillAmount(biller.mockDueAmount);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{biller.logo}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">{biller.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{biller.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">₹{biller.mockDueAmount}</span>
                      <span className="block text-[10px] text-indigo-600 font-bold">Pay Now &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
                  <span className="text-2xl">{selectedBiller.logo}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedBiller.name}</h4>
                    <span className="text-[11px] text-slate-500">Due Amount: <strong>₹{billAmount}</strong></span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {selectedBiller.identifierLabel}
                  </label>
                  <input
                    type="text"
                    value={consumerIdentifier}
                    onChange={(e) => setConsumerIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBiller(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold transition"
                  >
                    Back to Billers
                  </button>
                  <button
                    onClick={() => handleOpenPinScreen('bill')}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{billAmount}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: SCRATCH CARDS & REWARDS */}
        {viewMode === 'rewards' && (
          <div className="p-5 text-center space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Google Pay Rewards Vault</h3>
              <p className="text-xs text-slate-500">Scratch the card below to reveal your instant cashback</p>
            </div>

            <div 
              onClick={handleScratch}
              className={`aspect-[4/3] max-w-xs mx-auto rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all shadow-md ${
                isScratched 
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white'
                  : 'bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 text-white hover:scale-105'
              }`}
            >
              {isScratched ? (
                <div className="space-y-2 animate-scaleUp">
                  <span className="text-3xl">🎉</span>
                  <div className="text-3xl font-black">₹{scratchReward}</div>
                  <span className="text-xs font-bold text-emerald-100 block">
                    Cashback credited to ShopSense Wallet!
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-amber-200 animate-bounce" />
                  <span className="text-base font-black">Tap to Scratch!</span>
                  <p className="text-[11px] text-white/80">Earn up to ₹100 direct cashback</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewMode('home')}
              className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Back to Pay Home
            </button>
          </div>
        )}

        {/* VIEW 6: CHECK BALANCE SCREEN */}
        {viewMode === 'check_balance' && checkedBalanceResult !== null && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
              ✓
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">Available Bank Balance</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                ₹{checkedBalanceResult.toLocaleString('en-IN')}
              </h2>
              <p className="text-xs font-semibold text-slate-600 mt-1">{selectedBank.bankName} ({selectedBank.accountNumberMasked})</p>
            </div>
            <button
              onClick={() => setViewMode('home')}
              className="px-6 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* VIEW 7: NPCI SECURE UPI PIN DIALOG */}
        {viewMode === 'pin_screen' && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto mb-2 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Enter {selectedBank.pinLength}-Digit UPI PIN</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {selectedBank.bankName} &bull; {selectedBank.accountNumberMasked}
              </p>
            </div>

            {/* PIN Dots Display */}
            <div className="flex justify-center gap-3 py-2">
              {Array.from({ length: selectedBank.pinLength }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    enteredPin.length > idx
                      ? 'bg-indigo-600 border-indigo-600 scale-110'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 justify-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Simulated Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    if (enteredPin.length < selectedBank.pinLength) {
                      setEnteredPin(prev => prev + num);
                      setPinError('');
                    }
                  }}
                  className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg transition active:scale-95 cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setEnteredPin('')}
                className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs transition cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  if (enteredPin.length < selectedBank.pinLength) {
                    setEnteredPin(prev => prev + '0');
                    setPinError('');
                  }
                }}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-lg transition active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => setEnteredPin(prev => prev.slice(0, -1))}
                className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                ⌫
              </button>
            </div>

            <div className="flex items-center gap-2 max-w-xs mx-auto pt-2">
              <button
                onClick={() => setViewMode('home')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePinSubmit}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                Submit PIN
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-mono">
              Demo PIN hint: HDFC is 1234 &bull; SBI is 123456
            </p>
          </div>
        )}

        {/* SUCCESS RECEIPT OVERLAY */}
        {isSuccessModalOpen && lastTransaction && (
          <div className="absolute inset-0 bg-white z-50 p-6 flex flex-col justify-between animate-fadeIn">
            <div className="text-center pt-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-3xl font-black shadow-md animate-scaleUp">
                ✓
              </div>
              <h2 className="text-xl font-black text-slate-900">Payment Successful!</h2>
              <div className="text-3xl font-black text-slate-900 font-mono">
                ₹{lastTransaction.amountINR.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">
                Paid to <strong>{lastTransaction.recipientName}</strong> ({lastTransaction.recipientHandle})
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs font-mono space-y-1.5 max-w-sm mx-auto mt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ref ID:</span>
                  <span className="font-bold text-slate-800">{lastTransaction.txnRefNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid From:</span>
                  <span className="font-bold text-slate-800">{lastTransaction.sourceAccount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-slate-600">{new Date(lastTransaction.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {lastTransaction.cashbackRewardINR && lastTransaction.cashbackRewardINR > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold max-w-sm mx-auto flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <span>You won a ₹{lastTransaction.cashbackRewardINR} Scratch Card!</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setViewMode('home');
              }}
              className="w-full py-3 rounded-2xl bg-slate-950 text-white font-bold text-xs transition cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
