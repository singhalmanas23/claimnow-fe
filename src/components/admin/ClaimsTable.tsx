import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ClaimRecord } from '@/lib/api-types';
import { ClaimStatusBadge } from './ClaimStatusBadge';

interface ClaimsTableProps {
  claims: ClaimRecord[];
}

export function ClaimsTable({ claims }: ClaimsTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-semibold">Claim ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">User ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Policy ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Patient</TableHead>
              <TableHead className="text-gray-700 font-semibold">Hospital</TableHead>
              <TableHead className="text-gray-700 font-semibold">Amount</TableHead>
              <TableHead className="text-gray-700 font-semibold">Reimbursed</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No claims found
                </TableCell>
              </TableRow>
            ) : (
              claims.map((claim) => (
                <TableRow key={claim.claim_id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium font-mono text-xs text-gray-900">
                    {claim.claim_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-gray-700">{claim.submitted_by_user_id}</TableCell>
                  <TableCell className="text-gray-700">{claim.policy_id}</TableCell>
                  <TableCell className="text-gray-900">{claim.extracted_data.patient_name}</TableCell>
                  <TableCell className="text-gray-700">{claim.extracted_data.hospital_name}</TableCell>
                  <TableCell className="text-gray-900 font-medium">
                    ₹{claim.adjudicated_data.total_claimed_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    ₹{claim.adjudicated_data.total_amount_reimbursed.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <ClaimStatusBadge status={claim.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
