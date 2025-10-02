/**
 * Example: Complete Claim Processing Component
 * Demonstrates full workflow: Upload -> Extract -> Adjudicate -> Results
 */

'use client';

import { useState } from 'react';
import { useProcessCompleteClaim } from '@/hooks/use-claims';
import type { InsuranceDetails } from '@/lib/api-types';

export default function ClaimProcessingExample() {
  const [file, setFile] = useState<File | null>(null);
  const [insuranceDetails, setInsuranceDetails] = useState<InsuranceDetails>({
    policy_number: '',
    insurance_provider: '',
  });

  const processClaim = useProcessCompleteClaim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    if (!insuranceDetails.policy_number || !insuranceDetails.insurance_provider) {
      alert('Please fill in all insurance details');
      return;
    }

    try {
      await processClaim.mutateAsync({
        file,
        insuranceDetails,
      });
    } catch (error) {
      console.error('Claim processing failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Process Medical Claim</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <label className="block mb-2 font-medium">Upload Medical Bill (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Insurance Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Insurance Details</h2>
          
          <div>
            <label className="block mb-2 font-medium">Policy Number</label>
            <input
              type="text"
              value={insuranceDetails.policy_number}
              onChange={(e) =>
                setInsuranceDetails((prev) => ({
                  ...prev,
                  policy_number: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., POL123456"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Insurance Provider</label>
            <input
              type="text"
              value={insuranceDetails.insurance_provider}
              onChange={(e) =>
                setInsuranceDetails((prev) => ({
                  ...prev,
                  insurance_provider: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HealthCare Inc."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || processClaim.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold
            hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors"
        >
          {processClaim.isPending ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
              Processing...
            </span>
          ) : (
            'Process Claim'
          )}
        </button>
      </form>

      {/* Error Display */}
      {processClaim.isError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-semibold">Error Processing Claim</h3>
          <p className="text-red-600 text-sm mt-1">
            {processClaim.error instanceof Error
              ? processClaim.error.message
              : 'An unexpected error occurred'}
          </p>
        </div>
      )}

      {/* Results Display */}
      {processClaim.isSuccess && processClaim.data && (
        <div className="mt-8 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-green-800 font-semibold">✓ Claim Processed Successfully</h3>
          </div>

          {/* Extracted Data */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Extracted Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hospital Name</p>
                <p className="font-semibold">
                  {processClaim.data.extracted.hospital_name.value}
                </p>
                <p className="text-xs text-gray-500">
                  Confidence: {(processClaim.data.extracted.hospital_name.confidence * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Patient Name</p>
                <p className="font-semibold">
                  {processClaim.data.extracted.patient_name.value}
                </p>
                <p className="text-xs text-gray-500">
                  Confidence: {(processClaim.data.extracted.patient_name.confidence * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Bill Date</p>
                <p className="font-semibold">
                  {processClaim.data.extracted.bill_date.value}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="font-semibold">
                  {processClaim.data.extracted.admission_date.value}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Net Payable Amount</p>
                <p className="font-semibold text-lg">
                  ${processClaim.data.extracted.net_payable_amount.value.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {processClaim.data.extracted.line_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{item.description.value}</td>
                        <td className="px-4 py-2 text-right">{item.quantity.value}</td>
                        <td className="px-4 py-2 text-right">
                          ${item.unit_price.value.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${item.total_amount.value.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Adjudicated Results */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Adjudication Results</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Claimed Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${processClaim.data.adjudicated.total_claimed_amount.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Reimbursed</p>
                <p className="text-3xl font-bold text-green-600">
                  ${processClaim.data.adjudicated.total_amount_reimbursed.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Adjustments Log */}
            {processClaim.data.adjudicated.adjustments_log.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Adjustments Applied</h3>
                <ul className="space-y-1">
                  {processClaim.data.adjudicated.adjustments_log.map((adjustment, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {adjustment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sanity Check */}
            {processClaim.data.adjudicated.sanity_check_result && (
              <div
                className={`p-4 rounded-lg ${
                  processClaim.data.adjudicated.sanity_check_result.is_reasonable
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <h3 className="font-semibold mb-2">
                  {processClaim.data.adjudicated.sanity_check_result.is_reasonable
                    ? '✓ Sanity Check Passed'
                    : '⚠ Sanity Check Warnings'}
                </h3>
                <p className="text-sm mb-2">
                  {processClaim.data.adjudicated.sanity_check_result.reasoning}
                </p>
                {processClaim.data.adjudicated.sanity_check_result.flags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Flags:</p>
                    <ul className="list-disc list-inside text-sm">
                      {processClaim.data.adjudicated.sanity_check_result.flags.map(
                        (flag, idx) => (
                          <li key={idx}>{flag}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
