import { PriceHistoryRecord, PriceAnalytics, Product } from '../types';
import { mockProducts } from '../data/products';

// In-Memory Database for Price History Records
let priceHistoryDatabase: Record<string, PriceHistoryRecord[]> = {};

/**
 * Seed historical price database with realistic market fluctuation curves
 */
function initializePriceHistoryDatabase() {
  const seededDb: Record<string, PriceHistoryRecord[]> = {};

  mockProducts.forEach((product) => {
    const records = generateProductHistoricalCurve(product);
    seededDb[product.id] = records;
  });

  priceHistoryDatabase = seededDb;
}

/**
 * Generates realistic price trajectory points across the last 6 months (Jan - Aug 2026)
 */
function generateProductHistoricalCurve(product: Product): PriceHistoryRecord[] {
  const currentINR = product.priceINR;
  const currentUSD = product.priceUSD;
  const origINR = product.originalPriceINR || Math.round(currentINR * 1.15);
  const origUSD = product.originalPriceUSD || Math.round(currentUSD * 1.15);

  // We craft a realistic price trend:
  // 1. Launch/Jan: Original MSRP
  // 2. Feb: Slight initial drop / Republic Day / Early Promo
  // 3. Mar: Regular price
  // 4. Apr: Spring/Easter Tech Fest (Lowest or near lowest)
  // 5. May: Rebound / component adjustment
  // 6. Jun: Mid-year clearance sale
  // 7. Jul: Standard price
  // 8. Aug (Today): Current price (with possible active drop)

  const varianceFactor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
    return (Math.abs(hash) % 100) / 100;
  };

  const seed = varianceFactor(product.id);
  const launchINR = Math.round(origINR * (0.98 + seed * 0.05));
  const febINR = Math.round(launchINR * 0.94);
  const marINR = Math.round(launchINR * 0.96);
  const aprINR = Math.round(launchINR * 0.88); // Often lowest dip
  const mayINR = Math.round(launchINR * 0.93);
  const junINR = Math.round(launchINR * 0.90);
  const julINR = Math.round(launchINR * 0.91);

  const exchangeRate = currentUSD / currentINR || 0.012;

  const points: { date: string; dateLabel: string; priceINR: number; source: PriceHistoryRecord['source']; event: string }[] = [
    { date: '2026-01-10T08:00:00Z', dateLabel: 'Jan 10', priceINR: launchINR, source: 'catalog_launch', event: 'Catalog Launch MSRP' },
    { date: '2026-02-02T10:30:00Z', dateLabel: 'Feb 02', priceINR: febINR, source: 'festival_sale', event: 'Winter Tech Fest Deal' },
    { date: '2026-03-15T14:00:00Z', dateLabel: 'Mar 15', priceINR: marINR, source: 'regular_adjustment', event: 'Regular Price Adjustment' },
    { date: '2026-04-21T09:15:00Z', dateLabel: 'Apr 21', priceINR: aprINR, source: 'flash_deal', event: 'Flash Discount Weekend' },
    { date: '2026-05-18T16:45:00Z', dateLabel: 'May 18', priceINR: mayINR, source: 'competitor_match', event: 'Market Competitor Match' },
    { date: '2026-06-25T11:00:00Z', dateLabel: 'Jun 25', priceINR: junINR, source: 'seasonal_discount', event: 'Mid-Year Electronics Sale' },
    { date: '2026-07-20T13:20:00Z', dateLabel: 'Jul 20', priceINR: julINR, source: 'regular_adjustment', event: 'Inventory Re-stock Price' },
    { date: '2026-08-20T08:00:00Z', dateLabel: 'Aug 20', priceINR: currentINR, source: 'price_drop', event: 'Current Live Price' }
  ];

  return points.map((pt, idx) => ({
    id: `ph-${product.id}-${idx}`,
    productId: product.id,
    priceINR: pt.priceINR,
    priceUSD: Math.round(pt.priceINR * exchangeRate),
    originalPriceINR: origINR,
    timestamp: pt.date,
    dateLabel: pt.dateLabel,
    source: pt.source,
    eventDescription: pt.event
  }));
}

// Initialize on module load
initializePriceHistoryDatabase();

/**
 * Computes rich price intelligence and analytics for a given product
 */
