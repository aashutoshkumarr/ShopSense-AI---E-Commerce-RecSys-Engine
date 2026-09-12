/**
 * ShopSense UPI & Fintech Engine
 * Modeled after Google Pay / NPCI Unified Payments Interface (UPI 2.0)
 * Supports Linked Bank Accounts, UPI PIN Verification, P2P & P2M Transfers, and Bharat BillPay (BBPS).
 */

export interface LinkedBankAccount {
  id: string;
  bankName: string;
  bankLogo: string;
  accountNumberMasked: string;
  fullAccountNumber: string;
  accountType: 'Savings' | 'Current';
  ifsc: string;
  branch: string;
  upiId: string;
  balanceINR: number;
  isPrimary: boolean;
  pinLength: 4 | 6;
  correctPin: string;
}

export interface UPITransaction {
  id: string;
  txnRefNumber: string;
  timestamp: string;
  amountINR: number;
  type: 'transfer_out' | 'transfer_in' | 'bill_pay' | 'qr_pay' | 'wallet_topup' | 'cashback_reward';
  paymentSource: 'wallet' | 'bank';
  sourceAccount?: string;
  recipientName: string;
  recipientHandle: string;
  recipientType: 'contact' | 'upi_id' | 'bank_account' | 'merchant' | 'biller';
  note?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  cashbackRewardINR?: number;
}

export interface BillProvider {
  id: string;
  category: 'electricity' | 'mobile_recharge' | 'dth' | 'fastag';
  name: string;
  logo: string;
  identifierLabel: string;
  sampleIdentifier: string;
  mockDueAmount: number;
}

export const MOCK_LINKED_BANKS: LinkedBankAccount[] = [
  {
    id: 'bank-hdfc-01',
    bankName: 'HDFC Bank',
    bankLogo: '🏦',
    accountNumberMasked: 'HDFC Bank •• 4921',
    fullAccountNumber: '50100429184921',
    accountType: 'Savings',
    ifsc: 'HDFC0000060',
    branch: 'Fort Mumbai Central',
    upiId: 'alex.chen@okhdfcbank',
    balanceINR: 48520,
    isPrimary: true,
    pinLength: 4,
    correctPin: '1234'
  },
  {
    id: 'bank-sbi-02',
    bankName: 'State Bank of India',
    bankLogo: '🏛️',
    accountNumberMasked: 'SBI •• 1834',
    fullAccountNumber: '3098274191834',
    accountType: 'Savings',
    ifsc: 'SBIN0000456',
    branch: 'Connaught Place New Delhi',
    upiId: 'alex.chen@oksbi',
    balanceINR: 82150,
    isPrimary: false,
    pinLength: 6,
    correctPin: '123456'
  },
  {
    id: 'bank-icici-03',
    bankName: 'ICICI Bank',
    bankLogo: '💎',
    accountNumberMasked: 'ICICI Bank •• 8820',
    fullAccountNumber: '002101568820',
    accountType: 'Savings',
    ifsc: 'ICIC0000104',
    branch: 'Bandra Kurla Complex',
    upiId: 'alex.chen@okicici',
    balanceINR: 31400,
    isPrimary: false,
    pinLength: 4,
    correctPin: '4321'
  },
  {
    id: 'bank-axis-04',
    bankName: 'Axis Bank',
    bankLogo: '💳',
    accountNumberMasked: 'Axis Bank •• 3345',
    fullAccountNumber: '91701002343345',
    accountType: 'Savings',
    ifsc: 'UTIB0000210',
    branch: 'MG Road Bengaluru',
    upiId: 'alex.chen@okaxis',
    balanceINR: 19800,
    isPrimary: false,
    pinLength: 6,
    correctPin: '654321'
  }
];

