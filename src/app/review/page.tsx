"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReviewState } from "@/hooks/useReviewState";
import { PROGRESS_STEPS } from "@/constants/review";
import ReviewHeader from "@/components/review/ReviewHeader";
import PDFPreview from "@/components/review/PDFPreview";
import PolicyForm from "@/components/review/PolicyForm";
import ItemizedCharges from "@/components/review/ItemizedCharges";
import BottomNavigation from "@/components/review/BottomNavigation";
import { useAdjudicateClaim, useClaimStatus, useAdjudicatedData } from "@/hooks/use-claims";
import { useCurrentUser } from "@/hooks/use-auth";
import type {
  ExtractedDataWithConfidence,
  ExtractedData,
} from "@/lib/api-types";

interface FieldConfidence {
  [key: string]: number;
}

// const TEST_DATA: ExtractedDataWithConfidence = {
//   hospital_name: {
//     value: "Mahesh Smruti Multispeciality Hospital",
//     confidence: 0.98,
//   },
//   patient_name: {
//     value: "Mrs. Rohini Patil",
//     confidence: 0.98,
//   },
//   bill_date: {
//     value: null,
//     confidence: 0.95,
//   },
//   bill_no: {
//     value: "0308",
//     confidence: 0.98,
//   },
//   admission_date: {
//     value: "2020-10-16",
//     confidence: 0.98,
//   },
//   discharge_date: {
//     value: "2020-10-22",
//     confidence: 0.98,
//   },
//   net_payable_amount: {
//     value: 0,
//     confidence: 0.96,
//   },
//   line_items: [
//     {
//       description: {
//         value:
//           "Covid Ward Per Day Package (Included Bed Charges, Nursing Charges, Investigation, Hospital Drug, 2D Echo, USG, Hospital RMO Consultation Charges)",
//         confidence: 0.97,
//       },
//       quantity: {
//         value: 7,
//         confidence: 0.98,
//       },
//       unit_price: {
//         value: 4000,
//         confidence: 0.98,
//       },
//       total_amount: {
//         value: 28000,
//         confidence: 0.98,
//       },
//     },
//     {
//       description: {
//         value:
//           "Covid Ward Internal Medicine Consultant Charges - Dr. Nitin Lohokare",
//         confidence: 0.97,
//       },
//       quantity: {
//         value: 7,
//         confidence: 0.98,
//       },
//       unit_price: {
//         value: 1000,
//         confidence: 0.98,
//       },
//       total_amount: {
//         value: 7000,
//         confidence: 0.98,
//       },
//     },
//     {
//       description: {
//         value:
//           "COVID-19 Precautions Charges (PPE Kit, N-95 Mask, Sterilized Gloves - 2 Pair, Surgical Gloves - 1 Pair, Headcap, Faceshield, 3Ply Mask - 2 Pair, Disposable Bag, Shoe Cover, Sturlinum, Passco Charges, Sanitization)",
//         confidence: 0.97,
//       },
//       quantity: {
//         value: 7,
//         confidence: 0.98,
//       },
//       unit_price: {
//         value: 2000,
//         confidence: 0.98,
//       },
//       total_amount: {
//         value: 14000,
//         confidence: 0.98,
//       },
//     },
//     {
//       description: {
//         value: "Administration Charges @ 5%",
//         confidence: 0.98,
//       },
//       quantity: {
//         value: null,
//         confidence: 0.95,
//       },
//       unit_price: {
//         value: null,
//         confidence: 0.95,
//       },
//       total_amount: {
//         value: 2450,
//         confidence: 0.98,
//       },
//     },
//   ],
// };

const USE_TEST_DATA = false;

/**
 * Convert various date formats to ISO 8601 (YYYY-MM-DD)
 * Handles: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */
function convertToISODate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // If already a Date object
  if (dateStr instanceof Date) {
    return dateStr.toISOString().split('T')[0];
  }
  
  const str = dateStr.trim();
  
  // If already in ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  
  // Handle DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try parsing as a date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // Fallback to current date
  console.warn('Could not parse date:', dateStr, '- using current date');
  return new Date().toISOString().split('T')[0];
}

