import { PolicyInfo, ItemizedCharge } from '@/types/review';

// Empty initial state. The review page populates this from the backend's
// extracted_data response before render. Mock placeholder values would
// either appear permanently for fields the AI couldn't extract OR be
// mistaken for extracted values by reviewers.
export const STATIC_POLICY_DATA: PolicyInfo = {
  hospitalName: '',
  patientName: '',
  billNo: '',
  billDate: '',
  admissionDate: '',
  dischargeDate: '',
  policyNumber: '',
  insuranceProvider: '',
  icdCode: ''
};

export const STATIC_ITEMIZED_CHARGES: ItemizedCharge[] = [];

export const PROGRESS_STEPS = [
  { id: 'upload', label: 'Upload document', status: 'completed' as const },
  { id: 'process', label: 'Process Claim', status: 'current' as const },
  { id: 'complete', label: 'Successfully Processed', status: 'pending' as const }
];
