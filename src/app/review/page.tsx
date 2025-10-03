'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReviewState } from '@/hooks/useReviewState';
import { PROGRESS_STEPS } from '@/constants/review';
import ReviewHeader from '@/components/review/ReviewHeader';
import PDFPreview from '@/components/review/PDFPreview';
import PolicyForm from '@/components/review/PolicyForm';
import ItemizedCharges from '@/components/review/ItemizedCharges';
import BottomNavigation from '@/components/review/BottomNavigation';
import { useAdjudicateClaim } from '@/hooks/use-claims';
import { useCurrentUser } from '@/hooks/use-auth';
import type { ExtractedDataWithConfidence, ExtractedData, AdjudicatedClaim } from '@/lib/api-types';

export default function ReviewPage() {
  const router = useRouter();
  const adjudicateClaimMutation = useAdjudicateClaim();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [extractedData, setExtractedData] = useState<ExtractedDataWithConfidence | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('Bill11.pdf');
  const [hasLowConfidence, setHasLowConfidence] = useState(false);
  
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
    setItemizedCharges
  } = useReviewState();

  // Load extracted data from sessionStorage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('extractedClaimData');
    const storedFileName = sessionStorage.getItem('uploadedFileName');
    
    console.log('Review: Loading data from sessionStorage');
    
    if (storedFileName) {
      setUploadedFileName(storedFileName);
      console.log('Review: Filename set to:', storedFileName);
    }
    
    if (storedData) {
      try {
        const parsed: ExtractedDataWithConfidence = JSON.parse(storedData);
        setExtractedData(parsed);
        
        console.log('Review: Extracted data loaded:', parsed);
        
        // Check for low confidence fields (< 0.7)
        let foundLowConfidence = false;
        const confidenceThreshold = 0.7;
        
        // Check main fields
        if (parsed.hospital_name.confidence < confidenceThreshold ||
            parsed.patient_name.confidence < confidenceThreshold ||
            parsed.bill_date.confidence < confidenceThreshold ||
            parsed.admission_date.confidence < confidenceThreshold ||
            (parsed.discharge_date && parsed.discharge_date.confidence < confidenceThreshold) ||
            (parsed.bill_no && parsed.bill_no.confidence < confidenceThreshold) ||
            parsed.net_payable_amount.confidence < confidenceThreshold) {
          foundLowConfidence = true;
        }
        
        // Check line items
        if (parsed.line_items) {
          for (const item of parsed.line_items) {
            if (item.description?.confidence < confidenceThreshold ||
                item.total_amount?.confidence < confidenceThreshold ||
                (item.quantity?.confidence !== undefined && item.quantity.confidence < confidenceThreshold) ||
                (item.unit_price?.confidence !== undefined && item.unit_price.confidence < confidenceThreshold)) {
              foundLowConfidence = true;
              break;
            }
          }
        }
        
        setHasLowConfidence(foundLowConfidence);
        console.log('Review: Low confidence detected:', foundLowConfidence);
        
        // Pre-fill form with extracted data
        handlePolicyFieldChange('hospitalName', parsed.hospital_name.value);
        handlePolicyFieldChange('patientName', parsed.patient_name.value);
        handlePolicyFieldChange('billDate', parsed.bill_date.value);
        handlePolicyFieldChange('admissionDate', parsed.admission_date.value);
        
        if (parsed.bill_no?.value) {
          handlePolicyFieldChange('billNo', parsed.bill_no.value);
        }
        if (parsed.discharge_date?.value) {
          handlePolicyFieldChange('dischargeDate', parsed.discharge_date.value);
        }

        // Convert line items to itemized charges format
        if (parsed.line_items && parsed.line_items.length > 0) {
          const charges = parsed.line_items.map((item, index) => {
            const totalAmount = item.total_amount?.value || 0;
            const quantity = item.quantity?.value || 1;
            const unitPrice = item.unit_price?.value || (quantity > 0 ? totalAmount / quantity : totalAmount);
            
            return {
              id: String(index + 1),
              costTitle: item.description?.value || 'Unknown Item',
              quantity: quantity,
              unitPrice: unitPrice,
            };
          });
          
          console.log('Review: Setting itemized charges:', charges);
          setItemizedCharges(charges);
        }
      } catch (err) {
        console.error('Review: Failed to parse extracted data:', err);
        setError('Failed to load extracted data. Please try uploading again.');
      }
    } else {
      console.warn('Review: No extracted data found in sessionStorage');
    }
  }, [handlePolicyFieldChange, setItemizedCharges]);

  const handleProcessNow = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare extracted data from current form state
      const extractedDataPayload: ExtractedData = {
        hospital_name: policyInfo.hospitalName,
        patient_name: policyInfo.patientName,
        bill_no: policyInfo.billNo || null,
        bill_date: policyInfo.billDate,
        admission_date: policyInfo.admissionDate,
        discharge_date: policyInfo.dischargeDate || null,
        net_payable_amount: itemizedCharges.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        line_items: itemizedCharges.map(item => ({
          description: item.costTitle,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_amount: item.quantity * item.unitPrice,
        })),
      };

      // Call adjudication API
      const result: AdjudicatedClaim = await adjudicateClaimMutation.mutateAsync({
        extractedData: extractedDataPayload,
        insuranceDetails: {
          policy_number: policyInfo.policyNumber,
          insurance_provider: policyInfo.insuranceProvider,
        },
      });

      // Store adjudicated result in sessionStorage
      sessionStorage.setItem('adjudicatedClaimData', JSON.stringify(result));
      
      // Navigate to processed page
      router.push('/processed');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to process claim. Please try again.');
      console.error('Adjudication failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ReviewHeader 
        steps={PROGRESS_STEPS}
        userName={currentUser?.full_name || currentUser?.username || 'User'}
        userEmail={currentUser?.email || 'View profile'}
        isLoading={userLoading}
      />

      {/* Low Confidence Warning */}
      {hasLowConfidence && (
        <div className="mx-16 mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" fill="#F59E0B"/>
            <path d="M10 6V10M10 14H10.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-yellow-800">Issue Found</p>
            <p className="text-xs text-yellow-700">Some extracted data has low confidence. Please review and correct the fields if needed.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-16 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
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
          />

          <ItemizedCharges
            charges={itemizedCharges}
            onUpdateCharge={updateCharge}
            onUpdateQuantity={updateQuantity}
            onRemoveCharge={removeItem}
            onAddCharge={addNewItem}
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
