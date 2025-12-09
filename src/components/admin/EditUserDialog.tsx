import React, { useState } from 'react';
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
import { useUpdateUser } from '@/hooks';
import type { User } from '@/lib/api-types';

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const updateUser = useUpdateUser();
  const [formData, setFormData] = useState({
    full_name: user.full_name ?? '',
    email: user.email ?? '',
    role_id: user.role_id ?? 2,
    is_active: user.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({
        userId: user.user_id!,
        updates: formData,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Edit User: {user.username}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Update user information and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_email" className="text-gray-700">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_full_name" className="text-gray-700">Full Name</Label>
            <Input
              id="edit_full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_role" className="text-gray-700">Role</Label>
            <select
              id="edit_role"
              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
            >
              <option value={2}>User</option>
              <option value={1}>Admin</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="edit_is_active" className="text-gray-700 cursor-pointer">
              Active
            </Label>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 text-gray-700">
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending} className="bg-blue-600 hover:bg-blue-700">
              {updateUser.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
