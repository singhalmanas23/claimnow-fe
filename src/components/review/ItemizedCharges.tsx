import React from 'react';
import { ItemizedCharge } from '@/types/review';
import { PlusIcon, TrashIcon, CheckIcon } from '@/components/icons/Icons';
import FormInput from '@/components/ui/FormInput';

interface ItemizedChargesProps {
  charges: ItemizedCharge[];
  onUpdateCharge: (id: string, field: keyof ItemizedCharge, value: string | number) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveCharge: (id: string) => void;
  onAddCharge: () => void;
  /** Keyed by charge id so a confidence stays bound to its row after deletes. */
  itemConfidences?: Record<string, { [key: string]: number }>;
  /**
   * Optional header-field confidences (hospital_name, patient_name, bill_no,
   * dates, policy_no, insurance_provider, net_payable_amount).
   * When provided, the "Issues found" badge counts BOTH header + line-item
   * fields below the same threshold the backend uses for auto-adjudication
   * (0.9). This keeps the UI aligned with WHY a claim landed in needs_review.
   */
  headerConfidences?: { [key: string]: number };
}

const getConfidenceBorderClass = (confidence?: number): string => {
  if (!confidence) return 'border-[#D8DDE7]';
  if (confidence < 0.5) return 'border-2 border-red-500';
  if (confidence < 0.9) return 'border-2 border-amber-500';
  return 'border-[#D8DDE7]';
};

const ConfidenceBadge = ({ confidence }: { confidence?: number }) => {
  if (!confidence || confidence >= 0.9) return null;
  
  const isCritical = confidence < 0.5;
  const percentage = Math.round(confidence * 100);
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
      isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
    }`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 11C8.76142 11 11 8.76142 11 6C11 3.23858 8.76142 1 6 1C3.23858 1 1 3.23858 1 6C1 8.76142 3.23858 11 6 11Z" 
          fill={isCritical ? '#EF4444' : '#F59E0B'} fillOpacity="0.2"/>
        <path d="M6 3.5V6.5M6 8.5H6.005" 
          stroke={isCritical ? '#DC2626' : '#D97706'} 
          strokeWidth="1.5" 
          strokeLinecap="round"/>
      </svg>
    </div>
  );
};

// Same threshold as the backend's AUTO_ADJUDICATE_THRESHOLD env var (default 0.9).
// Field confidences below this trip the claim into needs_review.
const ISSUE_CONFIDENCE_THRESHOLD = 0.9;

export default function ItemizedCharges({
  charges,
  onUpdateCharge,
  onUpdateQuantity,
  onRemoveCharge,
  onAddCharge,
  itemConfidences,
  headerConfidences
}: ItemizedChargesProps) {
  const getTotalAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const getGrandTotal = () => {
    return charges.reduce((total, charge) => 
      total + getTotalAmount(charge.quantity, charge.unitPrice), 0
    );
  };

  // Count fields whose confidence is below the backend's auto-adjudicate
  // threshold (header fields + line-item fields combined). Matches the
  // logic that decides auto-process vs needs_review, so "0 Issues found"
  // genuinely means "this would have auto-processed."
  const getTotalIssues = () => {
    let issues = 0;
    if (itemConfidences) {
      // Iterate the live charges so confidences of deleted rows are excluded.
      charges.forEach((charge) => {
        const item = itemConfidences[charge.id];
        if (!item) return;
        Object.values(item).forEach((conf) => {
          if (typeof conf === "number" && conf < ISSUE_CONFIDENCE_THRESHOLD) issues++;
        });
      });
    }
    if (headerConfidences) {
      Object.values(headerConfidences).forEach((conf) => {
        if (typeof conf === "number" && conf < ISSUE_CONFIDENCE_THRESHOLD) issues++;
      });
    }
    return issues;
  };

  const totalIssues = getTotalIssues();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium text-[#1D2433]">Itemised Charges</h2>
        {/* Issue Badge */}
        {totalIssues > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full">
            <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{totalIssues}</span>
            </div>
            <span className="text-amber-700 text-xs font-medium">
              {totalIssues === 1 ? 'Issue' : 'Issues'} found
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#EDFDF8] rounded-full">
            <div className="w-6 h-6 bg-[#08875D] rounded-full flex items-center justify-center">
              <CheckIcon className="w-3.5 h-2.5" />
            </div>
            <span className="text-[#08875D] text-xs font-medium">No issues found</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {charges.map((charge) => {
          const itemConf = itemConfidences?.[charge.id];
          
          return (
            <div key={charge.id} className="flex gap-4 items-end group">
              {/* Cost Title */}
              <div className="w-[212px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Cost Title</div>
                  <ConfidenceBadge confidence={itemConf?.description} />
                </div>
                <input
                  type="text"
                  value={charge.costTitle}
                  onChange={(e) => onUpdateCharge(charge.id, 'costTitle', e.target.value)}
                  className={`w-full h-16 px-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                    getConfidenceBorderClass(itemConf?.description)
                  }`}
                  placeholder="Enter cost title"
                />
              </div>
              
              {/* Quantity */}
              <div className="w-[194px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Quantity</div>
                  <ConfidenceBadge confidence={itemConf?.quantity} />
                </div>
                <div className={`h-16 border rounded-lg px-5 py-2 flex flex-col justify-center ${
                  getConfidenceBorderClass(itemConf?.quantity)
                }`}>
                  <div className="flex items-center gap-2 justify-center">
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
              </div>
              
              {/* Unit Price */}
              <div className="w-[212px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Unit Price</div>
                  <ConfidenceBadge confidence={itemConf?.unitPrice} />
                </div>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-medium text-[rgba(29,36,51,0.8)]">₹</span>
                  <input
                    type="number"
                    value={charge.unitPrice}
                    onChange={(e) => onUpdateCharge(charge.id, 'unitPrice', parseInt(e.target.value) || 0)}
                    className={`w-full h-16 pl-8 pr-5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium text-[#1D2433] ${
                      getConfidenceBorderClass(itemConf?.unitPrice)
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Total Amount */}
              <div className="w-[175px]">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Total Amount</div>
                  <ConfidenceBadge confidence={itemConf?.totalAmount} />
                </div>
                <div className={`h-16 border rounded-lg px-5 py-2.5 flex flex-col justify-center ${
                  getConfidenceBorderClass(itemConf?.totalAmount)
                }`}>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">₹</span>
                    <span className="text-sm font-medium text-[#1D2433]">
                      {getTotalAmount(charge.quantity, charge.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                onClick={() => onRemoveCharge(charge.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded h-16 flex items-center"
                title="Remove item"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}
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
          <span className="text-2xl font-bold text-[#2F5FED]">₹{getGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {charges.length} items • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
