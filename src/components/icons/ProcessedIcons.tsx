import React from 'react';
import { Download, CheckCircle } from 'lucide-react';

export const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <Download className={className} />
);

export const SuccessCheckIcon = ({ className = "w-18 h-18" }: { className?: string }) => (
  <div className={`${className} rounded-full bg-[#08875D] flex items-center justify-center`}>
    <CheckCircle className="w-12 h-12 text-white fill-current" strokeWidth={0} />
  </div>
);
