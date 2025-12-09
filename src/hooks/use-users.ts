/**
 * Users & Admin Hooks
 * TanStack Query hooks for user and policy management (Admin)
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import type {
  UserCreate,
  UserUpdateAdmin,
  PaginationParams,
  Policy,
  PolicyCreate,
  PolicyUpdate,
  PolicyPartialUpdate,
} from '@/lib/api-types';
import { handleApiError } from '@/lib/api-client';

// Query Keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...usersKeys.lists(), params] as const,
};

export const policiesKeys = {
  all: ['policies'] as const,
  lists: () => [...policiesKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...policiesKeys.lists(), params] as const,
  details: () => [...policiesKeys.all, 'detail'] as const,
  detail: (id: string) => [...policiesKeys.details(), id] as const,
};

// ============================================================================
// User Management Hooks
// ============================================================================

/**
 * Hook to get all users (Admin only)
 */
export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersService.getUsers(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new user (Admin only)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: UserCreate) => usersService.createUser(user),
    onSuccess: () => {
      // Invalidate users list after successful creation
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('User creation failed:', apiError.message);
    },
  });
}

/**
 * Hook to update user details (Admin only)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: number;
      updates: UserUpdateAdmin;
    }) => usersService.updateUser(userId, updates),
    onSuccess: () => {
      // Invalidate users list after successful update
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('User update failed:', apiError.message);
    },
  });
}

// ============================================================================
// Policy Management Hooks
// ============================================================================

/**
 * Hook to get all policies (Admin only)
 */
export function usePolicies(params?: PaginationParams) {
  return useQuery({
    queryKey: policiesKeys.list(params),
    queryFn: () => usersService.getPolicies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a specific policy by ID (Admin only)
 */
export function usePolicy(policyId: string | null) {
  return useQuery({
    queryKey: policiesKeys.detail(policyId || ''),
    queryFn: () => usersService.getPolicyById(policyId!),
    enabled: !!policyId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new policy (Admin only)
 */
export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy: PolicyCreate) => usersService.createPolicy(policy),
    onSuccess: () => {
      // Invalidate policies list after successful creation
      queryClient.invalidateQueries({ queryKey: policiesKeys.lists() });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Policy creation failed:', apiError.message);
    },
  });
}

/**
 * Hook to update entire policy - full update (Admin only)
 */
export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      policy,
    }: {
      policyId: string;
      policy: PolicyUpdate;
    }) => usersService.updatePolicy(policyId, policy),
    onSuccess: (_data: Policy, variables: { policyId: string; policy: PolicyUpdate }) => {
      // Invalidate policies list and specific policy after successful update
      queryClient.invalidateQueries({ queryKey: policiesKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: policiesKeys.detail(variables.policyId) 
      });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Policy update failed:', apiError.message);
    },
  });
}

/**
 * Hook to partially update policy - only specified fields (Admin only)
 */
export function usePartialUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      updates,
    }: {
      policyId: string;
      updates: PolicyPartialUpdate;
    }) => usersService.partialUpdatePolicy(policyId, updates),
    onSuccess: (_data: Policy, variables: { policyId: string; updates: PolicyPartialUpdate }) => {
      // Invalidate policies list and specific policy after successful update
      queryClient.invalidateQueries({ queryKey: policiesKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: policiesKeys.detail(variables.policyId) 
      });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Policy partial update failed:', apiError.message);
    },
  });
}

/**
 * Hook to delete a policy (Admin only)
 */
export function useDeletePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => usersService.deletePolicy(policyId),
    onSuccess: (_data: void, policyId: string) => {
      // Invalidate policies list and remove specific policy from cache
      queryClient.invalidateQueries({ queryKey: policiesKeys.lists() });
      queryClient.removeQueries({ 
        queryKey: policiesKeys.detail(policyId) 
      });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Policy deletion failed:', apiError.message);
    },
  });
}
