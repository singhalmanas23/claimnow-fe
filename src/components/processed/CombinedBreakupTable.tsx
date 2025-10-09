import React from 'react';

interface CombinedBreakupItem {
  id: string;
  serialNo: string;
  costTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  allowedAmount: number;
  disallowedAmount: number;
  claimStatus: number;
  status: string;
  reason: string;
}

interface CombinedBreakupTableProps {
  data: CombinedBreakupItem[];
}

export default function CombinedBreakupTable({ data }: CombinedBreakupTableProps) {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full border border-[#D8DDE7] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8F9FB]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                S.No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider min-w-[200px]">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                Allowed
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                Disallowed
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
                Claim %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider min-w-[250px]">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#D8DDE7]">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgba(29,36,51,0.8)] font-medium">
                  {item.serialNo}
                </td>
                <td className="px-4 py-4 text-sm text-[rgba(29,36,51,0.8)]">
                  {item.costTitle}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-[rgba(29,36,51,0.8)]">
                  {item.quantity}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-[rgba(29,36,51,0.8)]">
                  ₹{formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-[rgba(29,36,51,0.8)]">
                  ₹{formatCurrency(item.totalAmount)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-[#08875D]">
                  ₹{formatCurrency(item.allowedAmount)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-[#E02D3C]">
                  {item.disallowedAmount > 0 ? `₹${formatCurrency(item.disallowedAmount)}` : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium text-[#08875D]">
                      {item.claimStatus}%
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#08875D] rounded-full transition-all"
                        style={{ width: `${item.claimStatus}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[rgba(29,36,51,0.65)]">
                  {item.reason || 'Fully allowed'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-[#F8F9FB] border-t-2 border-[#D8DDE7]">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-[rgba(29,36,51,0.8)]">
                Total:
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-[rgba(29,36,51,0.8)]">
                ₹{formatCurrency(data.reduce((sum, item) => sum + item.totalAmount, 0))}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-[#08875D]">
                ₹{formatCurrency(data.reduce((sum, item) => sum + item.allowedAmount, 0))}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-[#E02D3C]">
                ₹{formatCurrency(data.reduce((sum, item) => sum + item.disallowedAmount, 0))}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-center">
                <span className="text-sm font-bold text-[#08875D]">
                  {Math.round((data.reduce((sum, item) => sum + item.allowedAmount, 0) / data.reduce((sum, item) => sum + item.totalAmount, 0)) * 100)}%
                </span>
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}