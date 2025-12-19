"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UploadComponent from '../../components/UploadComponent';
import { useExtractClaim, useClaimStatus, useExtractedData } from '@/hooks/use-claims';
import { useCurrentUser } from '@/hooks/use-auth';
import { useClaims } from '@/hooks/use-claims';
import type { ExtractedDataResponse } from '@/lib/api-types';
import { pdfStorage } from '@/lib/pdf-storage';

export default function UploadPage() {
  const router = useRouter();
  const extractClaimMutation = useExtractClaim();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: claims } = useClaims({ limit: 5 });
  
  const [uploadState, setUploadState] = useState<'empty' | 'processing' | 'success'>('empty');
  const [extractedData, setExtractedData] = useState<ExtractedDataResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [, setUploadedFile] = useState<File | null>(null);
  const [currentPdfId, setCurrentPdfId] = useState<string>('');
  const [isPdfStored, setIsPdfStored] = useState<boolean>(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  
  // Poll claim status every 2 seconds when we have a claim_id
  const { data: statusData } = useClaimStatus(claimId, isPolling);
  
  // Fetch extracted data only when status is 'completed'
  const shouldFetchExtracted = statusData?.status === 'extracted';
  const { data: extractedDataResponse } = useExtractedData(
    claimId,
    shouldFetchExtracted
  );

  // Handle polling results
  useEffect(() => {
    if (statusData) {
      console.log('Upload: Status update:', statusData.status, '| Polling active:', isPolling);
      
      if (statusData.status === 'extracted') {
        // Stop polling when completed
        setIsPolling(false);
        console.log('Upload: ✓ Extraction completed, stopping poll');
      } else if (statusData.status === 'failed') {
        // Stop polling on failure
        setIsPolling(false);
        setUploadState('empty');
        setError(statusData.last_error || 'Extraction failed. Please try again.');
        console.error('Upload: ✗ Extraction failed:', statusData.last_error);
      }
    }
  }, [statusData, isPolling]);
  
  // Handle extracted data response
  useEffect(() => {
    if (extractedDataResponse && statusData?.status === 'extracted') {
      console.log('Upload: Extracted data received:', extractedDataResponse);
      setExtractedData(extractedDataResponse);
      setUploadState('success');
    }
  }, [extractedDataResponse, statusData]);

  const handleFileUpload = async (file: File) => {
    setUploadState('processing');
    setError('');
    setUploadedFileName(file.name);
    setUploadedFile(file);
    setIsPdfStored(false);
    setClaimId(null);
    setExtractedData(null);
    
    console.log('Upload: Starting file upload for', file.name, 'Size:', file.size, 'Type:', file.type);
    const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Upload: Generated PDF ID:', pdfId);
    setCurrentPdfId(pdfId);
    
    // Convert file to base64 for preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      console.log('Upload: PDF converted to base64. Size:', (base64Data.length / 1024 / 1024).toFixed(2), 'MB');
      
      try {
        // Store in IndexedDB (supports large files)
        await pdfStorage.storePDF(pdfId, file, base64Data);
        
        // Store current PDF ID in sessionStorage (small, won't exceed quota)
        sessionStorage.setItem('currentPdfId', pdfId);
        
        // Cleanup old PDFs (keep only 3 most recent)
        await pdfStorage.cleanupOldPDFs(3);
        
        setIsPdfStored(true);
        console.log('Upload: PDF stored successfully in IndexedDB with ID:', pdfId);
      } catch (err) {
        console.error('Upload: Failed to store PDF:', err);
        setError('Failed to store PDF. File might be too large.');
        setIsPdfStored(false);
      }
    };
    
    reader.onerror = () => {
      console.error('Upload: Error reading file');
      setError('Failed to read PDF file');
      setIsPdfStored(false);
    };
    
    reader.readAsDataURL(file);
    
    try {
      console.log('Upload: Calling extraction API...');
      const result = await extractClaimMutation.mutateAsync(file);
      console.log('Upload: Got claim_id:', result.claim_id, 'status:', result.status);
      
      // Start polling for status
      setClaimId(result.claim_id);
      setIsPolling(true);
      
    } catch (err: unknown) {
      setUploadState('empty');
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to extract claim data. Please try again.')
        : 'Failed to extract claim data. Please try again.';
      setError(errorMessage);
      console.error('Upload: Extraction failed:', err);
    }
  };

  const handleUploadSuccess = () => {
    // This is called when file is successfully uploaded (UI state)
  };

  const handleStartClaim = () => {
    if (extractedData) {
      // Ensure PDF is stored before navigating
      if (!isPdfStored) {
        console.warn('Upload: PDF not yet stored, waiting...');
        setError('Please wait, PDF is still loading...');
        return;
      }
      
      console.log('Upload: Starting claim with PDF ID:', currentPdfId);
      sessionStorage.setItem('extractedClaimData', JSON.stringify(extractedData));
      sessionStorage.setItem('uploadedFileName', uploadedFileName);
      
      // Store claim_id for adjudication workflow
      if (claimId) {
        sessionStorage.setItem('currentClaimId', claimId);
        console.log('Upload: Stored claim ID:', claimId);
      }
      
      const verifyPdfId = sessionStorage.getItem('currentPdfId');
      console.log('Upload: Verified PDF ID in storage:', verifyPdfId);
      
      router.push('/review');
    }
  };

  const handleReset = () => {
    setUploadState('empty');
    setExtractedData(null);
    setError('');
    setUploadedFileName('');
    setClaimId(null);
    setIsPolling(false);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -left-[49px] top-[423px] w-[1538px] h-[1538px] bg-[#2F5FED] opacity-70 rounded-full blur-[370px]"></div>
      <div className="absolute left-[48px] top-[520px] w-[1344px] h-[1344px] bg-[#688DFF] opacity-70 rounded-full blur-[370px]"></div>
      <div className="absolute left-[161px] top-[633px] w-[1118px] h-[1118px] bg-[#68DEFF] opacity-70 rounded-full blur-[370px]"></div>

      {/* Header */}
      <header className="w-full h-[72px] border-b border-[#D8DDE7] bg-white/90 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between h-full px-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="font-satoshi font-bold text-[20px] leading-[27px] bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent">
              ClaimNow.ai
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center pt-[124px] relative z-10">
        {/* Welcome Section */}
        <div className="flex items-center gap-1 mb-[29px]">
          <span className="font-poppins font-medium text-[20px] leading-[30px] text-[rgba(29,36,51,0.8)]">
            Welcome {currentUser?.full_name || currentUser?.username || 'User'}!
          </span>
          <span className="font-satoshi font-medium text-[20px] leading-[27px] text-black">
            👋
          </span>
        </div>

        {/* Main Heading */}
        <h2 className="font-poppins font-semibold text-[40px] leading-[60px] text-center bg-gradient-to-r from-black to-[#414141] bg-clip-text text-transparent mb-[27px] max-w-[592px]">
          Start your claim process now
        </h2>

        {/* Error Message */}
        {error && (
          <div className="w-[739px] mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Polling Status */}
        {isPolling && statusData && (
          <div className="w-[739px] mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-700 font-medium">
                {statusData.status === 'queued' && 'Processing claim... (queued)'}
                {statusData.status === 'processing' && 'Extracting data from document...'}
                {statusData.status === 'adjudicating' && 'Adjudicating claim...'}
              </p>
            </div>
          </div>
        )}

        {/* PDF Storage Status */}
        {extractedData && uploadState === 'success' && !isPdfStored && (
          <div className="w-[739px] mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-700 font-medium">Preparing PDF preview...</p>
            </div>
          </div>
        )}

        {/* Success Message with Extraction Status */}
        {extractedData && uploadState === 'success' && (
          <div className="w-[739px] mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✓ Document extracted successfully! Patient: {extractedData.patient_name.value} | 
              Hospital: {extractedData.hospital_name.value} | 
              Amount: ₹{extractedData.net_payable_amount.value.toLocaleString()}
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="w-[739px] h-[312px] bg-white/90 backdrop-blur-sm rounded-[32px] relative mb-[241px]">
          {/* Functional Upload Component */}
          <div className="absolute left-3 top-3 w-[715px] h-[228px]">
            <UploadComponent 
              onFileUpload={handleFileUpload}
              onStartClaim={handleStartClaim}
              onUploadSuccess={handleUploadSuccess}
              onReset={handleReset}
              uploadState={uploadState}
              uploadedFileName={uploadedFileName}
              className="w-full h-full"
            />
          </div>

          {/* Dynamic Send/Start Claim Button */}
          <div className="absolute right-3 bottom-3">
            {uploadState === 'success' && extractedData ? (
              <button 
                className="flex items-center gap-[7px] bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] text-white px-5 py-3 rounded-full hover:from-[#2854D6] hover:to-[#4B7AE8] transition-all duration-200"
                onClick={handleStartClaim}
                disabled={extractClaimMutation.isPending}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg width="19.5" height="19.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="font-satoshi font-medium text-[16px] leading-[21.6px]">
                  {extractClaimMutation.isPending ? 'Processing...' : 'Start claim'}
                </span>
              </button>
            ) : (
              <button 
                className="w-12 h-12 bg-[rgba(29,36,51,0.4)] rounded-full flex items-center justify-center hover:bg-[rgba(29,36,51,0.6)] transition-colors"
                onClick={() => console.log('Send clicked')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M16.5 1.5L8.25 9.75M16.5 1.5L11.25 16.5L8.25 9.75M16.5 1.5L1.5 6.75L8.25 9.75" 
                    stroke="white" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Recent Claims Section */}
        <div className="w-full max-w-[1312px] mx-auto px-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-[24px] p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-medium text-[20px] leading-[36px] text-[#1D2433]">
                Recent Processed Claims ({claims?.length || 0})
              </h3>
              {claims && claims.length > 0 && (
                <button
                  onClick={() => router.push('/claims')}
                  className="text-[#2F5FED] hover:text-[#2854D6] font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  View All
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
            {claims && claims.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                You have {claims.length} claim{claims.length !== 1 ? 's' : ''} in your history.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