export function getProductPriceAnalytics(product: Product): PriceAnalytics {
  let history = priceHistoryDatabase[product.id];
  if (!history || history.length === 0) {
    history = generateProductHistoricalCurve(product);
    priceHistoryDatabase[product.id] = history;
  }

  // Find lowest and highest
  let lowestINR = Infinity;
  let lowestUSD = Infinity;
  let lowestDate = '';
  let highestINR = -Infinity;
  let highestUSD = -Infinity;
  let highestDate = '';
  let sumINR = 0;
  let sumUSD = 0;

  history.forEach((record) => {
    if (record.priceINR < lowestINR) {
      lowestINR = record.priceINR;
      lowestUSD = record.priceUSD;
      lowestDate = record.dateLabel;
    }
    if (record.priceINR > highestINR) {
      highestINR = record.priceINR;
      highestUSD = record.priceUSD;
      highestDate = record.dateLabel;
    }
    sumINR += record.priceINR;
    sumUSD += record.priceUSD;
  });

  const avgINR = Math.round(sumINR / history.length);
  const avgUSD = Math.round(sumUSD / history.length);

  // Tag lowest/highest in records
  const annotatedHistory = history.map(h => ({
    ...h,
    isLowest: h.priceINR === lowestINR,
    isHighest: h.priceINR === highestINR
  }));

  const currentINR = product.priceINR;
  const currentUSD = product.priceUSD;

  // 30-day and 90-day comparisons
  const prev30DayRecord = history[history.length - 2] || history[0];
  const priceChange30DaysPct = Number((((currentINR - prev30DayRecord.priceINR) / prev30DayRecord.priceINR) * 100).toFixed(1));

  const prev90DayRecord = history[Math.max(0, history.length - 4)];
  const priceChange90DaysPct = Number((((currentINR - prev90DayRecord.priceINR) / prev90DayRecord.priceINR) * 100).toFixed(1));

  // Difference vs average
  const pctDiffFromAvg = Number((((currentINR - avgINR) / avgINR) * 100).toFixed(1));
  const isBelow90DayAvg = currentINR < avgINR;

  // Compute verdict & rationale
  let dealVerdict: PriceAnalytics['dealVerdict'] = 'fair_price';
  let verdictText = '';

  if (currentINR <= lowestINR) {
    dealVerdict = 'great_deal';
    verdictText = `All-Time Lowest Price! Current price is ₹${currentINR.toLocaleString()}, matching or beating historical record low.`;
  } else if (isBelow90DayAvg && Math.abs(pctDiffFromAvg) >= 8) {
    dealVerdict = 'great_deal';
    verdictText = `Current price is ${Math.abs(pctDiffFromAvg)}% below the 90-day average (₹${avgINR.toLocaleString()}) — Excellent time to purchase.`;
  } else if (isBelow90DayAvg) {
    dealVerdict = 'good_price';
    verdictText = `Current price is below the 90-day average of ₹${avgINR.toLocaleString()}. Good value range.`;
  } else if (pctDiffFromAvg > 8) {
    dealVerdict = 'above_average';
    verdictText = `Current price is ${pctDiffFromAvg}% above the 90-day average. Consider setting a price alert.`;
  } else {
    dealVerdict = 'fair_price';
    verdictText = `Price is within normal historical trading bands (Avg: ₹${avgINR.toLocaleString()}).`;
  }

  // Price drop today check (if latest record was updated today with a discount)
  const priceDropTodayPct = priceChange30DaysPct < 0 ? Math.abs(priceChange30DaysPct) : undefined;

  return {
    productId: product.id,
    productTitle: product.title,
    currentPriceINR: currentINR,
    currentPriceUSD: currentUSD,
    lowestPriceINR: lowestINR,
    lowestPriceUSD: lowestUSD,
    lowestPriceDate: lowestDate,
    highestPriceINR: highestINR,
    highestPriceUSD: highestUSD,
    highestPriceDate: highestDate,
    averagePriceINR: avgINR,
    averagePriceUSD: avgUSD,
    priceChange30DaysPct,
    priceChange90DaysPct,
    priceDropTodayPct,
    isBelow90DayAverage: isBelow90DayAvg,
    pctDifferenceFromAverage: pctDiffFromAvg,
    dealVerdict,
    verdictText,
    totalDataPoints: history.length,
    history: annotatedHistory
  };
}

/**
 * Record a live price update in the persistent price database
 */
export function recordPriceUpdate(
  product: Product,
  newPriceINR: number,
  source: PriceHistoryRecord['source'] = 'regular_adjustment',
  eventDescription?: string
): PriceAnalytics {
  const exchangeRate = product.priceUSD / product.priceINR || 0.012;
  const newPriceUSD = Math.round(newPriceINR * exchangeRate);

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const record: PriceHistoryRecord = {
    id: `ph-${product.id}-${Date.now()}`,
    productId: product.id,
    priceINR: newPriceINR,
    priceUSD: newPriceUSD,
    originalPriceINR: product.originalPriceINR,
    timestamp: now.toISOString(),
    dateLabel,
    source,
    eventDescription: eventDescription || 'Live Price Adjustment'
  };

  if (!priceHistoryDatabase[product.id]) {
    priceHistoryDatabase[product.id] = generateProductHistoricalCurve(product);
  }

  priceHistoryDatabase[product.id].push(record);

  // Update product object price
  product.priceINR = newPriceINR;
  product.priceUSD = newPriceUSD;

  return getProductPriceAnalytics(product);
}

/**
 * Simulates a price drop for testing live reactive triggers and price alert deliveries
 */
export function simulatePriceDrop(product: Product, discountPercentage: number = 10): {
  analytics: PriceAnalytics;
  dropAmountINR: number;
  newPriceINR: number;
} {
  const dropFactor = (100 - discountPercentage) / 100;
  const newPriceINR = Math.round(product.priceINR * dropFactor);
  const dropAmountINR = product.priceINR - newPriceINR;

  const analytics = recordPriceUpdate(
    product,
    newPriceINR,
    'price_drop',
    `Flash Price Drop (-${discountPercentage}%)`
  );

  return {
    analytics,
    dropAmountINR,
    newPriceINR
  };
}
