import React from 'react';

interface UnclaimedTableProps {
  data: Array<{
    id: string;
    serialNo: string;
    amount: number;
    reason: string;
  }>;
}

export default function UnclaimedTable({ data }: UnclaimedTableProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex border-l border-r border-t border-[#D8DDE7]">
        <div className="w-[155px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">S No</span>
        </div>
        <div className="w-[216px] h-10 bg-[#F8F9FC] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Amount</span>
        </div>
        <div className="flex-1 h-10 bg-[#F8F9FC] flex items-center px-4">
          <span className="text-sm font-medium text-[rgba(29,36,51,0.8)]">Reason</span>
        </div>
      </div>

      {/* Table Rows */}
      {data.map((item, index) => (
        <div key={item.id} className="flex border-l border-r border-t border-[#D8DDE7]">
          <div className="w-[155px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <span className="text-sm font-medium text-[rgba(29,36,51,0.65)]">{item.serialNo}</span>
          </div>
          <div className="w-[216px] min-h-10 bg-white border-r border-[#D8DDE7] flex items-center px-4">
            <div className="flex items-center gap-1">
              <span className="text-sm font-normal text-[#E02D3C]">-₹</span>
              <span className="text-sm font-medium text-[#E02D3C]">{item.amount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex-1 min-h-10 bg-white flex items-center px-4 py-2">
            <span className="text-sm font-medium text-[#1D2433] leading-relaxed">{item.reason}</span>
          </div>
        </div>
      ))}

      {/* Total Row */}
      <div className="flex border-l border-r border-t border-b border-[#D8DDE7]">
        <div className="w-[155px] h-10 bg-[#FEF1F2] border-r border-[#D8DDE7] flex items-center px-4">
          <span className="text-sm font-medium text-[#1D2433]">Total</span>
        </div>
        <div className="flex-1 h-10 bg-[#FEF1F2] flex items-center px-4">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-[#E02D3C]">-₹</span>
            <span className="text-sm font-semibold text-[#E02D3C]">{total.toLocaleString()}.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
