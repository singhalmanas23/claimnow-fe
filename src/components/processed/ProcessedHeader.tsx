import React from 'react';
import { CheckIcon, HelpIcon, NotificationIcon, ChevronDownIcon } from '@/components/icons/Icons';

export default function ProcessedHeader() {
  return (
    <header className="w-full h-[72px] bg-white border-b border-[#D8DDE7] flex items-center justify-between px-16 sticky top-0 z-50">
      {/* Logo */}
      <div className="text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent">
        ClaimNow.ai
      </div>
      
      <div className="flex items-center gap-9">
        {/* Progress Indicator - All Completed */}
        <div className="flex items-center gap-8">
          {/* Upload Document - Completed */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-[#EDFDF8] border border-[#08875D] rounded-full flex items-center justify-center">
              <CheckIcon className="w-3.5 h-2.5" />
            </div>
            <span className="text-xs font-medium text-[#1D2433]">Upload document</span>
          </div>
          
          {/* Line 1 - Completed */}
          <div className="w-[122px] h-px bg-[#08875D]"></div>
          
          {/* Process Claim - Completed */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 bg-[#EDFDF8] border border-[#08875D] rounded-full flex items-center justify-center">
              <CheckIcon className="w-3.5 h-2.5" />
            </div>
            <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Process Claim</span>
          </div>
          
          {/* Line 2 - Completed */}
          <div className="w-[129px] h-px bg-[#08875D]"></div>
          
          {/* Successfully Processed - Current */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 border border-[rgba(29,36,51,0.8)] rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-[rgba(29,36,51,0.8)] rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-[rgba(29,36,51,0.65)]">Successfully Processed</span>
          </div>
        </div>

        {/* Help Button */}
        <div className="flex items-center gap-3 px-4 py-2 bg-[#FFF8EB] rounded">
          <HelpIcon />
          <span className="text-base font-bold text-[#B25E09]">Need help?</span>
        </div>

        {/* Notification */}
        <NotificationIcon />

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[rgba(29,36,51,0.8)]">Ravi Varma</span>
              <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">More details</span>
            </div>
          </div>
          <ChevronDownIcon />
        </div>
      </div>
    </header>
  );
}
