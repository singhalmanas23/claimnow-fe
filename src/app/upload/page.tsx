"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadComponent from '../../components/UploadComponent';
import { useExtractClaim } from '@/hooks/use-claims';
import { useCurrentUser } from '@/hooks/use-auth';
import type { ExtractedDataWithConfidence } from '@/lib/api-types';

export default function UploadPage() {
  const router = useRouter();
  const extractClaimMutation = useExtractClaim();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  
  const [uploadState, setUploadState] = useState<'empty' | 'processing' | 'success'>('empty');
  const [extractedData, setExtractedData] = useState<ExtractedDataWithConfidence | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setUploadState('processing');
    setError('');
    setUploadedFileName(file.name);
    
    try {
      const result = await extractClaimMutation.mutateAsync(file);
      setExtractedData(result);
      setUploadState('success');
      console.log('Extraction successful:', result);
    } catch (err: any) {
      setUploadState('empty');
      setError(err?.response?.data?.detail || 'Failed to extract claim data. Please try again.');
      console.error('Extraction failed:', err);
    }
  };

  const handleUploadSuccess = () => {
    // This is called when file is successfully uploaded (UI state)
  };

  const handleStartClaim = () => {
    if (extractedData) {
      // Store extracted data in sessionStorage to pass to review page
      sessionStorage.setItem('extractedClaimData', JSON.stringify(extractedData));
      router.push('/review');
    }
  };

  const handleReset = () => {
    setUploadState('empty');
    setExtractedData(null);
    setError('');
    setUploadedFileName('');
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

          {/* Right Side */}
          <div className="flex items-center gap-9">
            {/* Need Help Button */}
            <div className="flex items-center gap-3 bg-[#FFF8EB] rounded px-4 py-2 h-[40px]">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" 
                    fill="#B25E09"
                  />
                  <path 
                    d="M7.57495 7.5C7.77087 6.94772 8.15758 6.48706 8.66659 6.19451C9.1756 5.90195 9.7727 5.79798 10.3521 5.90317C10.9314 6.00837 11.4571 6.31486 11.8411 6.76955C12.2251 7.22424 12.4399 7.79599 12.4499 8.39C12.4499 10 9.94995 10.8 9.94995 10.8M9.99995 14H10.0099" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-satoshi font-bold text-[16px] text-[#B25E09]">
                Need help?
              </span>
            </div>

            {/* Notification Icon */}
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 6C12 4.93913 11.5786 3.92172 10.8284 3.17157C10.0783 2.42143 9.06087 2 8 2C6.93913 2 5.92172 2.42143 5.17157 3.17157C4.42143 3.92172 4 4.93913 4 6C4 13 1 15 1 15H15C15 15 12 13 12 6Z" 
                  stroke="rgba(29, 36, 51, 0.8)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M9.73 17C9.5542 17.3031 9.3019 17.5547 8.99776 17.7295C8.69362 17.9044 8.34713 17.9965 8 17.9965C7.65287 17.9965 7.30638 17.9044 7.00224 17.7295C6.6981 17.5547 6.4458 17.3031 6.27 17" 
                  stroke="rgba(29, 36, 51, 0.8)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle cx="11" cy="5" r="2" fill="rgba(29, 36, 51, 0.8)"/>
              </svg>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[30px] bg-gray-300 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    {!userLoading && currentUser && (
                      <span className="text-white font-bold text-sm">
                        {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-satoshi font-bold text-[16px] text-[rgba(29,36,51,0.8)]">
                    {userLoading ? 'Loading...' : (currentUser?.full_name || currentUser?.username || 'User')}
                  </span>
                  <span className="font-satoshi font-medium text-[12px] text-[rgba(29,36,51,0.65)]">
                    {currentUser?.email || 'View profile'}
                  </span>
                </div>
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M1 4L5 1L9 4" 
                    stroke="rgba(29, 36, 51, 0.65)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
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

        {/* Success Message with Extraction Status */}
        {/* {extractedData && uploadState === 'success' && (
          <div className="w-[739px] mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              ✓ Document extracted successfully! Patient: {extractedData.patient_name.value} | 
              Hospital: {extractedData.hospital_name.value} | 
              Amount: ₹{extractedData.net_payable_amount.value.toLocaleString()}
            </p>
          </div>
        )} */}

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
            <h3 className="font-poppins font-medium text-[20px] leading-[36px] text-[#1D2433]">
              Recent Processed Claims (0)
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}
