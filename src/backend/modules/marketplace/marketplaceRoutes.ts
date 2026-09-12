import { Router, Request, Response } from 'express';
import { marketplaceRiskServiceInstance } from './marketplaceRiskService';

export const marketplaceRouter = Router();

// Browse marketplace listings
marketplaceRouter.get('/listings', (req: Request, res: Response) => {
  const { category, condition, maxPriceINR } = req.query;
  let listings = marketplaceRiskServiceInstance.getAllListings();

  if (category) {
    listings = listings.filter(l => l.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (condition) {
    listings = listings.filter(l => l.condition === condition);
  }
  if (maxPriceINR) {
    listings = listings.filter(l => l.askingPriceINR <= Number(maxPriceINR));
  }

  // Only return allowed or manual review listings to consumer feed
  return res.json({ success: true, count: listings.length, listings });
});

// Post a new listing with automated ML fraud risk evaluation
marketplaceRouter.post('/listings', (req: Request, res: Response) => {
  try {
    const {
      sellerId,
      sellerName,
      title,
      category,
      askingPriceINR,
      marketBenchmarkPriceINR,
      condition,
      locationCity,
      imageUrl,
      description
    } = req.body;

    if (!sellerId || !title || !askingPriceINR) {
      return res.status(400).json({ error: 'sellerId, title, and askingPriceINR are required' });
    }

    const listing = marketplaceRiskServiceInstance.createListing({
      sellerId,
      sellerName: sellerName || 'Community Member',
      title,
      category: category || 'Electronics',
      askingPriceINR: Number(askingPriceINR),
      marketBenchmarkPriceINR: marketBenchmarkPriceINR ? Number(marketBenchmarkPriceINR) : undefined,
      condition: condition || 'good',
      locationCity: locationCity || 'Bengaluru',
      imageUrl,
      description: description || 'Pre-owned item'
    });

    return res.status(201).json({ success: true, listing });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create listing' });
  }
});

// Check fraud / trust score
marketplaceRouter.get('/listings/:id/trust-score', (req: Request, res: Response) => {
  const listing = marketplaceRiskServiceInstance.getListing(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  return res.json({
    id: listing.id,
    trustScore: listing.trustScore,
    fraudRiskScore: listing.fraudRiskScore,
    decision: listing.moderationStatus,
    reasons: listing.moderationReasons
  });
});
