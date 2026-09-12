export type ItemCondition = 'brand_new' | 'like_new' | 'good' | 'fair';

export type ModerationDecision = 'ALLOW' | 'MANUAL_REVIEW' | 'BLOCK';

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  category: string;
  askingPriceINR: number;
  marketBenchmarkPriceINR: number;
  condition: ItemCondition;
  locationCity: string;
  imageUrl?: string;
  description: string;
  trustScore: number; // 0 to 100
  fraudRiskScore: number; // 0 to 1 (higher = riskier)
  moderationStatus: ModerationDecision;
  moderationReasons: string[];
  createdAt: string;
}

export interface SellerProfile {
  sellerId: string;
  sellerName: string;
  accountAgeDays: number;
  completedSales: number;
  rating: number;
  hasVerifiedPhone: boolean;
  hasVerifiedKyc: boolean;
  disputeRate: number; // 0 to 1
}

export class MarketplaceRiskService {
  private listings: Map<string, MarketplaceListing> = new Map();
  private sellers: Map<string, SellerProfile> = new Map();

  constructor() {
    this.seedMockSellersAndListings();
  }

  private seedMockSellersAndListings() {
    const verifiedSeller: SellerProfile = {
      sellerId: 'sel-blr-01',
      sellerName: 'Vikram Mehta',
      accountAgeDays: 420,
      completedSales: 28,
      rating: 4.9,
      hasVerifiedPhone: true,
      hasVerifiedKyc: true,
      disputeRate: 0.01
    };
    this.sellers.set(verifiedSeller.sellerId, verifiedSeller);

    const listing1: MarketplaceListing = {
      id: 'list-p2p-001',
      sellerId: 'sel-blr-01',
      sellerName: 'Vikram Mehta',
      title: 'Apple MacBook Air M2 (16GB RAM, 512GB SSD) - Space Grey',
      category: 'Laptops',
      askingPriceINR: 78000,
      marketBenchmarkPriceINR: 95000,
      condition: 'like_new',
      locationCity: 'Bengaluru (Indiranagar)',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      description: 'Used for 6 months for light coding. Battery health 98%, zero scratches. Original box and 67W MagSafe charger included.',
      trustScore: 94,
      fraudRiskScore: 0.06,
      moderationStatus: 'ALLOW',
      moderationReasons: ['Verified KYC seller', 'Price matches fair second-hand depreciation'],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    };
    this.listings.set(listing1.id, listing1);
  }

  /**
   * Computes multi-factor fraud risk score and trust score for a listing.
   */
  public evaluateListingRisk(params: {
    sellerId: string;
    title: string;
    category: string;
    askingPriceINR: number;
    marketBenchmarkPriceINR?: number;
    condition: ItemCondition;
  }): {
    trustScore: number;
    fraudRiskScore: number;
    decision: ModerationDecision;
    reasons: string[];
  } {
    const seller = this.sellers.get(params.sellerId) || {
      sellerId: params.sellerId,
      sellerName: 'New Community Seller',
      accountAgeDays: 1,
      completedSales: 0,
      rating: 4.0,
      hasVerifiedPhone: true,
      hasVerifiedKyc: false,
      disputeRate: 0.0
    };

    const benchmark = params.marketBenchmarkPriceINR || params.askingPriceINR;
    const priceRatio = params.askingPriceINR / Math.max(1, benchmark);
    const reasons: string[] = [];
    let risk = 0.1; // Base risk

    // 1. Price Anomaly Detection
    if (priceRatio < 0.25) {
      // e.g. An iPhone 15 Pro listed for 10% of retail price
      risk += 0.65;
      reasons.push(`Extreme price discount (${Math.round((1 - priceRatio) * 100)}% below market benchmark): potential counterfeit or bait-and-switch.`);
    } else if (priceRatio < 0.45) {
      risk += 0.25;
      reasons.push('Significantly below market second-hand value.');
    } else {
      reasons.push('Asking price aligns with realistic secondary market depreciation.');
    }

    // 2. Seller Trust Profile Evaluation
    if (!seller.hasVerifiedKyc) {
      risk += 0.15;
      reasons.push('Seller identity not yet KYC verified.');
    } else {
      risk -= 0.1;
      reasons.push('Verified Aadhaar/PAN KYC seller identity.');
    }

    if (seller.accountAgeDays < 7) {
      risk += 0.15;
      reasons.push('New account created less than 7 days ago.');
    } else if (seller.completedSales >= 5 && seller.rating >= 4.5) {
      risk -= 0.15;
      reasons.push(`Top-rated seller with ${seller.completedSales} completed transactions.`);
    }

    // Clamp risk [0, 1]
    const finalRiskScore = Math.min(1, Math.max(0, parseFloat(risk.toFixed(2))));
    const trustScore = Math.round((1 - finalRiskScore) * 100);

    let decision: ModerationDecision = 'ALLOW';
    if (finalRiskScore >= 0.7) {
      decision = 'BLOCK';
    } else if (finalRiskScore >= 0.35) {
      decision = 'MANUAL_REVIEW';
    }

    return {
      trustScore,
      fraudRiskScore: finalRiskScore,
      decision,
      reasons
    };
  }

  public createListing(params: {
    sellerId: string;
    sellerName: string;
    title: string;
    category: string;
    askingPriceINR: number;
    marketBenchmarkPriceINR?: number;
    condition: ItemCondition;
    locationCity: string;
    imageUrl?: string;
    description: string;
  }): MarketplaceListing {
    const evaluation = this.evaluateListingRisk({
      sellerId: params.sellerId,
      title: params.title,
      category: params.category,
      askingPriceINR: params.askingPriceINR,
      marketBenchmarkPriceINR: params.marketBenchmarkPriceINR,
      condition: params.condition
    });

    const id = `list_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const listing: MarketplaceListing = {
      id,
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      title: params.title,
      category: params.category,
      askingPriceINR: params.askingPriceINR,
      marketBenchmarkPriceINR: params.marketBenchmarkPriceINR || params.askingPriceINR * 1.3,
      condition: params.condition,
      locationCity: params.locationCity,
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
      description: params.description,
      trustScore: evaluation.trustScore,
      fraudRiskScore: evaluation.fraudRiskScore,
      moderationStatus: evaluation.decision,
      moderationReasons: evaluation.reasons,
      createdAt: new Date().toISOString()
    };

    this.listings.set(id, listing);
    return listing;
  }

  public getAllListings(): MarketplaceListing[] {
    return Array.from(this.listings.values());
  }

  public getListing(id: string): MarketplaceListing | undefined {
    return this.listings.get(id);
  }
}

export const marketplaceRiskServiceInstance = new MarketplaceRiskService();
