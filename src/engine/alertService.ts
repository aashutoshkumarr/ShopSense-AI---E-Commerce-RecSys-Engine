import { PriceAlert, BackInStockAlert, Product } from '../types';

const priceAlertsStore: PriceAlert[] = [
  {
    id: 'pa-001',
    userId: 'user-dev-alex',
    productId: 'prod-lap-01',
    productTitle: 'MacBook Pro 16" M3 Pro 36GB RAM',
    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    currentPriceINR: 249900,
    targetPriceINR: 235000,
    status: 'active',
    createdAt: '2026-08-12T10:00:00Z'
  },
  {
    id: 'pa-002',
    userId: 'user-audio-priya',
    productId: 'prod-aud-01',
    productTitle: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    currentPriceINR: 29990,
    targetPriceINR: 27000,
    status: 'triggered',
    createdAt: '2026-08-01T15:30:00Z',
    triggeredAt: '2026-08-15T08:00:00Z'
  }
];

const stockAlertsStore: BackInStockAlert[] = [
  {
    id: 'sa-001',
    userId: 'user-dev-alex',
    productId: 'prod-acc-02',
    productTitle: 'Logitech MX Master 3S Wireless Performance Mouse',
    productImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    status: 'waiting',
    createdAt: '2026-08-14T11:00:00Z'
  }
];

export function getUserPriceAlerts(userId: string): PriceAlert[] {
  return priceAlertsStore.filter(a => a.userId === userId);
}

export function getUserStockAlerts(userId: string): BackInStockAlert[] {
  return stockAlertsStore.filter(a => a.userId === userId);
}

export function createPriceAlert(
  userId: string,
  product: Product,
  targetPriceINR: number
): PriceAlert {
  const existing = priceAlertsStore.find(a => a.userId === userId && a.productId === product.id && a.status === 'active');
  if (existing) {
    existing.targetPriceINR = targetPriceINR;
    return existing;
  }

  const alert: PriceAlert = {
    id: `pa-${Date.now()}`,
    userId,
    productId: product.id,
    productTitle: product.title,
    productImage: product.imageUrl,
    currentPriceINR: product.priceINR,
    targetPriceINR,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  priceAlertsStore.unshift(alert);
  return alert;
}

export function createStockAlert(
  userId: string,
  product: Product
): BackInStockAlert {
  const existing = stockAlertsStore.find(a => a.userId === userId && a.productId === product.id && a.status === 'waiting');
  if (existing) return existing;

  const alert: BackInStockAlert = {
    id: `sa-${Date.now()}`,
    userId,
    productId: product.id,
    productTitle: product.title,
    productImage: product.imageUrl,
    status: 'waiting',
    createdAt: new Date().toISOString()
  };

  stockAlertsStore.unshift(alert);
  return alert;
}

export function dismissPriceAlert(alertId: string): boolean {
  const alert = priceAlertsStore.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'dismissed';
    return true;
  }
  return false;
}

export function checkAndTriggerPriceAlerts(productId: string, newPriceINR: number): PriceAlert[] {
  const triggered: PriceAlert[] = [];
  priceAlertsStore.forEach(alert => {
    if (alert.productId === productId && alert.status === 'active') {
      alert.currentPriceINR = newPriceINR;
      if (newPriceINR <= alert.targetPriceINR) {
        alert.status = 'triggered';
        alert.triggeredAt = new Date().toISOString();
        triggered.push(alert);
      }
    }
  });
  return triggered;
}
