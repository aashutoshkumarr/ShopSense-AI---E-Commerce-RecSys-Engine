import { Seller, BuyBoxListing, BuyBoxResult, Product } from '../types';
import { mockProducts } from '../data/products';

// Verified Third-Party Merchant Sellers
export const VERIFIED_SELLERS: Seller[] = [
  {
    id: 'seller-prime-direct',
    name: 'ShopSense Prime Retail (Official)',
    rating: 4.9,
    reviewCount: 38420,
    fulfillmentType: 'PRIME_EXPRESS',
    badges: ['Prime Verified', 'Authorized Direct Brand'],
    dispatchTimeHours: 4,
    sellerCity: 'Bengaluru, KA',
    positiveFeedbackPct: 99
  },
  {
    id: 'seller-cloudtail',
    name: 'Cloudtail India Corp',
    rating: 4.8,
    reviewCount: 92450,
    fulfillmentType: 'PRIME_EXPRESS',
    badges: ['Top Rated Merchant', 'Fast Dispatch'],
    dispatchTimeHours: 6,
    sellerCity: 'Mumbai, MH',
    positiveFeedbackPct: 97
  },
  {
    id: 'seller-appario',
    name: 'Appario Electronics Ltd',
    rating: 4.7,
    reviewCount: 65110,
    fulfillmentType: 'PRIME_EXPRESS',
    badges: ['OEM Certified'],
    dispatchTimeHours: 8,
    sellerCity: 'Hyderabad, TS',
    positiveFeedbackPct: 96
  },
  {
    id: 'seller-electrohub',
    name: 'ElectroDeals Online Hub',
    rating: 4.5,
    reviewCount: 14200,
    fulfillmentType: 'MERCHANT_STANDARD',
    badges: ['Value Guarantee'],
    dispatchTimeHours: 24,
    sellerCity: 'New Delhi, DL',
    positiveFeedbackPct: 93
  }
];

// In-memory multi-seller listings store
const productListingsMap = new Map<string, BuyBoxListing[]>();

// Initialize default multi-seller listings for catalog products
export const initializeBuyBoxListings = (products: Product[] = mockProducts) => {
  products.forEach((product) => {
    const basePrice = product.priceINR;
    const baseUSD = product.priceUSD;

    const listings: BuyBoxListing[] = [
      // Seller 1: Prime Official
      {
        seller: VERIFIED_SELLERS[0],
        priceINR: basePrice,
        priceUSD: baseUSD,
        originalPriceINR: product.originalPriceINR,
        shippingCostINR: 0,
        inStock: product.inStock,
        stockCount: Math.max(12, product.stockCount),
        deliveryDays: 1,
        buyBoxScore: 0,
        isWinner: false,
        repricerStrategy: 'MATCH_LOWEST'
      },
      // Seller 2: Cloudtail (Competitive, ₹100-₹500 difference)
      {
        seller: VERIFIED_SELLERS[1],
        priceINR: Math.max(999, Math.round(basePrice * 0.985)),
        priceUSD: Math.round(baseUSD * 0.985),
        originalPriceINR: product.originalPriceINR,
        shippingCostINR: 0,
        inStock: true,
        stockCount: 18,
        deliveryDays: 1,
        buyBoxScore: 0,
        isWinner: false,
        repricerStrategy: 'UNDERCUT_50'
      },
      // Seller 3: Appario Tech
      {
        seller: VERIFIED_SELLERS[2],
        priceINR: Math.round(basePrice * 1.01),
        priceUSD: Math.round(baseUSD * 1.01),
        originalPriceINR: product.originalPriceINR,
        shippingCostINR: 0,
        inStock: true,
        stockCount: 8,
        deliveryDays: 2,
        buyBoxScore: 0,
        isWinner: false,
        repricerStrategy: 'MAX_MARGIN'
      },
      // Seller 4: ElectroDeals (Budget Merchant, 3-day standard shipping)
      {
        seller: VERIFIED_SELLERS[3],
        priceINR: Math.max(799, Math.round(basePrice * 0.97)),
        priceUSD: Math.round(baseUSD * 0.97),
        originalPriceINR: product.originalPriceINR,
        shippingCostINR: 99,
        inStock: true,
        stockCount: 5,
        deliveryDays: 3,
        buyBoxScore: 0,
        isWinner: false,
        repricerStrategy: 'STATIC'
      }
    ];

    productListingsMap.set(product.id, listings);
    evaluateBuyBoxWinner(product.id);
  });
};

