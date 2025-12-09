import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useUsers } from '@/hooks';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { UsersTable } from './UsersTable';
import { User } from '@/lib/api-types';


export function UsersManagement() {
  const { data: users, isLoading, refetch } = useUsers();
  console.log('Users data:', users);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEditClose = () => {
    setEditingUser(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
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
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <CreateUserDialog onClose={() => setIsCreateDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <UsersTable users={users || []} onEdit={setEditingUser} />
      )}

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && handleEditClose()}>
        {editingUser && (
          <EditUserDialog
            user={editingUser}
            onClose={handleEditClose}
          />
        )}
      </Dialog>
    </div>
  );
}

