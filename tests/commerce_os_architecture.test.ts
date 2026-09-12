import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { paymentOrchestratorInstance } from '../src/backend/modules/payments/paymentOrchestrator';
import { darkStoreServiceInstance } from '../src/backend/modules/grocery/darkStoreService';
import { prescriptionVerificationServiceInstance } from '../src/backend/modules/pharmacy/prescriptionVerificationService';
import { marketplaceRiskServiceInstance } from '../src/backend/modules/marketplace/marketplaceRiskService';
import { bazaarValueServiceInstance } from '../src/backend/modules/bazaar/bazaarValueService';
import { hybridSearchServiceInstance } from '../src/backend/modules/search/hybridSearchService';

describe('ShopSense AI Commerce OS - Phase 1 Modular Architecture Suite', () => {

  // 1. Payment Orchestrator & Idempotency Layer
  describe('1. Payment Orchestration & Idempotency Layer', () => {
    test('should create PaymentIntent with client secret and expiration', () => {
      const intent = paymentOrchestratorInstance.createPaymentIntent({
        amountINR: 2499,
        customerId: 'user-alex-01',
        paymentMethodType: 'upi'
      });

      assert.ok(intent.id.startsWith('pi_'), 'Intent ID should have pi_ prefix');
      assert.strictEqual(intent.amountINR, 2499);
      assert.strictEqual(intent.currency, 'INR');
      assert.strictEqual(intent.status, 'requires_confirmation');
      assert.ok(intent.clientSecret.includes('secret_'), 'Client secret must be generated');
      assert.ok(new Date(intent.expiresAt) > new Date(), 'Expiration must be in future');
    });

    test('should prevent duplicate payments via Idempotency-Key caching', () => {
      const idempotencyKey = `idem-key-${Date.now()}-${Math.random()}`;

      // Request 1: Create intent
      const intent1 = paymentOrchestratorInstance.createPaymentIntent({
        amountINR: 1500,
        customerId: 'user-alex-01',
        paymentMethodType: 'upi',
        idempotencyKey
      });

      // Request 2: Duplicate call with identical key
      const intent2 = paymentOrchestratorInstance.createPaymentIntent({
        amountINR: 1500,
        customerId: 'user-alex-01',
        paymentMethodType: 'upi',
        idempotencyKey
      });

      // Must return identical intent without secondary allocation
      assert.strictEqual(intent1.id, intent2.id, 'Idempotent requests must return the exact same PaymentIntent ID');
      assert.strictEqual(intent1.clientSecret, intent2.clientSecret);
    });

    test('should confirm payment intent and generate settlement transaction', () => {
      const intent = paymentOrchestratorInstance.createPaymentIntent({
        amountINR: 3200,
        customerId: 'user-alex-01',
        paymentMethodType: 'upi'
      });

      const confirmResult = paymentOrchestratorInstance.confirmPaymentIntent({
        paymentIntentId: intent.id,
        paymentMethodType: 'upi',
        authCredential: '1234'
      });

      assert.strictEqual(confirmResult.success, true);
      assert.strictEqual(confirmResult.intent.status, 'succeeded');
      assert.ok(confirmResult.transaction, 'Settlement transaction must be produced');
      assert.strictEqual(confirmResult.transaction?.amountINR, 3200);
      assert.ok(confirmResult.transaction?.netAmountINR < 3200, 'Gateway fee should be deducted from net');
      assert.ok(confirmResult.transaction?.receiptNumber.startsWith('REC-'), 'Receipt number must be generated');
    });
  });

  // 2. Location-Aware Dark Store & Grocery Service
  describe('2. Location-Aware Dark Store & Grocery Service', () => {
    test('should resolve nearest dark store based on delivery pincode', () => {
      const storeIndiranagar = darkStoreServiceInstance.resolveDarkStore('560038');
      assert.strictEqual(storeIndiranagar.id, 'ds-blr-014');
      assert.strictEqual(storeIndiranagar.deliverySlaMinutes, 8);

      const storeKoramangala = darkStoreServiceInstance.resolveDarkStore('560034');
      assert.strictEqual(storeKoramangala.id, 'ds-blr-008');
      assert.strictEqual(storeKoramangala.deliverySlaMinutes, 9);

      const storeWhitefield = darkStoreServiceInstance.resolveDarkStore('560066');
      assert.strictEqual(storeWhitefield.id, 'ds-blr-021');
      assert.strictEqual(storeWhitefield.deliverySlaMinutes, 11);
    });

    test('should check stock availability and reserve items for 10-minute hold', () => {
      const storeId = 'ds-blr-014';
      const productId = 'prod-groc-01'; // Amul Milk

      const initialStock = darkStoreServiceInstance.getAvailableStock(storeId, productId);
      assert.ok(initialStock > 0, 'Initial stock should be available');

      // Create reservation of 3 units
      const res = darkStoreServiceInstance.reserveStock(storeId, productId, 3);
      assert.strictEqual(res.success, true);
      assert.ok(res.reservationId, 'Reservation ID must be returned');

      // Verify available stock dropped by 3
      const updatedStock = darkStoreServiceInstance.getAvailableStock(storeId, productId);
      assert.strictEqual(updatedStock, initialStock - 3);

      // Release hold and verify restoration
      darkStoreServiceInstance.releaseReservation(res.reservationId!);
      const restoredStock = darkStoreServiceInstance.getAvailableStock(storeId, productId);
      assert.strictEqual(restoredStock, initialStock);
    });

    test('should reject reservation if requested quantity exceeds available stock', () => {
      const res = darkStoreServiceInstance.reserveStock('ds-blr-014', 'prod-groc-01', 9999);
      assert.strictEqual(res.success, false);
      assert.ok(res.error?.includes('available'), 'Error should state limited availability');
    });
  });

  // 3. Healthcare & Prescription Verification Workflow
  describe('3. Healthcare & Prescription Verification Workflow', () => {
    test('should upload and transition prescription through compliance lifecycle', () => {
      const rx = prescriptionVerificationServiceInstance.uploadPrescription({
        customerId: 'user-alex-01',
        doctorName: 'Dr. Ramesh Rao, MD',
        doctorRegNumber: 'KMC-99214',
        patientName: 'Alex Kumar',
        diagnosis: 'Seasonal Bronchitis & Cough',
        items: [
          { medicineName: 'Augmentin 625 Duo', dosage: '625mg', frequency: 'BD', durationDays: 5, isScheduleH: true }
        ]
      });

      assert.strictEqual(rx.status, 'OCR_EXTRACTED');
      assert.strictEqual(rx.doctorName, 'Dr. Ramesh Rao, MD');

      // Registered Pharmacist audit sign-off
      const audit = prescriptionVerificationServiceInstance.auditPrescription(
        rx.id,
        'KA-PH-39402',
        'APPROVED'
      );

      assert.strictEqual(audit.success, true);
      assert.strictEqual(audit.record?.status, 'APPROVED_FOR_DISPATCH');
      assert.strictEqual(audit.record?.auditTrail.pharmacistRegNumber, 'KA-PH-39402');
    });

    test('should reject pharmacist audit if registration number format is invalid', () => {
      const rx = prescriptionVerificationServiceInstance.uploadPrescription({
        customerId: 'user-alex-01'
      });

      const invalidAudit = prescriptionVerificationServiceInstance.auditPrescription(
        rx.id,
        'INVALID_REG_999',
        'APPROVED'
      );

      assert.strictEqual(invalidAudit.success, false);
      assert.ok(invalidAudit.error?.includes('pharmacist registration number'));
    });

    test('should enforce Schedule H drug safety gating on order checkout', () => {
      const rxProductIds = ['prod-pharm-01', 'prod-pharm-02']; // Dolo & Pan-D (Schedule H)

      // Test 1: Order with OTC products only -> Always safe
      const otcCheck = prescriptionVerificationServiceInstance.validatePharmacyOrderSafety(
        ['prod-otc-01'],
        rxProductIds
      );
      assert.strictEqual(otcCheck.isSafeToDispense, true);
      assert.strictEqual(otcCheck.requiresRx, false);

      // Test 2: Order with Rx products without prescription -> Blocked
      const blockedCheck = prescriptionVerificationServiceInstance.validatePharmacyOrderSafety(
        ['prod-pharm-01'],
        rxProductIds
      );
      assert.strictEqual(blockedCheck.isSafeToDispense, false);
      assert.strictEqual(blockedCheck.requiresRx, true);
      assert.ok(blockedCheck.reason?.includes('Schedule H'));

      // Test 3: Order with approved verified prescription -> Approved
      const verifiedCheck = prescriptionVerificationServiceInstance.validatePharmacyOrderSafety(
        ['prod-pharm-01'],
        rxProductIds,
        'rx-rec-001' // Pre-seeded verified prescription
      );
      assert.strictEqual(verifiedCheck.isSafeToDispense, true);
    });
  });

  // 4. Marketplace & Fraud Risk Scoring Engine
  describe('4. Marketplace & Fraud Risk Scoring Engine', () => {
    test('should approve legitimate second-hand listing with high trust score', () => {
      const evaluation = marketplaceRiskServiceInstance.evaluateListingRisk({
        sellerId: 'sel-blr-01', // Verified KYC seller
        title: 'Sony WH-1000XM4 Noise Canceling Headphones',
        category: 'Audio',
        askingPriceINR: 14500,
        marketBenchmarkPriceINR: 19990,
        condition: 'like_new'
      });

      assert.ok(evaluation.trustScore >= 80, `Expected trust score >= 80, got ${evaluation.trustScore}`);
      assert.ok(evaluation.fraudRiskScore <= 0.25, `Expected low risk <= 0.25, got ${evaluation.fraudRiskScore}`);
      assert.strictEqual(evaluation.decision, 'ALLOW');
    });

    test('should flag suspicious underpricing as counterfeit or bait-and-switch fraud', () => {
      const evaluation = marketplaceRiskServiceInstance.evaluateListingRisk({
        sellerId: 'sel-unverified-99',
        title: 'Brand New Apple iPhone 15 Pro Max 1TB (Unopened Box)',
        category: 'Smartphones',
        askingPriceINR: 5000, // 96% below benchmark!
        marketBenchmarkPriceINR: 140000,
        condition: 'brand_new'
      });

      assert.ok(evaluation.fraudRiskScore >= 0.7, `Fraud risk should be high, got ${evaluation.fraudRiskScore}`);
      assert.strictEqual(evaluation.decision, 'BLOCK');
      assert.ok(evaluation.reasons.some(r => r.includes('Extreme price discount')));
    });

    test('should register and store verified pre-owned listing with image verification', () => {
      const listing = marketplaceRiskServiceInstance.createListing({
        sellerId: 'sel-blr-01',
        sellerName: 'Alex Kumar',
        title: 'Sony WH-1000XM4 Noise Canceling Headphones',
        category: 'Audio',
        askingPriceINR: 14500,
        condition: 'like_new',
        locationCity: 'Bengaluru',
        imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        description: 'Camera inspected condition: zero scratches.'
      });

      assert.ok(listing.id.startsWith('list_'), 'Listing ID should be assigned');
      assert.strictEqual(listing.condition, 'like_new');
      assert.ok(listing.imageUrl?.startsWith('data:image/jpeg'), 'Photo verification data should be saved');
      assert.ok(listing.trustScore >= 80);
    });
  });

  // 5. Bazaar Value-Commerce & Deal Scoring Engine
  describe('5. Bazaar Value-Commerce & Deal Scoring Engine', () => {
    test('should compute multi-factor ValueScore incorporating discount, rating, and review volume', () => {
      const mockBazaarItem: any = {
        id: 'prod-test-baz',
        priceINR: 199,
        originalPriceINR: 499, // 60% discount
        rating: 4.8,
        reviewCount: 350
      };

      const score = bazaarValueServiceInstance.computeValueScore(mockBazaarItem);
      assert.ok(score > 5.0, `ValueScore should be strong for high discount + rating, got ${score}`);
    });

    test('should compute progressive multi-buy discount rules accurately', () => {
      // 1 Item: 0% extra
      const buy1 = bazaarValueServiceInstance.calculateMultiBuyDiscount([299]);
      assert.strictEqual(buy1.discountPercentage, 0);
      assert.strictEqual(buy1.finalAmountINR, 299);

      // 2 Items: 10% extra
      const buy2 = bazaarValueServiceInstance.calculateMultiBuyDiscount([299, 199]);
      assert.strictEqual(buy2.discountPercentage, 10);
      assert.strictEqual(buy2.discountAmountINR, Math.round(498 * 0.1));
      assert.strictEqual(buy2.finalAmountINR, 498 - Math.round(498 * 0.1));

      // 3+ Items: 15% extra
      const buy3 = bazaarValueServiceInstance.calculateMultiBuyDiscount([299, 199, 99]);
      assert.strictEqual(buy3.discountPercentage, 15);
      assert.strictEqual(buy3.discountAmountINR, Math.round(597 * 0.15));
    });

    test('should return ranked Bazaar deals sorted by ValueScore', () => {
      const deals = bazaarValueServiceInstance.getRankedBazaarDeals();
      assert.ok(deals.length > 5, 'Should have multiple bazaar deals');
      
      // Verify descending sort
      for (let i = 0; i < deals.length - 1; i++) {
        assert.ok(
          deals[i].valueScore >= deals[i + 1].valueScore,
          `Deal at index ${i} (${deals[i].valueScore}) must be >= index ${i + 1} (${deals[i + 1].valueScore})`
        );
      }
    });
  });

  // 6. Hybrid Search Architecture (Lexical + Vector RRF)
  describe('6. Hybrid Search Architecture (Lexical + Semantic Vector)', () => {
    test('should compute accurate lexical keyword match scores', () => {
      const sampleProduct: any = {
        title: 'ASUS ROG Zephyrus G16 Gaming Laptop AMD Ryzen 9',
        brand: 'ASUS',
        category: 'Laptops',
        tags: ['gaming', 'rtx 4080', 'oled'],
        description: 'Elite gaming workstation'
      };

      const highMatch = hybridSearchServiceInstance.computeLexicalScore(sampleProduct, ['asus', 'rog', 'gaming']);
      const lowMatch = hybridSearchServiceInstance.computeLexicalScore(sampleProduct, ['organic', 'milk']);

      assert.ok(highMatch > lowMatch * 4, `Lexical match score (${highMatch}) should heavily exceed irrelevant (${lowMatch})`);
    });

    test('should execute hybrid search combining lexical and vector ranks via RRF', () => {
      const results = hybridSearchServiceInstance.executeHybridSearch({
        query: 'coding laptop ryzen 16gb ram',
        category: 'Laptops',
        limit: 5
      });

      assert.ok(results.length > 0, 'Hybrid search should return candidates');
      assert.strictEqual(results[0].product.category, 'Laptops');
      assert.ok(results[0].rrfScore > 0, 'RRF score must be positive');
      assert.ok(results[0].lexicalRank > 0, 'Lexical rank must be populated');
      assert.ok(results[0].vectorRank > 0, 'Vector rank must be populated');

      // Verify descending RRF order
      for (let i = 0; i < results.length - 1; i++) {
        assert.ok(
          results[i].rrfScore >= results[i + 1].rrfScore,
          `Result ${i} (${results[i].rrfScore}) must be >= Result ${i + 1} (${results[i + 1].rrfScore})`
        );
      }
    });

    test('should strictly respect budget constraints during hybrid search', () => {
      const maxBudget = 60000;
      const results = hybridSearchServiceInstance.executeHybridSearch({
        query: 'laptop',
        maxPriceINR: maxBudget,
        limit: 10
      });

      results.forEach(res => {
        assert.ok(
          res.product.priceINR <= maxBudget,
          `Product ${res.product.title} price (${res.product.priceINR}) must be <= ${maxBudget}`
        );
      });
    });
  });

});
