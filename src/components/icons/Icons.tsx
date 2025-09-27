import React from 'react';

export const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 14 10" fill="none">
    <path d="m1 4.94 3.44 3.44L12.56 0.94" stroke="#08875D" strokeWidth="2"/>
  </svg>
);

export const HelpIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="#B25E09"/>
  </svg>
);

export const NotificationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="2"/>
    <circle cx="19" cy="3" r="2" stroke="rgba(29, 36, 51, 0.8)" strokeWidth="2"/>
  </svg>
);

export const ChevronDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path d="M15 12.5L10 7.5L5 12.5" stroke="rgba(29, 36, 51, 0.65)" strokeWidth="2"/>
  </svg>
);

export const PlusIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h8.667Z" stroke="#E02D3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ResetIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path d="M1.33 8A6.67 6.67 0 0 1 8 1.33c1.47 0 2.84.48 3.93 1.28L10.67 4H14V.67l-1.33 1.33A8 8 0 1 0 16 8h-1.33A6.67 6.67 0 0 1 1.33 8Z" fill="rgba(29, 36, 51, 0.8)"/>
  </svg>
);
