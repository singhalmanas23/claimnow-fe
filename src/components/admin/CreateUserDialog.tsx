import React, { useState } from 'react';
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
import { useCreateUser } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';

interface CreateUserDialogProps {
  onClose: () => void;
}

export function CreateUserDialog({ onClose }: CreateUserDialogProps) {
  const createUser = useCreateUser();
  const { data: companies } = useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: () => adminService.listCompanies(),
  });
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(2); // Default to user role
  const [companyId, setCompanyId] = useState<string>(''); // '' = Default Company
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) newErrors.username = 'Username is required';
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createUser.mutateAsync({
        username,
        full_name: fullName,
        email,
        password,
        role_id: roleId as 1 | 2,
        company_id: companyId ? Number(companyId) : undefined,
      });

      onClose();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setErrors({
        submit: error?.response?.data?.detail || 'Failed to create user. Please try again.',
      });
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-gray-900">Create New User</DialogTitle>
        <DialogDescription className="text-gray-600">
          Add a new user to the system with credentials and role.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-700">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., johndoe"
            className={`border-gray-300 ${errors.username ? 'border-red-500' : ''}`}
          />
          {errors.username && <p className="text-xs text-red-600">{errors.username}</p>}
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
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className={`border-gray-300 ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
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

        <div className="space-y-2">
          <Label htmlFor="company" className="text-gray-700">
            Company <span className="text-gray-400 font-normal">(tenant this user belongs to)</span>
          </Label>
          <Select value={companyId} onValueChange={(value) => setCompanyId(value)}>
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Default Company" />
            </SelectTrigger>
            <SelectContent>
              {(companies || []).map((c) => (
                <SelectItem key={c.company_id} value={String(c.company_id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          disabled={createUser.isPending}
          className="border-gray-300"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createUser.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {createUser.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
