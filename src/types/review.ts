// Types for the review page components
export interface ItemizedCharge {
  id: string;
  costTitle: string;
  quantity: number;
  unitPrice: number;
}

export interface PolicyInfo {
  hospitalName: string;
  patientName: string;
  billNo: string;
  billDate: string;
  admissionDate: string;
  dischargeDate: string;
  policyNumber: string;
  insuranceProvider: string;
  icdCode: string;
}

export interface ReviewState {
  policyInfo: PolicyInfo;
  itemizedCharges: ItemizedCharge[];
  isSubmitting: boolean;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
}
