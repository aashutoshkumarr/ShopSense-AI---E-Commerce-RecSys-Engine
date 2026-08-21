import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  ArrowUpDown,
  Tag,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Product } from '../types';

interface AdminProductManagerProps {
  onCatalogChanged: () => void;
}

export const AdminProductManager: React.FC<AdminProductManagerProps> = ({ onCatalogChanged }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'active' | 'hidden' | 'discontinued'>('active');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?includeOutOfStock=true');
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load products:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStartEdit = (prod: Product) => {
    setEditingId(prod.id);
    setEditPrice(prod.priceINR);
    setEditStock(prod.stockCount);
    setEditCategory(prod.category);
    setEditStatus(prod.status || 'active');
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceINR: Number(editPrice),
          stockCount: Number(editStock),
          category: editCategory,
          status: editStatus
        })
      });
      if (res.ok) {
        setEditingId(null);
        fetchProducts();
        onCatalogChanged();
      }
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product from the catalog?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        onCatalogChanged();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleQuickStockToggle = async (prod: Product) => {
    const newStock = prod.stockCount > 0 ? 0 : 15;
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCount: newStock })
      });
      if (res.ok) {
        fetchProducts();
        onCatalogChanged();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  // Filtered product listing
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = p.stockCount > 0 && p.inStock;
    if (stockFilter === 'out_of_stock') matchesStock = p.stockCount <= 0 || !p.inStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalSKUs = products.length;
  const outOfStockSKUs = products.filter(p => p.stockCount <= 0 || !p.inStock).length;
  const totalCatalogValueINR = products.reduce((acc, p) => acc + (p.priceINR * p.stockCount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Active SKUs</span>
            <div className="text-2xl font-bold text-white mt-1">{totalSKUs} Products</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Out of Stock Warnings</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{outOfStockSKUs} SKUs</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Catalog Inventory Value</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{(totalCatalogValueINR / 100000).toFixed(2)} Lakhs</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search catalog by title, brand, tag, or spec..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Laptops">Laptops</option>
              <option value="Audio">Audio</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Smart Home">Smart Home</option>
              <option value="Gaming">Gaming</option>
              <option value="Accessories">Accessories</option>
              <option value="Wearables">Wearables</option>
            </select>
          </div>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In-Stock Only</option>
            <option value="out_of_stock">Out-of-Stock Only</option>
          </select>

          <button
            onClick={fetchProducts}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1"
            title="Refresh Catalog"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price (INR)</th>
                <th className="px-4 py-3">Stock Units</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vector Embedding</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(prod => {
                const isEditing = editingId === prod.id;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Title & Image */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img src={prod.imageUrl} alt={prod.title} className="h-10 w-10 rounded-lg object-cover bg-slate-950 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{prod.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="text-cyan-400 font-medium">{prod.brand}</span>
                            <span>&bull;</span>
                            <span>{prod.rating}★ ({prod.reviewCount} revs)</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                        >
                          <option value="Laptops">Laptops</option>
                          <option value="Audio">Audio</option>
                          <option value="Smartphones">Smartphones</option>
                          <option value="Smart Home">Smart Home</option>
                          <option value="Gaming">Gaming</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Wearables">Wearables</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700 font-mono">
                          {prod.category}
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 font-mono font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={e => setEditPrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-cyan-300 text-xs font-mono"
                        />
                      ) : (
                        <div className="text-cyan-300">
                          ₹{prod.priceINR.toLocaleString()}
                          <span className="text-[10px] text-slate-500 ml-1">(${prod.priceUSD})</span>
                        </div>
                      )}
                    </td>

                    {/* Stock Units & Quick In-Stock Toggle */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={e => setEditStock(Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickStockToggle(prod)}
                            title="Click to toggle In/Out of stock"
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border transition ${
                              prod.stockCount > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                            }`}
                          >
                            {prod.stockCount > 0 ? `${prod.stockCount} units` : '0 (Out of stock)'}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as any)}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs"
                        >
                          <option value="active">Active</option>
                          <option value="hidden">Hidden</option>
                          <option value="discontinued">Discontinued</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                          prod.status === 'active' || !prod.status
                            ? 'text-emerald-300 bg-emerald-500/10'
                            : prod.status === 'hidden'
                            ? 'text-amber-300 bg-amber-500/10'
                            : 'text-red-300 bg-red-500/10'
                        }`}>
                          {prod.status || 'active'}
                        </span>
                      )}
                    </td>

                    {/* Embedding Preview */}
                    <td className="px-4 py-3 font-mono text-[10px] text-purple-400 max-w-[130px] truncate">
                      [{prod.embedding.map(v => v.toFixed(1)).join(', ')}]
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(prod.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                            title="Save Changes"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(prod)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Product"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
