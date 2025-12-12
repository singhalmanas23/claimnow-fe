import React from 'react';
import { Edit } from 'lucide-react';
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
import type { User } from '@/lib/api-types';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-gray-700 font-semibold">User ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Username</TableHead>
              <TableHead className="text-gray-700 font-semibold">Email</TableHead>
              <TableHead className="text-gray-700 font-semibold">Full Name</TableHead>
              <TableHead className="text-gray-700 font-semibold">Role</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
              <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.user_id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{user.user_id}</TableCell>
                  <TableCell className="text-gray-900">{user.username}</TableCell>
                  <TableCell className="text-gray-700">{user.email || '-'}</TableCell>
                  <TableCell className="text-gray-700">{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role_id === 1 ? 'default' : 'secondary'}
                      className={user.role_id === 1 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
                    >
                      {user.role_id === 1 ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.is_active ? 'success' : 'destructive'}
                      className={user.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
