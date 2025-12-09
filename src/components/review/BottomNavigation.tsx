import React from 'react';
import { ResetIcon } from '@/components/icons/Icons';

interface BottomNavigationProps {
  isSubmitting: boolean;
  onReset: () => void;
  onProcess: () => void;
}

export default function BottomNavigation({ isSubmitting, onReset, onProcess }: BottomNavigationProps) {
  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-[92px] bg-white border-t border-[#D8DDE7] flex items-center justify-between px-6 lg:px-16 z-40 shadow-lg">
        <button 
          className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onReset}
          disabled={isSubmitting}
        >
          <ResetIcon />
          <span className="text-xs lg:text-sm font-medium text-[rgba(29,36,51,0.8)]">Reset all</span>
        </button>
        
        <button 
          className={`px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg text-xs lg:text-sm font-medium text-white transition-all shadow-md ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#2F5FED] to-[#547DF5] hover:from-[#2854D6] hover:to-[#4B7AE8] hover:shadow-lg'
          }`}
          onClick={onProcess}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            'Process Now'
          )}
        </button>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-[92px]"></div>
    </>
  );
}
