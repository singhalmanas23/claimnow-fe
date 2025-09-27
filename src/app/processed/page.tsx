"use client";

import React from "react";
import { PROCESSED_CLAIM_DATA } from "@/constants/processed";
import ProcessedHeader from "@/components/processed/ProcessedHeader";
import UnclaimedTable from "@/components/processed/UnclaimedTable";
import ClaimedTable from "@/components/processed/ClaimedTable";
import {
  DownloadIcon,
  SuccessCheckIcon,
} from "@/components/icons/ProcessedIcons";
import { Check } from "lucide-react";

export default function ProcessedPage() {
  const {
    fileName,
    totalRequested,
    claimedAmount,
    claimPercentage,
    unclaimedAmount,
    unclaimedBreakdown,
    claimedBreakdown,
  } = PROCESSED_CLAIM_DATA;

  const handleDownloadPdf = () => {
    console.log("Downloading PDF...");
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white">
      <ProcessedHeader />

      <div className="px-16 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-800">
            <Check className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium text-[#1D2433] mb-8">
            {fileName} Successfully Processed
          </h1>

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
            onClick={handleGoHome}
            className="px-6 py-3 bg-gradient-to-r from-[#2F5FED] to-[#547DF5] text-white rounded-lg hover:from-[#2854D6] hover:to-[#4B7AE8] transition-all"
          >
            <span className="text-sm font-medium">Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
