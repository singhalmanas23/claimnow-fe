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
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    onError: (error) => {
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
    onError: (error) => {
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update policy details (Admin only)
 */
export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      policy,
    }: {
      policyId: string;
      policy: Policy;
    }) => usersService.updatePolicy(policyId, policy),
    onSuccess: (_, variables) => {
      // Invalidate policies list and specific policy after successful update
      queryClient.invalidateQueries({ queryKey: policiesKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: policiesKeys.detail(variables.policyId) 
      });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('Policy update failed:', apiError.message);
    },
  });
}
