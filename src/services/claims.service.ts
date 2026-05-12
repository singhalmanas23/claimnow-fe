/**
 * Claims Service
 * Handles claim extraction, adjudication, and management
 */

import { apiClient } from '@/lib/api-client';
import type {
  BatchStatusResponse,
  BulkExtractResponse,
  ClaimIntakeResponse,
  ClaimStatusResponse,
  ExtractedDataResponse,
  AdjudicatedClaim,
  AdjudicateClaimRequest,
  ClaimRecord,
  PaginationParams,
  DashboardResponse,
} from '@/lib/api-types';

const API_PREFIX = '/api/v1/claims';
const ADMIN_API_CLAIM='/api/v1/admin/claims';

/**
 * Claims Service Class
 */
class ClaimsService {
  /**
   * Upload PDF file for extraction (async workflow)
   * Returns claim_id and status 'queued'
   * @param file - The PDF file to extract data from
   * @returns Claim intake response with claim_id
   */
  async extractClaim(file: File): Promise<ClaimIntakeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ClaimIntakeResponse>(
      `${API_PREFIX}/extract`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Upload multiple PDFs in a single request to /extract-bulk.
   * Returns per-file accepted/rejected results.
   */
  async extractBulkClaim(files: File[]): Promise<BulkExtractResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    const response = await apiClient.post<BulkExtractResponse>(
      `${API_PREFIX}/extract-bulk`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000,
      }
    );

    return response.data;
  }

  /**
   * Get aggregated status for a bulk-upload batch.
   */
  async getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
    const response = await apiClient.get<BatchStatusResponse>(
      `${API_PREFIX}/batches/${batchId}`
    );
    return response.data;
  }

  /**
   * Poll claim status
   * @param claimId - The claim ID to check status for
   * @returns Current status of the claim
   */
  async getClaimStatus(claimId: string): Promise<ClaimStatusResponse> {
    const response = await apiClient.get<ClaimStatusResponse>(
      `${API_PREFIX}/status/${claimId}`
    );
    return response.data;
  }

  /**
   * Get extracted data with confidence scores
   * Only available after extraction is completed
   * @param claimId - The claim ID
   * @returns Extracted data with confidence scores
   */
  async getExtractedData(claimId: string): Promise<ExtractedDataResponse> {
    const response = await apiClient.get<ExtractedDataResponse>(
      `${API_PREFIX}/extracted/${claimId}`
    );
    return response.data;
  }

  /**
   * Re-enqueue every failed claim in a batch. Returns { retried, claim_ids }.
   */
  async retryFailedInBatch(batchId: string): Promise<{ batch_id: string; retried: number; claim_ids?: string[]; message?: string }> {
    const r = await apiClient.post<{ batch_id: string; retried: number; claim_ids?: string[]; message?: string }>(
      `${API_PREFIX}/batches/${batchId}/retry-failed`,
      {}
    );
    return r.data;
  }

  /**
   * Flat list of the current user's claims, optionally filtered by dashboard bucket.
   * Buckets: in_flight | needs_review | completed | auto_processed | failed
   */
  async getClaimsByBucket(bucket?: string, limit = 200): Promise<ClaimRecord[]> {
    const params: Record<string, string | number> = { limit };
    if (bucket) params.bucket = bucket;
    const response = await apiClient.get<ClaimRecord[]>(`${API_PREFIX}/`, { params });
    return response.data;
  }

  /**
   * Pipeline overview across all of the current user's claims.
   * @param window - one of 'today', 'week', 'all'
   */
  async getDashboard(window: 'today' | 'week' | 'all' = 'today', recentLimit = 10): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>(
      `${API_PREFIX}/dashboard`,
      { params: { window, recent_limit: recentLimit } }
    );
    return response.data;
  }

  /**
   * Download the original uploaded PDF for a claim.
   * @param claimId - The claim ID
   * @returns Blob containing the PDF bytes
   */
  async getClaimPDF(claimId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `${API_PREFIX}/pdf/${claimId}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Submit claim for adjudication (async workflow)
   * @param request - Adjudication request with claim_id and extracted_data
   * @returns Claim intake response with status 'adjudicating'
   */
  async adjudicateClaim(
    request: AdjudicateClaimRequest
  ): Promise<ClaimIntakeResponse> {
    const response = await apiClient.post<ClaimIntakeResponse>(
      `${API_PREFIX}/adjudicate`,
      request,
      {
        timeout: 180000,
      }
    );

    return response.data;
  }

  /**
   * Get adjudicated results
   * Only available after adjudication is completed
   * @param claimId - The claim ID
   * @returns Adjudicated claim with final amounts
   */
  async getAdjudicatedData(claimId: string): Promise<AdjudicatedClaim> {
    const response = await apiClient.get<AdjudicatedClaim>(
      `${API_PREFIX}/adjudicated/${claimId}`
    );
    return response.data;
  }

  /**
   * Get all claims for the current user
   * @param params - Pagination parameters
   * @returns List of user's claims
   */
  async getClaims(params?: PaginationParams): Promise<ClaimRecord[]> {
    const response = await apiClient.get<ClaimRecord[]>(ADMIN_API_CLAIM, {
      params: {
        skip: params?.skip || 0,
        limit: params?.limit || 100,
      },
    });

    return response.data;
  }

  /**
   * Get a specific claim by ID
   * @param claimId - The unique claim identifier
   * @returns Claim details
   */
  async getClaimById(claimId: string): Promise<ClaimRecord> {
    const response = await apiClient.get<ClaimRecord>(`${API_PREFIX}/${claimId}`);
    return response.data;
  }


}

// Export singleton instance
export const claimsService = new ClaimsService();
