import React from 'react';

interface UnclaimedItem {
  id: string;
  serialNo: string;
  amount?: number;
  reason: string;
}

interface UnclaimedTableProps {
  data: UnclaimedItem[];
}

export default function UnclaimedTable({ data }: UnclaimedTableProps) {
  return (
    <div className="w-full border border-[#D8DDE7] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#F8F9FB]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider w-20">
              S.No
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[rgba(29,36,51,0.65)] uppercase tracking-wider">
              Adjustment Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#D8DDE7]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-4 py-8 text-center text-sm text-[rgba(29,36,51,0.65)]">
                No adjustments or deductions applied
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgba(29,36,51,0.8)] font-medium">
                  {item.serialNo}
                </td>
                <td className="px-4 py-4 text-sm text-[rgba(29,36,51,0.8)]">
                  {item.reason}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
