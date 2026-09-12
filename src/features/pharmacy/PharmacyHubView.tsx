import React, { useState, useMemo } from 'react';
import {
  FileText,
  Video,
  ShieldCheck,
  Search,
  Plus,
  ShoppingBag,
  HeartPulse,
  Activity,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Star,
  CheckCircle2,
  Stethoscope,
  TestTube2,
  AlertCircle
} from 'lucide-react';
import { Product, Currency } from '../../types';

interface PharmacyHubViewProps {
  allProducts: Product[];
  cartItems: Product[];
  currency: Currency;
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenPrescriptionModal: () => void;
  onOpenDoctorModal: () => void;
  onBackToStorefront: () => void;
}

export const PharmacyHubView: React.FC<PharmacyHubViewProps> = ({
  allProducts,
  cartItems,
  currency,
  onAddToCart,
  onOpenCart,
  onSelectProduct,
  onOpenPrescriptionModal,
  onOpenDoctorModal,
  onBackToStorefront
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [pharmacySearch, setPharmacySearch] = useState<string>('');
  const [showLabTestSuccess, setShowLabTestSuccess] = useState<string | null>(null);

  // Filter pharmacy products
  const pharmacyProducts = useMemo(() => {
    return allProducts.filter(p => p.category === 'Pharmacy');
  }, [allProducts]);

  // Categories
  const categories = [
    { id: 'All', label: 'All Medicines' },
    { id: 'Fever & Pain Relief', label: 'Fever & Pain' },
    { id: 'Digestion & Antacid', label: 'Acidity & Digestion' },
    { id: 'Vitamins & Supplements', label: 'Vitamins & Minerals' },
    { id: 'Diabetes Care', label: 'Diabetes & BP' },
    { id: 'Ayurvedic & Herbal', label: 'Herbal & Immunity' },
    { id: 'Medical Devices & First Aid', label: 'Devices & First Aid' }
  ];

  // Filtered list
  const filteredProducts = useMemo(() => {
    return pharmacyProducts.filter(p => {
      const matchesCategory = selectedSubCategory === 'All' ||
        p.subCategory?.toLowerCase().includes(selectedSubCategory.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(selectedSubCategory.toLowerCase()));
      const matchesSearch = !pharmacySearch ||
        p.title.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
        p.description.toLowerCase().includes(pharmacySearch.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(pharmacySearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [pharmacyProducts, selectedSubCategory, pharmacySearch]);

  const pharmacyCartItems = cartItems.filter(p => p.category === 'Pharmacy');
  const pharmacyCartTotal = pharmacyCartItems.reduce(
    (sum, item) => sum + (currency === 'INR' ? item.priceINR : item.priceUSD),
    0
  );

  // Home Lab Tests Packages
  const labTests = [
    {
      id: 'lab-1',
      title: 'Full Body Comprehensive Health Checkup',
      testsCount: '86 Tests included (Lipid, Liver, Kidney, Hemogram)',
      priceINR: 999,
      originalPriceINR: 2499,
      fasting: '10-12 hours fasting required',
      reportTime: 'Reports within 12 hours'
    },
    {
      id: 'lab-2',
      title: 'Diabetes & HbA1c Monitoring Package',
      testsCount: 'HbA1c, Fasting Blood Sugar, Urine Microalbumin',
      priceINR: 499,
      originalPriceINR: 1199,
      fasting: '8-10 hours fasting required',
      reportTime: 'Reports within 6 hours'
    },
    {
      id: 'lab-3',
      title: 'Vitamin D & B12 Vitality Duo',
      testsCount: '25-OH Vitamin D Total + Serum Vitamin B12',
      priceINR: 699,
      originalPriceINR: 1799,
      fasting: 'No fasting required',
      reportTime: 'Reports within 10 hours'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      
      {/* 1. Apollo 24/7 Medical Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={onBackToStorefront}
                  className="flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>All Tech Store</span>
                </button>
                <span className="bg-white text-rose-900 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full">
                  APOLLO 24/7 HEALTHCARE
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>ShopSense Pharmacy</span>
                <span className="text-rose-200 text-lg sm:text-xl font-normal font-sans">&bull; Tata 1mg Care</span>
              </h1>

              <p className="text-xs sm:text-sm text-rose-100 font-medium">
                100% Genuine Medicines &bull; Registered Pharmacist Audit &bull; Doorstep Delivery in 60 Mins
              </p>
            </div>

            {/* Quick Consultation CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenPrescriptionModal}
                className="px-4 py-2.5 rounded-2xl bg-white text-rose-900 hover:bg-rose-50 font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <FileText className="h-4 w-4 text-rose-600" />
                <span>Upload Prescription</span>
              </button>

              <button
                onClick={onOpenDoctorModal}
                className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Video className="h-4 w-4 text-emerald-400" />
                <span>Consult Doctor 24/7</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Pharmacist Verification Strip */}
      <div className="bg-rose-950 text-rose-200 py-2 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Regulated by CDSCO &bull; Audited by Registered Pharmacist (Reg #KA-PH-39402)</span>
          </div>
          <span className="text-rose-800 hidden md:inline">&bull;</span>
          <div className="flex items-center gap-2 shrink-0">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Emergency 60-Min Doorstep Delivery in Bengaluru, Delhi NCR, Mumbai &amp; Hyderabad</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 3. Three Flagship Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Service 1: Upload Prescription */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-rose-300 transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">AI Prescription Scanner</h3>
              <p className="text-xs text-slate-500">
                Upload your doctor's handwritten or printed prescription. Our medical OCR will auto-add all medicines to your cart.
              </p>
            </div>
            <button
              onClick={onOpenPrescriptionModal}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Scan Prescription</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Service 2: 24/7 Doctor Video Consult */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">24/7 Doctor Consult</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connect with top MD General Physicians, Pediatricians &amp; Dermatologists in under 2 minutes. Get signed e-Rx.
              </p>
            </div>
            <button
              onClick={onOpenDoctorModal}
              className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Start Video Call</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Service 3: Home Lab Tests */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TestTube2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Book Home Lab Tests</h3>
              <p className="text-xs text-slate-500">
                100% NABL accredited labs. Certified phlebotomist visits your home for sample collection. Digital reports in 12 hrs.
              </p>
            </div>
            <a
              href="#home-lab-tests"
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>View Test Packages</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>

        {/* 4. Search and Category Filter Strip */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={pharmacySearch}
              onChange={(e) => setPharmacySearch(e.target.value)}
              placeholder="Search by medicine name, brand or salt (e.g. Paracetamol, Dolo, Pan-D, Digene)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSubCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl font-bold text-xs whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedSubCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Medicines Product Grid with Active Salt Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedSubCategory === 'All' ? 'Essential Medicines & Healthcare' : selectedSubCategory}</span>
              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                {filteredProducts.length} items
              </span>
            </h2>
            <div className="text-xs text-slate-500 font-medium">
              Rx medicines require valid doctor prescription at checkout
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isRx = product.badge?.toLowerCase().includes('rx') ||
                product.tags.some(t => t.toLowerCase().includes('rx') || t.toLowerCase().includes('prescription'));
              const price = currency === 'INR' ? product.priceINR : product.priceUSD;
              const originalPrice = currency === 'INR' ? product.originalPriceINR : product.originalPriceUSD;
              const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

              // Salt / Composition from specs or description
              const composition = product.specs['SaltComposition'] || product.specs['Composition'] || product.specs['ActiveIngredient'] || 'Approved Salt Formulation';

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md hover:border-rose-300 transition flex flex-col justify-between group"
                >
                  {/* Top Bar: Rx Badge & Discount */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
                      isRx ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {isRx ? 'Rx Required' : 'OTC Medicine'}
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="relative aspect-video rounded-2xl bg-slate-50 overflow-hidden mb-3 cursor-pointer flex items-center justify-center p-2"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                    />
                  </div>

                  {/* Medicine Details & Salt Composition */}
                  <div className="space-y-1.5 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      {product.brand} &bull; {product.subCategory}
                    </span>

                    <h4
                      onClick={() => onSelectProduct(product)}
                      className="text-sm font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-rose-700 transition"
                      title={product.title}
                    >
                      {product.title}
                    </h4>

                    {/* Active Salt Composition Pill */}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-0.5">
                      <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                        Composition:
                      </span>
                      <span className="text-slate-800 font-semibold line-clamp-1">
                        {composition}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold pt-1">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="text-base font-black font-mono text-slate-950">
                        {currency === 'INR' ? `₹${price}` : `$${price}`}
                      </div>
                      {originalPrice > price && (
                        <div className="text-[11px] line-through text-slate-400 font-mono">
                          {currency === 'INR' ? `₹${originalPrice}` : `$${originalPrice}`}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onAddToCart(product)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Home Lab Tests Section */}
        <div id="home-lab-tests" className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-indigo-600" />
                <span>Book Home Lab Tests &bull; NABL Certified</span>
              </h3>
              <p className="text-xs text-slate-500">Free sample collection at your home by certified technician</p>
            </div>
          </div>

          {showLabTestSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span className="font-medium">
                Appointment booked for <strong>{showLabTestSuccess}</strong>! A phlebotomist will arrive tomorrow between 7:00 AM - 8:00 AM.
              </span>
              <button
                onClick={() => setShowLabTestSuccess(null)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {labTests.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                      {test.reportTime}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">
                      {test.fasting}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{test.title}</h4>
                  <p className="text-xs text-slate-500">{test.testsCount}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-black font-mono text-slate-900">
                      {currency === 'INR' ? `₹${test.priceINR}` : `$${Math.round(test.priceINR / 83)}`}
                    </div>
                    <div className="text-[11px] line-through text-slate-400 font-mono">
                      {currency === 'INR' ? `₹${test.originalPriceINR}` : `$${Math.round(test.originalPriceINR / 83)}`}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowLabTestSuccess(test.title)}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 7. Floating Pharmacy Cart Bar */}
      {pharmacyCartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-200 shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <div className="text-xs text-rose-800 font-bold flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-rose-600" />
                <span>Pharmacy Basket ({pharmacyCartItems.length} items)</span>
              </div>
              <div className="text-sm sm:text-base font-black font-mono text-slate-950">
                Total: {currency === 'INR' ? `₹${pharmacyCartTotal}` : `$${pharmacyCartTotal}`} &bull; Free Pharmacist Review
              </div>
            </div>

            <button
              onClick={onOpenCart}
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <span>Proceed to Pharmacy Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
