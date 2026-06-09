import React from 'react';

interface ClaimedTableProps {
  data: Array<{
    id: string;
    serialNo: string;
    costTitle: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    claimStatus: number;
    reason: string;
  }>;
}

export default function ClaimedTable({ data }: ClaimedTableProps) {
  const totalQuantity = data.length;
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const averageClaimStatus = Math.round(data.reduce((sum, item) => sum + item.claimStatus, 0) / data.length);

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex border-l border-r border-t border-[#D8DDE7]">
        <div className="w-[70px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">S No</span>
        </div>
        <div className="w-[164px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Cost Title</span>
        </div>
        <div className="w-[140px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Quantity</span>
        </div>
        <div className="w-[156px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Total Amount</span>
        </div>
        <div className="w-[170px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Claim Status</span>
        </div>
        <div className="flex-1 h-10 bg-[#F8F9FC] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Reason</span>
        </div>
      </div>

      {/* Table Rows */}
      {data.map((item) => (
        <div key={item.id} className="flex border-l border-r border-t border-[#D8DDE7]">
          <div className="w-[70px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <span className="text-sm font-medium text-[rgba(29,36,51,0.65)]">{item.serialNo}</span>
          </div>
          <div className="w-[164px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <span className="text-sm font-medium text-[#1D2433]">{item.costTitle}</span>
          </div>
          <div className="w-[140px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#1D2433]">{item.quantity}X</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-normal text-[#1D2433]">₹</span>
                <span className="text-sm font-medium text-[#1D2433]">{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          <div className="w-[156px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <div className="flex items-center gap-1">
              <span className="text-sm font-normal text-[#1D2433]">₹</span>
              <span className="text-sm font-medium text-[#1D2433]">{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="w-[170px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <span className="text-sm font-medium text-[#08875D]">{item.claimStatus}%</span>
          </div>
          <div className="flex-1 min-h-10 bg-white flex items-center px-4 py-2">
            <span className="text-sm font-medium text-[rgba(29,36,51,0.8)] leading-relaxed w-[562px]">
              {item.reason}
            </span>
          </div>
        </div>
      ))}

      {/* Total Row */}
      <div className="flex border-l border-r border-t border-b border-[#D8DDE7]">
        <div className="w-[70px] h-10 bg-[#EDFDF8] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-semibold text-[#1D2433]">Total</span>
        </div>
        <div className="w-[164px] h-10 bg-[#EDFDF8] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-semibold text-[#1D2433]">{totalQuantity}</span>
        </div>
        <div className="w-[296px] h-10 bg-[#EDFDF8] border-r border-[#D8DDE7] flex items-center px-4">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#1D2433]">₹</span>
            <span className="text-sm font-semibold text-[#1D2433]">{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="flex-1 h-10 bg-[#EDFDF8] flex items-center px-4">
          <span className="text-sm font-semibold text-[#08875D]">{averageClaimStatus}%</span>
        </div>
      </div>
    </div>
  );
}
