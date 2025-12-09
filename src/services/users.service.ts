/**
 * Users Service (Admin)
 * Handles user management operations for admin users
 */

import { apiClient } from '@/lib/api-client';
import type {
  User,
  UserCreate,
  UserUpdateAdmin,
  PaginationParams,
  Policy,
  PolicyCreate,
  PolicyUpdate,
  PolicyPartialUpdate,
} from '@/lib/api-types';

const API_PREFIX = '/api/v1/admin';

/**
 * Users Service Class
 */
class UsersService {
  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Create a new user (Admin only)
   */
  async createUser(user: UserCreate): Promise<User> {
    const response = await apiClient.post<User>(`${API_PREFIX}/users`, user);
    return response.data;
  }

  /**
   * Get all users (Admin only)
   */
  async getUsers(params?: PaginationParams): Promise<User[]> {
    const response = await apiClient.get<User[]>(`${API_PREFIX}/users`, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
      },
    });
    return response.data;
  }

  /**
   * Update user details (Admin only)
   */
  async updateUser(userId: number, updates: UserUpdateAdmin): Promise<User> {
    const response = await apiClient.put<User>(
      `${API_PREFIX}/users/${userId}`,
      updates
    );
    return response.data;
  }

  // ============================================================================
  // Policy Management
  // ============================================================================

  /**
   * Get all policies (Admin only)
   */
  async getPolicies(params?: PaginationParams): Promise<Policy[]> {
    const response = await apiClient.get<Policy[]>(`${API_PREFIX}/policies`, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
      },
    });
    return response.data;
  }

  /**
   * Get a specific policy by ID (Admin only)
   */
  async getPolicyById(policyId: string): Promise<Policy> {
    const response = await apiClient.get<Policy>(
      `${API_PREFIX}/policies/${policyId}`
    );
    return response.data;
  }

  /**
   * Create a new policy (Admin only)
   */
  async createPolicy(policy: PolicyCreate): Promise<Policy> {
    const response = await apiClient.post<Policy>(
      `${API_PREFIX}/policies`,
      policy
    );
    return response.data;
  }

  /**
   * Update entire policy - full update (Admin only)
   */
  async updatePolicy(policyId: string, policy: PolicyUpdate): Promise<Policy> {
    const response = await apiClient.put<Policy>(
      `${API_PREFIX}/policies/${policyId}`,
      policy
    );
    return response.data;
  }

  /**
   * Partially update policy - only specified fields (Admin only)
   */
  async partialUpdatePolicy(
    policyId: string,
    updates: PolicyPartialUpdate
  ): Promise<Policy> {
    const response = await apiClient.patch<Policy>(
      `${API_PREFIX}/policies/${policyId}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete a policy (Admin only)
   */
  async deletePolicy(policyId: string): Promise<void> {
    await apiClient.delete(`${API_PREFIX}/policies/${policyId}`);
  }
}

// Export singleton instance
export const usersService = new UsersService();
