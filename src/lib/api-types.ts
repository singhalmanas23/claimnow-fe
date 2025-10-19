/**
 * API Types
 * TypeScript interfaces matching the backend Pydantic schemas
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  username: string;
  email?: string | null;
  full_name?: string | null;
  disabled?: boolean | null;
  user_id?: number;
  is_active?: boolean;
  role_id?: number;
}

export interface UserCreate {
  username: string;
  email?: string | null;
  full_name?: string | null;
  password: string;
  role_id: 1 | 2; // 1 for admin, 2 for regular user
}

export interface UserUpdateAdmin {
  full_name?: string | null;
  email?: string | null;
  role_id?: number | null;
  is_active?: boolean | null;
  password?: string | null;
}

// ============================================================================
// Claim Types
// ============================================================================

export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

export interface InsuranceDetails {
  policy_number: string;
  insurance_provider: string;
}

export interface ExtractedData {
  hospital_name: string;
  patient_name: string;
  bill_no?: string | null;
  bill_date: string; // ISO date string
  admission_date: string; // ISO date string
  discharge_date?: string | null; // ISO date string
  line_items: LineItem[];
  net_payable_amount: number;
}

export interface AdjudicatedLineItem extends LineItem {
  status: string;
  allowed_amount: number;
  disallowed_amount: number;
  reason?: string | null;
}

export interface SanityCheckResult {
  is_reasonable: boolean;
  reasoning: string;
  flags: string[];
}

export interface AdjudicatedClaim {
  hospital_name: string;
  patient_name: string;
  bill_no?: string | null;
  bill_date: string;
  admission_date: string;
  discharge_date?: string | null;
  adjudicated_line_items: AdjudicatedLineItem[];
  total_claimed_amount: number;
  total_amount_reimbursed: number;
  adjustments_log: string[];
  sanity_check_result?: SanityCheckResult | null;
}

// ============================================================================
// Confidence-based Extraction Types
// ============================================================================

export interface FieldWithConfidence<T = string | number | null> {
  value: T;
  confidence: number; // 0.0 to 1.0
}

export interface LineItemWithConfidence {
  description: FieldWithConfidence<string>;
  quantity: FieldWithConfidence<number>;
  unit_price: FieldWithConfidence<number>;
  total_amount: FieldWithConfidence<number>;
}

export interface ExtractedDataWithConfidence {
  hospital_name: FieldWithConfidence<string>;
  patient_name: FieldWithConfidence<string>;
  bill_date: FieldWithConfidence<string>;
  bill_no: FieldWithConfidence<string | null>;
  admission_date: FieldWithConfidence<string>;
  discharge_date: FieldWithConfidence<string | null>;
  net_payable_amount: FieldWithConfidence<number>;
  line_items: LineItemWithConfidence[];
}

// ============================================================================
// Policy Types
// ============================================================================

export interface PolicyRuleValue {
  limit?: number;
  percentage?: number;
  description?: string;
  conditions?: Record<string, string | number | boolean>;
}

export interface Policy {
  policy_id: string;
  policy_name: string;
  rules: Record<string, PolicyRuleValue>;
}

// ============================================================================
// Claim Database Types
// ============================================================================

export interface ClaimRecord {
  claim_id: string;
  submitted_by_user_id: number;
  policy_id: string;
  status?: string;
  original_pdf_filename?: string;
  extracted_data: ExtractedData;
  adjudicated_data: AdjudicatedClaim;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface ClaimIntakeResponse {
  claim_id: string;
  status: string;
}

export interface ExtractClaimRequest {
  file: File;
}

export interface AdjudicateClaimRequest {
  extracted_data: ExtractedData;
  insurance_details: InsuranceDetails;
}

// ============================================================================
// Pagination & List Types
// ============================================================================

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface ClaimsListResponse {
  claims: ClaimRecord[];
  total?: number;
}

export interface UsersListResponse {
  users: User[];
  total?: number;
}

export interface PoliciesListResponse {
  policies: Policy[];
  total?: number;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiErrorResponse {
  detail: string;
}
