'use client';

import React, { useState } from 'react';
import {
  Users,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  usePolicies,
  usePolicy,
  useCreatePolicy,
  usePartialUpdatePolicy,
  useDeletePolicy,
  useClaims,
  useCurrentUser,
} from '@/hooks';
import type {
  User,
  UserCreate,
  Policy,
  PolicyCreate,
  ClaimRecord,
} from '@/lib/api-types';

export default function AdminDashboard() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = true;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage users, policies, and monitor claims
            </p>
          </div>
          <Badge variant="success" className="text-sm px-3 py-1">
            <Shield className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        </div>
        <StatsOverview />
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="policies" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Policies
                </TabsTrigger>
                <TabsTrigger value="claims" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Claims
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <UsersManagement />
              </TabsContent>

              <TabsContent value="policies" className="space-y-4">
                <PoliciesManagement />
              </TabsContent>

              <TabsContent value="claims" className="space-y-4">
                <ClaimsMonitoring />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stats Overview Component
function StatsOverview() {
  const { data: users } = useUsers();
  const { data: policies } = usePolicies();
  const { data: claims } = useClaims();

  const stats = [
    {
      name: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Policies',
      value: policies?.length || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Claims',
      value: claims?.length || 0,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Users Management Component
function UsersManagement() {
  const { data: users, isLoading, refetch } = useUsers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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
        <UsersTable users={users || []} />
      )}
    </div>
  );
}

// Users Table Component
function UsersTable({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.user_id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role_id === 1 ? 'default' : 'secondary'}>
                      {user.role_id === 1 ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'destructive'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
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

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </>
  );
}

// Create User Dialog
function CreateUserDialog({ onClose }: { onClose: () => void }) {
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>
          Add a new user to the system. All fields are required.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name || ''}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={formData.role_id}
            onChange={(e) =>
              setFormData({ ...formData, role_id: Number(e.target.value) as 1 | 2 })
            }
          >
            <option value={2}>User</option>
            <option value={1}>Admin</option>
          </select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Edit User Dialog
function EditUserDialog({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
}) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.username}</DialogTitle>
          <DialogDescription>Update user information and permissions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_full_name">Full Name</Label>
            <Input
              id="edit_full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_role">Role</Label>
            <select
              id="edit_role"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
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
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="edit_is_active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Policies Management Component
function PoliciesManagement() {
  const { data: policies, isLoading, refetch } = usePolicies();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Policy Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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

// Policies Table Component
function PoliciesTable({
  policies,
  onViewDetails,
}: {
  policies: Policy[];
  onViewDetails: (id: string) => void;
}) {
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy ID</TableHead>
            <TableHead>Policy Name</TableHead>
            <TableHead>Sum Insured</TableHead>
            <TableHead>Co-Payment %</TableHead>
            <TableHead>Sub-Limits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No policies found
              </TableCell>
            </TableRow>
          ) : (
            policies.map((policy) => (
              <TableRow key={policy.policy_id}>
                <TableCell className="font-medium">{policy.policy_id}</TableCell>
                <TableCell>{policy.policy_name}</TableCell>
                <TableCell>₹{policy.rules.sum_insured.toLocaleString()}</TableCell>
                <TableCell>{policy.rules.co_payment_percentage}%</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {Object.keys(policy.rules.sub_limits).length} rules
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(policy.policy_id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(policy.policy_id)}
                      disabled={deletingId === policy.policy_id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Create Policy Dialog (simplified version)
function CreatePolicyDialog({ onClose }: { onClose: () => void }) {
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
        <DialogTitle>Create New Policy</DialogTitle>
        <DialogDescription>
          Create a new insurance policy with basic rules.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policy_id">Policy ID</Label>
            <Input
              id="policy_id"
              value={formData.policy_id}
              onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
              placeholder="POL001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policy_name">Policy Name</Label>
            <Input
              id="policy_name"
              value={formData.policy_name}
              onChange={(e) =>
                setFormData({ ...formData, policy_name: e.target.value })
              }
              placeholder="Standard Health Policy"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sum_insured">Sum Insured (₹)</Label>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="co_payment">Co-Payment %</Label>
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createPolicy.isPending}>
            {createPolicy.isPending ? 'Creating...' : 'Create Policy'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

// Policy Details Dialog
function PolicyDetailsDialog({
  policyId,
  open,
  onClose,
}: {
  policyId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: policy, isLoading } = usePolicy(policyId);
  const partialUpdate = usePartialUpdatePolicy();
  const [isEditing, setIsEditing] = useState(false);
  const [coPayment, setCoPayment] = useState(0);

  React.useEffect(() => {
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Policy Details</DialogTitle>
          <DialogDescription>View and edit policy information.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : policy ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Policy ID</Label>
                <p className="font-medium">{policy.policy_id}</p>
              </div>
              <div>
                <Label className="text-gray-600">Policy Name</Label>
                <p className="font-medium">{policy.policy_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Sum Insured</Label>
                <p className="font-medium">₹{policy.rules.sum_insured.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-gray-600">Co-Payment %</Label>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={coPayment}
                      onChange={(e) => setCoPayment(Number(e.target.value))}
                      className="w-24"
                    />
                    <Button size="sm" onClick={handleUpdateCoPayment}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setCoPayment(policy.rules.co_payment_percentage);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{policy.rules.co_payment_percentage}%</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-600">Sub-Limits</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(policy.rules.sub_limits).length === 0 ? (
                  <p className="text-sm text-gray-500">No sub-limits defined</p>
                ) : (
                  Object.entries(policy.rules.sub_limits).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 border rounded-lg bg-gray-50 text-sm"
                    >
                      <p className="font-medium capitalize">
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
          <p className="text-center text-gray-500">Policy not found</p>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Claims Monitoring Component
function ClaimsMonitoring() {
  const { data: claims, isLoading, refetch } = useClaims();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Claims Monitoring</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <ClaimsTable claims={claims || []} />
      )}
    </div>
  );
}

// Claims Table Component
function ClaimsTable({ claims }: { claims: ClaimRecord[] }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Policy ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reimbursed</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                No claims found
              </TableCell>
            </TableRow>
          ) : (
            claims.map((claim) => (
              <TableRow key={claim.claim_id}>
                <TableCell className="font-medium font-mono text-xs">
                  {claim.claim_id.slice(0, 8)}...
                </TableCell>
                <TableCell>{claim.submitted_by_user_id}</TableCell>
                <TableCell>{claim.policy_id}</TableCell>
                <TableCell>{claim.extracted_data.patient_name}</TableCell>
                <TableCell>{claim.extracted_data.hospital_name}</TableCell>
                <TableCell>
                  ₹{claim.adjudicated_data.total_claimed_amount.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium text-green-600">
                  ₹{claim.adjudicated_data.total_amount_reimbursed.toLocaleString()}
                </TableCell>
                <TableCell>
                  <ClaimStatusBadge status={claim.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Claim Status Badge Component
function ClaimStatusBadge({ status }: { status?: string }) {
  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
      case 'adjudicating':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'processing':
      case 'adjudicating':
        return <Clock className="h-3 w-3 mr-1 animate-spin" />;
      case 'failed':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} className="flex items-center w-fit">
      {getStatusIcon(status)}
      {status || 'Unknown'}
    </Badge>
  );
}
