/**
 * Authentication Service
 * Handles user authentication, token management, and user operations
 */

import { apiClient, setToken, clearAuth } from '@/lib/api-client';
import type { 
  Token, 
  LoginCredentials, 
  User 
} from '@/lib/api-types';

const API_PREFIX = '/api/v1';

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * Login user and obtain access token
   */
  async login(credentials: LoginCredentials): Promise<Token> {
    // FastAPI OAuth2PasswordRequestForm expects form-data
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<Token>(
      `${API_PREFIX}/token`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Store token in localStorage
    setToken(response.data.access_token, response.data.token_type);

    return response.data;
  }

  /**
   * Logout user and clear authentication
   */
  logout(): void {
    clearAuth();
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(`${API_PREFIX}/users/me`);
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  }
}

// Export singleton instance
export const authService = new AuthService();
