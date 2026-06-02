/**
 * Claims Hooks
 * TanStack Query hooks for claim operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimsService } from '@/services/claims.service';
import type {
  AdjudicateClaimRequest,
  PaginationParams,
} from '@/lib/api-types';
import { handleApiError } from '@/lib/api-client';

// Query Keys
export const claimsKeys = {
  all: ['claims'] as const,
  lists: () => [...claimsKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...claimsKeys.lists(), params] as const,
  details: () => [...claimsKeys.all, 'detail'] as const,
  detail: (id: string) => [...claimsKeys.details(), id] as const,
};

export function useClaims(params?: PaginationParams) {
  return useQuery({
    queryKey: claimsKeys.list(params),
    queryFn: () => claimsService.getClaims(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get a specific claim by ID
 */
export function useClaim(claimId: string | null) {
  return useQuery({
    queryKey: claimsKeys.detail(claimId || ''),
    queryFn: () => claimsService.getClaimById(claimId!),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to upload PDF for extraction (async workflow)
 * Returns claim_id which should be used for polling
 */
export function useExtractClaim() {
  return useMutation({
    mutationFn: (file: File) => claimsService.extractClaim(file),
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Extraction upload failed:', apiError.message);
    },
  });
}

/**
 * Hook to poll a batch's aggregate status. Stops polling when no claims are in-flight.
 */
export function useBatchStatus(batchId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...claimsKeys.all, 'batch', batchId],
    queryFn: () => claimsService.getBatchStatus(batchId!),
    enabled: !!batchId && enabled,
    refetchInterval: (query) => {
      if (!enabled) return false;
      const data = query.state.data as { counts?: { in_flight?: number } } | undefined;
      if (data?.counts && data.counts.in_flight === 0) return false;
      return 3000;
    },
    staleTime: 0,
  });
}

/**
 * Hook to upload multiple PDFs at once.
 * Returns BulkExtractResponse with per-file accepted/rejected results.
 */
export function useExtractBulkClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => claimsService.extractBulkClaim(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsKeys.lists() });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Bulk extraction upload failed:', apiError.message);
    },
  });
}

/**
 * Hook to poll claim status
 * Use with refetchInterval for automatic polling
 */
export function useClaimStatus(claimId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...claimsKeys.all, 'status', claimId],
    queryFn: () => claimsService.getClaimStatus(claimId!),
    enabled: !!claimId && enabled,
    refetchInterval: (query) => {
      // Stop polling if disabled or if status is completed/failed
      if (!enabled) return false;
      const data = query.state.data as { status?: string } | undefined;
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    staleTime: 0, // Always fetch fresh data
  });
}

/**
 * Hook to get extracted data with confidence scores
 * Should be called after status is 'completed'
 */
export function useExtractedData(claimId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...claimsKeys.all, 'extracted', claimId],
    queryFn: () => claimsService.getExtractedData(claimId!),
    enabled: !!claimId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to submit claim for adjudication (async workflow)
 */
export function useAdjudicateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AdjudicateClaimRequest) =>
      claimsService.adjudicateClaim(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsKeys.lists() });
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      console.error('Adjudication submission failed:', apiError.message);
    },
  });
}

export function useAdjudicatedData(claimId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...claimsKeys.all, 'adjudicated', claimId],
    queryFn: () => claimsService.getAdjudicatedData(claimId!),
    enabled: !!claimId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