export const MOCK_BILL_PROVIDERS: BillProvider[] = [
  {
    id: 'bill-elec-tata',
    category: 'electricity',
    name: 'Tata Power (Mumbai / Delhi)',
    logo: '⚡',
    identifierLabel: 'Consumer Account Number (12 digits)',
    sampleIdentifier: '900014829104',
    mockDueAmount: 1840
  },
  {
    id: 'bill-elec-bescom',
    category: 'electricity',
    name: 'BESCOM (Bengaluru Electricity)',
    logo: '💡',
    identifierLabel: 'Consumer Account ID',
    sampleIdentifier: '5409821432',
    mockDueAmount: 1250
  },
  {
    id: 'bill-mob-jio',
    category: 'mobile_recharge',
    name: 'Jio 5G True Unlimited Recharge',
    logo: '📱',
    identifierLabel: 'Mobile Number (+91)',
    sampleIdentifier: '9820123456',
    mockDueAmount: 349
  },
  {
    id: 'bill-mob-airtel',
    category: 'mobile_recharge',
    name: 'Airtel 5G Unlimited Entertainment',
    logo: '📶',
    identifierLabel: 'Airtel Mobile Number',
    sampleIdentifier: '9810234567',
    mockDueAmount: 399
  },
  {
    id: 'bill-fastag-icici',
    category: 'fastag',
    name: 'NETC FASTag (ICICI / NHAI Toll)',
    logo: '🚗',
    identifierLabel: 'Vehicle Registration Number',
    sampleIdentifier: 'MH-02-CB-4921',
    mockDueAmount: 500
  },
  {
    id: 'bill-dth-tataplay',
    category: 'dth',
    name: 'Tata Play (HD & Binge Combo)',
    logo: '📺',
    identifierLabel: 'Subscriber ID / RMN',
    sampleIdentifier: '1098472910',
    mockDueAmount: 490
  }
];

