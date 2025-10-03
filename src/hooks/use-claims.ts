/**
 * Claims Hooks
 * TanStack Query hooks for claim operations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimsService } from '@/services/claims.service';
import type {
  ExtractedData,
  InsuranceDetails,
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

/**
 * Hook to get all claims for the current user
 */
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
 * Hook to extract data from uploaded PDF
 */
export function useExtractClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => claimsService.extractClaim(file),
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('Extraction failed:', apiError.message);
    },
  });
}

/**
 * Hook to adjudicate a claim
 */
export function useAdjudicateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      extractedData,
      insuranceDetails,
    }: {
      extractedData: ExtractedData;
      insuranceDetails: InsuranceDetails;
    }) => claimsService.adjudicateClaim(extractedData, insuranceDetails),
    onSuccess: () => {
      // Invalidate claims list after successful adjudication
      queryClient.invalidateQueries({ queryKey: claimsKeys.lists() });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('Adjudication failed:', apiError.message);
    },
  });
}

/**
 * Hook to process complete claim workflow (extract + adjudicate)
 */
export function useProcessCompleteClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      insuranceDetails,
    }: {
      file: File;
      insuranceDetails: InsuranceDetails;
    }) => claimsService.processCompleteClaim(file, insuranceDetails),
    onSuccess: () => {
      // Invalidate claims list after successful processing
      queryClient.invalidateQueries({ queryKey: claimsKeys.lists() });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      console.error('Claim processing failed:', apiError.message);
    },
  });
}
