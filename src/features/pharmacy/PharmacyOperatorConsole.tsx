import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Check, 
  X, 
  Sparkles, 
  Search, 
  Pill, 
  Building2, 
  Award,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { prescriptionVerificationServiceInstance, PrescriptionRecord } from '../../backend/modules/pharmacy/prescriptionVerificationService';

interface PharmacyOperatorConsoleProps {
  onBackToStorefront: () => void;
}

export const PharmacyOperatorConsole: React.FC<PharmacyOperatorConsoleProps> = ({
  onBackToStorefront
}) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(() => {
    return prescriptionVerificationServiceInstance.getAllPrescriptions();
  });
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionRecord | null>(
    prescriptions[0] || null
  );
  const [pharmacistReg, setPharmacistReg] = useState('KA-PH-39402');
  const [auditNotes, setAuditNotes] = useState('Rx dosage verified against CDSCO guidelines.');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAudit = (decision: 'APPROVED' | 'REJECTED') => {
    if (!selectedPrescription) return;
    setActionSuccess(null);
    setActionError(null);

    const result = prescriptionVerificationServiceInstance.pharmacistAudit({
      prescriptionId: selectedPrescription.id,
      pharmacistId: 'usr-pharmacy-priya',
      pharmacistRegistrationNumber: pharmacistReg,
      decision,
      notes: auditNotes
    });

    if (result.success && result.prescription) {
      setActionSuccess(
        decision === 'APPROVED' 
          ? `Prescription #${selectedPrescription.id} verified & approved for Schedule H dispatch!`
          : `Prescription #${selectedPrescription.id} marked as REJECTED.`
      );
      setPrescriptions(prescriptionVerificationServiceInstance.getAllPrescriptions());
      setSelectedPrescription(result.prescription);
    } else {
      setActionError(result.error || 'Audit verification failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 p-6 sm:p-8 text-white border border-emerald-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
            <Pill className="h-3.5 w-3.5 text-emerald-400" />
            <span>PHARMACY REGULATORY CONSOLE &bull; SCHEDULE H</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Apollo Verified Pharmacist Dispensing Hub
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Audit e-prescriptions, extract active salt compounds via OCR, and verify Schedule H/H1 compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStorefront}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            Back to Storefront
          </button>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Reg: KA-PH-39402</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Grid: Queue on Left, Active Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Prescriptions Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Pending Prescription Queue ({prescriptions.length})
            </h3>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Live OCR Feeds
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
            {prescriptions.map(p => {
              const isSelected = selectedPrescription?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrescription(p)}
                  className={`p-4 cursor-pointer transition flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{p.patientName}</span>
                      <span className="text-[10px] font-mono text-slate-500">#{p.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Doctor: {p.doctorName}</p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {p.items.map(item => (
                        <span key={item.medicineName} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {item.medicineName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'APPROVED_FOR_DISPATCH' || p.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Audit & Compliance View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {selectedPrescription ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Prescription Audit: #{selectedPrescription.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {selectedPrescription.patientName} (Age: {selectedPrescription.patientAge || '32'}) &bull; Dr: {selectedPrescription.doctorName}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedPrescription.status === 'APPROVED_FOR_DISPATCH' || selectedPrescription.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : selectedPrescription.status === 'REJECTED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {selectedPrescription.status}
                </span>
              </div>

              {/* Extracted Chemical Salts OCR */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    OCR-Extracted Active Pharmaceutical Ingredients (APIs):
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Confidence: 98.6%
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {selectedPrescription.items.map(item => (
                    <div key={item.medicineName} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{item.medicineName} ({item.dosage})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Form Controls */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Pharmacist Council Registration Number (CDSCO Mandated):
                  </label>
                  <input
                    type="text"
                    value={pharmacistReg}
                    onChange={e => setPharmacistReg(e.target.value)}
                    placeholder="e.g. KA-PH-39402"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Must match registered state pharmacy council license format (e.g. KA-PH-XXXXX)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Clinical Audit Notes &amp; Dosage Validation:
                  </label>
                  <textarea
                    value={auditNotes}
                    onChange={e => setAuditNotes(e.target.value)}
                    rows={3}
                    placeholder="Dosage, contraindications, and course duration verified."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleAudit('APPROVED')}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Authorize &amp; Approve for Dispatch</span>
                  </button>

                  <button
                    onClick={() => handleAudit('REJECTED')}
                    className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject Prescription</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Select a prescription from the queue to review.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
