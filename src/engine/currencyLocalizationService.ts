/**
 * ShopSense AI Commerce OS — Global Multi-Currency & Regional Localization Service
 * 
 * Manages real-time FX exchange rates, symbol formatting, localized rounding,
 * and tax estimations across global markets (India, USA, EU, UK, UAE, Japan).
 */

import { Currency, CurrencyInfo } from '../types';

export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyInfo> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rateFromINR: 1.0,
    flag: '🇮🇳'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromINR: 0.012, // ~₹83.3 / USD
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromINR: 0.011, // ~₹90.9 / EUR
    flag: '🇪🇺'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromINR: 0.0095, // ~₹105.2 / GBP
    flag: '🇬🇧'
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    rateFromINR: 0.044, // ~₹22.7 / AED
    flag: '🇦🇪'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rateFromINR: 1.82, // ~₹0.55 / JPY
    flag: '🇯🇵'
  }
};

export class CurrencyLocalizationService {
  private static instance: CurrencyLocalizationService;

  private constructor() {}

  public static getInstance(): CurrencyLocalizationService {
    if (!CurrencyLocalizationService.instance) {
      CurrencyLocalizationService.instance = new CurrencyLocalizationService();
    }
    return CurrencyLocalizationService.instance;
  }

  public getSupportedCurrencies(): CurrencyInfo[] {
    return Object.values(SUPPORTED_CURRENCIES);
  }

  public convertFromINR(amountINR: number, targetCurrency: Currency): number {
    const info = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.INR;
    const converted = amountINR * info.rateFromINR;

    // Japanese Yen is typically integer without decimals
    if (targetCurrency === 'JPY') {
      return Math.round(converted);
    }

    // Standard currencies rounded to 2 decimal places or clean integers
    return Math.round(converted * 100) / 100;
  }

  public formatPrice(amountINR: number, currency: Currency): string {
    const info = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
    const value = this.convertFromINR(amountINR, currency);

    if (currency === 'INR') {
      return `₹${value.toLocaleString('en-IN')}`;
    }

    if (currency === 'JPY') {
      return `¥${value.toLocaleString('ja-JP')}`;
    }

    if (currency === 'EUR') {
      return `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (currency === 'GBP') {
      return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (currency === 'AED') {
      return `AED ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  public calculateTaxAndDuties(amountINR: number, currency: Currency): {
    taxRatePercent: number;
    taxAmountINR: number;
    taxLabel: string;
  } {
    switch (currency) {
      case 'INR':
        return { taxRatePercent: 18, taxAmountINR: Math.round(amountINR * 0.18), taxLabel: 'GST (18% Included)' };
      case 'USD':
        return { taxRatePercent: 8.5, taxAmountINR: Math.round(amountINR * 0.085), taxLabel: 'Estimated Sales Tax' };
      case 'EUR':
        return { taxRatePercent: 20, taxAmountINR: Math.round(amountINR * 0.20), taxLabel: 'VAT (20% Included)' };
      case 'GBP':
        return { taxRatePercent: 20, taxAmountINR: Math.round(amountINR * 0.20), taxLabel: 'UK VAT (20% Included)' };
      case 'AED':
        return { taxRatePercent: 5, taxAmountINR: Math.round(amountINR * 0.05), taxLabel: 'UAE VAT (5%)' };
      case 'JPY':
        return { taxRatePercent: 10, taxAmountINR: Math.round(amountINR * 0.10), taxLabel: 'Consumption Tax (10%)' };
      default:
        return { taxRatePercent: 0, taxAmountINR: 0, taxLabel: 'Tax' };
    }
  }
}

export const currencyService = CurrencyLocalizationService.getInstance();
