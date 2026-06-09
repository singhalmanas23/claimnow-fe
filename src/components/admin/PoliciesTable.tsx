import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeletePolicy } from '@/hooks';
import type { Policy } from '@/lib/api-types';

interface PoliciesTableProps {
  policies: Policy[];
  onViewDetails: (id: string) => void;
}

export function PoliciesTable({ policies, onViewDetails }: PoliciesTableProps) {
  const deletePolicy = useDeletePolicy();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (policyId: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setDeletingId(policyId);
      try {
        await deletePolicy.mutateAsync(policyId);
      } catch (error) {
        console.error('Failed to delete policy:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-semibold">Policy ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Policy Name</TableHead>
              <TableHead className="text-gray-700 font-semibold">Sum Insured</TableHead>
              <TableHead className="text-gray-700 font-semibold">Co-Payment %</TableHead>
              <TableHead className="text-gray-700 font-semibold">Sub-Limits</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No policies found
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.policy_id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{policy.policy_id}</TableCell>
                  <TableCell className="text-gray-900">{policy.policy_name}</TableCell>
                  <TableCell className="text-gray-700">
                    {typeof policy.rules?.sum_insured === "number"
                      ? `₹${policy.rules.sum_insured.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-gray-700">{policy.rules?.co_payment_percentage ?? 0}%</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                      {Object.keys(policy.rules?.sub_limits ?? {}).length} rules
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(policy.policy_id)}
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(policy.policy_id)}
                        disabled={deletingId === policy.policy_id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
