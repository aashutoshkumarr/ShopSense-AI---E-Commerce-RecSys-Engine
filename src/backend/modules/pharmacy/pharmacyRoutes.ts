import { Router, Request, Response } from 'express';
import { prescriptionVerificationServiceInstance } from './prescriptionVerificationService';

export const pharmacyRouter = Router();

// Upload new prescription
pharmacyRouter.post('/prescriptions/upload', (req: Request, res: Response) => {
  try {
    const { customerId, doctorName, doctorRegNumber, patientName, diagnosis, items, imageUrl } = req.body;
    const record = prescriptionVerificationServiceInstance.uploadPrescription({
      customerId: customerId || 'guest_patient',
      doctorName,
      doctorRegNumber,
      patientName,
      diagnosis,
      items,
      imageUrl
    });
    return res.status(201).json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Prescription upload failed' });
  }
});

// Get prescription status
pharmacyRouter.get('/prescriptions/:id', (req: Request, res: Response) => {
  const record = prescriptionVerificationServiceInstance.getPrescription(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Prescription not found' });
  }
  return res.json({ success: true, record });
});

// Pharmacist Audit & Sign-off
pharmacyRouter.post('/prescriptions/:id/audit', (req: Request, res: Response) => {
  const { pharmacistRegNumber, decision, reason } = req.body;
  if (!pharmacistRegNumber || !decision) {
    return res.status(400).json({ error: 'pharmacistRegNumber and decision are required' });
  }

  const result = prescriptionVerificationServiceInstance.auditPrescription(
    req.params.id,
    pharmacistRegNumber,
    decision,
    reason
  );

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// Validate Pharmacy Order Safety
pharmacyRouter.post('/validate-order', (req: Request, res: Response) => {
  const { cartProductIds, rxRequiredProductIds, prescriptionId } = req.body;
  if (!cartProductIds || !rxRequiredProductIds) {
    return res.status(400).json({ error: 'cartProductIds and rxRequiredProductIds are required' });
  }

  const check = prescriptionVerificationServiceInstance.validatePharmacyOrderSafety(
    cartProductIds,
    rxRequiredProductIds,
    prescriptionId
  );
  return res.json(check);
});
