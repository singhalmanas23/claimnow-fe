"use client";

import UploadComponent, { UploadState } from '@/components/UploadComponent';
import React, { useState } from 'react';

export default function UploadDemo() {
  const [currentDemo, setCurrentDemo] = useState<UploadState>('empty');

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
  };

  const handleStartClaim = () => {
    console.log('Starting claim...');
    alert('Starting claim process!');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-poppins font-semibold text-[32px] leading-[48px] text-[#1D2433] mb-4">
            Upload Component Demo
          </h1>
          <p className="font-poppins font-normal text-[16px] leading-[24px] text-[rgba(29,36,51,0.65)] mb-8">
            Pixel-perfect upload component with three states based on Figma designs
          </p>
          
          {/* State Toggle Buttons */}
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => setCurrentDemo('empty')}
              className={`px-6 py-2 rounded-lg font-poppins font-medium text-sm transition-colors ${
                currentDemo === 'empty'
                  ? 'bg-[#2F5FED] text-white'
                  : 'bg-white text-[#1D2433] border border-[#D8DDE7] hover:bg-gray-50'
              }`}
            >
              Empty State
            </button>
            <button
              onClick={() => setCurrentDemo('processing')}
              className={`px-6 py-2 rounded-lg font-poppins font-medium text-sm transition-colors ${
                currentDemo === 'processing'
                  ? 'bg-[#2F5FED] text-white'
                  : 'bg-white text-[#1D2433] border border-[#D8DDE7] hover:bg-gray-50'
              }`}
            >
              Processing State
            </button>
            <button
              onClick={() => setCurrentDemo('success')}
              className={`px-6 py-2 rounded-lg font-poppins font-medium text-sm transition-colors ${
                currentDemo === 'success'
                  ? 'bg-[#2F5FED] text-white'
                  : 'bg-white text-[#1D2433] border border-[#D8DDE7] hover:bg-gray-50'
              }`}
            >
              Success State
            </button>
          </div>
        </div>

        {/* Demo Components */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Live Component */}
          <div className="bg-white rounded-[16px] p-8 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
            <h3 className="font-poppins font-semibold text-[20px] leading-[30px] text-[#1D2433] mb-6">
              Interactive Upload Component
            </h3>
            <div className="flex justify-center">
              <UploadComponent 
                onFileUpload={handleFileUpload}
                onStartClaim={handleStartClaim}
              />
            </div>
          </div>

          {/* State Demos */}
          <div className="space-y-8">
            <div className="bg-white rounded-[16px] p-8 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
              <h3 className="font-poppins font-semibold text-[20px] leading-[30px] text-[#1D2433] mb-6">
                Current Demo State: {currentDemo.charAt(0).toUpperCase() + currentDemo.slice(1)}
              </h3>
              <div className="flex justify-center">
                <StaticUploadDemo state={currentDemo} />
              </div>
            </div>
          </div>
        </div>

        {/* Design Specifications */}
        <div className="mt-16 bg-white rounded-[16px] p-8 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
          <h3 className="font-poppins font-semibold text-[24px] leading-[36px] text-[#1D2433] mb-6">
            Design Specifications
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Empty State Specs */}
            <div className="space-y-4">
              <h4 className="font-poppins font-medium text-[18px] leading-[27px] text-[#1D2433]">
                Empty State
              </h4>
              <ul className="space-y-2 font-poppins text-sm text-[rgba(29,36,51,0.65)]">
                <li>• 424px × 250px container</li>
                <li>• Dashed border (#D8DDE7)</li>
                <li>• 12px border radius</li>
                <li>• Upload icon (48×48)</li>
                <li>• Drag & drop functionality</li>
                <li>• &quot;Choose Files&quot; link interaction</li>
              </ul>
            </div>

            {/* Processing State Specs */}
            <div className="space-y-4">
              <h4 className="font-poppins font-medium text-[18px] leading-[27px] text-[#1D2433]">
                Processing State
              </h4>
              <ul className="space-y-2 font-poppins text-sm text-[rgba(29,36,51,0.65)]">
                <li>• Same container dimensions</li>
                <li>• Solid border (#D8DDE7)</li>
                <li>• Loading spinner animation</li>
                <li>• File name display</li>
                <li>• Processing message</li>
                <li>• 2-second simulation</li>
              </ul>
            </div>

            {/* Success State Specs */}
            <div className="space-y-4">
              <h4 className="font-poppins font-medium text-[18px] leading-[27px] text-[#1D2433]">
                Success State
              </h4>
              <ul className="space-y-2 font-poppins text-sm text-[rgba(29,36,51,0.65)]">
                <li>• Auto height container</li>
                <li>• Success checkmark icon</li>
                <li>• Green success color (#08875D)</li>
                <li>• &quot;Start claim&quot; button</li>
                <li>• Gradient button styling</li>
                <li>• Full width button</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Static component for demo purposes
function StaticUploadDemo({ state }: { state: UploadState }) {
  const renderEmptyState = () => (
    <div className="w-[424px] h-[250px] border-2 border-dashed border-[#D8DDE7] rounded-[12px] bg-white flex flex-col items-center justify-center">
      <div className="mb-6">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M42 32V38C42 39.0609 41.5786 40.0783 40.8284 40.8284C40.0783 41.5786 39.0609 42 38 42H10C8.93913 42 7.92172 41.5786 7.17157 40.8284C6.42143 40.0783 6 39.0609 6 38V32M34 16L24 6L14 16M24 6V32" 
            stroke="#9CA3AF" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-poppins font-medium text-[16px] leading-[24px] text-[#1D2433] mb-1">
          Drag & drop files or{' '}
          <span className="text-[#2F5FED] underline">
            Choose Files
          </span>
        </p>
        <p className="font-poppins font-normal text-[14px] leading-[21px] text-[rgba(29,36,51,0.65)]">
          Upload your medical bills or receipts
        </p>
      </div>
    </div>
  );

  const renderProcessingState = () => (
    <div className="w-[424px] h-[250px] bg-white rounded-[12px] border border-[#D8DDE7] flex flex-col items-center justify-center">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 relative">
          <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#2F5FED] rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="font-poppins font-medium text-[16px] leading-[24px] text-[#1D2433]">
            Bill11.pdf
          </p>
          <p className="font-poppins font-normal text-[14px] leading-[21px] text-[rgba(29,36,51,0.65)]">
            Processing your file...
          </p>
        </div>
      </div>
    </div>
  );

  const renderSuccessState = () => (
    <div className="w-[424px] bg-white rounded-[12px] border border-[#D8DDE7] p-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#08875D] rounded-full flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-poppins font-semibold text-[20px] leading-[30px] text-[#1D2433] mb-2">
          Bill11.pdf
        </p>
        <p className="font-poppins font-medium text-[16px] leading-[24px] text-[#08875D] mb-8">
          Uploaded successfully
        </p>
        <button className="w-full h-[48px] bg-gradient-to-br from-[#2F5FED] to-[#5D86FF] text-white font-poppins font-medium text-[14px] leading-[21px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
          Start claim
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      {state === 'empty' && renderEmptyState()}
      {state === 'processing' && renderProcessingState()}
      {state === 'success' && renderSuccessState()}
    </div>
  );
}
