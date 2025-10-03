/**
 * API Client Configuration
 * Production-grade Axios client with interceptors for authentication,
 * error handling, and request/response transformation
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Base URL - Configure based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Token storage keys
const TOKEN_KEY = 'access_token';
const TOKEN_TYPE_KEY = 'token_type';

/**
 * Create axios instance with base configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 300 seconds (5 minutes) for long-running operations
  headers: {
    'Content-Type': 'application/json',
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

/**
 * Request interceptor - Attach authorization token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response for debugging
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log detailed error information
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      clearAuth();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden. You do not have permission.');
    }

    return Promise.reject(error);
  }
);

/**
 * Token Management Functions
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string, tokenType: string = 'bearer'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_TYPE_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * API Error Handler
 */
export interface ApiError {
  message: string;
  status?: number;
  detail?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    
    return {
      message: axiosError.response?.data?.detail || axiosError.message || 'An error occurred',
      status: axiosError.response?.status,
      detail: axiosError.response?.data?.detail,
    };
  }
  
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
};