// Algorithmic Buy Box Winner Evaluation
// Multi-factor weight: Price (40%), Shipping Speed (25%), Seller Rating (20%), Stock Reliability (15%)
export const evaluateBuyBoxWinner = (productId: string): BuyBoxResult | null => {
  const listings = productListingsMap.get(productId);
  if (!listings || listings.length === 0) return null;

  const validListings = listings.filter(l => l.inStock && l.stockCount > 0);
  if (validListings.length === 0) {
    // If all out of stock, return first listing with 0 score
    listings.forEach(l => { l.isWinner = false; l.buyBoxScore = 0; });
    return {
      productId,
      productTitle: 'Unknown Product',
      winner: listings[0],
      competingListings: listings.slice(1),
      totalSellersCount: listings.length,
      priceSpreadINR: 0,
      lastRepricedAt: new Date().toISOString()
    };
  }

  const minPrice = Math.min(...validListings.map(l => l.priceINR + l.shippingCostINR));
  const maxPrice = Math.max(...validListings.map(l => l.priceINR + l.shippingCostINR));

  validListings.forEach((listing) => {
    const totalCost = listing.priceINR + listing.shippingCostINR;

    // 1. Price Competitiveness: 1.0 for cheapest, scales down
    const priceScore = totalCost <= minPrice ? 1.0 : Math.max(0.2, 1.0 - ((totalCost - minPrice) / minPrice) * 5);

    // 2. Shipping Speed Score: 1-day = 1.0, 2-day = 0.85, 3-day = 0.65, 4+ = 0.4
    const shippingScore = listing.deliveryDays <= 1 ? 1.0 : listing.deliveryDays === 2 ? 0.85 : 0.65;

    // 3. Seller Rating Score: (rating / 5) * (positiveFeedbackPct / 100)
    const ratingScore = (listing.seller.rating / 5.0) * (listing.seller.positiveFeedbackPct / 100.0);

    // 4. In-Stock Reliability Score: >10 units = 1.0, 5-10 = 0.8, <5 = 0.5
    const stockScore = listing.stockCount >= 10 ? 1.0 : listing.stockCount >= 5 ? 0.8 : 0.5;

    // Combined Buy Box Weighted Score
    const compositeScore = (
      priceScore * 0.40 +
      shippingScore * 0.25 +
      ratingScore * 0.20 +
      stockScore * 0.15
    );

    listing.buyBoxScore = Math.round(compositeScore * 100) / 100;
  });

  // Sort descending by Buy Box Score
  listings.sort((a, b) => b.buyBoxScore - a.buyBoxScore);

  // Designate winner
  listings.forEach((l, idx) => {
    l.isWinner = idx === 0;
  });

  const winner = listings[0];
  const competitors = listings.slice(1);

  return {
    productId,
    productTitle: '',
    winner,
    competingListings: competitors,
    totalSellersCount: listings.length,
    priceSpreadINR: maxPrice - minPrice,
    lastRepricedAt: new Date().toISOString()
  };
};

// Retrieve Buy Box result for a given product
export const getProductBuyBox = (product: Product): BuyBoxResult => {
  if (!productListingsMap.has(product.id)) {
    initializeBuyBoxListings([product]);
  }
  const result = evaluateBuyBoxWinner(product.id)!;
  result.productTitle = product.title;
  return result;
};

// Simulate Automated Algorithmic Repricing Round
export const simulateDynamicRepricing = (productId: string): BuyBoxResult | null => {
  const listings = productListingsMap.get(productId);
  if (!listings) return null;

  const currentCheapest = Math.min(...listings.map(l => l.priceINR));

  listings.forEach((listing) => {
    if (listing.repricerStrategy === 'UNDERCUT_50') {
      // Undercut lowest price by ₹50 to win buy box, respecting floor
      const floorPrice = Math.round(listing.originalPriceINR * 0.75);
      const targetPrice = Math.max(floorPrice, currentCheapest - 50);
      listing.priceINR = targetPrice;
      listing.priceUSD = Math.round(targetPrice / 85);
    } else if (listing.repricerStrategy === 'MATCH_LOWEST') {
      // Match lowest price with Prime fast shipping
      listing.priceINR = currentCheapest;
      listing.priceUSD = Math.round(currentCheapest / 85);
    }
  });

  return evaluateBuyBoxWinner(productId);
};

// Initialize default catalog listings upon import
initializeBuyBoxListings();
