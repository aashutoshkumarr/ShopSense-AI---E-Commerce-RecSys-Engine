import { Router, Request, Response } from 'express';
import { paymentOrchestratorInstance } from './paymentOrchestrator';

export const paymentRouter = Router();

// Create Payment Intent (with Idempotency Key header support)
paymentRouter.post('/intent', (req: Request, res: Response) => {
  try {
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
    const { amountINR, customerId, paymentMethodType, metadata } = req.body;

    if (!amountINR || amountINR <= 0) {
      return res.status(400).json({ error: 'amountINR must be a positive number' });
    }

    const intent = paymentOrchestratorInstance.createPaymentIntent({
      amountINR: Number(amountINR),
      customerId: customerId || 'guest_user',
      paymentMethodType,
      idempotencyKey,
      metadata
    });

    return res.status(201).json({ success: true, intent });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment intent creation failed' });
  }
});

// Confirm / Capture Payment Intent
paymentRouter.post('/confirm', (req: Request, res: Response) => {
  try {
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
    const { paymentIntentId, paymentMethodType, authCredential } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId is required' });
    }

    const result = paymentOrchestratorInstance.confirmPaymentIntent({
      paymentIntentId,
      paymentMethodType: paymentMethodType || 'upi',
      authCredential,
      idempotencyKey
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment confirmation failed' });
  }
});

// Get Intent Status
paymentRouter.get('/intent/:id', (req: Request, res: Response) => {
  const intent = paymentOrchestratorInstance.getPaymentIntent(req.params.id);
  if (!intent) {
    return res.status(404).json({ error: 'PaymentIntent not found' });
  }
  return res.json({ success: true, intent });
});

// Webhook Callback Receiver
paymentRouter.post('/webhook', (req: Request, res: Response) => {
  const signature = req.headers['x-shopsense-signature'] as string;
  const rawPayload = JSON.stringify(req.body);

  if (signature && !paymentOrchestratorInstance.verifyWebhookSignature(rawPayload, signature)) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  // Handle event
  const event = req.body;
  return res.json({ received: true, eventType: event.type || 'payment_intent.succeeded' });
});