export const RECENT_PAYEES = [
  { name: 'Rohan Sharma', handle: 'rohan.sharma@okaxis', phone: '+91 98201 44821', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { name: 'Pooja Verma', handle: 'pooja.verma@okhdfcbank', phone: '+91 98112 55902', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' },
  { name: 'Karthik Raja', handle: 'karthik.raja@oksbi', phone: '+91 97401 88319', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { name: 'Nature Basket Store', handle: 'naturebasket@icici', phone: '+91 99002 11400', avatar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&auto=format&fit=crop&q=80' },
  { name: 'Apollo Health Center', handle: 'apollo.mumbai@hdfcbank', phone: '+91 98210 99401', avatar: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=120&auto=format&fit=crop&q=80' }
];

class UPIPaymentService {
  private banks: LinkedBankAccount[] = [...MOCK_LINKED_BANKS];
  private transactions: UPITransaction[] = [];

  constructor() {
    this.initSampleTransactions();
  }

  private initSampleTransactions() {
    this.transactions = [
      {
        id: 'txn-upi-001',
        txnRefNumber: 'UPI/428910482910/HDFC',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        amountINR: 1250,
        type: 'transfer_out',
        paymentSource: 'bank',
        sourceAccount: 'HDFC Bank •• 4921',
        recipientName: 'Rohan Sharma',
        recipientHandle: 'rohan.sharma@okaxis',
        recipientType: 'contact',
        note: 'Dinner split',
        status: 'SUCCESS',
        cashbackRewardINR: 25
      },
      {
        id: 'txn-upi-002',
        txnRefNumber: 'UPI/428909871142/WALLET',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        amountINR: 349,
        type: 'bill_pay',
        paymentSource: 'wallet',
        recipientName: 'Jio 5G True Unlimited',
        recipientHandle: 'jio.recharge@rel',
        recipientType: 'biller',
        note: 'Monthly 5G Plan',
        status: 'SUCCESS'
      }
    ];
  }

  public getLinkedBanks(): LinkedBankAccount[] {
    return this.banks;
  }

  public getPrimaryBank(): LinkedBankAccount {
    return this.banks.find(b => b.isPrimary) || this.banks[0];
  }

  public setPrimaryBank(bankId: string): boolean {
    const target = this.banks.find(b => b.id === bankId);
    if (!target) return false;
    this.banks.forEach(b => { b.isPrimary = (b.id === bankId); });
    return true;
  }

  public verifyPin(bankId: string, enteredPin: string): boolean {
    const bank = this.banks.find(b => b.id === bankId);
    if (!bank) return false;
    return bank.correctPin === enteredPin;
  }

  public getAccountBalance(bankId: string, enteredPin: string): { success: boolean; balanceINR?: number; error?: string } {
    const bank = this.banks.find(b => b.id === bankId);
    if (!bank) return { success: false, error: 'Bank account not found' };
    if (bank.correctPin !== enteredPin) {
      return { success: false, error: 'Incorrect UPI PIN entered. Please try again.' };
    }
    return { success: true, balanceINR: bank.balanceINR };
  }

  public executeTransfer(params: {
    paymentSource: 'wallet' | 'bank';
    bankId?: string;
    pin?: string;
    amountINR: number;
    recipientName: string;
    recipientHandle: string;
    recipientType: 'contact' | 'upi_id' | 'bank_account' | 'merchant' | 'biller';
    note?: string;
  }): { success: boolean; transaction?: UPITransaction; error?: string } {
    if (params.amountINR <= 0) {
      return { success: false, error: 'Transfer amount must be greater than zero' };
    }

    let sourceAccountDesc = 'ShopSense Wallet';

    if (params.paymentSource === 'bank') {
      const bank = this.banks.find(b => b.id === params.bankId);
      if (!bank) return { success: false, error: 'Selected bank account not found' };
      
      if (!params.pin || bank.correctPin !== params.pin) {
        return { success: false, error: 'Incorrect UPI PIN. Authentication failed.' };
      }

      if (bank.balanceINR < params.amountINR) {
        return { success: false, error: `Insufficient bank balance. Available: ₹${bank.balanceINR.toLocaleString('en-IN')}` };
      }

      bank.balanceINR -= params.amountINR;
      sourceAccountDesc = bank.accountNumberMasked;
    }

    // Generate simulated Google Pay scratch card reward between ₹10 and ₹100
    const getsCashback = Math.random() > 0.4;
    const cashback = getsCashback ? Math.floor(Math.random() * 50) + 10 : 0;

    const txn: UPITransaction = {
      id: `txn-upi-${Date.now()}`,
      txnRefNumber: `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/${params.paymentSource.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      amountINR: params.amountINR,
      type: params.recipientType === 'biller' ? 'bill_pay' : 'transfer_out',
      paymentSource: params.paymentSource,
      sourceAccount: sourceAccountDesc,
      recipientName: params.recipientName,
      recipientHandle: params.recipientHandle,
      recipientType: params.recipientType,
      note: params.note || 'Instant UPI Transfer',
      status: 'SUCCESS',
      cashbackRewardINR: cashback
    };

    this.transactions.unshift(txn);
    return { success: true, transaction: txn };
  }

  public getTransactionHistory(): UPITransaction[] {
    return this.transactions;
  }

  public claimScratchCardReward(amountINR: number): { success: boolean; newBalanceINR: number; transaction: UPITransaction } {
    const txn: UPITransaction = {
      id: `txn-reward-${Date.now()}`,
      txnRefNumber: `UPI/RW-${Math.floor(100000 + Math.random() * 900000)}/CASHBACK`,
      timestamp: new Date().toISOString(),
      amountINR,
      type: 'cashback_reward',
      paymentSource: 'wallet',
      recipientName: 'ShopSense Wallet Cash',
      recipientHandle: 'rewards@shopsense.upi',
      recipientType: 'merchant',
      note: 'Google Pay Style Scratch Card Reward',
      status: 'SUCCESS'
    };
    this.transactions.unshift(txn);
    return { success: true, newBalanceINR: 4500 + amountINR, transaction: txn };
  }
}

export const upiPaymentServiceInstance = new UPIPaymentService();
