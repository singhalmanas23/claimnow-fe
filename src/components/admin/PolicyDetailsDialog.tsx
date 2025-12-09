import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePolicy, usePartialUpdatePolicy } from '@/hooks';

interface PolicyDetailsDialogProps {
  policyId: string;
  open: boolean;
  onClose: () => void;
}

export function PolicyDetailsDialog({ policyId, open, onClose }: PolicyDetailsDialogProps) {
  const { data: policy, isLoading } = usePolicy(policyId);
  const partialUpdate = usePartialUpdatePolicy();
  const [isEditing, setIsEditing] = useState(false);
  const [coPayment, setCoPayment] = useState(0);

  useEffect(() => {
    if (policy) {
      setCoPayment(policy.rules.co_payment_percentage);
    }
  }, [policy]);

  const handleUpdateCoPayment = async () => {
    try {
      await partialUpdate.mutateAsync({
        policyId,
        updates: {
          rules: {
            co_payment_percentage: coPayment,
          },
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update policy:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-gray-900">Policy Details</DialogTitle>
          <DialogDescription className="text-gray-600">
            View and edit policy information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : policy ? (
            <div className="space-y-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-600 text-sm">Policy ID</Label>
                  <p className="font-medium text-gray-900">{policy.policy_id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-600 text-sm">Policy Name</Label>
                  <p className="font-medium text-gray-900">{policy.policy_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-gray-600 text-sm">Sum Insured</Label>
                  <p className="font-medium text-gray-900">₹{policy.rules.sum_insured.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-gray-600 text-sm">Co-Payment %</Label>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={coPayment}
                        onChange={(e) => setCoPayment(Number(e.target.value))}
                        className="w-24 border-gray-300"
                      />
                      <Button size="sm" onClick={handleUpdateCoPayment} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setCoPayment(policy.rules.co_payment_percentage);
                        }}
                        className="border-gray-300"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{policy.rules.co_payment_percentage}%</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 text-sm">Sub-Limits</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(policy.rules.sub_limits).length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No sub-limits defined</p>
                  ) : (
                    Object.entries(policy.rules.sub_limits).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm"
                      >
                        <p className="font-medium capitalize text-gray-900">
                          {key.replace(/_/g, ' ')}
                        </p>
                        {value.description && (
                          <p className="text-gray-600 text-xs mt-1">
                            {value.description}
                          </p>
                        )}
                        {value.value && (
                          <p className="text-gray-700 mt-1">Value: ₹{value.value}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Policy not found</p>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
