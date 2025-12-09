import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClaimStatusBadgeProps {
  status?: string;
}

export function ClaimStatusBadge({ status }: ClaimStatusBadgeProps) {
  const getStatusConfig = (status?: string) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'completed':
        return {
          variant: 'success' as const,
          className: 'bg-green-100 text-green-700 border-green-200',
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
        };
      case 'processing':
      case 'adjudicating':
      case 'extracting':
        return {
          variant: 'warning' as const,
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: <Clock className="h-3 w-3 mr-1 animate-spin" />,
        };
      case 'failed':
      case 'error':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-700 border-red-200',
          icon: <XCircle className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`flex items-center w-fit ${config.className}`}>
      {config.icon}
      {status || 'Unknown'}
    </Badge>
  );
}
