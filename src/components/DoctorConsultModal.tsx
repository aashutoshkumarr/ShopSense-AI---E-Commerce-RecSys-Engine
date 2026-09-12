import React, { useState, useEffect } from 'react';
import {
  X,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  FileText,
  ShoppingBag,
  User,
  HeartPulse,
  Award
} from 'lucide-react';
import { Product, Currency } from '../types';

interface DoctorConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
  currency: Currency;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  degrees: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  languages: string;
  feeINR: number;
  hospital: string;
  avatar: string;
  regNumber: string;
}

export const DoctorConsultModal: React.FC<DoctorConsultModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onAddToCart,
  currency
}) => {
  const [activeScreen, setActiveScreen] = useState<'select' | 'calling' | 'in_call' | 'rx_issued'>('select');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [prescribedAdded, setPrescribedAdded] = useState<boolean>(false);

  const doctors: Doctor[] = [
    {
      id: 'doc-1',
      name: 'Dr. Priya Sen',
      specialty: 'General Physician & Diabetologist',
      degrees: 'MBBS, MD (Internal Medicine - AIIMS)',
      experienceYears: 14,
      rating: 4.9,
      reviewCount: 3840,
      languages: 'English, Hindi, Bengali',
      feeINR: 299,
      hospital: 'Apollo Hospitals, Bannerghatta Road',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
      regNumber: 'KMC-78491'
    },
    {
      id: 'doc-2',
      name: 'Dr. Rajesh Murthy',
      specialty: 'Consultant Dermatologist',
      degrees: 'MBBS, DDVL (Skin & Venereal Diseases)',
      experienceYears: 11,
      rating: 4.8,
      reviewCount: 2190,
      languages: 'English, Kannada, Hindi',
      feeINR: 499,
      hospital: 'Apollo Spectra, Koramangala',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      regNumber: 'KMC-64210'
    },
    {
      id: 'doc-3',
      name: 'Dr. Amitav Ghosh',
      specialty: 'Senior Cardiologist',
      degrees: 'MBBS, MD, DM (Cardiology)',
      experienceYears: 19,
      rating: 5.0,
      reviewCount: 4120,
      languages: 'English, Hindi',
      feeINR: 699,
      hospital: 'Apollo Heart Centre',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
      regNumber: 'MCI-99412'
    }
  ];

  // Call timer simulation
  useEffect(() => {
    let interval: any;
    if (activeScreen === 'in_call') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeScreen]);

  if (!isOpen) return null;

  const handleStartConsultation = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setActiveScreen('calling');
    setTimeout(() => {
      setActiveScreen('in_call');
    }, 2000);
  };

  const handleEndCall = () => {
    setActiveScreen('rx_issued');
  };

  const handleAddRxMedicines = () => {
    const pharmacyItems = allProducts.filter(p => p.category === 'Pharmacy').slice(0, 2);
    pharmacyItems.forEach(p => onAddToCart(p));
    setPrescribedAdded(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Apollo 24/7 Doctor Consult</h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Live in 2 Mins
                </span>
              </div>
              <p className="text-xs text-teal-100 font-medium">
                Verified MBBS/MD Specialists &bull; Instant Digital Prescription
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* SCREEN 1: DOCTOR SELECTOR */}
          {activeScreen === 'select' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>NMC / KMC Certified Doctors &bull; 100% Confidential Medical Video Calls</span>
                </div>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  FREE with Prime
                </span>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Available Online Specialists Right Now
                </h4>

                <div className="space-y-3">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 bg-white shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={doc.avatar}
                            alt={doc.name}
                            className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online now" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900">{doc.name}</h5>
                            <span className="text-[10px] font-mono text-slate-400 font-medium">({doc.regNumber})</span>
                          </div>
                          <p className="text-xs font-semibold text-teal-800">{doc.specialty}</p>
                          <p className="text-[11px] text-slate-500">{doc.degrees} &bull; {doc.experienceYears} yrs exp</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-current" />
                              {doc.rating}
                            </span>
                            <span>&bull;</span>
                            <span>{doc.languages}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-medium">Consult Fee</div>
                          <div className="text-sm font-black font-mono text-slate-900">
                            {currency === 'INR' ? `₹${doc.feeINR}` : `$${Math.round(doc.feeINR / 83)}`}
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartConsultation(doc)}
                          className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Video className="h-4 w-4" />
                          <span>Consult Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: CALLING SIMULATOR */}
          {activeScreen === 'calling' && selectedDoctor && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <img
                  src={selectedDoctor.avatar}
                  alt={selectedDoctor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-teal-500 shadow-2xl animate-pulse"
                />
                <span className="absolute inset-0 rounded-full border-4 border-teal-400 animate-ping opacity-75" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">Connecting to {selectedDoctor.name}...</h4>
                <p className="text-xs text-slate-500">Establishing end-to-end encrypted medical consultation line</p>
              </div>
            </div>
          )}

          {/* SCREEN 3: IN CALL SIMULATOR */}
          {activeScreen === 'in_call' && selectedDoctor && (
            <div className="space-y-4">
              {/* Video Call Screen */}
              <div className="relative aspect-[16/10] rounded-3xl bg-slate-950 overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                <img
                  src={selectedDoctor.avatar}
                  alt={selectedDoctor.name}
                  className="w-full h-full object-cover opacity-85"
                />

                {/* Status Bar */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white z-10">
                  <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{selectedDoctor.name} &bull; {selectedDoctor.specialty}</span>
                  </div>
                  <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 font-mono font-bold">
                    {formatTime(callDuration)}
                  </div>
                </div>

                {/* Self Preview (PiP) */}
                <div className="absolute bottom-16 right-4 w-28 h-36 rounded-2xl bg-slate-900 border-2 border-white/20 shadow-xl overflow-hidden flex items-center justify-center text-slate-400 text-xs">
                  {isVideoOff ? (
                    <span>Camera Off</span>
                  ) : (
                    <div className="text-center p-2">
                      <User className="h-8 w-8 mx-auto text-slate-500 mb-1" />
                      <span className="text-[10px] text-white font-medium">You (Patient)</span>
                    </div>
                  )}
                </div>

                {/* Call Control Strip */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 z-10">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 rounded-full transition cursor-pointer ${
                      isMuted ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-2.5 rounded-full transition cursor-pointer ${
                      isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    title={isVideoOff ? 'Start Video' : 'Stop Video'}
                  >
                    {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-lg"
                    title="End Call & Generate Rx"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Consultation Quick Trigger */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Doctor finished diagnosis? Click to generate your signed digital prescription.
                </span>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition cursor-pointer"
                >
                  Issue Digital Rx &rarr;
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: DIGITAL RX ISSUED */}
          {activeScreen === 'rx_issued' && selectedDoctor && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Consultation Completed Successfully</h4>
                <p className="text-xs text-slate-500">
                  Dr. {selectedDoctor.name} has issued an authenticated e-Prescription
                </p>
              </div>

              {/* Digital Prescription Preview Card */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-300 space-y-4 font-sans text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h5 className="font-extrabold text-sm text-teal-900">{selectedDoctor.name}</h5>
                    <p className="text-[11px] text-slate-500">{selectedDoctor.degrees} &bull; Reg: {selectedDoctor.regNumber}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedDoctor.hospital}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                      VERIFIED DIGITAL Rx
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Date: 07 Sept 2026</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-slate-700">Clinical Diagnosis:</div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 font-medium">
                    Acute Upper Respiratory Infection with Mild Pyrexia &amp; Acid Dyspepsia
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-700">Prescribed Regimen (Rx):</div>
                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl p-2 space-y-2">
                    <div className="pt-1">
                      <div className="font-bold text-slate-900">1. Dolo 650mg Tablet (Paracetamol IP 650mg)</div>
                      <div className="text-[11px] text-slate-500">1 tablet thrice daily after meals for 3 days</div>
                    </div>
                    <div className="pt-2">
                      <div className="font-bold text-slate-900">2. Pan-D Capsule (Pantoprazole 40mg + Domperidone 30mg)</div>
                      <div className="text-[11px] text-slate-500">1 capsule once daily 30 minutes before breakfast for 5 days</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Digitally signed via Apollo 24/7 Health Engine</span>
                  <span className="font-mono text-emerald-700 font-bold">Valid for 30 days across India</span>
                </div>
              </div>

              {/* Action: Add to Cart */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950">
                    {prescribedAdded ? 'Prescribed Medicines Added to Cart!' : 'Order Prescribed Medicines with 1-Click'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Express doorstep delivery in under 60 minutes with temperature-controlled packaging.
                  </div>
                </div>

                <button
                  onClick={handleAddRxMedicines}
                  disabled={prescribedAdded}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{prescribedAdded ? 'Added to Bag ✓' : 'Add Prescribed Medicines'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Emergency? Please call 108 or 1066 for immediate ambulance dispatch.
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