export default function ReviewPage() {
  const router = useRouter();
  const adjudicateClaimMutation = useAdjudicateClaim();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [error, setError] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] =
    useState<string>("Bill11.pdf");
  const [fieldConfidences, setFieldConfidences] = useState<FieldConfidence>({});
  // Keyed by charge id (not array index) so confidences stay attached to the
  // correct line item after rows are deleted/reordered.
  const [itemConfidences, setItemConfidences] = useState<
    Record<string, { [key: string]: number }>
  >({});
  const [criticalIssues, setCriticalIssues] = useState(0);
  const [warningIssues, setWarningIssues] = useState(0);
  
  // State for adjudication polling
  const [claimId, setClaimId] = useState<string | null>(null);
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  
  // Poll adjudication status
  const { data: adjudicationStatus } = useClaimStatus(claimId, isAdjudicating);
  
  // Fetch adjudicated data only when adjudication is completed
  // Note: 'extracted' means PDF extraction is done, NOT adjudication
  const shouldFetchAdjudicated = 
    adjudicationStatus?.status === 'completed' && isAdjudicating;
  const { data: adjudicatedData } = useAdjudicatedData(claimId, shouldFetchAdjudicated);

  const {
    policyInfo,
    itemizedCharges,
    isSubmitting,
    handlePolicyFieldChange,
    updateQuantity,
    updateCharge,
    addNewItem,
    removeItem,
    handleReset,
    setIsSubmitting,
    setItemizedCharges,
  } = useReviewState();
  useEffect(() => {
    if (adjudicationStatus && isAdjudicating) {
      console.log('Review: Adjudication status update:', adjudicationStatus.status);
      
      if (adjudicationStatus.status === 'completed') {
        // Adjudication completed - safe to fetch adjudicated data
        setIsAdjudicating(false);
        console.log('Review: ✓ Adjudication completed - stopping poll');
      } else if (adjudicationStatus.status === 'failed') {
        // Adjudication failed
        setIsAdjudicating(false);
        setError(adjudicationStatus.last_error || 'Adjudication failed. Please try again.');
        setIsSubmitting(false);
      }
      // Note: 'adjudicating' status means still processing - continue polling
    }
  }, [adjudicationStatus, isAdjudicating, setIsSubmitting]);

  // Handle adjudicated data received
  useEffect(() => {
    if (adjudicatedData) {
      console.log('Review: Adjudicated data received:', adjudicatedData);
      
      // Store adjudicated result in sessionStorage
      sessionStorage.setItem("adjudicatedClaimData", JSON.stringify(adjudicatedData));
      
      // Navigate to processed page
      router.push("/processed");
    }
  }, [adjudicatedData, router]);

  useEffect(() => {
    let parsed: ExtractedDataWithConfidence | null = null;
    if (USE_TEST_DATA) {
      setUploadedFileName("Test_Bill.pdf");
    } else {
      const storedData = sessionStorage.getItem("extractedClaimData");
      const storedFileName = sessionStorage.getItem("uploadedFileName");
      const storedClaimId = sessionStorage.getItem("currentClaimId");

      console.log("Review: Loading data from sessionStorage");

      if (storedClaimId) {
        setClaimId(storedClaimId);
        console.log("Review: Claim ID set to:", storedClaimId);
      }

      if (storedFileName) {
        setUploadedFileName(storedFileName);
        console.log("Review: Filename set to:", storedFileName);
      }

      if (storedData) {
        try {
          parsed = JSON.parse(storedData);
        } catch (err) {
          console.error("Review: Failed to parse extracted data:", err);
          setError(
            "Failed to load extracted data. Please try uploading again."
          );
          return;
        }
      } else {
        console.warn("Review: No extracted data found in sessionStorage");
        return;
      }
    }

    if (!parsed) return;

    const confidences: FieldConfidence = {
      hospitalName: parsed.hospital_name.confidence,
      patientName: parsed.patient_name.confidence,
      billNo: parsed.bill_no?.confidence ?? 1,
      billDate: parsed.bill_date?.confidence ?? 1,
      admissionDate: parsed.admission_date.confidence,
      dischargeDate: parsed.discharge_date?.confidence ?? 1,
      policyNumber: parsed.policy_no?.confidence ?? 1,
      insuranceProvider: parsed.insurance_provider?.confidence ?? 1,
      icdCode: parsed.icd_code?.confidence ?? 1,
      netPayableAmount: parsed.net_payable_amount.confidence,
    };

    setFieldConfidences(confidences);

    // Track item confidences, keyed by the SAME id the charges use below
    // (String(index + 1)) so a confidence stays bound to its line item even
    // after rows above it are deleted.
    const itemConfs: Record<string, { [key: string]: number }> = {};
    parsed.line_items?.forEach((item, index) => {
      itemConfs[String(index + 1)] = {
        description: item.description?.confidence || 1,
        quantity: item.quantity?.confidence || 1,
        unitPrice: item.unit_price?.confidence || 1,
        totalAmount: item.total_amount?.confidence || 1,
      };
    });

    setItemConfidences(itemConfs);

    // Count issues
    let critical = 0;
    let warnings = 0;

    Object.values(confidences).forEach((conf) => {
      if (conf < 0.5) critical++;
      else if (conf < 0.9) warnings++;
    });

    Object.values(itemConfs).forEach((item) => {
      Object.values(item).forEach((conf) => {
        if (conf < 0.5) critical++;
        else if (conf < 0.9) warnings++;
      });
    });

    setCriticalIssues(critical);
    setWarningIssues(warnings);

    // Pre-fill form with extracted data. Empty fields (AI couldn't find on
    // the bill) stay as empty strings — the reviewer fills them in.
    handlePolicyFieldChange("hospitalName", parsed.hospital_name?.value ?? "");
    handlePolicyFieldChange("patientName", parsed.patient_name?.value ?? "");
    handlePolicyFieldChange("billNo", parsed.bill_no?.value ?? "");
    handlePolicyFieldChange("billDate", parsed.bill_date?.value ?? "");
    handlePolicyFieldChange("admissionDate", parsed.admission_date?.value ?? "");
    handlePolicyFieldChange("dischargeDate", parsed.discharge_date?.value ?? "");
    handlePolicyFieldChange("policyNumber", parsed.policy_no?.value ?? "");
    handlePolicyFieldChange("insuranceProvider", parsed.insurance_provider?.value ?? "");
    handlePolicyFieldChange("icdCode", parsed.icd_code?.value ?? "");

    // Convert line items to itemized charges format
    if (parsed.line_items && parsed.line_items.length > 0) {
      const charges = parsed.line_items.map((item, index) => {
        const totalAmount = item.total_amount?.value || 0;
        const quantity = item.quantity?.value || 1;
        const unitPrice =
          item.unit_price?.value ||
          (quantity > 0 ? totalAmount / quantity : totalAmount);

        return {
          id: String(index + 1),
          costTitle: item.description?.value || "Unknown Item",
          quantity: quantity,
          unitPrice: unitPrice,
        };
      });
      setItemizedCharges(charges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProcessNow = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Validate required fields
      const missingFields: string[] = [];
      
      if (!policyInfo.hospitalName?.trim()) missingFields.push("Hospital Name");
      if (!policyInfo.patientName?.trim()) missingFields.push("Patient Name");
      if (!policyInfo.admissionDate) missingFields.push("Admission Date");
      if (!policyInfo.policyNumber?.trim()) missingFields.push("Policy Number");
      if (!policyInfo.insuranceProvider?.trim()) missingFields.push("Insurance Provider");
      if(!policyInfo.dischargeDate) missingFields.push("Discharge Date");


      if (missingFields.length > 0) {
        setError(
          `Please fill in the following required fields: ${missingFields.join(", ")}`
        );
        setIsSubmitting(false);
        return;
      }

      // Validate itemized charges
      if (itemizedCharges.length === 0) {
        setError("Please add at least one itemized charge");
        setIsSubmitting(false);
        return;
      }

      // Check if we have a claim_id
      if (!claimId) {
        setError("No claim ID found. Please upload a document first.");
        setIsSubmitting(false);
        return;
      }

      // Convert dates to ISO format (YYYY-MM-DD) as required by backend
      const isoAdmissionDate = convertToISODate(policyInfo.admissionDate);
      const isoDischargeDate = policyInfo.dischargeDate 
        ? convertToISODate(policyInfo.dischargeDate) 
        : null;
      const isoBillDate = policyInfo.billDate 
        ? convertToISODate(policyInfo.billDate) 
        : convertToISODate(new Date());

      console.log("Review: Date conversions:", {
        admission: { original: policyInfo.admissionDate, iso: isoAdmissionDate },
        discharge: { original: policyInfo.dischargeDate, iso: isoDischargeDate },
        bill: { original: policyInfo.billDate, iso: isoBillDate }
      });

      const extractedDataPayload: ExtractedData = {
        bill_date: new Date(isoBillDate),
        bill_no: policyInfo.billNo || "",
        hospital_name: policyInfo.hospitalName,
        patient_name: policyInfo.patientName,
        admission_date: isoAdmissionDate,
        discharge_date: isoDischargeDate,
        net_payable_amount: itemizedCharges.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        ),
        line_items: itemizedCharges.map((item) => ({
          description: item.costTitle,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_amount: item.quantity * item.unitPrice,
        })),
        policy_no: policyInfo.policyNumber,
        insurance_provider: policyInfo.insuranceProvider,
        icd_code: policyInfo.icdCode || undefined,
      };

      console.log("Review: Submitting adjudication for claim:", claimId);
      console.log("Review: Policy Number:", policyInfo.policyNumber);
      console.log("Review: Insurance Provider:", policyInfo.insuranceProvider);

      // Submit for adjudication (async - returns claim_id with status 'adjudicating')
      const result = await adjudicateClaimMutation.mutateAsync({
        claim_id: claimId,
        extracted_data: extractedDataPayload,
      });

      console.log("Review: Adjudication submitted:", result);

      // Start polling for adjudication status
      setIsAdjudicating(true);
      
      // Note: The useEffect hooks above will handle:
      // 1. Polling status until completed
      // 2. Fetching adjudicated data
      // 3. Storing in sessionStorage
      // 4. Navigating to /processed
    } catch (err: unknown) {
      const error = err as { 
        response?: { data?: { detail?: string } };
        message?: string;
        code?: string;
      };
      console.error("Review: Adjudication failed:", error);
      console.error("Review: Error response:", error?.response);
      console.error("Review: Error message:", error?.message);
      console.error("Review: Error code:", error?.code);

      let errorMessage = "Failed to process claim. Please try again.";

      if (error?.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. The server is taking too long to respond. Please try again.";
      } else if (error?.code === "ERR_NETWORK") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ReviewHeader
        steps={PROGRESS_STEPS}
        userName={currentUser?.full_name || currentUser?.username || "User"}
        userEmail={currentUser?.email || "View profile"}
        isLoading={userLoading}
      />

      {/* Confidence Alert Banner */}
      {(criticalIssues > 0 || warningIssues > 0) && (
        <div className="mx-8 lg:mx-16 mt-4 space-y-3">
          {/* Critical Issues Alert */}
          {criticalIssues > 0 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" fill="#EF4444" />
                    <path
                      d="M12 8V12M12 16H12.01"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-red-800">
                      Critical: Cross-Checking Required
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {criticalIssues}{" "}
                      {criticalIssues === 1 ? "field" : "fields"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">
                    {criticalIssues}{" "}
                    {criticalIssues === 1 ? "field has" : "fields have"} very
                    low confidence (&lt;50%). Please carefully verify the
                    extracted data against the original document.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    <span className="inline-block w-3 h-3 rounded border-2 border-red-500"></span>
                    <span>
                      Fields marked with red borders require verification
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning Issues Alert */}
          {warningIssues > 0 && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      fill="#F59E0B"
                    />
                    <path
                      d="M12 8V12M12 16H12.01"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-amber-800">
                      Review Recommended
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {warningIssues} {warningIssues === 1 ? "field" : "fields"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-amber-700">
                    {warningIssues}{" "}
                    {warningIssues === 1 ? "field has" : "fields have"} moderate
                    confidence (50-90%). Please review these fields for
                    accuracy.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                    <span className="inline-block w-3 h-3 rounded border-2 border-amber-500"></span>
                    <span>
                      Fields marked with yellow borders should be reviewed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-8 lg:mx-16 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0 mt-0.5"
            >
              <circle cx="10" cy="10" r="8" stroke="#DC2626" strokeWidth="2" />
              <path
                d="M10 6V10M10 14H10.01"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-red-600 font-medium flex-1">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-1 bg-white overflow-hidden">
        <PDFPreview
          fileName={uploadedFileName}
          policyInfo={policyInfo}
          itemizedCharges={itemizedCharges}
        />

        <div className="flex-1 bg-white p-8 lg:p-16 overflow-y-auto">
          <PolicyForm
            policyInfo={policyInfo}
            onFieldChange={handlePolicyFieldChange}
            fieldConfidences={fieldConfidences}
          />

          <ItemizedCharges
            charges={itemizedCharges}
            onUpdateCharge={updateCharge}
            onUpdateQuantity={updateQuantity}
            onRemoveCharge={removeItem}
            onAddCharge={addNewItem}
            itemConfidences={itemConfidences}
            headerConfidences={fieldConfidences}
          />
        </div>
      </div>

      {/* Processing Overlay */}
      {(isSubmitting || 
        isAdjudicating || 
        adjudicationStatus?.status === 'adjudicating' || 
        adjudicationStatus?.status === 'processing' ||
        adjudicationStatus?.status === 'queued') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Claim
                </h3>
                <p className="text-sm text-gray-600">
                  {adjudicationStatus?.status === 'adjudicating' 
                    ? 'Adjudicating your claim...' 
                    : adjudicationStatus?.status === 'processing'
                    ? 'Processing your claim...'
                    : adjudicationStatus?.status === 'queued'
                    ? 'Your claim is queued for processing...'
                    : 'Please wait while we process your claim...'}
                </p>
                {adjudicationStatus?.status && (
                  <p className="text-xs text-gray-500 mt-2 capitalize">
                    Status: {adjudicationStatus.status}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation
        isSubmitting={isSubmitting || isAdjudicating}
        onReset={handleReset}
        onProcess={handleProcessNow}
      />
    </div>
  );
}
