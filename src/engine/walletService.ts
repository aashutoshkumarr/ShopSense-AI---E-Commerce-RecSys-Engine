import { UserWallet, WalletTransaction, Currency } from '../types';

// In-memory mock wallet storage
const walletStore: Record<string, UserWallet> = {
  'user-dev-alex': {
    userId: 'user-dev-alex',
    balanceINR: 8500,
    balanceUSD: 102,
    totalDepositedINR: 15000,
    totalSpentINR: 6500,
    totalRefundedINR: 0,
    updatedAt: new Date().toISOString(),
    transactions: [
      {
        id: 'tx-w-001',
        userId: 'user-dev-alex',
        type: 'topup',
        amountINR: 10000,
        amountUSD: 120,
        balanceAfterINR: 10000,
        balanceAfterUSD: 120,
        description: 'Stripe Test Mode Top-up (Visa 4242)',
        timestamp: '2026-08-01T10:00:00Z',
        referenceId: 'pi_test_3N9xQ8Lkd81',
        status: 'succeeded',
        paymentGateway: 'Stripe Test Mode'
      },
      {
        id: 'tx-w-002',
        userId: 'user-dev-alex',
        type: 'order_payment',
        amountINR: -1500,
        amountUSD: -18,
        balanceAfterINR: 8500,
        balanceAfterUSD: 102,
        description: 'Applied to Order #ord-2026-0801',
        timestamp: '2026-08-10T10:30:00Z',
        referenceId: 'ord-2026-0801',
        status: 'succeeded'
      }
    ]
  },
  'user-audio-priya': {
    userId: 'user-audio-priya',
    balanceINR: 4200,
    balanceUSD: 50.4,
    totalDepositedINR: 5000,
    totalSpentINR: 800,
    totalRefundedINR: 0,
    updatedAt: new Date().toISOString(),
    transactions: [
      {
        id: 'tx-w-003',
        userId: 'user-audio-priya',
        type: 'topup',
        amountINR: 5000,
        amountUSD: 60,
        balanceAfterINR: 5000,
        balanceAfterUSD: 60,
        description: 'Razorpay Sandbox UPI (priya@okaxis)',
        timestamp: '2026-08-05T14:20:00Z',
        referenceId: 'pay_test_901xLzp',
        status: 'succeeded',
        paymentGateway: 'Razorpay Sandbox'
      },
      {
        id: 'tx-w-004',
        userId: 'user-audio-priya',
        type: 'cashback_reward',
        amountINR: 200,
        amountUSD: 2.4,
        balanceAfterINR: 4200,
        balanceAfterUSD: 50.4,
        description: 'Gold Tier Cashback Reward',
        timestamp: '2026-08-08T11:00:00Z',
        status: 'succeeded'
      }
    ]
  },
  'user-enterprise-vikram': {
    userId: 'user-enterprise-vikram',
    balanceINR: 25000,
    balanceUSD: 300,
    totalDepositedINR: 30000,
    totalSpentINR: 5000,
    totalRefundedINR: 0,
    updatedAt: new Date().toISOString(),
    transactions: [
      {
        id: 'tx-w-005',
        userId: 'user-enterprise-vikram',
        type: 'topup',
        amountINR: 30000,
        amountUSD: 360,
        balanceAfterINR: 30000,
        balanceAfterUSD: 360,
        description: 'Corporate Card Top-up (Stripe Test)',
        timestamp: '2026-08-02T09:00:00Z',
        referenceId: 'pi_test_vikram_corp_01',
        status: 'succeeded',
        paymentGateway: 'Stripe Test Mode'
      }
    ]
  }
};

export function getWallet(userId: string): UserWallet {
  if (!walletStore[userId]) {
    walletStore[userId] = {
      userId,
      balanceINR: 3000,
      balanceUSD: 36,
      totalDepositedINR: 3000,
      totalSpentINR: 0,
      totalRefundedINR: 0,
      updatedAt: new Date().toISOString(),
      transactions: [
        {
          id: `tx-init-${Date.now()}`,
          userId,
          type: 'topup',
          amountINR: 3000,
          amountUSD: 36,
          balanceAfterINR: 3000,
          balanceAfterUSD: 36,
          description: 'Welcome Bonus Credit (Test Mode)',
          timestamp: new Date().toISOString(),
          status: 'succeeded',
          paymentGateway: 'System Automated'
        }
      ]
    };
  }
  return walletStore[userId];
}

