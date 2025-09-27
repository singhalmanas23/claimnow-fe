'use client';

import React, { useState } from 'react';

interface ItemizedCharge {
  id: string;
  costTitle: string;
  quantity: number;
  unitPrice: number;
  hasIssue?: boolean;
  issueField?: 'costTitle' | 'unitPrice';
}

interface PolicyInfo {
  hospitalName: string;
  patientName: string;
  billNo: string;
  billDate: string;
  admissionDate: string;
  dischargeDate: string;
}

interface ReviewComponentProps {
  fileName?: string;
  onNext?: () => void;
  onReset?: () => void;
  state?: 'with-issues' | 'single-issue' | 'no-issues';
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({
  fileName = "Bill11.pdf",
  onNext,
  onReset,
  state = 'with-issues'
}) => {
  // const [policyInfo, setPolicyInfo] = useState<PolicyInfo>({
  const [policyInfo] = useState<PolicyInfo>({
    hospitalName: 'Apollo Hospitals',
    patientName: 'Sravana Kumar',
    billNo: 'ICR33540',
    billDate: '13/01/2025',
    admissionDate: '13/01/2025',
    dischargeDate: '14/01/2025'
  });

  const getInitialCharges = (): ItemizedCharge[] => {
    const baseCharges = [
      { id: '1', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
      { id: '2', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
      { id: '3', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
      { id: '4', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
      { id: '5', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
      { id: '6', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 },
      { id: '7', costTitle: 'Pharmacy', quantity: 1, unitPrice: 4000 }
    ];

    if (state === 'with-issues') {
      return baseCharges.map((charge, index) => ({
        ...charge,
        hasIssue: index === 2 || index === 5 || index === 6,
        issueField: index === 2 ? 'unitPrice' : index === 6 ? 'unitPrice' : index === 5 ? 'costTitle' : undefined
      }));
    } else if (state === 'single-issue') {
      return baseCharges.map((charge, index) => ({
        ...charge,
        hasIssue: index === 2,
        issueField: index === 2 ? 'unitPrice' : undefined
      }));
    }
    
    return baseCharges;
  };

  const [itemizedCharges, setItemizedCharges] = useState<ItemizedCharge[]>(getInitialCharges());

  const updateQuantity = (id: string, delta: number) => {
    setItemizedCharges(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const updateUnitPrice = (id: string, delta: number) => {
    setItemizedCharges(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, unitPrice: Math.max(0, item.unitPrice + delta * 1000) }
          : item
      )
    );
  };

  const addNewItem = () => {
    const newItem: ItemizedCharge = {
      id: Date.now().toString(),
      costTitle: 'Pharmacy',
      quantity: 1,
      unitPrice: 4000
    };
    setItemizedCharges(prev => [...prev, newItem]);
  };

  const getTotalAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const getIssuesCount = () => {
    if (state === 'no-issues') return 0;
    if (state === 'single-issue') return 1;
    return 3; // with-issues state
  };

  const getIssuesBadge = () => {
    const issuesCount = getIssuesCount();
    
    if (issuesCount === 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-[#EDFDF8] rounded-full">
          <div className="w-6 h-6 bg-[#08875D] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">0</span>
          </div>
          <span className="text-[#08875D] text-xs font-medium">Issues found</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-[#FEF1F2] rounded-full">
        <div className="w-6 h-6 bg-[#E02D3C] rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{issuesCount}</span>
        </div>
        <span className="text-[#E02D3C] text-xs font-medium">
          {issuesCount === 1 ? 'Issues found' : state === 'with-issues' ? 'Needs attention' : 'Issues found'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full h-[72px] bg-white border-b border-[#D8DDE7] flex items-center justify-between px-16">
        <div className="text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent">
          ClaimNow.ai
        </div>
        
        <div className="flex items-center gap-9">
          {/* Progress indicator */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-[#EDFDF8] border border-[#08875D] rounded-full flex items-center justify-center">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="m1 4.94 3.44 3.44L12.56 0.94" stroke="#08875D" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-[#1D2433]">Upload document</span>
            </div>
            
            <div className="w-[122px] h-px bg-[#08875D]"></div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 border border-[rgba(29,36,51,0.8)] rounded-full flex items-center justify-center">
                <div className="w-3.5 h-3.5 bg-[rgba(29,36,51,0.8)] rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Process Claim</span>
            </div>
            
            <div className="w-[129px] h-px bg-[#D8DDE7] border-dashed border-t"></div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 border border-[#D8DDE7] rounded-full"></div>
              <span className="text-sm font-medium text-[rgba(29,36,51,0.65)]">Successfull Processed</span>
            </div>
          </div>

          {/* Help button */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[#FFF8EB] rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="#B25E09"/>
            </svg>
            <span className="text-base font-bold text-[#B25E09]">Need help?</span>
          </div>

          {/* Notification */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="2"/>
            <circle cx="19" cy="3" r="2" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="2"/>
          </svg>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[rgba(29,36,51,0.8)]">Ravi Varma</span>
                <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">More details</span>
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 12.5L10 7.5L5 12.5" stroke="rgba(29, 36, 51, 0.65)" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left side - PDF Preview */}
        <div className="w-[447px] p-16">
          <h1 className="text-[28px] font-semibold text-black mb-6">
            Verify Data & Enter Policy Details
          </h1>
          <div className="text-xl font-semibold text-[rgba(29,36,51,0.8)] mb-8">
            {fileName}
          </div>
          
          {/* PDF Preview */}
          <div className="w-full h-[808px] bg-[rgba(216,221,231,0.5)] rounded-t-3xl relative">
            <div className="absolute inset-4 top-[137px] bg-gray-200 rounded" 
                 style={{ backgroundImage: 'url(/api/placeholder/414/534)', backgroundSize: 'cover' }}>
              {/* PDF content placeholder */}
            </div>
            
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
              onClick={onReset}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 p-16">
          {/* Header & Policy Information */}
          <div className="mb-16">
            <h2 className="text-xl font-medium text-[#1D2433] mb-4">Header & Policy Information</h2>
            
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Hospital Name</div>
                    <div className="text-sm font-medium text-[#1D2433]">{policyInfo.hospitalName}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Patient Name</div>
                    <div className="text-sm font-medium text-[#1D2433]">{policyInfo.patientName}</div>
                  </div>
                </div>
              </div>
              
              {/* Row 2 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Bill No</div>
                    <div className="text-sm font-medium text-[#1D2433]">{policyInfo.billNo}</div>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Bill Date</div>
                    <div className="text-sm font-medium text-[#1D2433]">{policyInfo.billDate}</div>
                  </div>
                  <svg className="absolute right-4 top-4 w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 1.5-.64 2.5-2.25 2.5H5.25C3.64 19.5 3 18.5 3 17V8.5c0-1.5.64-2.5 2.25-2.5H18.75C20.36 6 21 7 21 8.5z" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              
              {/* Row 3 */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <div className="h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Admission Date</div>
                    <div className="text-sm font-medium text-[#1D2433]">{policyInfo.admissionDate}</div>
                  </div>
                  <svg className="absolute right-4 top-4 w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 1.5-.64 2.5-2.25 2.5H5.25C3.64 19.5 3 18.5 3 17V8.5c0-1.5.64-2.5 2.25-2.5H18.75C20.36 6 21 7 21 8.5z" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="flex-1 relative">
                  <div className="h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Discharge Date</div>
                    <div className="text-sm font-medium text-[#1D2433]">{policyInfo.dischargeDate}</div>
                  </div>
                  <svg className="absolute right-4 top-4 w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 1.5-.64 2.5-2.25 2.5H5.25C3.64 19.5 3 18.5 3 17V8.5c0-1.5.64-2.5 2.25-2.5H18.75C20.36 6 21 7 21 8.5z" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Itemised Charges */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-medium text-[#1D2433]">Itemised Charges</h2>
              {getIssuesBadge()}
            </div>
            
            <div className="space-y-4">
              {itemizedCharges.map((charge) => (
                <div key={charge.id} className="flex gap-4 items-center">
                  {/* Cost Title */}
                  <div className={`w-[212px] h-14 border rounded-lg px-5 py-2.5 ${
                    charge.hasIssue && charge.issueField === 'costTitle' 
                      ? 'border-[#E02D3C]' 
                      : 'border-[#D8DDE7]'
                  }`}>
                    <div className={`text-[11px] font-medium mb-1 ${
                      charge.hasIssue && charge.issueField === 'costTitle' 
                        ? 'text-[#E02D3C]' 
                        : 'text-[rgba(29,36,51,0.65)]'
                    }`}>
                      Cost Title
                    </div>
                    <div className="text-sm font-medium text-[#1D2433]">{charge.costTitle}</div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="w-[194px] h-14 border border-[#D8DDE7] rounded-lg px-5 py-4">
                    <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-2">Quantity</div>
                    <div className="flex items-center gap-4">
                      <button 
                        className="w-4 h-4 border border-[rgba(29,36,51,0.24)] rounded-full flex items-center justify-center"
                        onClick={() => updateQuantity(charge.id, -1)}
                      >
                        <span className="text-sm font-medium text-[#1D2433]">-</span>
                      </button>
                      <span className="text-sm font-medium text-[#1D2433]">{charge.quantity}</span>
                      <button 
                        className="w-4 h-4 border border-[rgba(29,36,51,0.24)] rounded-full flex items-center justify-center"
                        onClick={() => updateQuantity(charge.id, 1)}
                      >
                        <span className="text-sm font-medium text-[#1D2433]">+</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Unit Price */}
                  <div className={`w-[212px] h-14 border rounded-lg px-5 py-2.5 ${
                    charge.hasIssue && charge.issueField === 'unitPrice' 
                      ? 'border-[#E02D3C]' 
                      : 'border-[#D8DDE7]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className={`text-[11px] font-medium mb-1 ${
                          charge.hasIssue && charge.issueField === 'unitPrice' 
                            ? 'text-[#E02D3C]' 
                            : 'text-[rgba(29,36,51,0.65)]'
                        }`}>
                          Unit Price
                        </div>
                        <div className="text-sm font-medium text-[#1D2433]">{charge.unitPrice.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          className="w-4 h-4 border border-[rgba(29,36,51,0.24)] rounded-full flex items-center justify-center"
                          onClick={() => updateUnitPrice(charge.id, -1)}
                        >
                          <span className="text-sm font-medium text-[#1D2433]">-</span>
                        </button>
                        <button 
                          className="w-4 h-4 border border-[rgba(29,36,51,0.24)] rounded-full flex items-center justify-center"
                          onClick={() => updateUnitPrice(charge.id, 1)}
                        >
                          <span className="text-sm font-medium text-[#1D2433]">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="w-[175px] h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
                    <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Total Amount</div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">₹</span>
                      <span className="text-sm font-medium text-[#1D2433]">
                        {getTotalAmount(charge.quantity, charge.unitPrice).toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add item button */}
            <button 
              className="flex items-center gap-1 mt-4 text-[#2F5FED]"
              onClick={addNewItem}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#2F5FED" strokeWidth="2"/>
              </svg>
              <span className="text-base font-medium">Add item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-[511px] right-0 h-[92px] bg-white border-t border-[#D8DDE7] flex items-center justify-between px-16">
        <button 
          className="flex items-center gap-2 px-4 py-3 rounded-lg"
          onClick={onReset}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1.33 1.33L14.67 14.67M1.33 14.67L14.67 1.33" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="1.33"/>
          </svg>
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Reset all</span>
        </button>
        
        <button 
          className={`px-8 py-3 rounded-lg text-sm font-medium text-white ${
            state === 'no-issues' 
              ? 'bg-gradient-to-r from-[#2F5FED] to-[#547DF5]'
              : 'bg-[rgba(29,36,51,0.5)]'
          }`}
          onClick={onNext}
        >
          {state === 'no-issues' ? 'Process Now' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default ReviewComponent;
