'use client';

import React, { useEffect, useState } from 'react';
import { PolicyInfo, ItemizedCharge } from '@/types/review';
import { pdfStorage } from '@/lib/pdf-storage';

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
  const [zoom, setZoom] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const blobUrlRef = React.useRef<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      const currentPdfId = sessionStorage.getItem('currentPdfId');
      
      if (!currentPdfId) {
        console.warn('PDFPreview: No PDF ID found in sessionStorage');
        try {
          const allPdfIds = await pdfStorage.getAllPDFIds();
          
          if (allPdfIds.length > 0) {
            const latestId = allPdfIds[allPdfIds.length - 1];
            const pdfData = await pdfStorage.getPDF(latestId);
            
            if (pdfData && pdfData.file) {
              const blobUrl = URL.createObjectURL(pdfData.file);
              blobUrlRef.current = blobUrl;
              setPdfData(blobUrl);
              setShowFallback(false);
              return;
            }
          }
        } catch (err) {
          console.error('PDFPreview: Error loading fallback PDF:', err);
        }
        
        console.warn('PDFPreview: No PDF data found anywhere, showing fallback');
        setShowFallback(true);
        return;
      }
      
      try {
        const storedPdfData = await pdfStorage.getPDF(currentPdfId);
        
        if (storedPdfData && storedPdfData.file) {
          const fileSizeMB = (storedPdfData.file.size / 1024 / 1024).toFixed(2);
          const blobUrl = URL.createObjectURL(storedPdfData.file);
          blobUrlRef.current = blobUrl;
          
          setPdfData(blobUrl);
          setShowFallback(false);
        } else {
          console.warn('PDFPreview: No PDF data found for ID:', currentPdfId);
          
          const allPdfIds = await pdfStorage.getAllPDFIds();
          
          if (allPdfIds.length > 0) {
            const latestId = allPdfIds[allPdfIds.length - 1];
            const fallbackData = await pdfStorage.getPDF(latestId);
            
            if (fallbackData && fallbackData.file) {
              const blobUrl = URL.createObjectURL(fallbackData.file);
              blobUrlRef.current = blobUrl;
              setPdfData(blobUrl);
              setShowFallback(false);
              return;
            }
          }
          
          console.warn('PDFPreview: No fallback PDF data available, showing extracted data');
          setShowFallback(true);
        }
      } catch (err) {
        console.error('PDFPreview: Error loading PDF from IndexedDB:', err);
        setShowFallback(true);
      }
    };

    loadPDF();

    // Cleanup: Revoke blob URL when component unmounts
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Track loading state of iframe
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.error('PDFPreview: iframe load error', e);
    setPdfError('Failed to load PDF in preview');
    setShowFallback(true);
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const getTotalAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const getGrandTotal = () => {
    return itemizedCharges.reduce((total, charge) => 
      total + getTotalAmount(charge.quantity, charge.unitPrice), 0
    );
  };

  const truncateFileName = (name: string, maxLength: number = 50) => {
    if (name.length <= maxLength) return name;
    
    // Get file extension
    const lastDotIndex = name.lastIndexOf('.');
    const extension = lastDotIndex > 0 ? name.substring(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;
    
    // Calculate how much of the name we can show
    const availableLength = maxLength - extension.length - 3; // -3 for "..."
    
    if (availableLength <= 0) {
      return '...' + extension;
    }
    
    // Show start of filename + ... + extension
    return nameWithoutExt.substring(0, availableLength) + '...' + extension;
  };

  return (
    <div className="w-[650px] p-8 bg-gray-50">
      <h1 className="text-[28px] font-semibold text-black mb-4">
        Verify Data & Enter Policy Details
      </h1>
      <div 
        className="text-xl font-semibold text-[rgba(29,36,51,0.8)] mb-3"
        title={fileName} // Show full name on hover
      >
        {truncateFileName(fileName, 55)}
      </div>
      
      {/* Status indicator */}
      <div className="mb-3">
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

      {/* Zoom Controls */}
      {pdfData && !showFallback && (
        <div className="mb-3 flex items-center gap-2 bg-white rounded-lg shadow-sm p-2.5 border border-gray-200">
          <span className="text-xs font-medium text-gray-600 mr-1">Zoom:</span>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <button
            onClick={handleResetZoom}
            className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded transition-colors min-w-[70px] border border-gray-200"
            title="Reset Zoom"
          >
            {zoom}%
          </button>
          
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 300}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* PDF Preview Container */}
      <div className="w-full h-[calc(100vh-280px)] min-h-[850px] bg-white rounded-lg shadow-lg relative overflow-hidden border border-gray-200">
        {pdfData && !showFallback ? (
          /* Real PDF Preview using iframe with zoom */
          <div className="w-full h-full overflow-auto bg-gray-100 flex items-start justify-center p-4">
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2F5FED] mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600 font-medium">Loading PDF...</p>
                  <p className="text-xs text-gray-500 mt-1">This may take a moment for large files</p>
                </div>
              </div>
            )}
            
            <div 
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              <iframe
                ref={iframeRef}
                src={`${pdfData}#view=FitH`}
                className="border-0 shadow-xl bg-white"
                style={{
                  width: '595px', 
                  height: '842px',
                }}
                title="PDF Preview"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto p-8">
            {pdfError && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">{pdfError}</p>
                  <p className="text-xs mt-1">Showing extracted data as fallback</p>
                </div>
              </div>
            )}
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
              <div className="border-b-2 pb-6 mb-6">
                <h3 className="font-bold text-2xl mb-4 text-gray-800">{policyInfo.hospitalName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Patient Name</span>
                    <span className="font-medium">{policyInfo.patientName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Bill Number</span>
                    <span className="font-medium">{policyInfo.billNo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Bill Date</span>
                    <span className="font-medium">{policyInfo.billDate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Admission Date</span>
                    <span className="font-medium">{policyInfo.admissionDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4 text-gray-800">Itemized Charges</h4>
                <div className="space-y-3">
                  {itemizedCharges.map((charge) => (
                    <div key={charge.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                      <div>
                        <span className="font-medium text-gray-800">{charge.costTitle}</span>
                        <span className="text-gray-500 ml-2">(Qty: {charge.quantity})</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        ₹{getTotalAmount(charge.quantity, charge.unitPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-800">Total Amount:</span>
                  <span className="text-[#2F5FED]">₹{getGrandTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
