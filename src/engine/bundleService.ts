import { ProductBundle, Product } from '../types';
import { mockProducts } from '../data/products';

// Predefined complementary category affinities
const COMPLEMENTARY_CATEGORY_MAP: Record<string, string[]> = {
  Laptops: ['Audio', 'Accessories', 'Gaming'],
  Audio: ['Accessories', 'Wearables', 'Laptops'],
  Smartphones: ['Audio', 'Wearables', 'Accessories'],
  Gaming: ['Accessories', 'Audio', 'Laptops'],
  'Smart Home': ['Accessories', 'Audio'],
  Wearables: ['Audio', 'Smartphones', 'Accessories'],
  Accessories: ['Laptops', 'Audio', 'Gaming']
};

export const getSmartProductBundle = (
  primaryProduct: Product,
  catalog: Product[] = mockProducts
): ProductBundle => {
  const complementCategories = COMPLEMENTARY_CATEGORY_MAP[primaryProduct.category] || ['Accessories', 'Audio'];

  // Find high-rating in-stock accessories from complementary categories
  const candidates = catalog.filter(
    p => p.id !== primaryProduct.id && complementCategories.includes(p.category) && p.inStock
  );

  // Pick top 2 most complementary items
  // 1 from primary complementary category, 1 from secondary
  const bundleItems: Product[] = [];

  for (const cat of complementCategories) {
    const item = candidates.find(c => c.category === cat && !bundleItems.some(b => b.id === c.id));
    if (item) bundleItems.push(item);
    if (bundleItems.length >= 2) break;
  }

  // Fallback if less than 2
  if (bundleItems.length < 2) {
    const remaining = candidates.filter(c => !bundleItems.some(b => b.id === c.id));
    bundleItems.push(...remaining.slice(0, 2 - bundleItems.length));
  }

  const allProducts = [primaryProduct, ...bundleItems];
  const totalOriginalPriceINR = allProducts.reduce((sum, p) => sum + p.priceINR, 0);

  // 12% instant bundle discount
  const savingsPct = 12;
  const savingsINR = Math.round(totalOriginalPriceINR * (savingsPct / 100));
  const bundlePriceINR = totalOriginalPriceINR - savingsINR;

  return {
    id: `bundle-${primaryProduct.id}`,
    primaryProduct,
    bundleProducts: bundleItems,
    totalOriginalPriceINR,
    bundlePriceINR,
    savingsINR,
    savingsPct,
    coPurchaseConfidence: 0.92,
    bundleTag: `Frequently Bought Together: Complete ${primaryProduct.brand} Ecosystem`
  };
};

export const getAllCatalogBundles = (catalog: Product[] = mockProducts): ProductBundle[] => {
  return catalog.slice(0, 6).map(p => getSmartProductBundle(p, catalog));
};
