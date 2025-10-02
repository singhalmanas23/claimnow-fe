/**
 * Providers
 * TanStack Query Provider setup with configuration
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * Create Query Client with default options
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time: 1 minute
        staleTime: 60 * 1000,
        // Retry failed requests
        retry: 1,
        // Refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        // Show errors in console during development
        throwOnError: false,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
        // Show errors in console during development
        throwOnError: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get Query Client (singleton pattern for browser)
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Providers Component
 * Wraps the application with TanStack Query provider
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
