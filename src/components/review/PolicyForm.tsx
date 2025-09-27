import React from 'react';
import { PolicyInfo } from '@/types/review';
import FormInput from '@/components/ui/FormInput';

interface PolicyFormProps {
  policyInfo: PolicyInfo;
  onFieldChange: (field: keyof PolicyInfo, value: string) => void;
}

export default function PolicyForm({ policyInfo, onFieldChange }: PolicyFormProps) {
  return (
    <div className="mb-16">
      <h2 className="text-xl font-medium text-[#1D2433] mb-4">
        Header & Policy Information
      </h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <FormInput
              label="Hospital Name"
              value={policyInfo.hospitalName}
              onChange={(value) => onFieldChange('hospitalName', value)}
            />
          </div>
          <div className="flex-1">
            <FormInput
              label="Patient Name"
              value={policyInfo.patientName}
              onChange={(value) => onFieldChange('patientName', value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <FormInput
              label="Bill No"
              value={policyInfo.billNo}
              onChange={(value) => onFieldChange('billNo', value)}
            />
          </div>
          <div className="flex-1">
            <FormInput
              label="Bill Date"
              type="date"
              value={policyInfo.billDate}
              onChange={(value) => onFieldChange('billDate', value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <FormInput
              label="Admission Date"
              type="date"
              value={policyInfo.admissionDate}
              onChange={(value) => onFieldChange('admissionDate', value)}
            />
          </div>
          <div className="flex-1">
            <FormInput
              label="Discharge Date"
              type="date"
              value={policyInfo.dischargeDate}
              onChange={(value) => onFieldChange('dischargeDate', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
