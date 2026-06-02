import React from 'react';
import { HelpIcon, NotificationIcon, ChevronDownIcon } from '@/components/icons/Icons';

interface ProcessedHeaderProps {
  userName?: string;
  userEmail?: string;
  isLoading?: boolean;
}

// Minimal header — the page body renders its own progress stepper. The
// previous design crammed a 3-step stepper into this row alongside the
// logo, help button, and profile, which collided and wrapped badly on
// anything narrower than ~1500px.
export default function ProcessedHeader({
  userName = "User",
  userEmail = "View profile",
  isLoading = false,
}: ProcessedHeaderProps) {
  return (
    <header className="w-full h-[72px] bg-white border-b border-[#D8DDE7] flex items-center justify-between px-8 lg:px-16 sticky top-0 z-50">
      {/* Logo */}
      <div className="text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent flex-shrink-0">
        ClaimNow.ai
      </div>

      <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
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
          <div className="hidden md:flex flex-col min-w-0 max-w-[180px]">
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
    </header>
  );
}
