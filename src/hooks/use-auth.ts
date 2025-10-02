/**
 * Authentication Hooks
 * TanStack Query hooks for authentication operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { LoginCredentials, User } from '@/lib/api-types';
import { handleApiError } from '@/lib/api-client';

// Query Keys
export const authKeys = {
  currentUser: ['auth', 'currentUser'] as const,
};

/**
 * Hook to get current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Hook to handle user login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async () => {
      // Invalidate and refetch current user after successful login
      await queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('Login failed:', apiError.message);
    },
  });
}

/**
 * Hook to handle user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      authService.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  return authService.isAuthenticated();
}
