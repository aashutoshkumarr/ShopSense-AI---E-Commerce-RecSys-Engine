import { Router, Request, Response } from 'express';
import { darkStoreServiceInstance } from './darkStoreService';

export const groceryRouter = Router();

// List dark stores or resolve by pincode
groceryRouter.get('/dark-stores', (req: Request, res: Response) => {
  const { pincode, lat, lng } = req.query;

  if (pincode || (lat && lng)) {
    const store = darkStoreServiceInstance.resolveDarkStore(
      pincode as string,
      lat ? Number(lat) : undefined,
      lng ? Number(lng) : undefined
    );
    return res.json({ success: true, store });
  }

  const stores = darkStoreServiceInstance.getAllDarkStores();
  return res.json({ success: true, stores });
});

// Check available stock in a store
groceryRouter.get('/inventory/:storeId/:productId', (req: Request, res: Response) => {
  const { storeId, productId } = req.params;
  const availableStock = darkStoreServiceInstance.getAvailableStock(storeId, productId);
  return res.json({ success: true, storeId, productId, availableStock });
});

// Create 10-minute checkout reservation hold
groceryRouter.post('/reserve', (req: Request, res: Response) => {
  const { storeId, productId, quantity } = req.body;
  if (!storeId || !productId || !quantity) {
    return res.status(400).json({ error: 'storeId, productId, and quantity are required' });
  }

  const result = darkStoreServiceInstance.reserveStock(storeId, productId, Number(quantity));
  if (!result.success) {
    return res.status(409).json(result);
  }
  return res.status(201).json(result);
});

// Release reservation
groceryRouter.post('/release', (req: Request, res: Response) => {
  const { reservationId } = req.body;
  if (!reservationId) {
    return res.status(400).json({ error: 'reservationId is required' });
  }
  const released = darkStoreServiceInstance.releaseReservation(reservationId);
  return res.json({ success: released });
});
