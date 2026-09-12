import { Product } from '../../../types';
import { mockProducts } from '../../../data/products';

export interface BazaarDealScore {
  productId: string;
  title: string;
  brand: string;
  priceINR: number;
  originalPriceINR: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  valueScore: number; // Algorithmic score
  priceTier: 99 | 199 | 499 | 999;
}

export interface MultiBuyCalculation {
  itemCount: number;
  subtotalINR: number;
  discountPercentage: number;
  discountAmountINR: number;
  finalAmountINR: number;
  savingsMessage: string;
}

export class BazaarValueService {
  /**
   * Computes the algorithmic ValueScore for a product:
   * ValueScore = (discountPercentage / 100) * rating * log10(10 + reviewCount)
   */
  public computeValueScore(product: Product): number {
    const original = product.originalPriceINR || product.priceINR;
    const current = product.priceINR;
    const discountRatio = Math.max(0.05, (original - current) / Math.max(1, original));
    const rating = Math.min(5, Math.max(1, product.rating || 4.0));
    const popularityFactor = Math.log10(10 + (product.reviewCount || 10));

    const rawScore = discountRatio * rating * popularityFactor;
    return parseFloat(rawScore.toFixed(3));
  }

  /**
   * Resolves the lowest applicable price tier (99, 199, 499, 999).
   */
  public resolvePriceTier(priceINR: number): 99 | 199 | 499 | 999 {
    if (priceINR <= 99) return 99;
    if (priceINR <= 199) return 199;
    if (priceINR <= 499) return 499;
    return 999;
  }

  /**
   * Returns ranked Bazaar deals sorted by ValueScore.
   */
  public getRankedBazaarDeals(tier?: number): BazaarDealScore[] {
    const bazaarProducts = mockProducts.filter(p => p.category === 'Bazaar');

    const scored = bazaarProducts.map(p => {
      const original = p.originalPriceINR || p.priceINR;
      const discountPercentage = Math.round(((original - p.priceINR) / original) * 100);
      return {
        productId: p.id,
        title: p.title,
        brand: p.brand,
        priceINR: p.priceINR,
        originalPriceINR: original,
        discountPercentage,
        rating: p.rating,
        reviewCount: p.reviewCount,
        valueScore: this.computeValueScore(p),
        priceTier: this.resolvePriceTier(p.priceINR)
      };
    });

    const filtered = tier ? scored.filter(s => s.priceINR <= tier) : scored;
    return filtered.sort((a, b) => b.valueScore - a.valueScore);
  }

  /**
   * Computes progressive multi-buy discount:
   * 1 item: 0% extra off
   * 2 items: 10% extra off
   * 3+ items: 15% extra off
   */
  public calculateMultiBuyDiscount(itemPrices: number[]): MultiBuyCalculation {
    const itemCount = itemPrices.length;
    const subtotalINR = itemPrices.reduce((acc, val) => acc + val, 0);

    let discountPercentage = 0;
    let savingsMessage = 'Add 1 more Bazaar deal to unlock an Extra 10% OFF!';

    if (itemCount >= 3) {
      discountPercentage = 15;
      savingsMessage = 'Maximum 15% Multi-Buy Super Saver Unlocked! 🎉';
    } else if (itemCount === 2) {
      discountPercentage = 10;
      savingsMessage = '10% Multi-Buy Saver Active! Add 1 more for 15% OFF!';
    }

    const discountAmountINR = Math.round((subtotalINR * discountPercentage) / 100);
    const finalAmountINR = subtotalINR - discountAmountINR;

    return {
      itemCount,
      subtotalINR,
      discountPercentage,
      discountAmountINR,
      finalAmountINR,
      savingsMessage
    };
  }
}

export const bazaarValueServiceInstance = new BazaarValueService();
