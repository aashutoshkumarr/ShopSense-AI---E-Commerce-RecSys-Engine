export interface DarkStore {
  id: string;
  name: string;
  cluster: string;
  pincodes: string[];
  lat: number;
  lng: number;
  activeRiders: number;
  deliverySlaMinutes: number;
  operatingStatus: 'ONLINE' | 'BUSY' | 'CLOSED';
}

export interface StockReservation {
  reservationId: string;
  storeId: string;
  productId: string;
  quantity: number;
  expiresAt: number; // timestamp
}

export class DarkStoreService {
  private stores: DarkStore[] = [
    {
      id: 'ds-blr-014',
      name: 'Indiranagar Dark Store #14',
      cluster: 'Bengaluru East',
      pincodes: ['560038', '560008', '560075'],
      lat: 12.9784,
      lng: 77.6408,
      activeRiders: 18,
      deliverySlaMinutes: 8,
      operatingStatus: 'ONLINE'
    },
    {
      id: 'ds-blr-008',
      name: 'Koramangala Dark Store #08',
      cluster: 'Bengaluru South',
      pincodes: ['560034', '560095', '560047'],
      lat: 12.9352,
      lng: 77.6245,
      activeRiders: 22,
      deliverySlaMinutes: 9,
      operatingStatus: 'ONLINE'
    },
    {
      id: 'ds-blr-021',
      name: 'Whitefield Tech Corridor Hub #21',
      cluster: 'Bengaluru Tech Corridor',
      pincodes: ['560066', '560048', '560087'],
      lat: 12.9698,
      lng: 77.7499,
      activeRiders: 15,
      deliverySlaMinutes: 11,
      operatingStatus: 'ONLINE'
    }
  ];

  // Store-level inventory counts: key = `${storeId}:${productId}` -> count
  private inventoryMap: Map<string, number> = new Map();
  // Active reservations: key = reservationId -> StockReservation
  private reservations: Map<string, StockReservation> = new Map();

  constructor() {
    this.initStock();
  }

  private initStock() {
    // Seed initial stock for essential groceries
    const groceryProdIds = [
      'prod-groc-01', 'prod-groc-02', 'prod-groc-03', 'prod-groc-04',
      'prod-groc-05', 'prod-groc-06', 'prod-groc-07', 'prod-groc-08'
    ];
    this.stores.forEach(store => {
      groceryProdIds.forEach(id => {
        this.inventoryMap.set(`${store.id}:${id}`, Math.floor(Math.random() * 40) + 20);
      });
    });
  }

  public getAllDarkStores(): DarkStore[] {
    return this.stores;
  }

  /**
   * Resolves the nearest active dark store by user postal pincode or coordinates.
   */
  public resolveDarkStore(pincode?: string, lat?: number, lng?: number): DarkStore {
    if (pincode) {
      const match = this.stores.find(s => s.pincodes.includes(pincode.trim()));
      if (match) return match;
    }

    if (lat !== undefined && lng !== undefined) {
      // Euclidean distance approximation
      let closest = this.stores[0];
      let minDistance = Infinity;
      this.stores.forEach(s => {
        const dist = Math.hypot(s.lat - lat, s.lng - lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = s;
        }
      });
      return closest;
    }

    // Default primary hub
    return this.stores[0];
  }

  /**
   * Gets available stock for a product in a given dark store, accounting for active holds.
   */
  public getAvailableStock(storeId: string, productId: string): number {
    const rawStock = this.inventoryMap.get(`${storeId}:${productId}`) ?? 35;
    
    // Deduct unexpired holds
    const now = Date.now();
    let reservedQty = 0;
    for (const res of this.reservations.values()) {
      if (res.storeId === storeId && res.productId === productId && res.expiresAt > now) {
        reservedQty += res.quantity;
      }
    }

    return Math.max(0, rawStock - reservedQty);
  }

  /**
   * Creates a temporary stock reservation for 10 minutes during grocery checkout.
   */
  public reserveStock(storeId: string, productId: string, quantity: number): { success: boolean; reservationId?: string; error?: string } {
    const available = this.getAvailableStock(storeId, productId);
    if (available < quantity) {
      return { success: false, error: `Only ${available} units available in ${storeId}` };
    }

    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.reservations.set(reservationId, {
      reservationId,
      storeId,
      productId,
      quantity,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes hold
    });

    return { success: true, reservationId };
  }

  public releaseReservation(reservationId: string): boolean {
    return this.reservations.delete(reservationId);
  }
}

export const darkStoreServiceInstance = new DarkStoreService();
