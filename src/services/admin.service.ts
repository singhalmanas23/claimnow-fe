/**
 * Admin Service — companies + API keys.
 */

import { apiClient } from '@/lib/api-client';

const ADMIN_PREFIX = '/api/v1/admin';

export interface Company {
  company_id: number;
  name: string;
  slug: string;
  status: string;
  contact_email?: string | null;
}

export interface CompanyCreatePayload {
  name: string;
  slug: string;
  contact_email?: string | null;
}

export interface ApiKey {
  api_key_id: number;
  company_id: number;
  name: string;
  key_prefix: string;
  created_at?: string | null;
  last_used_at?: string | null;
  status: string;
  revoked_at?: string | null;
}

export interface ApiKeyCreated extends ApiKey {
  api_key: string; // raw key, shown once
}

class AdminService {
  async listCompanies(): Promise<Company[]> {
    const r = await apiClient.get<Company[]>(`${ADMIN_PREFIX}/companies`);
    return r.data;
  }

  async createCompany(payload: CompanyCreatePayload): Promise<Company> {
    const r = await apiClient.post<Company>(`${ADMIN_PREFIX}/companies`, payload);
    return r.data;
  }

  async listApiKeys(companyId: number): Promise<ApiKey[]> {
    const r = await apiClient.get<ApiKey[]>(`${ADMIN_PREFIX}/companies/${companyId}/api-keys`);
    return r.data;
  }

  async createApiKey(companyId: number, name: string): Promise<ApiKeyCreated> {
    const r = await apiClient.post<ApiKeyCreated>(
      `${ADMIN_PREFIX}/companies/${companyId}/api-keys`,
      { name }
    );
    return r.data;
  }

  async revokeApiKey(companyId: number, apiKeyId: number): Promise<{ detail: string }> {
    const r = await apiClient.delete<{ detail: string }>(
      `${ADMIN_PREFIX}/companies/${companyId}/api-keys/${apiKeyId}`
    );
    return r.data;
  }

  async listWebhookFailures(opts: { only_undelivered?: boolean; company_id?: number } = {}): Promise<WebhookFailure[]> {
    const params: Record<string, string | number | boolean> = { only_undelivered: opts.only_undelivered ?? true };
    if (opts.company_id !== undefined) params.company_id = opts.company_id;
    const r = await apiClient.get<WebhookFailure[]>(`${ADMIN_PREFIX}/webhook-failures`, { params });
    return r.data;
  }

  async redeliverWebhook(batchId: string): Promise<{ batch_id: string; status: string }> {
    const r = await apiClient.post<{ batch_id: string; status: string }>(
      `${ADMIN_PREFIX}/batches/${batchId}/redeliver-webhook`,
      {}
    );
    return r.data;
  }

  async getCompanyAnalytics(window: AnalyticsWindow = 'all'): Promise<CompanyAnalyticsResponse> {
    const r = await apiClient.get<CompanyAnalyticsResponse>(
      `${ADMIN_PREFIX}/analytics/companies`,
      { params: { window } }
    );
    return r.data;
  }
}

export type AnalyticsWindow = 'today' | 'week' | 'all';

export interface CompanyAnalyticsRow {
  company_id: number;
  name: string;
  status: string;
  total: number;
  completed: number;
  needs_review: number;
  failed: number;
  in_flight: number;
  auto_rate_percent?: number | null;
}

export interface CompanyAnalyticsResponse {
  window: string;
  since?: string | null;
  companies: CompanyAnalyticsRow[];
  totals: CompanyAnalyticsRow;
}

export interface WebhookFailure {
  batch_id: string;
  company_id: number;
  source_type: string;
  submitted_at?: string | null;
  completed_at?: string | null;
  webhook_url: string;
  delivery_attempts: number;
  last_attempt_at?: string | null;
  last_delivery_status_code?: number | null;
  last_delivery_error?: string | null;
  delivered_at?: string | null;
}

export const adminService = new AdminService();
