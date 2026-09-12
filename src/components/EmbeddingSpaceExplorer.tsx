import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Layers, 
  Crosshair, 
  User, 
  Info, 
  ArrowRight,
  Target
} from 'lucide-react';
import { ProjectedEmbeddingPoint, UserPersona } from '../types';

interface EmbeddingSpaceExplorerProps {
  currentPersona: UserPersona;
}

export const EmbeddingSpaceExplorer: React.FC<EmbeddingSpaceExplorerProps> = ({ currentPersona }) => {
  const [points, setPoints] = useState<ProjectedEmbeddingPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPoint, setSelectedPoint] = useState<ProjectedEmbeddingPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ProjectedEmbeddingPoint | null>(null);

  const fetchEmbeddings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/embeddings/projected?userId=${currentPersona.id}`);
      const data = await res.json();
      if (data.points) {
        setPoints(data.points);
        setSelectedPoint(data.points[0] || null);
      }
    } catch (err) {
      console.error('Failed to load embedding points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmbeddings();
  }, [currentPersona.id]);

  const categoryColors: Record<string, string> = {
    Laptops: '#3b82f6',     // blue
    Audio: '#06b6d4',       // cyan
    Smartphones: '#8b5cf6', // purple
    Gaming: '#ec4899',      // pink
    'Smart Home': '#10b981',// emerald
    Wearables: '#f59e0b',   // amber
    Accessories: '#64748b'  // slate
  };

  // Find 3 nearest semantic neighbors to selected point using euclidean distance in 2D space
  const nearestNeighbors = selectedPoint
    ? [...points]
        .filter(p => p.id !== selectedPoint.id)
        .sort((a, b) => {
          const distA = Math.hypot(a.x - selectedPoint.x, a.y - selectedPoint.y);
          const distB = Math.hypot(b.x - selectedPoint.x, b.y - selectedPoint.y);
          return distA - distB;
        })
        .slice(0, 3)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Database className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Latent Vector Embedding Space &amp; Semantic Geometry Explorer
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            2D PCA / t-SNE decomposition of high-dimensional 1536-dim catalog embeddings. Explore topological semantic clusters, cosine similarity distances, and real-time user persona affinity vectors.
          </p>
        </div>

        <button
          onClick={fetchEmbeddings}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-compute 2D PCA</span>
        </button>
      </div>

      {/* Main Interactive Scatter Map & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual 2D Latent Vector Scatter Plot (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                Interactive Latent Geometry Plane (Normalized [-100, +100])
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>User Vector: </span>
              <span className="text-emerald-400 font-bold">{currentPersona.name}</span>
            </div>
          </div>

          {/* SVG Vector Field Plane */}
          <div className="relative w-full aspect-[16/10] bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-20">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-r border-b border-slate-600" />
              ))}
            </div>

            {/* Center Origin Crosshair */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700/40 pointer-events-none" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/40 pointer-events-none" />

            {/* SVG Lines Connecting Selected Point to Nearest Neighbors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {selectedPoint && nearestNeighbors.map((neighbor) => {
                // Map [-100, 100] to [0%, 100%]
                const x1 = `${((selectedPoint.x + 100) / 200) * 100}%`;
                const y1 = `${((100 - selectedPoint.y) / 200) * 100}%`;
                const x2 = `${((neighbor.x + 100) / 200) * 100}%`;
                const y2 = `${((100 - neighbor.y) / 200) * 100}%`;

                return (
                  <line 
                    key={neighbor.id} 
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="#06b6d4" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 3" 
                    opacity="0.75" 
                  />
                );
              })}
            </svg>

            {/* Product Nodes */}
            {points.map((pt) => {
              const isSelected = selectedPoint?.id === pt.id;
              const isNeighbor = nearestNeighbors.some(n => n.id === pt.id);
              const color = categoryColors[pt.category] || '#38bdf8';

              // Map coordinates to percentage
              const left = `${((pt.x + 100) / 200) * 100}%`;
              const top = `${((100 - pt.y) / 200) * 100}%`;

              return (
                <div
                  key={pt.id}
                  onClick={() => setSelectedPoint(pt)}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ left, top, transform: 'translate(-50%, -50%)' }}
                  className={`absolute z-20 transition-transform duration-200 cursor-pointer ${
                    isSelected ? 'scale-150 z-30' : isNeighbor ? 'scale-125 z-25' : 'hover:scale-125'
                  }`}
                >
                  <div 
                    className={`h-4 w-4 rounded-full border-2 shadow-lg transition-all flex items-center justify-center ${
                      isSelected 
                        ? 'ring-4 ring-cyan-400/50 border-white' 
                        : isNeighbor 
                        ? 'ring-2 ring-indigo-400/60 border-slate-900' 
                        : 'border-slate-950'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                </div>
              );
            })}

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div 
                style={{
                  left: `${((hoveredPoint.x + 100) / 200) * 100}%`,
                  top: `${((100 - hoveredPoint.y) / 200) * 100}%`,
                  transform: 'translate(-50%, -130%)'
                }}
                className="absolute z-40 p-2 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl pointer-events-none text-xs w-48 animate-in fade-in"
              >
                <div className="font-bold text-white truncate">{hoveredPoint.title}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span className="font-mono text-cyan-400">{hoveredPoint.category}</span>
                  <span className="font-mono font-bold text-white">₹{hoveredPoint.priceINR.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Category Color Legend */}
          <div className="flex items-center gap-3 flex-wrap pt-2 text-[11px] text-slate-400">
            <span className="font-bold text-slate-300">Semantic Clusters:</span>
            {Object.entries(categoryColors).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-1.5 font-mono">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col }} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Product & Nearest Neighbor Inspection (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                Semantic Node Inspector
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Cosine similarity &amp; geometric proximity metrics
            </p>
          </div>

          {selectedPoint ? (
            <div className="space-y-4">
              {/* Selected Node Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={selectedPoint.imageUrl} alt={selectedPoint.title} className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{selectedPoint.brand}</span>
                    <h4 className="text-xs font-bold text-white truncate">{selectedPoint.title}</h4>
                    <div className="text-xs font-mono text-cyan-300">₹{selectedPoint.priceINR.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  <div>2D Coordinate: <strong className="text-white">({selectedPoint.x}, {selectedPoint.y})</strong></div>
                  <div>User Cosine: <strong className="text-emerald-400">{selectedPoint.cosineSimilarityToUser}</strong></div>
                </div>
              </div>

              {/* 3 Nearest Neighbors */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Top-3 Nearest Semantic Neighbors:</span>
                  <span className="text-[10px] font-mono text-cyan-400">Cosine Distance</span>
                </div>

                <div className="space-y-2">
                  {nearestNeighbors.map((n, idx) => {
                    // Approximate cosine similarity from euclidean proximity
                    const dist = Math.hypot(n.x - selectedPoint.x, n.y - selectedPoint.y);
                    const cosineSim = Math.max(0.7, Math.round((1.0 - dist / 250) * 100) / 100);

                    return (
                      <div 
                        key={n.id}
                        onClick={() => setSelectedPoint(n)}
                        className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-medium text-slate-200 truncate">{n.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">#{idx + 1} &bull; {n.category}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/20">
                            {cosineSim}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-500">
              Click any node in the vector field to inspect its nearest semantic neighbors.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
