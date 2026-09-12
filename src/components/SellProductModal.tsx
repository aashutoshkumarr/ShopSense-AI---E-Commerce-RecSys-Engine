import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Tag, 
  Coins, 
  ArrowRight,
  Camera,
  Layers,
  HelpCircle,
  Video,
  VideoOff,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Product, UserPersona } from '../types';

interface SellProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishProduct: (product: Product) => void;
  currentPersona: UserPersona;
}

const SAMPLE_IMAGE_PRESETS = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80' },
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Console/Gaming', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
  { label: 'Camera/Gear', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' }
];

export const SellProductModal: React.FC<SellProductModalProps> = ({
  isOpen,
  onClose,
  onPublishProduct,
  currentPersona
}) => {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [category, setCategory] = useState('Smartphones');
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Gently Used' | 'Fair'>('Like New');
  const [originalPrice, setOriginalPrice] = useState('79990');
  const [sellingPrice, setSellingPrice] = useState('42990');
  const [city, setCity] = useState('Bengaluru');
  const [description, setDescription] = useState('Original box, bill, and fast charger included. 100% battery health with zero scratches.');
  
  // Image & Camera States
  const [imageMode, setImageMode] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGE_PRESETS[0].url);
  const [customPhotoLabel, setCustomPhotoLabel] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPublished, setIsPublished] = useState(false);
  const [publishedItem, setPublishedItem] = useState<Product | null>(null);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start device camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError(err?.message || 'Unable to access device camera. Please check browser permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  // Snap photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedImage(dataUrl);
        setCustomPhotoLabel('Live Camera Snapshot (Condition Verified)');
        stopCamera();
      }
    } catch (err: any) {
      console.error('Failed to capture photo:', err);
      setCameraError('Failed to capture frame. Please upload an image instead.');
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setSelectedImage(event.target.result);
          setCustomPhotoLabel(`Uploaded: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Cleanup camera stream on close or unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  // AI Fair-Market Valuation Helper
  const orig = parseInt(originalPrice, 10) || 0;
  const conditionMultipliers = {
    'Brand New': 0.85,
    'Like New': 0.65,
    'Gently Used': 0.50,
    'Fair': 0.35
  };
  const suggestedPrice = Math.round(orig * (conditionMultipliers[condition] || 0.6));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    stopCamera();

    const sellINR = parseInt(sellingPrice, 10) || suggestedPrice;
    const origINR = parseInt(originalPrice, 10) || Math.round(sellINR * 1.5);

    const newProduct: Product = {
      id: `prod-user-${Date.now()}`,
      title: `${title} (${condition} • OLX Verified)`,
      brand,
      category,
      subCategory: `Pre-Owned ${category}`,
      priceINR: sellINR,
      priceUSD: Math.round(sellINR / 83.5),
      originalPriceINR: origINR,
      originalPriceUSD: Math.round(origINR / 83.5),
      rating: 4.9,
      reviewCount: 1,
      inStock: true,
      stockCount: 1,
      imageUrl: selectedImage,
      badge: 'Pre-Owned • Verified Seller',
      tags: ['pre-owned', 'used', 'resale', 'olx', brand.toLowerCase(), category.toLowerCase(), city.toLowerCase()],
      description: `${description} [Listed by verified customer ${currentPersona.name} in ${city}. Cosmetic Condition: ${condition}. Direct inspection photo attached.]`,
      specs: {
        Condition: condition,
        Seller: `${currentPersona.name} (Verified Resident, ${city})`,
        Warranty: '7-Day ShopSense Inspection & Return Guarantee',
        Includes: 'Original Box, Accessories & Valid Bill',
        PhotoVerification: customPhotoLabel || 'Real-time Condition Verified'
      },
      features: [
        `Verified cosmetic condition: ${condition}`,
        `Direct seller deal in ${city} with instant dispatch or local handoff`,
        'Protected by ShopSense Escrow: payment released only after buyer inspection',
        'Eligible for 7-day money-back guarantee if item condition does not match photo'
      ],
      popularityScore: 0.95,
      historicalCTR: 0.12,
      releaseDaysAgo: 0,
      embedding: [0.6, 0.7, 0.5, 0.5, 0.6, 0.5, 0.6, 0.95],
      status: 'active'
    };

    onPublishProduct(newProduct);
    setPublishedItem(newProduct);
    setIsPublished(true);
  };

  const handleReset = () => {
    setIsPublished(false);
    setPublishedItem(null);
    setTitle('');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Sell on ShopSense</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950">
                  OLX-Style ReCommerce
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Turn your pre-owned gadgets into instant cash & unlock +50 loyalty points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isPublished ? (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Listing Live on Storefront!
                </span>
                <h3 className="text-2xl font-black text-slate-950 mt-1">
                  {publishedItem?.title}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  Your item has been verified by the ShopSense ReCommerce engine and is now browsable by thousands of shoppers. +50 Loyalty Points credited to your account!
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto text-left flex items-center gap-3">
                <img
                  src={publishedItem?.imageUrl}
                  alt={publishedItem?.title}
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600">
                    Listed Price
                  </span>
                  <div className="text-base font-black text-slate-900">
                    ₹{publishedItem?.priceINR.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {city} &bull; Escrow Protected
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                >
                  Done & View in Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item Title & Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 14 Pro 128GB Deep Purple"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Brand
                  </label>
                  <select
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    {['Apple', 'Samsung', 'ASUS', 'Vivo', 'Sony', 'OnePlus', 'Xiaomi', 'Google', 'Dell', 'Lenovo', 'HP', 'Razer', 'Nothing', 'Bose', 'Logitech', 'Other'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  >
                    {['Smartphones', 'Laptops', 'Audio', 'Gaming', 'Smart Home', 'Accessories', 'Wearables'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cosmetic & Hardware Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Brand New', 'Like New', 'Gently Used', 'Fair'] as const).map(cond => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => setCondition(cond)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        condition === cond
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing & AI Valuation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Original Price (₹ MRP)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* AI Valuation Banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-900 font-medium">
                    AI Suggested Fair Resale: <strong className="font-extrabold text-amber-950">₹{suggestedPrice.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSellingPrice(suggestedPrice.toString())}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-[10px] transition"
                >
                  Apply AI Price
                </button>
              </div>

              {/* 📸 OLX PRODUCT IMAGE & CAMERA INSPECTION SECTION */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Product Condition Photo
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Buyers inspect condition & scratches here
                  </span>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('camera');
                      startCamera();
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      imageMode === 'camera'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Live Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setImageMode('upload');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      imageMode === 'upload'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setImageMode('preset');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      imageMode === 'preset'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Presets</span>
                  </button>
                </div>

                {/* MODE 1: LIVE DEVICE CAMERA */}
                {imageMode === 'camera' && (
                  <div className="space-y-3">
                    {isCameraActive ? (
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-56 flex items-center justify-center border-2 border-indigo-500 shadow-inner">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Camera Framing Reticle Overlay */}
                        <div className="absolute inset-4 border border-dashed border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                          <span className="text-[10px] text-white/80 font-mono bg-black/40 px-1.5 py-0.5 rounded self-start">
                            FRAME PRODUCT CONDITION
                          </span>
                          <span className="text-[10px] text-white/80 font-mono bg-black/40 px-1.5 py-0.5 rounded self-end">
                            HOLD STEADY
                          </span>
                        </div>
                        {/* Shutter Capture Button */}
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-5 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
                          >
                            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                            <span>Snap Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs transition cursor-pointer"
                            title="Cancel Camera"
                          >
                            <VideoOff className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                        {cameraError ? (
                          <div className="flex items-center justify-center gap-2 text-rose-600 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{cameraError}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">
                            Take a live picture of your gadget to verify scratches, screen condition, and authenticity.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Camera Viewfinder</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: FILE UPLOAD */}
                {imageMode === 'upload' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl text-center cursor-pointer transition space-y-2 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Click or tap to upload photo from device
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Supports PNG, JPG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                )}

                {/* MODE 3: SAMPLE PRESETS */}
                {imageMode === 'preset' && (
                  <div className="space-y-2">
                    <select
                      value={selectedImage}
                      onChange={e => {
                        setSelectedImage(e.target.value);
                        setCustomPhotoLabel(null);
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                    >
                      {SAMPLE_IMAGE_PRESETS.map(p => (
                        <option key={p.label} value={p.url}>{p.label} (High-Res Sample Preset)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Photo Preview & Inspection Badge */}
                {selectedImage && (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={selectedImage}
                        alt="Listing Condition Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {customPhotoLabel || 'Photo Selected'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                          Condition: {condition}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        Buyers will see this exact photo to verify physical appearance, screen integrity, and accessories.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location & City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seller City
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                >
                  {['Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad'].map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item Description & Accessories
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Escrow Badge */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>ShopSense Buyer-Seller Escrow:</strong> 100% fraud-free transaction. We hold the buyer’s funds until delivery confirmation.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-98"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish Pre-Owned Listing &bull; Earn +50 Loyalty Points</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
