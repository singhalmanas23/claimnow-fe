import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClaimStatusBadge } from './ClaimStatusBadge';

interface Claim {
  claim_id: string;
  policy_id: string;
  status: string;
  submitted_by_username: string;
  total_claimed_amount: number;
  updated_at: string;
  last_error: string | null;
}

interface ClaimsTableProps {
  claims: Claim[];
}

export function ClaimsTable({ claims }: ClaimsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (claims.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No claims found</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-900">Claim ID</TableHead>
            <TableHead className="font-semibold text-gray-900">Policy ID</TableHead>
            <TableHead className="font-semibold text-gray-900">Submitted By</TableHead>
            <TableHead className="font-semibold text-gray-900">Amount</TableHead>
            <TableHead className="font-semibold text-gray-900">Status</TableHead>
            <TableHead className="font-semibold text-gray-900">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow
              key={claim.claim_id}
              className="hover:bg-gray-50 transition-colors"
            >
              <TableCell className="font-mono text-xs text-gray-700">
                {claim.claim_id.substring(0, 8)}...
              </TableCell>
              <TableCell className="font-medium text-gray-900">
                {claim.policy_id}
              </TableCell>
              <TableCell className="text-gray-700">
                {claim.submitted_by_username}
              </TableCell>
              <TableCell className="font-semibold text-gray-900">
                {formatCurrency(claim.total_claimed_amount)}
              </TableCell>
              <TableCell>
                <ClaimStatusBadge status={claim.status} lastError={claim.last_error} />
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {formatDate(claim.updated_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Error indicator if any claim has errors */}
      {claims.some(claim => claim.last_error) && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <p className="text-sm text-red-800 font-medium">
            Some claims have errors. Please check individual claim details.
          </p>
        </div>
      )}
    </div>
  );
}
