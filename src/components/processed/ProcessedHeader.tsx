'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@/components/icons/Icons';
import { useLogout } from '@/hooks/use-auth';

interface ProcessedHeaderProps {
  userName?: string;
  userEmail?: string;
  isLoading?: boolean;
}

// Minimal, functional header: clickable logo + a working profile menu
// (sign out). The old "Need help?" badge and notification bell were static
// placeholders and have been removed.
export default function ProcessedHeader({
  userName = 'User',
  userEmail = 'View profile',
  isLoading = false,
}: ProcessedHeaderProps) {
  const router = useRouter();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout.mutateAsync();
    } finally {
      router.push('/');
    }
  };

  return (
    <header className="w-full h-[72px] bg-white border-b border-[#D8DDE7] flex items-center justify-between px-8 lg:px-16 sticky top-0 z-50">
      {/* Logo */}
      <button
        onClick={() => router.push('/upload')}
        className="text-xl font-bold bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent flex-shrink-0"
      >
        ClaimNow.ai
      </button>

      {/* Profile menu */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 min-w-0 rounded-lg px-2 py-1 hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {(userName || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:flex flex-col min-w-0 max-w-[180px] text-left">
            <span className="text-sm font-bold text-[rgba(29,36,51,0.85)] truncate">
              {isLoading ? 'Loading...' : userName}
            </span>
            <span className="text-xs font-medium text-[rgba(29,36,51,0.6)] truncate">
              {userEmail}
            </span>
          </div>
          <ChevronDownIcon />
        </button>

        {menuOpen && (
          <>
            {/* click-outside backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={logout.isPending}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {logout.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
