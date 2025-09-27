'use client';

import React from 'react';
import { useReviewState } from '@/hooks/useReviewState';
import { PROGRESS_STEPS } from '@/constants/review';
import ReviewHeader from '@/components/review/ReviewHeader';
import PDFPreview from '@/components/review/PDFPreview';
import PolicyForm from '@/components/review/PolicyForm';
import ItemizedCharges from '@/components/review/ItemizedCharges';
import BottomNavigation from '@/components/review/BottomNavigation';

export default function ReviewPage() {
  const {
    policyInfo,
    itemizedCharges,
    isSubmitting,
    handlePolicyFieldChange,
    updateQuantity,
    updateCharge,
    addNewItem,
    removeItem,
    handleProcessNow,
    handleReset
  } = useReviewState();

  return (
    <div className="min-h-screen bg-white">
      <ReviewHeader steps={PROGRESS_STEPS} />

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
