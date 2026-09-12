import { Router, Request, Response } from 'express';
import { hybridSearchServiceInstance } from './hybridSearchService';

export const searchRouter = Router();

// Execute hybrid lexical + semantic search
searchRouter.post('/hybrid', (req: Request, res: Response) => {
  try {
    const { query, category, maxPriceINR, limit } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = hybridSearchServiceInstance.executeHybridSearch({
      query,
      category,
      maxPriceINR: maxPriceINR ? Number(maxPriceINR) : undefined,
      limit: limit ? Number(limit) : 20
    });

    return res.json({
      success: true,
      query,
      count: results.length,
      results
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Hybrid search execution failed' });
  }
});
