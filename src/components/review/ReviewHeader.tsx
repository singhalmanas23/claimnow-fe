import React from 'react';
import { ProgressStep } from '@/types/review';
import { CheckIcon, HelpIcon, NotificationIcon, ChevronDownIcon } from '@/components/icons/Icons';

interface ReviewHeaderProps {
  steps: ProgressStep[];
  userName?: string;
  userEmail?: string;
  isLoading?: boolean;
}

// Two-row layout: top row is logo + actions (help, notif, profile), bottom
// row is the progress stepper (only when steps is non-empty). The previous
// design crammed all of that into a single 72px row, which collided badly
// on anything under ~1500px (long labels wrapped onto a second line under
// the step circles, overlapping the logo).
export default function ReviewHeader({
  steps,
  userName = "User",
  userEmail = "View profile",
  isLoading = false,
}: ReviewHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-[#D8DDE7] sticky top-0 z-50 shadow-sm">
      {/* Top row — logo + actions */}
      <div className="h-[64px] flex items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <div className="text-lg lg:text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent flex-shrink-0">
          ClaimNow.ai
        </div>

        <div className="flex items-center gap-4 lg:gap-5 flex-shrink-0">
          {/* Help Button */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FFF8EB] rounded">
            <HelpIcon />
            <span className="text-sm font-bold text-[#B25E09] whitespace-nowrap">Need help?</span>
          </div>

          {/* Notification */}
          <NotificationIcon />

          {/* Profile */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center overflow-hidden flex-shrink-0">
              {!isLoading && (
                <span className="text-white font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col min-w-0 max-w-[200px]">
              <span className="text-sm font-bold text-[rgba(29,36,51,0.85)] truncate">
                {isLoading ? 'Loading...' : userName}
              </span>
              <span className="text-xs font-medium text-[rgba(29,36,51,0.6)] truncate">
                {userEmail}
              </span>
            </div>
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      {/* Bottom row — progress stepper (its own row so it can breathe) */}
      {steps && steps.length > 0 && (
        <div className="border-t border-[#F1F2F4] bg-[#FAFBFD]">
          <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-10 py-3 px-6 overflow-x-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0 ${
                      step.status === 'completed'
                        ? 'bg-[#EDFDF8] border-[#08875D]'
                        : step.status === 'current'
                        ? 'border-[rgba(29,36,51,0.8)]'
                        : 'border-[#D8DDE7]'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckIcon className="w-3.5 h-2.5" />
                    ) : step.status === 'current' ? (
                      <div className="w-3 h-3 bg-[rgba(29,36,51,0.8)] rounded-full"></div>
                    ) : null}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      step.status === 'completed'
                        ? 'text-[#1D2433]'
                        : step.status === 'current'
                        ? 'text-[rgba(29,36,51,0.85)]'
                        : 'text-[rgba(29,36,51,0.6)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-px w-12 sm:w-20 lg:w-28 flex-shrink-0 ${
                      step.status === 'completed' ? 'bg-[#08875D]' : 'border-t border-dashed border-[#D8DDE7]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
