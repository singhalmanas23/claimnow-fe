/**
 * App Header Component
 * Reusable header with user profile, notifications, and help
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser, useLogout } from '@/hooks/use-auth';

interface AppHeaderProps {
  showWelcome?: boolean;
}

export default function AppHeader({ showWelcome = false }: AppHeaderProps) {
  const router = useRouter();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push('/');
  };

  return (
    <header className="w-full h-[72px] border-b border-[#D8DDE7] bg-white/90 backdrop-blur-sm relative z-10">
      <div className="flex items-center justify-between h-full px-16">
        {/* Logo */}
        <div className="flex items-center">
          <h1 
            className="font-satoshi font-bold text-[20px] leading-[27px] bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent cursor-pointer"
            onClick={() => router.push('/upload')}
          >
            ClaimNow.ai
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-9">
          {/* Need Help Button */}
          <div className="flex items-center gap-3 bg-[#FFF8EB] rounded px-4 py-2 h-[40px] cursor-pointer hover:bg-[#FFF3D6] transition-colors">
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
          <div className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
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

          {/* User Profile with Dropdown */}
          <div className="flex items-center gap-3 relative group">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-[40px] h-[40px] rounded-[30px] bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  {!userLoading && currentUser && (
                    <span className="text-white font-bold text-lg">
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

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#D8DDE7] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <button
                  onClick={() => router.push('/upload')}
                  className="w-full px-4 py-2 text-left text-sm text-[rgba(29,36,51,0.8)] hover:bg-gray-50 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
