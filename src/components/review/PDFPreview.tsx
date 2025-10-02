'use client';

import React, { useEffect, useState } from 'react';
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
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [pdfError, setPdfError] = useState<string>('');

  useEffect(() => {
    // Load PDF data from sessionStorage
    const storedPdfData = sessionStorage.getItem('uploadedPdfData');
    console.log('PDFPreview: Checking for stored PDF data');
    
    if (storedPdfData) {
      console.log('PDFPreview: PDF data found, length:', storedPdfData.length);
      setPdfData(storedPdfData);
      setShowFallback(false);
    } else {
      console.warn('PDFPreview: No PDF data found in sessionStorage, showing fallback');
      setShowFallback(true);
    }
  }, []);

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
      <div className="text-xl font-semibold text-[rgba(29,36,51,0.8)] mb-4">
        {fileName}
      </div>
      
      {/* Status indicator */}
      <div className="mb-4">
        {pdfData && !showFallback ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Original document loaded</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Showing extracted data preview</span>
          </div>
        )}
      </div>
      
      {/* PDF Preview Container */}
      <div className="w-full h-[700px] bg-white rounded-lg shadow-lg relative overflow-hidden border border-gray-200">
        {pdfData && !showFallback ? (
          /* Real PDF Preview using iframe */
          <iframe
            src={pdfData}
            className="w-full h-full border-0"
            title="PDF Preview"
            onError={(e) => {
              console.error('PDFPreview: iframe error', e);
              setPdfError('Failed to load PDF in preview');
              setShowFallback(true);
            }}
          />
        ) : (
          /* Fallback preview with extracted data */
          <div className="w-full h-full overflow-auto p-6">
            {pdfError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                {pdfError}
              </div>
            )}
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
        )}
      </div>
    </div>
  );
}
