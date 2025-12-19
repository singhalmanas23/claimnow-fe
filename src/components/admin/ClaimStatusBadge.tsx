import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface ClaimStatusBadgeProps {
  status: string;
  lastError?: string | null;
}

export function ClaimStatusBadge({ status, lastError }: ClaimStatusBadgeProps) {
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const normalizedStatus = status.toLowerCase();
  const hasError = lastError && (normalizedStatus === 'failed' || normalizedStatus === 'error');

  const getStatusConfig = (status: string) => {
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
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 cursor-pointer',
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
        };
    }
  };

  const config = getStatusConfig(status);

  const handleBadgeClick = () => {
    if (hasError) {
      setIsErrorDialogOpen(true);
    }
  };

  return (
    <>
      {hasError ? (
        <button
          type="button"
          onClick={handleBadgeClick}
          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.className}`}
          aria-label={`${config.label} - Click to view error details`}
        >
          {config.label}
        </button>
      ) : (
        <Badge className={`text-xs font-medium px-2 py-1 ${config.className}`}>
          {config.label}
        </Badge>
      )}

      {hasError && (
        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Error Details
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Error information for claim status: <span className="font-medium">{config.label}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-900 mb-2">Error Message:</p>
                <p className="text-sm text-red-800 whitespace-pre-wrap break-words">
                  {lastError}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setIsErrorDialogOpen(false)}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
