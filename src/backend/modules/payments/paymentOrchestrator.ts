import { UPITransaction } from '../../../engine/upiPaymentService';

export type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';

export type PaymentIntentStatus = 
  | 'requires_payment_method' 
  | 'requires_confirmation' 
  | 'processing' 
  | 'succeeded' 
  | 'failed' 
  | 'canceled';

export interface PaymentIntent {
  id: string;
  amountINR: number;
  currency: 'INR' | 'USD';
  status: PaymentIntentStatus;
  clientSecret: string;
  customerId: string;
  paymentMethodType?: PaymentMethodType;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentAttempt {
  id: string;
  paymentIntentId: string;
  method: PaymentMethodType;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  npciRefNo?: string;
  failureReason?: string;
  timestamp: string;
}

export interface PaymentTransaction {
  id: string;
  intentId: string;
  amountINR: number;
  feeINR: number;
  netAmountINR: number;
  status: 'SETTLED' | 'REFUNDED';
  capturedAt: string;
  receiptNumber: string;
}

interface IdempotencyRecord {
  key: string;
  requestHash: string;
  response: any;
  timestamp: number;
}

export class PaymentOrchestrator {
  private intents: Map<string, PaymentIntent> = new Map();
  private attempts: Map<string, PaymentAttempt[]> = new Map();
  private transactions: Map<string, PaymentTransaction> = new Map();
  private idempotencyStore: Map<string, IdempotencyRecord> = new Map();
  private readonly IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Checks or registers an idempotency key.
   * If the key already exists within TTL, returns the cached response.
   */
  public checkIdempotency(key: string, requestPayload: any): { isDuplicate: boolean; cachedResponse?: any } {
    if (!key) return { isDuplicate: false };

    const payloadHash = JSON.stringify(requestPayload);
    const existing = this.idempotencyStore.get(key);

    if (existing) {
      const now = Date.now();
      if (now - existing.timestamp < this.IDEMPOTENCY_TTL_MS) {
        return { isDuplicate: true, cachedResponse: existing.response };
      }
      this.idempotencyStore.delete(key);
    }

    return { isDuplicate: false };
  }

  public recordIdempotency(key: string, requestPayload: any, response: any): void {
    if (!key) return;
    this.idempotencyStore.set(key, {
      key,
      requestHash: JSON.stringify(requestPayload),
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Creates a new PaymentIntent with idempotency protection.
   */
  public createPaymentIntent(params: {
    amountINR: number;
    currency?: 'INR' | 'USD';
    customerId: string;
    paymentMethodType?: PaymentMethodType;
    idempotencyKey?: string;
    metadata?: Record<string, any>;
  }): PaymentIntent {
    if (params.idempotencyKey) {
      const check = this.checkIdempotency(params.idempotencyKey, params);
      if (check.isDuplicate && check.cachedResponse) {
        return check.cachedResponse as PaymentIntent;
      }
    }

    const id = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const intent: PaymentIntent = {
      id,
      amountINR: params.amountINR,
      currency: params.currency || 'INR',
      status: 'requires_confirmation',
      clientSecret: `secret_${id}_tok_${Math.random().toString(36).substring(2, 10)}`,
      customerId: params.customerId,
      paymentMethodType: params.paymentMethodType || 'upi',
      idempotencyKey: params.idempotencyKey,
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 mins
    };

    this.intents.set(id, intent);

    if (params.idempotencyKey) {
      this.recordIdempotency(params.idempotencyKey, params, intent);
    }

    return intent;
  }

  /**
   * Confirms payment for an active PaymentIntent.
   */
  public confirmPaymentIntent(params: {
    paymentIntentId: string;
    paymentMethodType: PaymentMethodType;
    authCredential?: string; // e.g. UPI PIN or OTP
    idempotencyKey?: string;
  }): { success: boolean; intent: PaymentIntent; transaction?: PaymentTransaction; error?: string } {
    if (params.idempotencyKey) {
      const check = this.checkIdempotency(params.idempotencyKey, params);
      if (check.isDuplicate && check.cachedResponse) {
        return check.cachedResponse;
      }
    }

    const intent = this.intents.get(params.paymentIntentId);
    if (!intent) {
      return { success: false, intent: null as any, error: 'PaymentIntent not found' };
    }

    if (intent.status === 'succeeded') {
      return { success: true, intent, error: 'Payment has already been captured' };
    }

    // Process payment attempt
    const attemptId = `att_${Date.now()}`;
    const attempt: PaymentAttempt = {
      id: attemptId,
      paymentIntentId: intent.id,
      method: params.paymentMethodType,
      status: 'SUCCESS',
      npciRefNo: `NPCI-UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      timestamp: new Date().toISOString()
    };

    const currentAttempts = this.attempts.get(intent.id) || [];
    currentAttempts.push(attempt);
    this.attempts.set(intent.id, currentAttempts);

    // Update Intent
    intent.status = 'succeeded';
    intent.paymentMethodType = params.paymentMethodType;

    // Create Settlement Transaction
    const txnId = `txn_${Date.now()}`;
    const feeINR = Math.round(intent.amountINR * 0.015); // 1.5% gateway fee
    const transaction: PaymentTransaction = {
      id: txnId,
      intentId: intent.id,
      amountINR: intent.amountINR,
      feeINR,
      netAmountINR: intent.amountINR - feeINR,
      status: 'SETTLED',
      capturedAt: new Date().toISOString(),
      receiptNumber: `REC-${Date.now().toString(36).toUpperCase()}`
    };
    this.transactions.set(txnId, transaction);

    const result = { success: true, intent, transaction };

    if (params.idempotencyKey) {
      this.recordIdempotency(params.idempotencyKey, params, result);
    }

    return result;
  }

  public getPaymentIntent(id: string): PaymentIntent | undefined {
    return this.intents.get(id);
  }

  public getTransaction(id: string): PaymentTransaction | undefined {
    return this.transactions.get(id);
  }

  /**
   * Validates a simulated payment webhook signature.
   */
  public verifyWebhookSignature(payload: string, signature: string, secret: string = 'whsec_shopsense_mock_2026'): boolean {
    if (!signature || !payload) return false;
    // For deterministic mock validation
    return signature.startsWith('t=') && signature.includes('v1=');
  }
}

export const paymentOrchestratorInstance = new PaymentOrchestrator();
