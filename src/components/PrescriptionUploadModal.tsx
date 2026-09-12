import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ShoppingBag,
  Clock,
  AlertCircle,
  ScanLine
} from 'lucide-react';
import { Product, Currency } from '../types';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
  currency: Currency;
}

interface ExtractedMedicine {
  id: string;
  name: string;
  dosage: string;
  matchedProductId?: string;
  product?: Product;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onAddToCart,
  currency
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [selectedSample, setSelectedSample] = useState<'sample1' | 'sample2' | 'custom'>('sample1');
  const [extractedList, setExtractedList] = useState<ExtractedMedicine[] | null>(null);
  const [addedAll, setAddedAll] = useState<boolean>(false);

  if (!isOpen) return null;

  const samplePrescriptions = [
    {
      id: 'sample1',
      title: 'Dr. Ananya Sharma, MD (General Physician)',
      condition: 'Acute Viral Fever & Acid Reflux',
      clinic: 'Apollo Clinic, Koramangala',
      date: '07 Sept 2026',
      items: [
        { name: 'Dolo 650mg Tablet', dosage: '1 Tablet thrice daily after food (3 days)' },
        { name: 'Pan-D Capsule', dosage: '1 Capsule once daily 30 mins before breakfast (5 days)' }
      ]
    },
    {
      id: 'sample2',
      title: 'Dr. Rajesh Iyer, MD, DM (Cardiology)',
      condition: 'Hypertension & Cholesterol Maintenance',
      clinic: 'Manipal Heart Institute',
      date: '05 Sept 2026',
      items: [
        { name: 'Telma 40mg Tablet', dosage: '1 Tablet morning after breakfast (30 days)' },
        { name: 'Atorva 10mg Tablet', dosage: '1 Tablet at night before sleep (30 days)' }
      ]
    }
  ];

  const handleStartOCRScan = () => {
    setIsScanning(true);
    setScanProgress(10);
    setExtractedList(null);
    setAddedAll(false);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            // Find matched products in catalog
            const currentSample = samplePrescriptions.find(s => s.id === selectedSample) || samplePrescriptions[0];
            const matches: ExtractedMedicine[] = currentSample.items.map((item, idx) => {
              const matchedProd = allProducts.find(p =>
                p.category === 'Pharmacy' && (
                  p.title.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) ||
                  p.brand.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]) ||
                  p.description.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
                )
              ) || allProducts.find(p => p.category === 'Pharmacy')!;

              return {
                id: `med-${idx}`,
                name: item.name,
                dosage: item.dosage,
                product: matchedProd
              };
            });

            setExtractedList(matches);
            setIsScanning(false);
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleAddAllToCart = () => {
    if (!extractedList) return;
    extractedList.forEach(item => {
      if (item.product) {
        onAddToCart(item.product);
      }
    });
    setAddedAll(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">AI Prescription OCR Reader</h3>
                <span className="bg-white/20 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Apollo 24/7 Verified
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Instant doctor handwriting transcription &bull; 100% Salt accuracy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition cursor-pointer text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Instructions Strip */}
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-rose-600 shrink-0" />
            <span>
              All digital &amp; uploaded prescriptions are audited by a registered Apollo 24/7 pharmacist before medicines are dispatched.
            </span>
          </div>

          {/* Prescription Selection (Demo Prescriptions or Upload) */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold uppercase text-slate-500 block tracking-wider">
              Select Prescription To Scan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {samplePrescriptions.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedSample(sample.id as any);
                    setExtractedList(null);
                    setAddedAll(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    selectedSample === sample.id
                      ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{sample.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mb-1">{sample.condition}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{sample.clinic}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action to Start OCR Scan */}
          <div className="flex items-center justify-center">
            <button
              onClick={handleStartOCRScan}
              disabled={isScanning}
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{isScanning ? `Analyzing Doctor Handwriting (${scanProgress}%)...` : 'Run AI OCR Prescription Scan'}</span>
            </button>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs text-rose-400 font-mono">
                <span className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 animate-spin" />
                  <span>Processing Medical Handwriting with Medical NLP Engine...</span>
                </span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Cross-referencing active salt formulations with Indian Pharmacopoeia standards...
              </div>
            </div>
          )}

          {/* Extracted Medicines List */}
          {extractedList && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Extracted Medicines ({extractedList.length})
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  100% Salt Match
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {extractedList.map((item) => (
                  <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                          Rx
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Dosage:</strong> {item.dosage}
                      </p>
                      {item.product && (
                        <p className="text-[11px] text-emerald-700 font-mono font-medium">
                          Matched: {item.product.title} &bull; {currency === 'INR' ? `₹${item.product.priceINR}` : `$${item.product.priceUSD}`}
                        </p>
                      )}
                    </div>

                    {item.product && (
                      <button
                        onClick={() => onAddToCart(item.product!)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 hover:border-rose-600 font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Bulk Add Action */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950">
                    {addedAll ? 'All Prescribed Medicines Added to Cart!' : 'Ready to order prescribed course?'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Apollo 24/7 priority dispatch with free doorstep delivery.
                  </div>
                </div>

                <button
                  onClick={handleAddAllToCart}
                  disabled={addedAll}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{addedAll ? 'Added to Cart ✓' : 'Add All to Cart'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Powered by Apollo 24/7 MedVision OCR Engine
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
