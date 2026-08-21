import React, { useState } from 'react';
import { 
  DownloadCloud, 
  Upload, 
  FileSpreadsheet, 
  FileCode, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Cpu, 
  Database, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IngestionJob, Product } from '../types';

interface ProductIngestionHubProps {
  onIngestSuccess: () => void;
}

export const ProductIngestionHub: React.FC<ProductIngestionHubProps> = ({ onIngestSuccess }) => {
  const [activeTab, setActiveTab] = useState<'dummyjson' | 'upload' | 'manual'>('dummyjson');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeJob, setActiveJob] = useState<IngestionJob | null>(null);
  const [addedProductsPreview, setAddedProductsPreview] = useState<Product[]>([]);

  // CSV/JSON text state
  const [rawText, setRawText] = useState<string>('');
  const [uploadFormat, setUploadFormat] = useState<'json' | 'csv'>('json');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manual creation form state
  const [manualForm, setManualForm] = useState({
    title: '',
    brand: '',
    category: 'Laptops',
    priceINR: 65000,
    stockCount: 15,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    tags: 'coding, ultrabook, 16gb ram'
  });

  const ingestionSteps = [
    { title: '1. External Catalog Request', desc: 'Querying DummyJSON API endpoints / categories' },
    { title: '2. Schema Validation', desc: 'Enforcing required types, price integrity, & non-null fields' },
    { title: '3. Currency & Category Normalization', desc: 'Converting USD -> INR (@ 83.5) & mapping to catalog taxonomy' },
    { title: '4. Title Deduplication', desc: 'Checking PostgreSQL unique constraints against existing catalog' },
    { title: '5. 8-Dim Embedding Generation', desc: 'Computing semantic text vectors across [Dev, Audio, Gaming, Portability...]' },
    { title: '6. pgvector Semantic Indexing', desc: 'Updating high-dimensional candidate retrieval space' }
  ];

  // DummyJSON Ingestion Handler
  const handleDummyJSONIngest = async () => {
    setIsIngesting(true);
    setCurrentStepIndex(0);
    setActiveJob(null);
    setAddedProductsPreview([]);

    // Step-by-step UI animation
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < ingestionSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const res = await fetch('/api/admin/ingest/dummyjson', { method: 'POST' });
      const data = await res.json();

      setTimeout(() => {
        clearInterval(stepInterval);
        setCurrentStepIndex(ingestionSteps.length);
        setIsIngesting(false);
        setActiveJob(data.job);
        setAddedProductsPreview(data.addedProducts || []);
        onIngestSuccess();

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }, 3600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsIngesting(false);
      console.error('Ingestion failed:', err);
    }
  };

  // Custom Upload Handler
  const handleCustomUpload = async () => {
    if (!rawText.trim()) {
      setUploadError('Please provide JSON or CSV data.');
      return;
    }

    setUploadError(null);
    setIsIngesting(true);

    try {
      const res = await fetch('/api/admin/ingest/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: rawText, format: uploadFormat })
      });
      const data = await res.json();
      setIsIngesting(false);
      setActiveJob(data.job);
      setAddedProductsPreview(data.addedProducts || []);
      onIngestSuccess();

      if (data.job?.status === 'completed') {
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err: any) {
      setIsIngesting(false);
      setUploadError(err.message || 'Upload failed');
    }
  };

  // Manual Product Creation Handler
  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIngesting(true);

    try {
      const tagsArray = manualForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualForm.title,
          brand: manualForm.brand,
          category: manualForm.category,
          priceINR: Number(manualForm.priceINR),
          stockCount: Number(manualForm.stockCount),
          description: manualForm.description,
          imageUrl: manualForm.imageUrl,
          tags: tagsArray
        })
      });

      const data = await res.json();
      setIsIngesting(false);
      onIngestSuccess();
      setAddedProductsPreview([data.product]);
      setActiveJob({
        id: `job-manual-${Date.now()}`,
        source: 'manual',
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        itemsFetched: 1,
        itemsValidated: 1,
        itemsNormalized: 1,
        itemsDeduplicated: 0,
        embeddingsGenerated: 1,
        itemsIndexed: 1,
        errors: [],
        logs: [`Product "${manualForm.title}" manually registered and embedded.`]
      });

      confetti({ particleCount: 50 });
    } catch (err: any) {
      setIsIngesting(false);
      console.error('Failed to create manual product:', err);
    }
  };

  const sampleJSON = `[
  {
    "title": "Bose QuietComfort Ultra Headphones",
    "brand": "Bose",
    "category": "Audio",
    "priceINR": 35990,
    "stockCount": 18,
    "description": "Spatialized audio, world-class noise cancellation, CustomTune technology.",
    "tags": ["audio", "anc", "spatial", "wireless"]
  }
]`;

  const sampleCSV = `title,brand,category,priceINR,stock,tags,description
Logitech MX Mechanical Mini,Logitech,Accessories,13995,25,keyboard;wireless;low-profile,Tactile low profile quiet mechanical switches with smart illumination.
Samsung Galaxy S24 Ultra,Samsung,Smartphones,129999,12,ai;titanium;oled;camera,Galaxy AI built-in with 200MP camera and Snapdragon 8 Gen 3.`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Product Ingestion &amp; Vector Indexer</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-source pipeline: External Catalog (DummyJSON) &bull; CSV/JSON Upload &bull; Schema Validation &bull; Embedding Generation &bull; pgvector Indexing
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dummyjson')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'dummyjson'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DownloadCloud className="h-3.5 w-3.5" />
            DummyJSON Ingestion
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            CSV / JSON Upload
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Tab 1: DummyJSON Ingestion Flow */}
      {activeTab === 'dummyjson' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Action Card */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                  External Data Source
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono border border-emerald-500/20">
                  Ready to Sync
                </span>
              </div>

              <h2 className="text-lg font-bold text-white">DummyJSON Product Catalog</h2>
              
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects to the external DummyJSON REST API to pull real e-commerce data (laptops, audio, smartphones, accessories, watches, smart-home). Automatically transforms schema, normalizes currencies to INR &amp; USD, validates inventory counts, calculates 8-dimensional semantic embeddings, and indexes into pgvector.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Source Endpoint:</span>
                  <span className="font-mono text-slate-300">dummyjson.com/products</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Currency Conversion:</span>
                  <span className="font-mono text-cyan-300">USD &times; 83.5 &rarr; INR</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Deduplication Key:</span>
                  <span className="font-mono text-amber-300">LOWER(title.trim())</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Vector Embedding:</span>
                  <span className="font-mono text-purple-300">8-dim pgvector space</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                id="start-dummyjson-ingestion-btn"
                onClick={handleDummyJSONIngest}
                disabled={isIngesting}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                  isIngesting
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/20 hover:scale-[1.01]'
                }`}
              >
                {isIngesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
                    <span>Executing Ingestion Pipeline...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4" />
                    <span>Trigger DummyJSON Ingestion Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pipeline Visualizer Steps */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              Ingestion Execution Waterfall
            </h3>

            <div className="space-y-3">
              {ingestionSteps.map((step, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex && isIngesting;
                const isPending = idx > currentStepIndex;

                return (
                  <div
                    key={step.title}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isPast
                        ? 'bg-slate-950/90 border-emerald-500/30 text-slate-200'
                        : isCurrent
                        ? 'bg-indigo-950/60 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPast
                            ? 'bg-emerald-500 text-slate-950'
                            : isCurrent
                            ? 'bg-cyan-500 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isPast ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isPast ? 'text-emerald-300' : isCurrent ? 'text-cyan-300' : 'text-slate-400'}`}>
                            {step.title}
                          </div>
                          <div className="text-[11px] text-slate-400">{step.desc}</div>
                        </div>
                      </div>

                      {isPast && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          SUCCESS
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          RUNNING
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Custom CSV / JSON Upload */}
      {activeTab === 'upload' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Batch Upload Catalog (CSV or JSON)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste your product dataset to run validation, currency normalization, deduplication, and vector indexing.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUploadFormat('json');
                  setRawText(sampleJSON);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border ${
                  uploadFormat === 'json' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Load Sample JSON
              </button>
              <button
                onClick={() => {
                  setUploadFormat('csv');
                  setRawText(sampleCSV);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border ${
                  uploadFormat === 'csv' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Load Sample CSV
              </button>
            </div>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Paste raw ${uploadFormat.toUpperCase()} here...`}
            rows={10}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
          />

          {uploadError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleCustomUpload}
              disabled={isIngesting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md flex items-center gap-2"
            >
              {isIngesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>Validate &amp; Ingest Batch</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Manual Product Creation */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualCreate} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-white">Register New Product Manually</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Product Title *</label>
              <input
                type="text"
                required
                value={manualForm.title}
                onChange={e => setManualForm({ ...manualForm, title: e.target.value })}
                placeholder="e.g. ThinkPad X1 Carbon Gen 12"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Brand *</label>
              <input
                type="text"
                required
                value={manualForm.brand}
                onChange={e => setManualForm({ ...manualForm, brand: e.target.value })}
                placeholder="e.g. Lenovo"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Category *</label>
              <select
                value={manualForm.category}
                onChange={e => setManualForm({ ...manualForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Laptops">Laptops</option>
                <option value="Audio">Audio</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Smart Home">Smart Home</option>
                <option value="Gaming">Gaming</option>
                <option value="Accessories">Accessories</option>
                <option value="Wearables">Wearables</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Price (INR ₹) *</label>
              <input
                type="number"
                required
                value={manualForm.priceINR}
                onChange={e => setManualForm({ ...manualForm, priceINR: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Stock Units *</label>
              <input
                type="number"
                required
                value={manualForm.stockCount}
                onChange={e => setManualForm({ ...manualForm, stockCount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Tags (comma-separated)</label>
              <input
                type="text"
                value={manualForm.tags}
                onChange={e => setManualForm({ ...manualForm, tags: e.target.value })}
                placeholder="coding, oled, 16gb ram"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-slate-400 mb-1 font-medium">Image URL</label>
              <input
                type="text"
                value={manualForm.imageUrl}
                onChange={e => setManualForm({ ...manualForm, imageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-slate-400 mb-1 font-medium">Description</label>
              <textarea
                rows={2}
                value={manualForm.description}
                onChange={e => setManualForm({ ...manualForm, description: e.target.value })}
                placeholder="Describe key specs, target users, and capabilities..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isIngesting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-2"
            >
              {isIngesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              <span>Save &amp; Generate Vector Embedding</span>
            </button>
          </div>
        </form>
      )}

      {/* Ingestion Job Audit Summary */}
      {activeJob && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Ingestion Job Completed: {activeJob.id}</h3>
            </div>
            <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              STATUS: {activeJob.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Fetched</span>
              <strong className="text-base font-bold text-white">{activeJob.itemsFetched}</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Validated</span>
              <strong className="text-base font-bold text-cyan-300">{activeJob.itemsValidated}</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Normalized</span>
              <strong className="text-base font-bold text-indigo-300">{activeJob.itemsNormalized}</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Deduplicated</span>
              <strong className="text-base font-bold text-amber-300">{activeJob.itemsDeduplicated}</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Embeddings</span>
              <strong className="text-base font-bold text-purple-300">{activeJob.embeddingsGenerated}</strong>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">pgvector Indexed</span>
              <strong className="text-base font-bold text-emerald-300">{activeJob.itemsIndexed}</strong>
            </div>
          </div>

          {/* Newly Ingested Product Cards Preview */}
          {addedProductsPreview.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Recently Ingested Products ({addedProductsPreview.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {addedProductsPreview.slice(0, 6).map(prod => (
                  <div key={prod.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <img src={prod.imageUrl} alt={prod.title} className="h-12 w-12 rounded-lg object-cover bg-slate-900" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{prod.title}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">₹{prod.priceINR.toLocaleString()} &bull; {prod.stockCount} in stock</div>
                      <div className="text-[10px] text-purple-400 font-mono truncate">Vector: [{prod.embedding.map(v => v.toFixed(1)).join(', ')}]</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
