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
      <div className="fixed bottom-0 left-0 right-0 h-[92px] bg-white border-t border-[#D8DDE7] flex items-center justify-between px-16 z-40">
        <button 
          className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={onReset}
          disabled={isSubmitting}
        >
          <ResetIcon />
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Reset all</span>
        </button>
        
        <button 
          className={`px-8 py-3 rounded-lg text-sm font-medium text-white transition-all ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#2F5FED] to-[#547DF5] hover:from-[#2854D6] hover:to-[#4B7AE8]'
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
