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
import { useCreateUser } from '@/hooks';
import type { UserCreate } from '@/lib/api-types';

interface CreateUserDialogProps {
  onClose: () => void;
}

export function CreateUserDialog({ onClose }: CreateUserDialogProps) {
  const createUser = useCreateUser();
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: undefined,
    full_name: undefined,
    password: '',
    role_id: 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="text-gray-900">Create New User</DialogTitle>
        <DialogDescription className="text-gray-600">
          Add a new user to the system. Username and password are required.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-700">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="johndoe"
            required
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value || undefined })}
            placeholder="john@example.com"
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-gray-700">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value || undefined })}
            placeholder="John Doe"
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-700">Role</Label>
          <select
            id="role"
            className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.role_id}
            onChange={(e) =>
              setFormData({ ...formData, role_id: Number(e.target.value) as 1 | 2 })
            }
          >
            <option value={2}>User</option>
            <option value={1}>Admin</option>
          </select>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 text-gray-700">
            Cancel
          </Button>
          <Button type="submit" disabled={createUser.isPending} className="bg-blue-600 hover:bg-blue-700">
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
