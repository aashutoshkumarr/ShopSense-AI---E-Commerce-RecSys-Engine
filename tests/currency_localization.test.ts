import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { currencyService, SUPPORTED_CURRENCIES } from '../src/engine/currencyLocalizationService';
import { Currency } from '../src/types';

describe('Global Multi-Currency & Regional Localization Suite', () => {

  test('should provide complete configuration for all 6 global currencies', () => {
    const list = currencyService.getSupportedCurrencies();
    assert.strictEqual(list.length, 6);

    const codes = list.map(c => c.code);
    assert.ok(codes.includes('INR'));
    assert.ok(codes.includes('USD'));
    assert.ok(codes.includes('EUR'));
    assert.ok(codes.includes('GBP'));
    assert.ok(codes.includes('AED'));
    assert.ok(codes.includes('JPY'));
  });

  test('should convert INR amount correctly across all supported currencies', () => {
    const amountINR = 10000; // ₹10,000

    const inrVal = currencyService.convertFromINR(amountINR, 'INR');
    assert.strictEqual(inrVal, 10000);

    const usdVal = currencyService.convertFromINR(amountINR, 'USD');
    assert.strictEqual(usdVal, 120); // 10000 * 0.012 = 120

    const eurVal = currencyService.convertFromINR(amountINR, 'EUR');
    assert.strictEqual(eurVal, 110); // 10000 * 0.011 = 110

    const gbpVal = currencyService.convertFromINR(amountINR, 'GBP');
    assert.strictEqual(gbpVal, 95); // 10000 * 0.0095 = 95

    const aedVal = currencyService.convertFromINR(amountINR, 'AED');
    assert.strictEqual(aedVal, 440); // 10000 * 0.044 = 440

    const jpyVal = currencyService.convertFromINR(amountINR, 'JPY');
    assert.strictEqual(jpyVal, 18200); // 10000 * 1.82 = 18200
  });

  test('should format localized price strings with accurate symbols and separators', () => {
    const amountINR = 24999;

    const inrFormatted = currencyService.formatPrice(amountINR, 'INR');
    assert.ok(inrFormatted.startsWith('₹'));
    assert.ok(inrFormatted.includes('24,999'));

    const usdFormatted = currencyService.formatPrice(amountINR, 'USD');
    assert.ok(usdFormatted.startsWith('$'));

    const eurFormatted = currencyService.formatPrice(amountINR, 'EUR');
    assert.ok(eurFormatted.startsWith('€'));

    const gbpFormatted = currencyService.formatPrice(amountINR, 'GBP');
    assert.ok(gbpFormatted.startsWith('£'));

    const aedFormatted = currencyService.formatPrice(amountINR, 'AED');
    assert.ok(aedFormatted.startsWith('AED'));

    const jpyFormatted = currencyService.formatPrice(amountINR, 'JPY');
    assert.ok(jpyFormatted.startsWith('¥'));
  });

  test('should compute accurate regional tax and statutory duties', () => {
    const amountINR = 50000;

    const inrTax = currencyService.calculateTaxAndDuties(amountINR, 'INR');
    assert.strictEqual(inrTax.taxRatePercent, 18);
    assert.strictEqual(inrTax.taxAmountINR, 9000);
    assert.ok(inrTax.taxLabel.includes('GST'));

    const usdTax = currencyService.calculateTaxAndDuties(amountINR, 'USD');
    assert.strictEqual(usdTax.taxRatePercent, 8.5);

    const eurTax = currencyService.calculateTaxAndDuties(amountINR, 'EUR');
    assert.strictEqual(eurTax.taxRatePercent, 20);

    const aedTax = currencyService.calculateTaxAndDuties(amountINR, 'AED');
    assert.strictEqual(aedTax.taxRatePercent, 5);
  });

});