export function topUpWallet(
  userId: string, 
  amountINR: number, 
  gateway: 'Stripe Test Mode' | 'Razorpay Sandbox' = 'Stripe Test Mode',
  gatewayRef?: string
): { success: boolean; wallet: UserWallet; transaction: WalletTransaction } {
  const wallet = getWallet(userId);
  const amountUSD = Math.round((amountINR / 83.5) * 10) / 10;
  
  wallet.balanceINR += amountINR;
  wallet.balanceUSD = Math.round((wallet.balanceINR / 83.5) * 10) / 10;
  wallet.totalDepositedINR += amountINR;
  wallet.updatedAt = new Date().toISOString();

  const transaction: WalletTransaction = {
    id: `tx-topup-${Date.now()}`,
    userId,
    type: 'topup',
    amountINR,
    amountUSD,
    balanceAfterINR: wallet.balanceINR,
    balanceAfterUSD: wallet.balanceUSD,
    description: `Wallet Top-Up via ${gateway}`,
    timestamp: new Date().toISOString(),
    referenceId: gatewayRef || `pay_${Date.now()}_test`,
    status: 'succeeded',
    paymentGateway: gateway
  };

  wallet.transactions.unshift(transaction);
  return { success: true, wallet, transaction };
}

export function deductWallet(
  userId: string,
  amountINR: number,
  orderId: string,
  description?: string
): { success: boolean; amountDeductedINR: number; remainingOrderINR: number; wallet: UserWallet; transaction?: WalletTransaction } {
  const wallet = getWallet(userId);
  
  if (wallet.balanceINR <= 0) {
    return { success: false, amountDeductedINR: 0, remainingOrderINR: amountINR, wallet };
  }

  const deductionINR = Math.min(wallet.balanceINR, amountINR);
  const deductionUSD = Math.round((deductionINR / 83.5) * 10) / 10;
  
  wallet.balanceINR -= deductionINR;
  wallet.balanceUSD = Math.round((wallet.balanceINR / 83.5) * 10) / 10;
  wallet.totalSpentINR += deductionINR;
  wallet.updatedAt = new Date().toISOString();

  const transaction: WalletTransaction = {
    id: `tx-pay-${Date.now()}`,
    userId,
    type: 'order_payment',
    amountINR: -deductionINR,
    amountUSD: -deductionUSD,
    balanceAfterINR: wallet.balanceINR,
    balanceAfterUSD: wallet.balanceUSD,
    description: description || `Payment for Order #${orderId}`,
    timestamp: new Date().toISOString(),
    referenceId: orderId,
    status: 'succeeded'
  };

  wallet.transactions.unshift(transaction);
  const remainingOrderINR = amountINR - deductionINR;

  return { success: true, amountDeductedINR: deductionINR, remainingOrderINR, wallet, transaction };
}

export function refundToWallet(
  userId: string,
  amountINR: number,
  orderId: string,
  reason: string
): { success: boolean; wallet: UserWallet; transaction: WalletTransaction } {
  const wallet = getWallet(userId);
  const amountUSD = Math.round((amountINR / 83.5) * 10) / 10;

  wallet.balanceINR += amountINR;
  wallet.balanceUSD = Math.round((wallet.balanceINR / 83.5) * 10) / 10;
  wallet.totalRefundedINR += amountINR;
  wallet.updatedAt = new Date().toISOString();

  const transaction: WalletTransaction = {
    id: `tx-ref-${Date.now()}`,
    userId,
    type: 'refund',
    amountINR,
    amountUSD,
    balanceAfterINR: wallet.balanceINR,
    balanceAfterUSD: wallet.balanceUSD,
    description: `Refund for Order #${orderId} (${reason})`,
    timestamp: new Date().toISOString(),
    referenceId: orderId,
    status: 'succeeded'
  };

  wallet.transactions.unshift(transaction);
  return { success: true, wallet, transaction };
}

export function getAllWallets(): UserWallet[] {
  return Object.values(walletStore);
}
