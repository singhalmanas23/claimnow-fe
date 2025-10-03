import { useState } from 'react';
import { PolicyInfo, ItemizedCharge, ReviewState } from '@/types/review';
import { STATIC_POLICY_DATA, STATIC_ITEMIZED_CHARGES } from '@/constants/review';

export function useReviewState(): ReviewState & {
  handlePolicyFieldChange: (field: keyof PolicyInfo, value: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateCharge: (id: string, field: keyof ItemizedCharge, value: string | number) => void;
  addNewItem: () => void;
  removeItem: (id: string) => void;
  getTotalAmount: (quantity: number, unitPrice: number) => number;
  getGrandTotal: () => number;
  handleProcessNow: () => Promise<void>;
  handleReset: () => void;
  setIsSubmitting: (submitting: boolean) => void;
  setItemizedCharges: (charges: ItemizedCharge[]) => void;
} {
  const [policyInfo, setPolicyInfo] = useState<PolicyInfo>(STATIC_POLICY_DATA);
  const [itemizedCharges, setItemizedCharges] = useState<ItemizedCharge[]>(STATIC_ITEMIZED_CHARGES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePolicyFieldChange = (field: keyof PolicyInfo, value: string) => {
    setPolicyInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItemizedCharges(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const updateCharge = (id: string, field: keyof ItemizedCharge, value: string | number) => {
    setItemizedCharges(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, [field]: field === 'unitPrice' ? Math.max(0, Number(value)) : value }
          : item
      )
    );
  };

  const addNewItem = () => {
    const newItem: ItemizedCharge = {
      id: `new_${Date.now()}`,
      costTitle: 'New Item',
      quantity: 1,
      unitPrice: 1000
    };
    setItemizedCharges(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItemizedCharges(prev => prev.filter(item => item.id !== id));
  };

  const getTotalAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const getGrandTotal = () => {
    return itemizedCharges.reduce((total, charge) => 
      total + getTotalAmount(charge.quantity, charge.unitPrice), 0
    );
  };

  const handleProcessNow = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      const payload = {
        policyInfo,
        itemizedCharges,
        grandTotal: getGrandTotal(),
        timestamp: new Date().toISOString()
      };
      
      console.log('Processing claim with data:', payload);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Claim processed successfully!');
    } catch (error) {
      console.error('Error processing claim:', error);
      alert('Error processing claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setPolicyInfo(STATIC_POLICY_DATA);
      setItemizedCharges(STATIC_ITEMIZED_CHARGES);
    }
  };

  return {
    policyInfo,
    itemizedCharges,
    isSubmitting,
    handlePolicyFieldChange,
    updateQuantity,
    updateCharge,
    addNewItem,
    removeItem,
    getTotalAmount,
    getGrandTotal,
    handleProcessNow,
    handleReset,
    setIsSubmitting,
    setItemizedCharges
  };
}
