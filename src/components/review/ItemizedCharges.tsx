import React from 'react';
import { ItemizedCharge } from '@/types/review';
import { PlusIcon, TrashIcon } from '@/components/icons/Icons';
import FormInput from '@/components/ui/FormInput';

interface ItemizedChargesProps {
  charges: ItemizedCharge[];
  onUpdateCharge: (id: string, field: keyof ItemizedCharge, value: string | number) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveCharge: (id: string) => void;
  onAddCharge: () => void;
}

export default function ItemizedCharges({
  charges,
  onUpdateCharge,
  onUpdateQuantity,
  onRemoveCharge,
  onAddCharge
}: ItemizedChargesProps) {
  const getTotalAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const getGrandTotal = () => {
    return charges.reduce((total, charge) => 
      total + getTotalAmount(charge.quantity, charge.unitPrice), 0
    );
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium text-[#1D2433]">Itemised Charges</h2>
        {/* Success Badge - No Issues */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#EDFDF8] rounded-full">
          <div className="w-6 h-6 bg-[#08875D] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">0</span>
          </div>
          <span className="text-[#08875D] text-xs font-medium">Issues found</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {charges.map((charge) => (
          <div key={charge.id} className="flex gap-4 items-center group">
            {/* Cost Title */}
            <div className="w-[212px]">
              <FormInput
                label="Cost Title"
                value={charge.costTitle}
                onChange={(value) => onUpdateCharge(charge.id, 'costTitle', value)}
              />
            </div>
            
            {/* Quantity */}
            <div className="w-[194px] h-16 border border-[#D8DDE7] rounded-lg px-5 py-2">
              <div className="text-sm font-medium text-[rgba(29,36,51,0.8)] mb-1">Quantity</div>
              <div className="flex items-center gap-2">
                <button 
                  className="w-4 h-4 border border-[rgba(29,36,51,0.24)] rounded-full flex items-center justify-center hover:bg-gray-50"
                  onClick={() => onUpdateQuantity(charge.id, -1)}
                >
                  <span className="text-sm font-medium text-[#1D2433]">-</span>
                </button>
                <span className="text-sm font-medium text-[#1D2433] min-w-[20px] text-center">
                  {charge.quantity}
                </span>
                <button 
                  className="w-4 h-4 border border-[rgba(29,36,51,0.24)] rounded-full flex items-center justify-center hover:bg-gray-50"
                  onClick={() => onUpdateQuantity(charge.id, 1)}
                >
                  <span className="text-sm font-medium text-[#1D2433]">+</span>
                </button>
              </div>
            </div>
            
            {/* Unit Price */}
            <div className="w-[212px]">
              <FormInput
                label="Unit Price"
                type="number"
                value={charge.unitPrice}
                onChange={(value) => onUpdateCharge(charge.id, 'unitPrice', parseInt(value) || 0)}
              />
            </div>
            
            {/* Total Amount */}
            <div className="w-[175px] h-14 border border-[#D8DDE7] rounded-lg px-5 py-2.5">
              <div className="text-[11px] font-medium text-[rgba(29,36,51,0.65)] mb-1">Total Amount</div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">₹</span>
                <span className="text-sm font-medium text-[#1D2433]">
                  {getTotalAmount(charge.quantity, charge.unitPrice).toLocaleString()}.00
                </span>
              </div>
            </div>

            {/* Delete Button */}
            <button 
              onClick={() => onRemoveCharge(charge.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded"
              title="Remove item"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      
      {/* Add item button */}
      <button 
        className="flex items-center gap-1 mt-4 text-[#2F5FED] hover:text-[#2854D6] transition-colors"
        onClick={onAddCharge}
      >
        <PlusIcon className="w-8 h-8" />
        <span className="text-base font-medium">Add item</span>
      </button>

      {/* Grand Total */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-[#1D2433]">Grand Total:</span>
          <span className="text-2xl font-bold text-[#2F5FED]">₹{getGrandTotal().toLocaleString()}.00</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {charges.length} items • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
