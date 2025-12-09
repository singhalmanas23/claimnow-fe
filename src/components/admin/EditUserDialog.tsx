import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateUser } from '@/hooks';

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  disabled: boolean;
  role?: string;
}

interface EditUserDialogProps {
  user: User;
  onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  const updateUser = useUpdateUser();
  const [fullName, setFullName] = useState(user.full_name);
  const [email, setEmail] = useState(user.email);
  const [isActive, setIsActive] = useState(!user.disabled);
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(2); // Default to user role
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFullName(user.full_name);
    setEmail(user.email);
    setIsActive(!user.disabled);
    setPassword('');
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Password is optional, but if provided, validate it
    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const updates: any = {
        full_name: fullName,
        email: email,
        is_active: isActive,
        role_id: roleId,
      };

      // Only include password if it was provided
      if (password.trim()) {
        updates.password = password;
      }

      await updateUser.mutateAsync({
        userId: user.user_id,
        updates,
      });

      onClose();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      setErrors({
        submit: error?.response?.data?.detail || 'Failed to update user. Please try again.',
      });
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-gray-900">Edit User</DialogTitle>
        <DialogDescription className="text-gray-600">
          Update user information for <span className="font-medium text-gray-900">{user.username}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-700">
            Username
          </Label>
          <Input
            id="username"
            value={user.username}
            disabled
            className="bg-gray-50 border-gray-300 text-gray-500"
          />
          <p className="text-xs text-gray-500">Username cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., John Doe"
            className={`border-gray-300 ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., john@example.com"
            className={`border-gray-300 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            New Password (optional)
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            className={`border-gray-300 ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          <p className="text-xs text-gray-500">Minimum 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-700">
            Role
          </Label>
          <Select value={roleId.toString()} onValueChange={(value) => setRoleId(Number(value))}>
            <SelectTrigger className="border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="2">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="isActive" className="text-gray-700 cursor-pointer">
            Active User
          </Label>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={updateUser.isPending}
          className="border-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateUser.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {updateUser.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
