export type PrescriptionStatus = 
  | 'UPLOADED' 
  | 'OCR_EXTRACTED' 
  | 'PHARMACIST_ASSIGNED' 
  | 'VERIFIED' 
  | 'APPROVED_FOR_DISPATCH' 
  | 'REJECTED';

export interface PrescribedMedicineItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  matchedProductId?: string;
  isScheduleH: boolean;
}

export interface PrescriptionRecord {
  id: string;
  customerId: string;
  imageUrl?: string;
  doctorName: string;
  doctorRegNumber: string;
  patientName: string;
  diagnosis: string;
  items: PrescribedMedicineItem[];
  status: PrescriptionStatus;
  auditTrail: {
    pharmacistId?: string;
    pharmacistRegNumber?: string;
    verifiedAt?: string;
    rejectionReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class PrescriptionVerificationService {
  private records: Map<string, PrescriptionRecord> = new Map();

  constructor() {
    this.seedSamplePrescriptions();
  }

  private seedSamplePrescriptions() {
    const rx1: PrescriptionRecord = {
      id: 'rx-rec-001',
      customerId: 'user-dev-alex',
      doctorName: 'Dr. Ananya Sharma, MD',
      doctorRegNumber: 'KMC-78491',
      patientName: 'Alex Kumar',
      diagnosis: 'Acute Viral Pyrexia & Acid Reflux',
      items: [
        { medicineName: 'Dolo 650mg Tablet', dosage: '650mg', frequency: 'TID', durationDays: 3, matchedProductId: 'prod-pharm-01', isScheduleH: true },
        { medicineName: 'Pan-D Capsule', dosage: '40mg+30mg', frequency: 'OD', durationDays: 5, matchedProductId: 'prod-pharm-02', isScheduleH: true }
      ],
      status: 'APPROVED_FOR_DISPATCH',
      auditTrail: {
        pharmacistId: 'pharm-rajesh-01',
        pharmacistRegNumber: 'KA-PH-39402',
        verifiedAt: new Date(Date.now() - 3600000).toISOString()
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    };
    this.records.set(rx1.id, rx1);
  }

  public uploadPrescription(params: {
    customerId: string;
    doctorName?: string;
    doctorRegNumber?: string;
    patientName?: string;
    diagnosis?: string;
    items?: PrescribedMedicineItem[];
    imageUrl?: string;
  }): PrescriptionRecord {
    const id = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: PrescriptionRecord = {
      id,
      customerId: params.customerId,
      imageUrl: params.imageUrl,
      doctorName: params.doctorName || 'Dr. Verified Specialist, MBBS',
      doctorRegNumber: params.doctorRegNumber || 'KMC-84920',
      patientName: params.patientName || 'Patient',
      diagnosis: params.diagnosis || 'Prescribed Healthcare Course',
      items: params.items || [
        { medicineName: 'Dolo 650mg Tablet', dosage: '650mg', frequency: 'TID', durationDays: 3, isScheduleH: true }
      ],
      status: 'OCR_EXTRACTED',
      auditTrail: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.records.set(id, record);
    return record;
  }

  /**
   * Registered Pharmacist audits and verifies an uploaded prescription.
   */
  public auditPrescription(
    id: string, 
    pharmacistRegNumber: string, 
    decision: 'APPROVED' | 'REJECTED', 
    reason?: string
  ): { success: boolean; record?: PrescriptionRecord; error?: string } {
    const record = this.records.get(id);
    if (!record) {
      return { success: false, error: 'Prescription not found' };
    }

    if (!pharmacistRegNumber || !pharmacistRegNumber.startsWith('KA-PH-')) {
      return { success: false, error: 'Invalid pharmacist registration number' };
    }

    if (decision === 'APPROVED') {
      record.status = 'APPROVED_FOR_DISPATCH';
      record.auditTrail = {
        pharmacistId: 'pharm-lead',
        pharmacistRegNumber,
        verifiedAt: new Date().toISOString()
      };
    } else {
      record.status = 'REJECTED';
      record.auditTrail = {
        pharmacistId: 'pharm-lead',
        pharmacistRegNumber,
        verifiedAt: new Date().toISOString(),
        rejectionReason: reason || 'Prescription expired or illegible'
      };
    }

    record.updatedAt = new Date().toISOString();
    return { success: true, record };
  }

  public getPrescription(id: string): PrescriptionRecord | undefined {
    return this.records.get(id);
  }

  public getAllPrescriptions(): PrescriptionRecord[] {
    return Array.from(this.records.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public pharmacistAudit(params: {
    prescriptionId: string;
    pharmacistId: string;
    pharmacistRegistrationNumber: string;
    decision: 'APPROVED' | 'REJECTED';
    notes?: string;
  }): { success: boolean; prescription?: PrescriptionRecord; error?: string } {
    const result = this.auditPrescription(
      params.prescriptionId,
      params.pharmacistRegistrationNumber,
      params.decision,
      params.notes
    );
    return {
      success: result.success,
      prescription: result.record,
      error: result.error
    };
  }

  /**
   * Validates whether an order containing Schedule H (Rx Required) items has a valid verified prescription.
   */
  public validatePharmacyOrderSafety(
    cartProductIds: string[], 
    rxRequiredProductIds: string[], 
    prescriptionId?: string
  ): { isSafeToDispense: boolean; requiresRx: boolean; reason?: string } {
    const hasRxItems = cartProductIds.some(id => rxRequiredProductIds.includes(id));
    
    if (!hasRxItems) {
      return { isSafeToDispense: true, requiresRx: false };
    }

    if (!prescriptionId) {
      return {
        isSafeToDispense: false,
        requiresRx: true,
        reason: 'Order contains Schedule H prescription drugs. Valid doctor prescription required.'
      };
    }

    const rx = this.records.get(prescriptionId);
    if (!rx) {
      return { isSafeToDispense: false, requiresRx: true, reason: 'Prescription record not found.' };
    }

    if (rx.status !== 'APPROVED_FOR_DISPATCH') {
      return {
        isSafeToDispense: false,
        requiresRx: true,
        reason: `Prescription is in ${rx.status} state. Awaiting pharmacist approval.`
      };
    }

    return { isSafeToDispense: true, requiresRx: true };
  }
}

export const prescriptionVerificationServiceInstance = new PrescriptionVerificationService();
