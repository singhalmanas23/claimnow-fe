import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { usePolicies } from '@/hooks';
import { PoliciesTable } from './PoliciesTable';
import { CreatePolicyDialog } from './CreatePolicyDialog';
import { PolicyDetailsDialog } from './PolicyDetailsDialog';

export function PoliciesManagement() {
  const { data: policies, isLoading, refetch } = usePolicies();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Policy Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </DialogTrigger>
            <CreatePolicyDialog onClose={() => setIsCreateDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <PoliciesTable
          policies={policies || []}
          onViewDetails={setSelectedPolicyId}
        />
      )}

      {selectedPolicyId && (
        <PolicyDetailsDialog
          policyId={selectedPolicyId}
          open={!!selectedPolicyId}
          onClose={() => setSelectedPolicyId(null)}
        />
      )}
    </div>
  );
}
