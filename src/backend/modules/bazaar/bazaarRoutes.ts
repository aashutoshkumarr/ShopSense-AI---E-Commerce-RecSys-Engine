import { Router, Request, Response } from 'express';
import { bazaarValueServiceInstance } from './bazaarValueService';

export const bazaarRouter = Router();

// Get ranked bazaar deals with algorithmic ValueScore
bazaarRouter.get('/deals', (req: Request, res: Response) => {
  const { tier } = req.query;
  const deals = bazaarValueServiceInstance.getRankedBazaarDeals(tier ? Number(tier) : undefined);
  return res.json({ success: true, count: deals.length, deals });
});

// Calculate progressive multi-buy savings
bazaarRouter.post('/multi-buy/calculate', (req: Request, res: Response) => {
  const { itemPrices } = req.body;
  if (!Array.isArray(itemPrices)) {
    return res.status(400).json({ error: 'itemPrices must be an array of numbers' });
  }

  const calculation = bazaarValueServiceInstance.calculateMultiBuyDiscount(itemPrices.map(Number));
  return res.json({ success: true, calculation });
});
