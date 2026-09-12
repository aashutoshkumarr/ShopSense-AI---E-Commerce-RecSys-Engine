import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { upiPaymentServiceInstance } from '../src/engine/upiPaymentService';
import { mockProducts } from '../src/data/products';

describe('ShopSense Super-App & Fintech Test Suite', () => {

  // 1. Google Pay UPI 2.0 & Bank Account Engine
  describe('Google Pay & NPCI UPI 2.0 Engine', () => {
    test('should load linked bank accounts with masked numbers and valid IFSC', () => {
      const accounts = upiPaymentServiceInstance.getLinkedBanks();
      assert.ok(accounts.length >= 3, 'Must have at least 3 linked bank accounts');
      
      const hdfc = accounts.find(a => a.bankName.includes('HDFC'));
      assert.ok(hdfc, 'HDFC Bank account should exist');
      assert.ok(hdfc.accountNumberMasked.includes('••'), 'Account number must be masked');
      assert.ok(hdfc.ifsc.length > 5, 'IFSC must be populated');
      assert.ok(hdfc.balanceINR > 0, 'Account must have initial balance');
    });

    test('should validate UPI PIN correctly and reject incorrect PIN', () => {
      const accounts = upiPaymentServiceInstance.getLinkedBanks();
      const testAccount = accounts[0];

      // Test valid PIN check
      const validCheck = upiPaymentServiceInstance.getAccountBalance(testAccount.id, testAccount.correctPin);
      assert.strictEqual(validCheck.success, true);
      assert.strictEqual(validCheck.balanceINR, testAccount.balanceINR);

      // Test invalid PIN check
      const invalidCheck = upiPaymentServiceInstance.getAccountBalance(testAccount.id, '0000');
      assert.strictEqual(invalidCheck.success, false);
      assert.ok(invalidCheck.error?.toLowerCase().includes('incorrect upi pin'), 'Error must note incorrect PIN');
    });

    test('should process bank-to-contact UPI transfer and generate transaction reference', () => {
      const accounts = upiPaymentServiceInstance.getLinkedBanks();
      const sourceBank = accounts[0];
      const initialBalance = sourceBank.balanceINR;
      const transferAmount = 450;

      const result = upiPaymentServiceInstance.executeTransfer({
        recipientType: 'contact',
        recipientName: 'Rohan Sharma',
        recipientHandle: 'rohan.sharma@okaxis',
        amountINR: transferAmount,
        paymentSource: 'bank',
        bankId: sourceBank.id,
        pin: sourceBank.correctPin,
        note: 'Dinner split'
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.transaction, 'Transaction object must be returned');
      assert.strictEqual(result.transaction?.status, 'SUCCESS');
      assert.ok(result.transaction?.txnRefNumber.startsWith('UPI/'), 'Must have UPI reference number');
      
      // Verify bank balance deduction
      const updatedBalance = upiPaymentServiceInstance.getAccountBalance(sourceBank.id, sourceBank.correctPin).balanceINR;
      assert.strictEqual(updatedBalance, initialBalance - transferAmount);
    });

    test('should execute BillPay transaction successfully with wallet source', () => {
      const result = upiPaymentServiceInstance.executeTransfer({
        recipientType: 'biller',
        recipientName: 'BESCOM Electricity Bangalore',
        recipientHandle: 'bescom.bill@bbps',
        amountINR: 1420,
        paymentSource: 'wallet',
        note: 'Monthly Electricity Bill'
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.transaction, 'Bill payment transaction must exist');
      assert.strictEqual(result.transaction?.status, 'SUCCESS');
      assert.strictEqual(result.transaction?.paymentSource, 'wallet');
    });

    test('should scratch reward card and credit cashback to user ledger', () => {
      const initialCashback = 45;
      const result = upiPaymentServiceInstance.claimScratchCardReward(initialCashback);
      assert.strictEqual(result.success, true);
      assert.ok(result.newBalanceINR > 0, 'New wallet balance must be updated');
      
      const allTx = upiPaymentServiceInstance.getTransactionHistory();
      const rewardTx = allTx.find(t => t.type === 'cashback_reward');
      assert.ok(rewardTx, 'Cashback reward transaction must be logged in ledger');
      assert.strictEqual(rewardTx?.amountINR, initialCashback);
    });
  });

  // 2. Comprehensive Catalog Diversity & Indian Brands
  describe('Comprehensive Indian Catalog Expansion', () => {
    test('should maintain at least 210 total catalog products', () => {
      assert.ok(mockProducts.length >= 210, `Expected >= 210 products, got ${mockProducts.length}`);
    });

    test('should contain diverse products across requested tech brands', () => {
      const brands = ['Apple', 'Samsung', 'ASUS', 'Vivo', 'Lenovo', 'OnePlus', 'Xiaomi'];
      brands.forEach(b => {
        const count = mockProducts.filter(p => p.brand === b).length;
        assert.ok(count >= 5, `Brand ${b} should have at least 5 products, got ${count}`);
      });
    });

    test('should contain verified grocery items with delivery tags', () => {
      const groceries = mockProducts.filter(p => p.category === 'Grocery');
      assert.ok(groceries.length >= 10, 'Should have at least 10 grocery products');
      
      const amulMilk = groceries.find(p => p.title.toLowerCase().includes('amul'));
      assert.ok(amulMilk, 'Amul milk must exist in groceries');
      assert.ok(amulMilk.priceINR <= 100, 'Milk price should be realistic');
    });

    test('should contain Amazon Bazaar products with sub-₹999 pricing', () => {
      const bazaar = mockProducts.filter(p => p.category === 'Bazaar');
      assert.ok(bazaar.length >= 10, 'Should have at least 10 bazaar products');
      
      bazaar.forEach(item => {
        assert.ok(item.priceINR <= 999, `Bazaar item ${item.title} price (${item.priceINR}) must be <= ₹999`);
      });
    });

    test('should contain Apollo 24/7 pharmacy products with active salt compositions', () => {
      const pharmacy = mockProducts.filter(p => p.category === 'Pharmacy');
      assert.ok(pharmacy.length >= 10, 'Should have at least 10 pharmacy products');
      
      const dolo = pharmacy.find(p => p.title.toLowerCase().includes('dolo'));
      assert.ok(dolo, 'Dolo 650 must exist in pharmacy');
      assert.ok(
        dolo.specs['ActiveSalt'] || dolo.specs['Composition'] || dolo.specs['ActiveIngredient'],
        'Active salt composition must be present in specs'
      );
    });
  });

});
