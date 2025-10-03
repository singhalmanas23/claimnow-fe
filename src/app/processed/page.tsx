"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdjudicatedClaim, ClaimRecord } from "@/lib/api-types";
import { useCurrentUser } from "@/hooks/use-auth";
import ProcessedHeader from "@/components/processed/ProcessedHeader";
import UnclaimedTable from "@/components/processed/UnclaimedTable";
import ClaimedTable from "@/components/processed/ClaimedTable";
import {
  DownloadIcon,
} from "@/components/icons/ProcessedIcons";
import { Check, ArrowLeft } from "lucide-react";

export default function ProcessedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [claimData, setClaimData] = useState<AdjudicatedClaim | null>(null);
  const [claimRecord, setClaimRecord] = useState<ClaimRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  const [claimNumber, setClaimNumber] = useState<string>("");

  useEffect(() => {
    // Check if this is a historical view (from claims history page)
    const viewMode = searchParams?.get('view');
    const claimId = searchParams?.get('claimId');
    
    if (viewMode === 'history' && claimId) {
      // Load from claims history
      setIsHistoricalView(true);
      setClaimNumber(claimId.slice(0, 8)); // Use first 8 chars as claim number
      
      const storedClaim = sessionStorage.getItem('selectedClaimData');
      if (storedClaim) {
        try {
          const parsed: ClaimRecord = JSON.parse(storedClaim);
          setClaimRecord(parsed);
          
          // Extract adjudicated data from claim record
          if (parsed.adjudicated_data) {
            setClaimData(parsed.adjudicated_data);
          }
        } catch (err) {
          console.error('Failed to parse stored claim:', err);
          router.push('/claims');
        }
      } else {
        router.push('/claims');
      }
    } else {
      // Load newly processed claim data
      setIsHistoricalView(false);
      const storedData = sessionStorage.getItem('adjudicatedClaimData');
      if (storedData) {
        try {
          const parsed: AdjudicatedClaim = JSON.parse(storedData);
          setClaimData(parsed);
        } catch (err) {
          console.error('Failed to parse adjudicated data:', err);
          router.push('/upload');
        }
      } else {
        // No data available, redirect to upload page
        router.push('/upload');
      }
    }
    setLoading(false);
  }, [searchParams, router]);

  if (loading || !claimData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F5FED] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading claim results...</p>
        </div>
      </div>
    );
  }

  const fileName = `${claimData.patient_name}_${claimData.bill_no || 'claim'}`;
  const totalRequested = claimData.total_claimed_amount;
  const claimedAmount = claimData.total_amount_reimbursed;
  const unclaimedAmount = totalRequested - claimedAmount;
  const claimPercentage = Math.round((claimedAmount / totalRequested) * 100);

  // Prepare unclaimed breakdown
  const unclaimedBreakdown = claimData.adjudicated_line_items
    .filter(item => item.disallowed_amount > 0)
    .map((item, index) => ({
      id: `unclaimed-${index}`,
      serialNo: (index + 1).toString(),
      amount: item.disallowed_amount,
      reason: item.reason || 'Not covered',
    }));

  // Prepare claimed breakdown
  const claimedBreakdown = claimData.adjudicated_line_items
    .filter(item => item.allowed_amount > 0)
    .map((item, index) => ({
      id: `claimed-${index}`,
      serialNo: (index + 1).toString(),
      costTitle: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalAmount: item.allowed_amount,
      claimStatus: Math.round((item.allowed_amount / item.total_amount) * 100),
      reason: item.status,
    }));

  const handleDownloadPdf = () => {
    console.log("Downloading PDF...");
    // TODO: Implement PDF download
  };

  const handleGoHome = () => {
    // Clear session storage
    sessionStorage.removeItem('extractedClaimData');
    sessionStorage.removeItem('adjudicatedClaimData');
    sessionStorage.removeItem('selectedClaimData');
    router.push("/upload");
  };

  const handleBackToClaims = () => {
    router.push("/claims");
  };

  return (
    <div className="min-h-screen bg-white">
      <ProcessedHeader 
        userName={currentUser?.full_name || currentUser?.username || 'User'}
        userEmail={currentUser?.email || 'View profile'}
        isLoading={userLoading}
      />

      <div className="px-16 py-8">
        {/* Progress Stepper - Only show for newly processed claims */}
        {!isHistoricalView && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {/* Step 1: Upload Document */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EDFDF8] border border-[#08875D]">
                  <Check className="w-4 h-4 text-[#08875D]" />
                </div>
                <span className="text-xs font-medium text-[#1D2433]">Upload document</span>
              </div>
              
              {/* Connector Line 1 */}
              <div className="w-16 h-[1px] bg-[#08875D] mt-[-16px]"></div>
              
              {/* Step 2: Process Claim */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EDFDF8] border border-[#08875D]">
                  <Check className="w-4 h-4 text-[#08875D]" />
                </div>
                <span className="text-xs font-medium text-[rgba(29,36,51,0.8)]">Process Claim</span>
              </div>
              
              {/* Connector Line 2 */}
              <div className="w-16 h-[1px] border-t border-dashed border-[#D8DDE7] mt-[-16px]"></div>
              
              {/* Step 3: Successfully Processed */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[rgba(29,36,51,0.8)]">
                  <div className="w-3.5 h-3.5 rounded-full bg-[rgba(29,36,51,0.8)]"></div>
                </div>
                <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">Successfully Processed</span>
              </div>
            </div>
          </div>
        )}

        {/* Back Button and Claim Number - Only show for historical view */}
        {isHistoricalView && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackToClaims}
              className="text-[rgba(29,36,51,0.8)] hover:text-[#1D2433] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-medium text-[rgba(29,36,51,0.8)]">
              Claim No: {claimNumber}
            </h2>
          </div>
        )}

        {/* Success Icon - Only show for newly processed claims */}
        {!isHistoricalView && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-800">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
        
        <div className="text-center mb-12">
          {!isHistoricalView && (
            <h1 className="text-2xl font-medium text-[#1D2433] mb-4">
              {fileName} Successfully Processed
            </h1>
          )}

          {/* Sanity Check Result */}
          {claimData.sanity_check_result && (
            <div className={`mx-auto max-w-2xl mb-6 p-4 rounded-lg ${
              claimData.sanity_check_result.is_reasonable 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm font-medium ${
                claimData.sanity_check_result.is_reasonable 
                  ? 'text-green-700' 
                  : 'text-yellow-700'
              }`}>
                {claimData.sanity_check_result.is_reasonable ? '✓' : '⚠'} {claimData.sanity_check_result.reasoning}
              </p>
              {claimData.sanity_check_result.flags.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">Flags:</p>
                  <ul className="list-disc list-inside text-xs text-gray-600">
                    {claimData.sanity_check_result.flags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Total Claim Amount */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">
              Total Claim Requested
            </span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-normal text-[#1D2433]">₹</span>
              <span className="text-2xl font-medium text-[#1D2433]">
                {totalRequested.toLocaleString()}.00
              </span>
            </div>
          </div>

          {/* Progress Bar - Right after Total Claim */}
          <div className="flex justify-center mb-12">
            <div className="w-[493px] h-5 bg-[#F1F3F9] rounded-full relative overflow-hidden">
              <div
                className="h-5 bg-[#08875D] rounded-full transition-all duration-1000"
                style={{ width: `${(claimedAmount / totalRequested) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Claim Statistics */}
          <div className="flex justify-center items-center gap-8 mb-12">
            {/* Claimed Amount */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">
                Claimed Amount
              </span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-normal text-[#08875D]">₹</span>
                <span className="text-2xl font-medium text-[#08875D]">
                  {claimedAmount.toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* Claim Percentage */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">
                Claim Percentage
              </span>
              <span className="text-2xl font-medium text-[#08875D]">
                {claimPercentage}%
              </span>
            </div>

            {/* Unclaimed Amount */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-[rgba(29,36,51,0.65)]">
                Unclaimed Amount
              </span>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-normal text-[#E02D3C]">₹</span>
                <span className="text-2xl font-medium text-[#E02D3C]">
                  {unclaimedAmount.toLocaleString()}.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#D8DDE7] mb-8"></div>

        {/* Unclaimed Amount Breakup */}
        <div className="mb-16">
          <h2 className="text-xl font-medium text-[#1D2433] mb-6">
            Unclaimed Amount Breakup
          </h2>
          <UnclaimedTable data={unclaimedBreakdown} />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#D8DDE7] mb-8"></div>

        {/* Claimed Amount Breakup */}
        <div className="mb-16">
          <h2 className="text-xl font-medium text-[#1D2433] mb-6">
            Claimed Amount Breakup
          </h2>
          <ClaimedTable data={claimedBreakdown} />
        </div>

        {/* Action Buttons - At the bottom */}
        <div className="flex justify-center gap-3 mt-12">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-5 py-3 border border-[#D8DDE7] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DownloadIcon className="w-4 h-4 text-[rgba(29,36,51,0.8)]" />
            <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">
              Download Pdf
            </span>
          </button>

          <button
            onClick={isHistoricalView ? handleBackToClaims : handleGoHome}
            className="px-6 py-3 bg-gradient-to-r from-[#2F5FED] to-[#547DF5] text-white rounded-lg hover:from-[#2854D6] hover:to-[#4B7AE8] transition-all"
          >
            <span className="text-sm font-medium">
              {isHistoricalView ? 'Back to Claims' : 'Go Home'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
