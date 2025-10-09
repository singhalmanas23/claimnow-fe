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
import { useAdjudicateClaim } from "@/hooks/use-claims";
import { useCurrentUser } from "@/hooks/use-auth";
import type {
  ExtractedDataWithConfidence,
  ExtractedData,
  AdjudicatedClaim,
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

export default function ReviewPage() {
  const router = useRouter();
  const adjudicateClaimMutation = useAdjudicateClaim();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [extractedData, setExtractedData] =
    useState<ExtractedDataWithConfidence | null>(null);
  const [error, setError] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] =
    useState<string>("Bill11.pdf");
  const [fieldConfidences, setFieldConfidences] = useState<FieldConfidence>({});
  const [itemConfidences, setItemConfidences] = useState<
    Array<{ [key: string]: number }>
  >([]);
  const [criticalIssues, setCriticalIssues] = useState(0);
  const [warningIssues, setWarningIssues] = useState(0);

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

  // Load extracted data from sessionStorage on component mount
  useEffect(() => {
    let parsed: ExtractedDataWithConfidence | null = null;

    // TESTING: Use static test data or real data
    if (USE_TEST_DATA) {
      //console.log("Review: Using TEST DATA");
      // parsed = TEST_DATA;
      setUploadedFileName("Test_Bill.pdf");
    } else {
      const storedData = sessionStorage.getItem("extractedClaimData");
      const storedFileName = sessionStorage.getItem("uploadedFileName");

      console.log("Review: Loading data from sessionStorage");

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

    setExtractedData(parsed);

    // Track field confidences
    const confidences: FieldConfidence = {
      hospitalName: parsed.hospital_name.confidence,
      patientName: parsed.patient_name.confidence,
      billDate: parsed.bill_date.confidence,
      admissionDate: parsed.admission_date.confidence,
      dischargeDate: parsed.discharge_date?.confidence || 1,
      billNo: parsed.bill_no?.confidence || 1,
      netPayableAmount: parsed.net_payable_amount.confidence,
    };

    setFieldConfidences(confidences);

    // Track item confidences
    const itemConfs =
      parsed.line_items?.map((item) => ({
        description: item.description?.confidence || 1,
        quantity: item.quantity?.confidence || 1,
        unitPrice: item.unit_price?.confidence || 1,
        totalAmount: item.total_amount?.confidence || 1,
      })) || [];

    setItemConfidences(itemConfs);

    // Count issues
    let critical = 0;
    let warnings = 0;

    Object.values(confidences).forEach((conf) => {
      if (conf < 0.5) critical++;
      else if (conf < 0.9) warnings++;
    });

    itemConfs.forEach((item) => {
      Object.values(item).forEach((conf) => {
        if (conf < 0.5) critical++;
        else if (conf < 0.9) warnings++;
      });
    });

    setCriticalIssues(critical);
    setWarningIssues(warnings);

    // Pre-fill form with extracted data
    handlePolicyFieldChange("hospitalName", parsed.hospital_name.value);
    handlePolicyFieldChange("patientName", parsed.patient_name.value);
    handlePolicyFieldChange("billDate", parsed.bill_date.value);
    handlePolicyFieldChange("admissionDate", parsed.admission_date.value);

    if (parsed.bill_no?.value) {
      handlePolicyFieldChange("billNo", parsed.bill_no.value);
    }
    if (parsed.discharge_date?.value) {
      handlePolicyFieldChange("dischargeDate", parsed.discharge_date.value);
    }

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
      if(!policyInfo.billNo?.trim()) missingFields.push("Bill Number");
      if (!policyInfo.billDate) missingFields.push("Bill Date");
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

      const extractedDataPayload: ExtractedData = {
        hospital_name: policyInfo.hospitalName,
        patient_name: policyInfo.patientName,
        bill_no: policyInfo.billNo || null,
        bill_date: policyInfo.billDate,
        admission_date: policyInfo.admissionDate,
        discharge_date: policyInfo.dischargeDate || null,
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
      };

      const result: AdjudicatedClaim =
        await adjudicateClaimMutation.mutateAsync({
          extractedData: extractedDataPayload,
          insuranceDetails: {
            policy_number: policyInfo.policyNumber,
            insurance_provider: policyInfo.insuranceProvider,
          },
        });

      console.log("Review: Adjudication successful:", result);

      // Store adjudicated result in sessionStorage
      sessionStorage.setItem("adjudicatedClaimData", JSON.stringify(result));

      // Navigate to processed page
      router.push("/processed");
    } catch (err: any) {
      console.error("Review: Adjudication failed:", err);
      console.error("Review: Error response:", err?.response);
      console.error("Review: Error message:", err?.message);
      console.error("Review: Error code:", err?.code);

      let errorMessage = "Failed to process claim. Please try again.";

      if (err?.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout. The server is taking too long to respond. Please try again.";
      } else if (err?.code === "ERR_NETWORK") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ReviewHeader
        steps={PROGRESS_STEPS}
        userName={currentUser?.full_name || currentUser?.username || "User"}
        userEmail={currentUser?.email || "View profile"}
        isLoading={userLoading}
      />

      {/* Confidence Alert Banner */}
      {(criticalIssues > 0 || warningIssues > 0) && (
        <div className="mx-16 mt-4 space-y-3">
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
        <div className="mx-16 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
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

      <div className="flex">
        <PDFPreview
          fileName={uploadedFileName}
          policyInfo={policyInfo}
          itemizedCharges={itemizedCharges}
        />

        <div className="flex-1 p-16">
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
          />
        </div>
      </div>

      <BottomNavigation
        isSubmitting={isSubmitting}
        onReset={handleReset}
        onProcess={handleProcessNow}
      />
    </div>
  );
}
