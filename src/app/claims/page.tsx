'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useClaims } from '@/hooks/use-claims';
import { useCurrentUser } from '@/hooks/use-auth';
import type { ClaimRecord } from '@/lib/api-types';
import { format } from 'date-fns';

export default function ClaimsPage() {
  const router = useRouter();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: claims, isLoading: claimsLoading, error } = useClaims();

  // Helper function to safely extract value from confidence object or plain value
  const safeExtractValue = (field: unknown): string => {
    if (!field) return '';
    if (typeof field === 'object' && field !== null && 'value' in field) {
      return String((field as { value: unknown }).value || '');
    }
    return String(field);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
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

  const handleViewDetails = (claim: ClaimRecord) => {
    // Store claim data and navigate to processed page with history view
    sessionStorage.setItem('selectedClaimData', JSON.stringify(claim));
    router.push(`/processed?view=history&claimId=${claim.claim_id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full h-[72px] border-b border-[#D8DDE7] bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="font-satoshi font-bold text-[20px] leading-[27px] bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent cursor-pointer"
                onClick={() => router.push('/upload')}>
              ClaimNow.ai
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-9">
            {/* Need Help Button */}
            <div className="flex items-center gap-3 bg-[#FFF8EB] rounded px-4 py-2 h-[40px]">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" 
                    fill="#B25E09"
                  />
                  <path 
                    d="M7.57495 7.5C7.77087 6.94772 8.15758 6.48706 8.66659 6.19451C9.1756 5.90195 9.7727 5.79798 10.3521 5.90317C10.9314 6.00837 11.4571 6.31486 11.8411 6.76955C12.2251 7.22424 12.4399 7.79599 12.4499 8.39C12.4499 10 9.94995 10.8 9.94995 10.8M9.99995 14H10.0099" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-satoshi font-bold text-[16px] text-[#B25E09]">
                Need help?
              </span>
            </div>

            {/* Notification Icon */}
            <div className="w-6 h-6 flex items-center justify-center">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 6C12 4.93913 11.5786 3.92172 10.8284 3.17157C10.0783 2.42143 9.06087 2 8 2C6.93913 2 5.92172 2.42143 5.17157 3.17157C4.42143 3.92172 4 4.93913 4 6C4 13 1 15 1 15H15C15 15 12 13 12 6Z" 
                  stroke="rgba(29, 36, 51, 0.8)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M9.73 17C9.5542 17.3031 9.3019 17.5547 8.99776 17.7295C8.69362 17.9044 8.34713 17.9965 8 17.9965C7.65287 17.9965 7.30638 17.9044 7.00224 17.7295C6.6981 17.5547 6.4458 17.3031 6.27 17" 
                  stroke="rgba(29, 36, 51, 0.8)" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                {claims && claims.length > 0 && (
                  <circle cx="11" cy="5" r="2" fill="rgba(29, 36, 51, 0.8)"/>
                )}
              </svg>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-[40px] h-[40px] rounded-[30px] bg-gray-300 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    {!userLoading && currentUser && (
                      <span className="text-white font-bold text-sm">
                        {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-satoshi font-bold text-[16px] text-[rgba(29,36,51,0.8)]">
                    {userLoading ? 'Loading...' : (currentUser?.full_name || currentUser?.username || 'User')}
                  </span>
                  <span className="font-satoshi font-medium text-[12px] text-[rgba(29,36,51,0.65)]">
                    {currentUser?.email || 'View profile'}
                  </span>
                </div>
              </div>
              <div className="w-5 h-5 flex items-center justify-center">
                <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M1 4L5 1L9 4" 
                    stroke="rgba(29, 36, 51, 0.65)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-16 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-[#1D2433] mb-2">Claims History</h1>
          <p className="text-[16px] text-[rgba(29,36,51,0.65)]">
            View and manage all your submitted claims
          </p>
        </div>

        {/* Loading State */}
        {claimsLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F5FED]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-600 font-medium">Failed to load claims. Please try again.</p>
          </div>
        )}

        {/* Empty State */}
        {!claimsLoading && !error && (!claims || claims.length === 0) && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Claims Yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first medical claim</p>
            <button 
              onClick={() => router.push('/upload')}
              className="bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upload New Claim
            </button>
          </div>
        )}

        {/* Claims Table */}
        {!claimsLoading && claims && claims.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Claimed Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reimbursed Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {claims.map((claim) => {
                  const extractedData = claim.extracted_data;
                  const patientName = claim.adjudicated_data?.patient_name || 
                    (extractedData && typeof extractedData === 'object' && 'patient_name' in extractedData 
                      ? safeExtractValue(extractedData.patient_name) 
                      : 'N/A');
                  const hospitalName = claim.adjudicated_data?.hospital_name || 
                    (extractedData && typeof extractedData === 'object' && 'hospital_name' in extractedData 
                      ? safeExtractValue(extractedData.hospital_name) 
                      : 'N/A');

                  return (
                    <tr key={claim.claim_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {claim.claim_id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {hospitalName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {claim.adjudicated_data?.total_claimed_amount 
                            ? formatCurrency(claim.adjudicated_data.total_claimed_amount)
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {claim.adjudicated_data?.total_amount_reimbursed 
                            ? formatCurrency(claim.adjudicated_data.total_amount_reimbursed)
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(claim.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(claim.status || 'processing')}`}>
                          {(claim.status || 'processing').charAt(0).toUpperCase() + (claim.status || 'processing').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(claim)}
                          className="text-[#2F5FED] hover:text-[#2854D6] font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>View Details</span>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!claimsLoading && claims && claims.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Claims</div>
              <div className="text-2xl font-bold text-gray-900">{claims.length}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Claimed</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(claims.reduce((sum, c) => sum + (c.adjudicated_data?.total_claimed_amount || 0), 0))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Reimbursed</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(claims.reduce((sum, c) => sum + (c.adjudicated_data?.total_amount_reimbursed || 0), 0))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Average Processing Time</div>
              <div className="text-2xl font-bold text-gray-900">2-3 mins</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
