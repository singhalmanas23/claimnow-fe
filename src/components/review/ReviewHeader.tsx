import React from 'react';
import { ProgressStep } from '@/types/review';
import { CheckIcon, HelpIcon, NotificationIcon, ChevronDownIcon } from '@/components/icons/Icons';

interface ReviewHeaderProps {
  steps: ProgressStep[];
  userName?: string;
  userEmail?: string;
  isLoading?: boolean;
}

export default function ReviewHeader({ 
  steps, 
  userName = "User", 
  userEmail = "View profile",
  isLoading = false 
}: ReviewHeaderProps) {
  return (
    <header className="w-full h-[72px] bg-white border-b border-[#D8DDE7] flex items-center justify-between px-16 sticky top-0 z-50">
      {/* Logo */}
      <div className="text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent">
        ClaimNow.ai
      </div>
      
      <div className="flex items-center gap-9">
        {/* Progress Indicator */}
        <div className="flex items-center gap-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step.status === 'completed' 
                    ? 'bg-[#EDFDF8] border-[#08875D]' 
                    : step.status === 'current'
                    ? 'border-[rgba(29,36,51,0.8)]'
                    : 'border-[#D8DDE7]'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckIcon className="w-3.5 h-2.5" />
                  ) : step.status === 'current' ? (
                    <div className="w-3.5 h-3.5 bg-[rgba(29,36,51,0.8)] rounded-full"></div>
                  ) : null}
                </div>
                <span className={`text-xs font-medium ${
                  step.status === 'completed' 
                    ? 'text-[#1D2433]' 
                    : step.status === 'current'
                    ? 'text-[rgba(29,36,51,0.8)]'
                    : 'text-[rgba(29,36,51,0.65)]'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`h-px ${
                  index === 0 
                    ? 'w-[122px] bg-[#08875D]'
                    : 'w-[129px] bg-[#D8DDE7] border-dashed border-t'
                }`}></div>
              )}
            </React.Fragment>
          ))}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center overflow-hidden">
              {!isLoading && (
                <span className="text-white font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-[rgba(29,36,51,0.8)]">
                {isLoading ? 'Loading...' : userName}
              </span>
              <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">
                {userEmail}
              </span>
            </div>
          </div>
          <ChevronDownIcon />
        </div>
      </div>
    </header>
  );
}
