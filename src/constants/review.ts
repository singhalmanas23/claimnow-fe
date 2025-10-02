import { PolicyInfo, ItemizedCharge } from '@/types/review';

export const STATIC_POLICY_DATA: PolicyInfo = {
  hospitalName: 'Apollo Hospitals',
  patientName: 'Sravana Kumar',
  billNo: 'ICR33540',
  billDate: '13/01/2025',
  admissionDate: '13/01/2025',
  dischargeDate: '14/01/2025',
  policyNumber: 'POL123456',
  insuranceProvider: 'Star Health Insurance'
};

export const STATIC_ITEMIZED_CHARGES: ItemizedCharge[] = [
  { id: '1', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
  { id: '2', costTitle: 'Consultation', quantity: 2, unitPrice: 1500 },
  { id: '3', costTitle: 'Laboratory Tests', quantity: 3, unitPrice: 800 },
  { id: '4', costTitle: 'Room Charges', quantity: 1, unitPrice: 5000 },
  { id: '5', costTitle: 'Nursing Care', quantity: 2, unitPrice: 1200 },
  { id: '6', costTitle: 'Medical Supplies', quantity: 1, unitPrice: 2000 }
];

export const PROGRESS_STEPS = [
  { id: 'upload', label: 'Upload document', status: 'completed' as const },
  { id: 'process', label: 'Process Claim', status: 'current' as const },
  { id: 'complete', label: 'Successfully Processed', status: 'pending' as const }
];
