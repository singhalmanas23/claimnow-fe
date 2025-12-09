import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePolicy } from '@/hooks';
import type { PolicyCreate } from '@/lib/api-types';

interface CreatePolicyDialogProps {
  onClose: () => void;
}

export function CreatePolicyDialog({ onClose }: CreatePolicyDialogProps) {
  const createPolicy = useCreatePolicy();
  const [formData, setFormData] = useState<PolicyCreate>({
    policy_id: '',
    policy_name: '',
    rules: {
      sum_insured: 500000,
      co_payment_percentage: 10,
      sub_limits: {},
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPolicy.mutateAsync(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-gray-900">Create New Policy</DialogTitle>
        <DialogDescription className="text-gray-600">
          Create a new insurance policy with basic rules.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policy_id" className="text-gray-700">Policy ID *</Label>
            <Input
              id="policy_id"
              value={formData.policy_id}
              onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
              placeholder="POL001"
              required
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policy_name" className="text-gray-700">Policy Name *</Label>
            <Input
              id="policy_name"
              value={formData.policy_name}
              onChange={(e) =>
                setFormData({ ...formData, policy_name: e.target.value })
              }
              placeholder="Standard Health Policy"
              required
              className="border-gray-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sum_insured" className="text-gray-700">Sum Insured (₹) *</Label>
            <Input
              id="sum_insured"
              type="number"
              value={formData.rules.sum_insured}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rules: {
                    ...formData.rules,
                    sum_insured: Number(e.target.value),
                  },
                })
              }
              required
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="co_payment" className="text-gray-700">Co-Payment % *</Label>
            <Input
              id="co_payment"
              type="number"
              min="0"
              max="100"
              value={formData.rules.co_payment_percentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rules: {
                    ...formData.rules,
                    co_payment_percentage: Number(e.target.value),
                  },
                })
              }
              required
              className="border-gray-300"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 text-gray-700">
            Cancel
          </Button>
          <Button type="submit" disabled={createPolicy.isPending} className="bg-green-600 hover:bg-green-700">
            {createPolicy.isPending ? 'Creating...' : 'Create Policy'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
