/**
 * Claims Service
 * Handles claim extraction, adjudication, and management
 */

import { apiClient } from '@/lib/api-client';
import type {
  ExtractedDataWithConfidence,
  AdjudicatedClaim,
  ExtractedData,
  InsuranceDetails,
  ClaimRecord,
  PaginationParams,
} from '@/lib/api-types';

const API_PREFIX = '/api/v1/claims';

/**
 * Claims Service Class
 */
class ClaimsService {
  /**
   * Extract data from uploaded medical bill PDF
   * @param file - The PDF file to extract data from
   * @returns Extracted data with confidence scores
   */
  async extractClaim(file: File): Promise<ExtractedDataWithConfidence> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ExtractedDataWithConfidence>(
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
   * Adjudicate a claim based on extracted data and insurance details
   * @param extractedData - The extracted claim data
   * @param insuranceDetails - Insurance policy information
   * @returns Adjudicated claim with final amounts
   */
  async adjudicateClaim(
    extractedData: ExtractedData,
    insuranceDetails: InsuranceDetails
  ): Promise<AdjudicatedClaim> {
    try {
      console.log('ClaimsService: Sending adjudication request...');
      console.log('ClaimsService: Extracted Data:', extractedData);
      console.log('ClaimsService: Insurance Details:', insuranceDetails);

      const response = await apiClient.post<AdjudicatedClaim>(
        `${API_PREFIX}/adjudicate`,
        extractedData,
        {
          params: insuranceDetails,
          timeout: 180000, // 3 minutes
        }
      );

      console.log('ClaimsService: Adjudication response received:', response.data);
      return response.data;
    } catch (error: any)//eslint-disable-line @typescript-eslint/no-explicit-any
     {
      console.error('ClaimsService: Adjudication error:', error);
      console.error('ClaimsService: Error response:', error.response);
      console.error('ClaimsService: Error message:', error.message);
      console.error('ClaimsService: Error config:', error.config);
      throw error;
    }
  }

  /**
   * Get all claims for the current user
   * @param params - Pagination parameters
   * @returns List of user's claims
   */
  async getClaims(params?: PaginationParams): Promise<ClaimRecord[]> {
    const response = await apiClient.get<ClaimRecord[]>(API_PREFIX, {
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

  /**
   * Process complete claim workflow: extract + adjudicate
   * @param file - The PDF file
   * @param insuranceDetails - Insurance policy information
   * @returns Complete adjudicated claim
   */
  async processCompleteClaim(
    file: File,
    insuranceDetails: InsuranceDetails
  ): Promise<{
    extracted: ExtractedDataWithConfidence;
    adjudicated: AdjudicatedClaim;
  }> {
    // Step 1: Extract data from PDF
    const extracted = await this.extractClaim(file);

    // Step 2: Convert extracted data with confidence to plain extracted data
    const extractedData: ExtractedData = {
      hospital_name: extracted.hospital_name.value,
      patient_name: extracted.patient_name.value,
      bill_no: extracted.bill_no.value,
      bill_date: extracted.bill_date.value,
      admission_date: extracted.admission_date.value,
      discharge_date: extracted.discharge_date.value,
      net_payable_amount: extracted.net_payable_amount.value,
      line_items: extracted.line_items.map((item) => ({
        description: item.description.value,
        quantity: item.quantity.value,
        unit_price: item.unit_price.value,
        total_amount: item.total_amount.value,
      })),
    };

    // Step 3: Adjudicate the claim
    const adjudicated = await this.adjudicateClaim(extractedData, insuranceDetails);

    return {
      extracted,
      adjudicated,
    };
  }
}

// Export singleton instance
export const claimsService = new ClaimsService();
