import React from 'react';
import { PolicyInfo, ItemizedCharge } from '@/types/review';

interface PDFPreviewProps {
  fileName?: string;
  policyInfo: PolicyInfo;
  itemizedCharges: ItemizedCharge[];
}

export default function PDFPreview({ 
  fileName = "Bill11.pdf", 
  policyInfo, 
  itemizedCharges 
}: PDFPreviewProps) {
  const getTotalAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const getGrandTotal = () => {
    return itemizedCharges.reduce((total, charge) => 
      total + getTotalAmount(charge.quantity, charge.unitPrice), 0
    );
  };

  return (
    <div className="w-[447px] p-16 bg-gray-50">
      <h1 className="text-[28px] font-semibold text-black mb-6">
        Verify Data & Enter Policy Details
      </h1>
      <div className="text-xl font-semibold text-[rgba(29,36,51,0.8)] mb-8">
        {fileName}
      </div>
      
      {/* PDF Preview Container */}
      <div className="w-full h-[808px] bg-[rgba(216,221,231,0.5)] rounded-t-3xl relative">
        {/* Real PDF content would go here - for now showing preview */}
        <div className="absolute inset-4 top-[137px] bg-white rounded border">
          {/* PDF Preview Content */}
          <div className="p-6 text-sm">
            <div className="border-b pb-4 mb-4">
              <h3 className="font-bold text-lg mb-2">{policyInfo.hospitalName}</h3>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div><strong>Patient:</strong> {policyInfo.patientName}</div>
                <div><strong>Bill No:</strong> {policyInfo.billNo}</div>
                <div><strong>Bill Date:</strong> {policyInfo.billDate}</div>
                <div><strong>Admission:</strong> {policyInfo.admissionDate}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Itemized Charges</h4>
              <div className="space-y-1">
                {itemizedCharges.map((charge) => (
                  <div key={charge.id} className="flex justify-between text-xs">
                    <span>{charge.costTitle} (×{charge.quantity})</span>
                    <span>₹{getTotalAmount(charge.quantity, charge.unitPrice).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>₹{getGrandTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
