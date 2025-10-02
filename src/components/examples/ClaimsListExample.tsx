/**
 * Example: Claims List Component
 * Demonstrates fetching and displaying user claims with TanStack Query
 */

'use client';

import { useState } from 'react';
import { useClaims, useClaim } from '@/hooks/use-claims';

export default function ClaimsListExample() {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });

  // Fetch claims list
  const { data: claims, isLoading, error, refetch } = useClaims(pagination);

  // Fetch selected claim details
  const {
    data: selectedClaim,
    isLoading: isLoadingClaim,
  } = useClaim(selectedClaimId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Loading claims...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Claims</h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Claims</h1>
        <button
          onClick={() => refetch()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {!claims || claims.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Claims Yet</h3>
          <p className="text-gray-500 mb-4">Upload your first medical bill to get started</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Upload Claim
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {claims.map((claim) => (
            <div
              key={claim.claim_id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedClaimId(claim.claim_id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {claim.adjudicated_data.patient_name}
                  </h3>
                  <p className="text-gray-600">
                    {claim.adjudicated_data.hospital_name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    claim.adjudicated_data.sanity_check_result?.is_reasonable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {claim.adjudicated_data.sanity_check_result?.is_reasonable
                    ? 'Approved'
                    : 'Review'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Bill Date</p>
                  <p className="font-semibold">{claim.adjudicated_data.bill_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Claimed</p>
                  <p className="font-semibold">
                    ${claim.adjudicated_data.total_claimed_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reimbursed</p>
                  <p className="font-semibold text-green-600">
                    ${claim.adjudicated_data.total_amount_reimbursed.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Claim ID: {claim.claim_id.substring(0, 8)}...
                </p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {claims && claims.length > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                skip: Math.max(0, prev.skip - prev.limit),
              }))
            }
            disabled={pagination.skip === 0}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                skip: prev.skip + prev.limit,
              }))
            }
            disabled={claims.length < pagination.limit}
            className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Selected Claim Modal */}
      {selectedClaimId && selectedClaim && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedClaimId(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Claim Details</h2>
              <button
                onClick={() => setSelectedClaimId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Hospital Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-semibold text-lg">{selectedClaim.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hospital Name</p>
                  <p className="font-semibold text-lg">{selectedClaim.hospital_name}</p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Claimed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${selectedClaim.total_claimed_amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Reimbursed</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedClaim.total_amount_reimbursed.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Adjudicated Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-right">Claimed</th>
                        <th className="px-4 py-2 text-right">Allowed</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedClaim.adjudicated_line_items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{item.description}</td>
                          <td className="px-4 py-2 text-right">
                            ${item.total_amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right">
                            ${item.allowed_amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.status === 'Allowed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Adjustments */}
              {selectedClaim.adjustments_log.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Adjustments</h3>
                  <ul className="space-y-1">
                    {selectedClaim.adjustments_log.map((adj, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {adj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
