import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Tag, 
  Wallet, 
  Crown, 
  Truck, 
  Sparkles, 
  CreditCard, 
  ShieldCheck,
  Plus,
  Zap,
  Percent
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Currency, UserPersona, UserWallet, UserLoyaltyAccount, Coupon, MLPersonalizedOffer } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  currency: Currency;
  currentPersona: UserPersona;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onClearCart: () => void;
  onOrderPlaced?: (order: any) => void;
  onOpenCouponsModal?: () => void;
  onOpenWalletDrawer?: () => void;
  initialCouponCode?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  currentPersona,
  onRemoveItem,
  onAddToCart,
  onClearCart,
  onOrderPlaced,
  onOpenCouponsModal,
  onOpenWalletDrawer,
  initialCouponCode = ''
}) => {
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Wallet & Loyalty states
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loyalty, setLoyalty] = useState<UserLoyaltyAccount | null>(null);
  const [useWallet, setUseWallet] = useState(true);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  // Coupon state
  const [couponCode, setCouponCode] = useState(initialCouponCode);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Smart Cart Co-Purchase Recommendations
  const [coPurchases, setCoPurchases] = useState<{ product: Product; reason: string }[]>([]);

  // Payment method
  const [paymentGateway, setPaymentGateway] = useState<'stripe_test' | 'razorpay_test'>('stripe_test');

  // Shipping address
  const [shippingAddress, setShippingAddress] = useState('402 Innovation Park Residency, Outer Ring Rd, Bengaluru, Karnataka, 560103');

  // Load Wallet, Loyalty & Co-Purchases
  useEffect(() => {
    if (isOpen) {
      // Fetch wallet
      fetch(`/api/wallet?userId=${currentPersona.id}`)
        .then(r => r.json())
        .then(d => { if (d.wallet) setWallet(d.wallet); })
        .catch(console.error);

      // Fetch loyalty
      fetch(`/api/loyalty?userId=${currentPersona.id}`)
        .then(r => r.json())
        .then(d => {
          if (d.account) {
            setLoyalty(d.account);
            setPointsToRedeem(Math.min(d.account.totalPoints, 1000));
          }
        })
        .catch(console.error);

      // Fetch co-purchases
      if (cartItems.length > 0) {
        fetch('/api/recommendations/co-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cartProductIds: cartItems.map(p => p.id),
            userId: currentPersona.id
          })
        })
          .then(r => r.json())
          .then(d => { if (d.suggestions) setCoPurchases(d.suggestions); })
          .catch(console.error);
      }
    }
  }, [isOpen, currentPersona.id, cartItems.length]);

  if (!isOpen) return null;

  // Calculate pricing math
  const subtotalINR = cartItems.reduce((acc, item) => acc + item.priceINR, 0);
  const subtotalUSD = cartItems.reduce((acc, item) => acc + item.priceUSD, 0);

  // Free shipping rule: free if subtotal >= 2000, or Platinum tier
  const freeShippingThreshold = 2000;
  const isFreeShipping = subtotalINR >= freeShippingThreshold || loyalty?.currentTier === 'Platinum' || appliedCoupon?.discountType === 'free_shipping';
  const shippingFeeINR = isFreeShipping ? 0 : 150;
  const shippingDiffINR = Math.max(0, freeShippingThreshold - subtotalINR);

  // Coupon discount
  let couponDiscountINR = 0;
  if (appliedCoupon && appliedCoupon.valid) {
    couponDiscountINR = appliedCoupon.discountINR || 0;
  }

  // Loyalty points discount (100 pts = ₹10 => 1 pt = ₹0.10)
  const pointsDiscountINR = redeemPoints ? Math.round(pointsToRedeem * 0.1) : 0;

  // Total before wallet
  const totalBeforeWalletINR = Math.max(0, subtotalINR - couponDiscountINR - pointsDiscountINR + shippingFeeINR);

  // Wallet payment calculation
  const availableWalletINR = wallet?.balanceINR || 0;
  const walletUsedINR = useWallet ? Math.min(availableWalletINR, totalBeforeWalletINR) : 0;
  const remainingCardINR = Math.max(0, totalBeforeWalletINR - walletUsedINR);

  const handleApplyCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code) return;

    try {
      setValidatingCoupon(true);
      setCouponError(null);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          subtotalINR,
          categories: cartItems.map(p => p.category)
        })
      });

      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data);
        setCouponCode(data.coupon.code);
      } else {
        setCouponError(data.message || 'Invalid or non-applicable coupon');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      const orderPayload = {
        userId: currentPersona.id,
        userName: currentPersona.name,
        items: cartItems.map(item => ({
          productId: item.id,
          title: item.title,
          priceINR: item.priceINR,
          priceUSD: item.priceUSD,
          quantity: 1,
          imageUrl: item.imageUrl || item.thumbnail,
          brand: item.brand,
          category: item.category
        })),
        subtotalINR,
        discountINR: couponDiscountINR,
        walletUsedINR,
        pointsRedeemed: redeemPoints ? pointsToRedeem : 0,
        shippingFeeINR,
        totalINR: totalBeforeWalletINR,
        cardAmountINR: remainingCardINR,
        paymentMethod: walletUsedINR > 0 && remainingCardINR > 0 
          ? 'split_wallet_card' 
          : walletUsedINR >= totalBeforeWalletINR 
          ? 'wallet' 
          : paymentGateway === 'stripe_test' 
          ? 'stripe_test' 
          : 'razorpay_test',
        shippingAddress,
        couponCode: appliedCoupon?.coupon?.code
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      setIsProcessing(false);
      setCheckoutComplete(true);

      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 }
      });

      if (onOrderPlaced) onOrderPlaced(data.order);

      setTimeout(() => {
        onClearCart();
        setCheckoutComplete(false);
        onClose();
      }, 2500);
    } catch (err) {
      setIsProcessing(false);
      console.error('Checkout error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Shopping Cart</h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono font-bold">
                  {cartItems.length} items
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Smart Cart with ML Co-purchases &amp; Split Pay</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cartItems.length > 0 && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-950/60 to-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Truck className="h-3.5 w-3.5 text-cyan-400" />
                {isFreeShipping ? '🎉 You unlocked Free Express Shipping!' : `Add ₹${shippingDiffINR.toLocaleString()} more for Free Express Delivery`}
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {isFreeShipping ? 'FREE' : '₹150'}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((subtotalINR / freeShippingThreshold) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <ShoppingBag className="h-12 w-12 text-slate-600 mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">Your cart is empty</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Explore your personalized recommendation models and add high-affinity items.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Cart Items List */}
            <div className="space-y-2.5">
              {cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.imageUrl || item.thumbnail}
                    alt={item.title}
                    className="h-14 w-14 object-cover rounded-xl bg-slate-900 border border-slate-800"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.brand} • {item.category}</div>
                    <div className="text-xs font-mono font-bold text-cyan-400 mt-1">
                      {currency === 'INR' ? `₹${item.priceINR.toLocaleString()}` : `$${item.priceUSD.toLocaleString()}`}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Remove from cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 🛒 Smart Cart Co-Purchases Cross-Sell */}
            {coPurchases.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Frequently Bought Together
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {coPurchases.slice(0, 2).map(({ product, reason }) => (
                    <div 
                      key={product.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={product.thumbnail} 
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 object-cover rounded-lg bg-slate-800 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-white truncate">{product.title}</div>
                          <div className="text-[10px] font-mono text-cyan-300">₹{product.priceINR.toLocaleString()}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="w-full py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[10px] font-bold border border-indigo-500/30 transition"
                      >
                        + Add Together
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🎟️ Coupon & Offers Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-rose-400" /> Apply Coupon
                </span>
                {onOpenCouponsModal && (
                  <button 
                    onClick={onOpenCouponsModal}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View ML Offers &rarr;
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {appliedCoupon.coupon.code}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Saved ₹{appliedCoupon.discountINR.toLocaleString()} ({appliedCoupon.coupon.title})
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SHOPTODAY15)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={validatingCoupon || !couponCode}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition active:scale-95"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && (
                <div className="text-[11px] text-rose-400 font-medium">
                  {couponError}
                </div>
              )}
            </div>

            {/* ⭐ Loyalty Points Redemption */}
            {loyalty && loyalty.totalPoints > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-semibold text-slate-200">Redeem Loyalty Points</span>
                    <span className="text-[10px] text-amber-400 font-mono">({loyalty.totalPoints} pts available)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {redeemPoints && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between font-mono">
                    <span>Redeeming {pointsToRedeem} pts</span>
                    <span className="font-bold">-₹{Math.round(pointsToRedeem * 0.1).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* 💰 Wallet Deduction Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">Pay with ShopSense Wallet</span>
                  <span className="text-[10px] text-emerald-400 font-mono">(₹{(wallet?.balanceINR || 0).toLocaleString()} bal)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {useWallet && walletUsedINR > 0 && (
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex justify-between font-mono">
                  <span>Wallet Applied</span>
                  <span className="font-bold">-₹{walletUsedINR.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Payment Method selection for remaining balance */}
            {remainingCardINR > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-200 block">
                  Remaining Balance (₹{remainingCardINR.toLocaleString()}) via Gateway:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('stripe_test')}
                    className={`p-2 rounded-xl border text-xs text-left transition ${
                      paymentGateway === 'stripe_test'
                        ? 'bg-indigo-900/40 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-indigo-300 text-[11px]">Stripe Test Mode</div>
                    <div className="text-[10px] text-slate-400">Card 4242...</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('razorpay_test')}
                    className={`p-2 rounded-xl border text-xs text-left transition ${
                      paymentGateway === 'razorpay_test'
                        ? 'bg-blue-900/40 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-blue-300 text-[11px]">Razorpay Sandbox</div>
                    <div className="text-[10px] text-slate-400">UPI / Netbanking</div>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            
            {/* Bill Summary */}
            <div className="space-y-1 text-xs border-b border-slate-800/80 pb-3">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-mono text-slate-200">₹{subtotalINR.toLocaleString()}</span>
              </div>

              {couponDiscountINR > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-₹{couponDiscountINR.toLocaleString()}</span>
                </div>
              )}

              {pointsDiscountINR > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Loyalty Points Discount</span>
                  <span className="font-mono">-₹{pointsDiscountINR.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Express Shipping</span>
                <span className="font-mono">{shippingFeeINR === 0 ? 'FREE' : `₹${shippingFeeINR}`}</span>
              </div>

              {walletUsedINR > 0 && (
                <div className="flex justify-between text-emerald-300 font-semibold pt-1">
                  <span>ShopSense Wallet Debited</span>
                  <span className="font-mono">-₹{walletUsedINR.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                <span>Net Payable:</span>
                <span className="font-mono text-cyan-300 text-base">
                  {remainingCardINR === 0 ? '₹0 (Paid via Wallet)' : `₹${remainingCardINR.toLocaleString()}`}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutComplete || isProcessing}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
                checkoutComplete
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Processing Order &amp; Deducting Balances...</span>
                </>
              ) : checkoutComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Order Placed! Live Tracking Timeline Initiated</span>
                </>
              ) : (
                <>
                  <span>
                    Place Order &bull; {remainingCardINR === 0 ? 'Zero-Card Fast Pay' : `Pay ₹${remainingCardINR.toLocaleString()}`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 font-mono">
              ⚡ Decrements stock, updates GBDT training rewards, and initiates BlueDart Express live tracking timeline.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
