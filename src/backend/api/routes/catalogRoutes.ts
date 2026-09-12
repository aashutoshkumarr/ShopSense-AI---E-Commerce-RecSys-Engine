import { Router, Request, Response } from 'express';
import {
  getProductCatalog,
  setProductCatalog,
  generateProductEmbedding,
  getProjectedCatalogEmbeddings
} from '../../../engine/ingestionService';
import { recommendationServiceInstance } from '../../../recommendation/RecommendationService';
import { getProductBuyBox, simulateDynamicRepricing } from '../../../engine/buyBoxService';
import { getSmartProductBundle, getAllCatalogBundles } from '../../../engine/bundleService';
import { Product } from '../../../types';
import { requireRole } from '../../middleware/auth';

export const catalogRouter = Router();

// Catalog query
catalogRouter.get('/products', (req: Request, res: Response) => {
  const { category, brand, search, inStockOnly, maxPrice, includeOutOfStock } = req.query;
  let catalog = getProductCatalog();

  if (includeOutOfStock !== 'true') {
    catalog = catalog.filter(p => p.status !== 'hidden' && p.status !== 'discontinued');
  }

  if (category && typeof category === 'string' && category !== 'All') {
    catalog = catalog.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (brand && typeof brand === 'string' && brand !== 'All') {
    catalog = catalog.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (maxPrice && !isNaN(Number(maxPrice))) {
    catalog = catalog.filter(p => p.priceINR <= Number(maxPrice));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    catalog = catalog.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (inStockOnly === 'true') {
    catalog = catalog.filter(p => p.inStock && p.stockCount > 0);
  }

  res.json({ products: catalog, total: catalog.length });
});

// Single product query
catalogRouter.get('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const catalog = getProductCatalog();
  const product = catalog.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product });
});

// Admin Product Creation
catalogRouter.post('/products', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const {
      title,
      brand,
      category,
      subCategory,
      priceINR,
      priceUSD,
      stockCount = 10,
      imageUrl,
      badge,
      tags = [],
      description,
      specs = {},
      features = []
    } = req.body;

    if (!title || !priceINR) {
      return res.status(400).json({ error: 'Title and priceINR are required' });
    }

    const pTags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim());
    const pDesc = description || `${title} from ${brand}. Verified high-quality item.`;
    const numPriceINR = Number(priceINR);
    const embedding = generateProductEmbedding(title, category || 'Accessories', pTags, pDesc, numPriceINR);

    const newProduct: Product = {
      id: `prod-admin-${Date.now().toString(36)}`,
      title,
      brand: brand || 'CustomBrand',
      category: category || 'Accessories',
      subCategory: subCategory || category || 'Accessories',
      priceINR: numPriceINR,
      priceUSD: Number(priceUSD) || Math.round(numPriceINR / 83.5),
      originalPriceINR: Math.round(numPriceINR * 1.15),
      originalPriceUSD: Math.round((Number(priceUSD) || Math.round(numPriceINR / 83.5)) * 1.15),
      rating: 4.8,
      reviewCount: 1,
      inStock: Number(stockCount) > 0,
      stockCount: Number(stockCount) || 10,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
      badge: badge || 'New',
      tags: pTags,
      description: pDesc,
      specs: specs || { Brand: brand || 'Custom', Category: category || 'Accessories' },
      features: features || ['Full 1-Year Warranty', 'Fast Dispatch'],
      popularityScore: 0.85,
      historicalCTR: 0.05,
      releaseDaysAgo: 0,
      embedding,
      source: 'manual',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const catalog = getProductCatalog();
    setProductCatalog([newProduct, ...catalog]);
    recommendationServiceInstance.setCatalog(getProductCatalog());

    res.status(201).json({ status: 'success', product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// Admin Product Update
catalogRouter.put('/products/:id', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const catalog = getProductCatalog();
    const index = catalog.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = catalog[index];
    const priceINR = updates.priceINR !== undefined ? Number(updates.priceINR) : existing.priceINR;
    const priceUSD = updates.priceUSD !== undefined ? Number(updates.priceUSD) : (updates.priceINR ? Math.round(priceINR / 83.5) : existing.priceUSD);
    const stockCount = updates.stockCount !== undefined ? Number(updates.stockCount) : existing.stockCount;
    const inStock = stockCount > 0;

    const updatedProduct: Product = {
      ...existing,
      ...updates,
      priceINR,
      priceUSD,
      stockCount,
      inStock,
      updatedAt: new Date().toISOString()
    };

    catalog[index] = updatedProduct;
    setProductCatalog([...catalog]);
    recommendationServiceInstance.setCatalog(catalog);

    res.json({ status: 'success', product: updatedProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// Admin Product Deletion
catalogRouter.delete('/products/:id', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const catalog = getProductCatalog();
    const filtered = catalog.filter(p => p.id !== id);

    if (filtered.length === catalog.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    setProductCatalog(filtered);
    recommendationServiceInstance.setCatalog(filtered);

    res.json({ status: 'success', message: 'Product deleted successfully', remainingCount: filtered.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// Amazon Multi-Seller Buy Box
catalogRouter.get('/buybox/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const catalog = getProductCatalog();
  const product = catalog.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: `Product "${productId}" not found` });
  }

  const buyBox = getProductBuyBox(product);
  res.json(buyBox);
});

catalogRouter.post('/buybox/reprice', (req: Request, res: Response) => {
  const { productId } = req.body;
  const updated = simulateDynamicRepricing(productId);
  if (!updated) {
    return res.status(404).json({ error: `Product listings for "${productId}" not found` });
  }
  res.json(updated);
});

// Amazon Frequently Bought Together Bundles
catalogRouter.get('/bundles/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const catalog = getProductCatalog();
  const product = catalog.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: `Could not find product "${productId}"` });
  }

  const bundle = getSmartProductBundle(product, catalog);
  res.json(bundle);
});

catalogRouter.get('/bundles', (req: Request, res: Response) => {
  const catalog = getProductCatalog();
  const bundles = getAllCatalogBundles(catalog);
  res.json({ bundles, count: bundles.length });
});

// 2D PCA Projected Embeddings for Latent Space Map
catalogRouter.get('/embeddings/projected', (req: Request, res: Response) => {
  const projected = getProjectedCatalogEmbeddings();
  res.json({ items: projected, total: projected.length });
});
