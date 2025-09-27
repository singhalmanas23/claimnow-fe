"use client";

import React, { useState, useRef } from 'react';

export type UploadState = 'empty' | 'processing' | 'success';

export interface UploadComponentProps {
  onFileUpload?: (file: File) => void;
  onStartClaim?: () => void;
  onUploadSuccess?: () => void;
  onReset?: () => void;
  className?: string;
}

export interface FileInfo {
  name: string;
  size?: number;
}

export default function UploadComponent({ 
  onFileUpload, 
  onStartClaim, 
  onUploadSuccess,
  onReset,
  className = "" 
}: UploadComponentProps) {
  const [uploadState, setUploadState] = useState<UploadState>('empty');
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile({ name: file.name, size: file.size });
    setUploadState('processing');
    
    // Call the onFileUpload callback if provided (file starts uploading)
    if (onFileUpload) {
      onFileUpload(file);
    }

    // Simulate processing time
    setTimeout(() => {
      setUploadState('success');
      // Call onUploadSuccess when upload is complete
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }, 2000);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  // const handleStartClaim = () => {
  //   if (onStartClaim) {
  //     onStartClaim();
  //   }
  // };

  const renderEmptyState = () => (
    <div 
      className="w-full h-full border border-dashed border-[#B2B5BC] rounded-[20px] bg-transparent flex flex-col items-center justify-center cursor-pointer hover:border-[#2F5FED] transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleChooseFiles}
    >
      {/* Upload Icon */}
      <div className="w-14 h-14 bg-white rounded-xl shadow-[4px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center mb-[55px]">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Base Upload Icon */}
            <path 
              d="M3.33337 15V33.3333C3.33337 34.2174 3.68456 35.0652 4.30969 35.6904C4.93481 36.3155 5.78265 36.6667 6.66671 36.6667H33.3334C34.2174 36.6667 35.0653 36.3155 35.6904 35.6904C36.3155 35.0652 36.6667 34.2174 36.6667 33.3333V15" 
              fill="rgba(29, 36, 51, 0.65)" 
              opacity="0.5"
            />
            {/* Arrow */}
            <path 
              d="M13.75 2.08337L20 8.33337L26.25 2.08337M20 8.33337V26.25" 
              stroke="rgba(29, 36, 51, 0.65)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {/* Text */}
      <div className="text-center">
        <p className="font-satoshi font-medium text-[16px] leading-[21.6px] text-[rgba(29,36,51,0.8)]">
          Drag & drop files or{' '}
          <span className="text-[#2F5FED] underline cursor-pointer">
            Choose Files
          </span>
        </p>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div className="w-full h-full bg-white rounded-[20px] border border-[#D8DDE7] flex flex-col items-center justify-center">
      <div className="flex items-center gap-4">
        {/* Loading Spinner */}
        <div className="w-8 h-8 relative">
          <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#2F5FED] rounded-full animate-spin"></div>
        </div>
        
        {/* File Name */}
        <div className="text-center">
          <p className="font-satoshi font-medium text-[16px] leading-[21.6px] text-[rgba(29,36,51,0.8)]">
            {uploadedFile?.name || 'Processing...'}
          </p>
          <p className="font-satoshi font-normal text-[14px] leading-[18.9px] text-[rgba(29,36,51,0.65)]">
            Processing your file...
          </p>
        </div>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="w-full h-full bg-white rounded-[20px] shadow-[4px_4px_16px_0px_rgba(0,0,0,0.08)] relative">
      {/* Close Button - positioned exactly as in Figma */}
      <button 
        className="absolute right-4 top-4 w-6 h-6 flex items-center justify-center"
        onClick={() => {
          setUploadState('empty');
          setUploadedFile(null);
          if (onReset) {
            onReset();
          }
        }}
      >
        <svg width="13.15" height="13.15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M18 6L6 18M6 6L18 18" 
            stroke="rgba(29, 36, 51, 0.8)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* File Icon - positioned at center top */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[58px] w-12 h-12 flex items-center justify-center">
        <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M32.25 43H10.75C8.68125 43 7.16667 41.4854 7.16667 39.4167V7.16667C7.16667 5.09792 8.68125 3.58333 10.75 3.58333H23.0542L35.8333 16.3625V39.4167C35.8333 41.4854 34.3188 43 32.25 43Z" 
            fill="rgba(29, 36, 51, 0.8)"
          />
          <path 
            d="M23.5 16.5H33.5L23.5 6.5V16.5Z" 
            stroke="rgba(29, 36, 51, 0.8)" 
            strokeWidth="3" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* File Name - centered and responsive width */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[112px] max-w-[400px] px-4">
        <span className="font-poppins font-medium text-[20px] leading-[30px] text-[#1D2433] text-center block truncate">
          {uploadedFile?.name || 'Bill11.pdf'}
        </span>
      </div>

      {/* Success Message with Checkmark - centered */}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-[144px] flex items-center gap-1">
        <span className="font-poppins font-medium text-[12px] leading-[18px] text-[#08875D]">
          Uploaded successfully
        </span>
        <div className="w-5 h-5 flex items-center justify-center">
          <svg width="16.67" height="16.67" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M16.6667 5L7.50004 14.1667L3.33337 10" 
              stroke="#08875D" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full ${className}`}>
      {uploadState === 'empty' && renderEmptyState()}
      {uploadState === 'processing' && renderProcessingState()}
      {uploadState === 'success' && renderSuccessState()}
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
