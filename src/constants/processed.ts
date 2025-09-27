// Static data for the processed screen
export const PROCESSED_CLAIM_DATA = {
  fileName: 'Bill11.pdf',
  totalRequested: 15003.00,
  claimedAmount: 12453.00,
  claimPercentage: 89,
  unclaimedAmount: 1547.00,
  
  unclaimedBreakdown: [
    {
      id: '1',
      serialNo: '01',
      amount: 547.00,
      reason: 'The items MEDICAL EQUIPMENT not allowed because they are categorised as Non-Payable by IRDAI'
    },
    {
      id: '2',
      serialNo: '02',
      amount: 500.00,
      reason: 'The amount deducted due to insurance policy rules'
    },
    {
      id: '3',
      serialNo: '03',
      amount: 500.00,
      reason: 'Applied 10% co-payment on allowed amount'
    }
  ],

  claimedBreakdown: [
    {
      id: '1',
      serialNo: '01',
      costTitle: 'Consumables',
      quantity: 1,
      unitPrice: 2118.00,
      totalAmount: 2118.00,
      claimStatus: 100,
      reason: 'None'
    },
    {
      id: '2',
      serialNo: '02',
      costTitle: 'Room Rent',
      quantity: 1,
      unitPrice: 4000.00,
      totalAmount: 4000.00,
      claimStatus: 100,
      reason: 'Claimed amount is within the policy limit of 1% of Sum Insured (10000.0) or the maximum'
    },
    {
      id: '3',
      serialNo: '03',
      costTitle: 'Pharmacy',
      quantity: 1,
      unitPrice: 2765.54,
      totalAmount: 2860.00,
      claimStatus: 100,
      reason: 'Allowed as per policy: Total pharmacy and medicine costs are capped'
    },
    {
      id: '4',
      serialNo: '04',
      costTitle: 'Investigations',
      quantity: 1,
      unitPrice: 1000.00,
      totalAmount: 1000.00,
      claimStatus: 0,
      reason: 'Allowed as per policy: Total pharmacy and medicine costs are capped'
    }
  ]
};
