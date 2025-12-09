import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ClaimStatusBadgeProps {
  status: string;
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
        };
      case 'extracted':
        return {
          label: 'Extracted',
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
        };
      case 'adjudicating':
        return {
          label: 'Adjudicating',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
        };
      case 'processing':
        return {
          label: 'Processing',
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
        };
      case 'queued':
        return {
          label: 'Queued',
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
        };
      case 'failed':
        return {
          label: 'Failed',
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`text-xs font-medium px-2 py-1 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
