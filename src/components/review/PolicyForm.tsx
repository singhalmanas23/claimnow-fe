import React from 'react';
import { PolicyInfo } from '@/types/review';
import FormInput from '@/components/ui/FormInput';

interface FieldConfidence {
  [key: string]: number;
}

interface PolicyFormProps {
  policyInfo: PolicyInfo;
  onFieldChange: (field: keyof PolicyInfo, value: string) => void;
  fieldConfidences?: FieldConfidence;
}

const getConfidenceBorderClass = (confidence?: number): string => {
  if (!confidence) return 'border-[#D8DDE7]';
  if (confidence < 0.5) return 'border-2 border-red-500 focus:border-red-600 focus:ring-red-500';
  if (confidence < 0.9) return 'border-2 border-amber-500 focus:border-amber-600 focus:ring-amber-500';
  return 'border-[#D8DDE7]';
};

const ConfidenceBadge = ({ confidence }: { confidence?: number }) => {
  if (!confidence || confidence >= 0.9) return null;
  
  const isCritical = confidence < 0.5;
  const percentage = Math.round(confidence * 100);
  
  return (
    <div className={`absolute right-2 top-2 z-10 mb-4 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
      isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z" 
          fill={isCritical ? '#EF4444' : '#F59E0B'} fillOpacity="0.2"/>
        <path d="M6 3.5V6.5M6 8.5H6.005" 
          stroke={isCritical ? '#DC2626' : '#D97706'} 
          strokeWidth="1.5" 
          strokeLinecap="round"/>
      </svg>
    </div>
  );
};

export default function PolicyForm({ policyInfo, onFieldChange, fieldConfidences }: PolicyFormProps) {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium text-[#1D2433]">
          Header & Policy Information
        </h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Hospital Name</div>
            <input
              type="text"
              value={policyInfo.hospitalName}
              onChange={(e) => onFieldChange('hospitalName', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.hospitalName)
              }`}
              placeholder="Enter hospital name"
            />
            <ConfidenceBadge confidence={fieldConfidences?.hospitalName} />
          </div>
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Patient Name</div>
            <input
              type="text"
              value={policyInfo.patientName}
              onChange={(e) => onFieldChange('patientName', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.patientName)
              }`}
              placeholder="Enter patient name"
            />
            <ConfidenceBadge confidence={fieldConfidences?.patientName} />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Bill No</div>
            <input
              type="text"
              value={policyInfo.billNo}
              onChange={(e) => onFieldChange('billNo', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.billNo)
              }`}
              placeholder="Enter bill number"
            />
            <ConfidenceBadge confidence={fieldConfidences?.billNo} />
          </div>
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Bill Date</div>
            <input
              type="date"
              value={policyInfo.billDate}
              onChange={(e) => onFieldChange('billDate', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.billDate)
              }`}
            />
            <ConfidenceBadge confidence={fieldConfidences?.billDate} />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Admission Date</div>
            <input
              type="date"
              value={policyInfo.admissionDate}
              onChange={(e) => onFieldChange('admissionDate', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.admissionDate)
              }`}
            />
            <ConfidenceBadge confidence={fieldConfidences?.admissionDate} />
          </div>
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Discharge Date</div>
            <input
              type="date"
              value={policyInfo.dischargeDate}
              onChange={(e) => onFieldChange('dischargeDate', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.dischargeDate)
              }`}
            />
            <ConfidenceBadge confidence={fieldConfidences?.dischargeDate} />
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Policy Number</div>
            <input
              type="text"
              value={policyInfo.policyNumber}
              onChange={(e) => onFieldChange('policyNumber', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.policyNumber)
              }`}
              placeholder="Enter policy number"
            />
            <ConfidenceBadge confidence={fieldConfidences?.policyNumber} />
          </div>
          <div className="flex-1 relative">
            <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Insurance Provider</div>
            <input
              type="text"
              value={policyInfo.insuranceProvider}
              onChange={(e) => onFieldChange('insuranceProvider', e.target.value)}
              className={`w-full h-14 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                getConfidenceBorderClass(fieldConfidences?.insuranceProvider)
              }`}
              placeholder="Enter insurance provider name"
            />
            <ConfidenceBadge confidence={fieldConfidences?.insuranceProvider} />
          </div>
        </div>
      </div>
    </div>
  );
}
