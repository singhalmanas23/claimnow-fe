'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useClaim } from '@/hooks/use-claims';
import { useCurrentUser } from '@/hooks/use-auth';
import type { ClaimRecord } from '@/lib/api-types';
import { format } from 'date-fns';

export default function ClaimDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params?.claimId as string;
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: claim, isLoading: claimLoading, error } = useClaim(claimId);
  const [localClaim, setLocalClaim] = useState<ClaimRecord | null>(null);

  // Helper function to safely extract value from confidence object or plain value
  const safeExtractValue = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'object' && 'value' in field) {
      return String(field.value || '');
    }
    return String(field);
  };

  useEffect(() => {
    // Try to load from sessionStorage first for immediate display
    const storedClaim = sessionStorage.getItem('selectedClaimData');
    if (storedClaim) {
      try {
        setLocalClaim(JSON.parse(storedClaim));
      } catch (err) {
        console.error('Failed to parse stored claim:', err);
      }
    }
  }, []);

  // Use API data when available, fallback to local data
  const displayClaim = claim || localClaim;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (claimLoading && !localClaim) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F5FED] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim details...</p>
        </div>
      </div>
    );
  }

  if (error && !localClaim) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load claim details</p>
          <button 
            onClick={() => router.push('/claims')}
            className="text-[#2F5FED] hover:underline"
          >
            ← Back to Claims
          </button>
        </div>
      </div>
    );
  }

  if (!displayClaim) {
    return null;
  }

  const adjudicatedData = displayClaim.adjudicated_data;
  const extractedData = displayClaim.extracted_data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full h-[72px] border-b border-[#D8DDE7] bg-white">
        <div className="flex items-center justify-between h-full px-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/claims')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="font-satoshi font-bold text-[20px] leading-[27px] bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent">
              Claim Details
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
              {!userLoading && currentUser && (
                <span className="text-white font-bold text-sm">
                  {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-16 py-8">
        {/* Claim Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Claim #{displayClaim.claim_id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-gray-600">
                Submitted on {formatDate(displayClaim.created_at)}
              </p>
            </div>
            <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full border ${getStatusColor(displayClaim.status || 'processing')}`}>
              {(displayClaim.status || 'processing').charAt(0).toUpperCase() + (displayClaim.status || 'processing').slice(1)}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Claimed Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(adjudicatedData?.total_claimed_amount || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Amount Reimbursed</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(adjudicatedData?.total_amount_reimbursed || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Disallowed Amount</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency((adjudicatedData?.total_claimed_amount || 0) - (adjudicatedData?.total_amount_reimbursed || 0))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient & Hospital Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient & Hospital Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Patient Name</div>
                <div className="text-base font-medium text-gray-900">
                  {adjudicatedData?.patient_name || 
                   safeExtractValue((extractedData as any)?.patient_name) || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Hospital Name</div>
                <div className="text-base font-medium text-gray-900">
                  {adjudicatedData?.hospital_name || 
                   safeExtractValue((extractedData as any)?.hospital_name) || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Bill Number</div>
                <div className="text-base font-medium text-gray-900">
                  {adjudicatedData?.bill_no || 
                   safeExtractValue((extractedData as any)?.bill_no) || 'N/A'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Bill Date</div>
                  <div className="text-base font-medium text-gray-900">
                    {adjudicatedData?.bill_date ? formatDate(adjudicatedData.bill_date.toString()) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Admission Date</div>
                  <div className="text-base font-medium text-gray-900">
                    {adjudicatedData?.admission_date ? formatDate(adjudicatedData.admission_date.toString()) : 'N/A'}
                  </div>
                </div>
              </div>
              {adjudicatedData?.discharge_date && (
                <div>
                  <div className="text-sm text-gray-600">Discharge Date</div>
                  <div className="text-base font-medium text-gray-900">
                    {formatDate(adjudicatedData.discharge_date.toString())}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Policy Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Information</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Policy ID</div>
                <div className="text-base font-medium text-gray-900">
                  {displayClaim.policy_id || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Claim ID</div>
                <div className="text-sm font-mono text-gray-900 break-all">
                  {displayClaim.claim_id}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Submitted By</div>
                <div className="text-base font-medium text-gray-900">
                  User ID: {displayClaim.submitted_by_user_id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        {adjudicatedData?.adjudicated_line_items && adjudicatedData.adjudicated_line_items.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Itemized Charges</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Allowed Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Disallowed</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adjudicatedData.adjudicated_line_items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">{formatCurrency(item.total_amount)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-green-600 text-right">{formatCurrency(item.allowed_amount)}</td>
                      <td className="py-3 px-4 text-sm font-medium text-red-600 text-right">{formatCurrency(item.disallowed_amount)}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === 'Allowed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Adjustments Log */}
        {adjudicatedData?.adjustments_log && adjudicatedData.adjustments_log.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjustments & Remarks</h3>
            <div className="space-y-2">
              {adjudicatedData.adjustments_log.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-700">{log}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sanity Check Result */}
        {adjudicatedData?.sanity_check_result && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Audit Result</h3>
            <div className={`p-4 rounded-lg border ${
              adjudicatedData.sanity_check_result.is_reasonable 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {adjudicatedData.sanity_check_result.is_reasonable ? (
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="flex-1">
                  <div className={`font-semibold mb-1 ${
                    adjudicatedData.sanity_check_result.is_reasonable ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {adjudicatedData.sanity_check_result.is_reasonable ? 'Reasonable Adjudication' : 'Requires Review'}
                  </div>
                  <p className={`text-sm ${
                    adjudicatedData.sanity_check_result.is_reasonable ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {adjudicatedData.sanity_check_result.reasoning}
                  </p>
                </div>
              </div>
              {adjudicatedData.sanity_check_result.flags && adjudicatedData.sanity_check_result.flags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Flags:</div>
                  <div className="flex flex-wrap gap-2">
                    {adjudicatedData.sanity_check_result.flags.map((flag, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-white border border-gray-300 rounded-full text-gray-700">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/claims')}
            className="flex-1 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back to Claims
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Download Report
          </button>
        </div>
      </main>
    </div>
  );
}
