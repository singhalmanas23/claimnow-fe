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
import type { ExtractedDataWithConfidence, ExtractedData, AdjudicatedClaim } from '@/lib/api-types';

export default function ReviewPage() {
  const router = useRouter();
  const adjudicateClaimMutation = useAdjudicateClaim();
  const [extractedData, setExtractedData] = useState<ExtractedDataWithConfidence | null>(null);
  const [error, setError] = useState<string>('');
  
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
    setIsSubmitting
  } = useReviewState();

  // Load extracted data from sessionStorage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('extractedClaimData');
    if (storedData) {
      try {
        const parsed: ExtractedDataWithConfidence = JSON.parse(storedData);
        setExtractedData(parsed);
        
        // Optionally pre-fill form with extracted data
        handlePolicyFieldChange('hospitalName', parsed.hospital_name.value);
        handlePolicyFieldChange('patientName', parsed.patient_name.value);
        handlePolicyFieldChange('billDate', parsed.bill_date.value);
        handlePolicyFieldChange('admissionDate', parsed.admission_date.value);
        if (parsed.discharge_date?.value) {
          handlePolicyFieldChange('dischargeDate', parsed.discharge_date.value);
        }
      } catch (err) {
        console.error('Failed to parse extracted data:', err);
      }
    }
  }, []);

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
      <ReviewHeader steps={PROGRESS_STEPS} />

      {/* Error Message */}
      {error && (
        <div className="mx-16 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex">
        <PDFPreview 
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
