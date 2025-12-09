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
    <header className="w-full h-[72px] bg-white border-b border-[#D8DDE7] flex items-center justify-between px-6 lg:px-16 sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent flex-shrink-0">
        ClaimNow.ai
      </div>
      
      <div className="flex items-center gap-3 lg:gap-9">
        {/* Progress Indicator */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center border ${
                  step.status === 'completed' 
                    ? 'bg-[#EDFDF8] border-[#08875D]' 
                    : step.status === 'current'
                    ? 'border-[rgba(29,36,51,0.8)]'
                    : 'border-[#D8DDE7]'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckIcon className="w-3 h-2 xl:w-3.5 xl:h-2.5" />
                  ) : step.status === 'current' ? (
                    <div className="w-3 h-3 xl:w-3.5 xl:h-3.5 bg-[rgba(29,36,51,0.8)] rounded-full"></div>
                  ) : null}
                </div>
                <span className={`text-[10px] xl:text-xs font-medium ${
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
                    ? 'w-[80px] xl:w-[122px] bg-[#08875D]'
                    : 'w-[80px] xl:w-[129px] bg-[#D8DDE7] border-dashed border-t'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Help Button */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-1.5 lg:py-2 bg-[#FFF8EB] rounded">
          <HelpIcon />
          <span className="text-sm lg:text-base font-bold text-[#B25E09]">Need help?</span>
        </div>

        {/* Notification */}
        <div className="hidden md:block">
          <NotificationIcon />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center overflow-hidden">
              {!isLoading && (
                <span className="text-white font-bold text-xs lg:text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm lg:text-base font-bold text-[rgba(29,36,51,0.8)]">
                {isLoading ? 'Loading...' : userName}
              </span>
              <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">
                {userEmail}
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            <ChevronDownIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
