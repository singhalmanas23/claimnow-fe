# Adjudication Workflow Implementation - Complete

## Overview

The adjudication workflow has been successfully implemented with async polling. When users click "Process Now" on the review page, the system now:

1. ✅ Submits corrected data to `/api/v1/claims/adjudicate`
2. ✅ Receives `claim_id` with status `"adjudicating"`
3. ✅ Polls `/api/v1/claims/status/{claim_id}` every 2 seconds
4. ✅ When status becomes `"extracted"` (completed), fetches adjudicated data
5. ✅ Retrieves final results from `/api/v1/claims/adjudicated/{claim_id}`
6. ✅ Navigates to processed page with adjudicated data

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UPLOAD PAGE                                   │
│  1. User uploads PDF                                                 │
│  2. POST /api/v1/claims/extract → {claim_id, status: "queued"}     │
│  3. Poll /status/{claim_id} every 2s                                │
│  4. GET /extracted/{claim_id} when status = "extracted"             │
│  5. Store: extractedClaimData, uploadedFileName, currentClaimId     │
│  6. Navigate to /review                                              │
└─────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        REVIEW PAGE                                   │
│  1. Load claim_id from sessionStorage                                │
│  2. User corrects/verifies extracted data                           │
│  3. User fills policy number & insurance provider                   │
│  4. Click "Process Now"                                              │
└─────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ADJUDICATION WORKFLOW                             │
│  1. POST /api/v1/claims/adjudicate                                  │
│     Body: { claim_id, extracted_data }                              │
│     Response: { claim_id, status: "adjudicating" }                  │
│                                                                      │
│  2. Start polling /status/{claim_id} every 2 seconds                │
│     - useClaimStatus hook with isAdjudicating=true                  │
│     - Auto-stops when status !== "adjudicating"                     │
│                                                                      │
│  3. Status changes to "extracted" (adjudication complete)           │
│     - Stop polling (setIsAdjudicating(false))                       │
│                                                                      │
│  4. GET /api/v1/claims/adjudicated/{claim_id}                       │
│     - useAdjudicatedData hook fetches final results                 │
│     - Returns AdjudicatedClaim with:                                │
│       * adjudicated_line_items (status, allowed_amount, reason)     │
│       * total_claimed_amount                                        │
│       * total_amount_reimbursed                                     │
│       * adjustments_log                                             │
│       * sanity_check_result                                         │
│                                                                      │
│  5. Store adjudicated data in sessionStorage                        │
│  6. Navigate to /processed                                          │
└─────────────────────────────────────────────────────────────────────┘
                                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     PROCESSED PAGE                                   │
│  Display adjudication results with breakdowns                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Review Page State Management

```typescript
// State for adjudication polling
const [claimId, setClaimId] = useState<string | null>(null);
const [isAdjudicating, setIsAdjudicating] = useState(false);

// Poll adjudication status
const { data: adjudicationStatus } = useClaimStatus(claimId, isAdjudicating);

// Fetch adjudicated data when complete
const shouldFetchAdjudicated = adjudicationStatus?.status === 'extracted' && !isAdjudicating;
const { data: adjudicatedData } = useAdjudicatedData(claimId, shouldFetchAdjudicated);
```

### 2. Load Claim ID from Upload

```typescript
useEffect(() => {
  const storedClaimId = sessionStorage.getItem("currentClaimId");
  if (storedClaimId) {
    setClaimId(storedClaimId);
    console.log("Review: Claim ID set to:", storedClaimId);
  }
  // ... load other data
}, []);
```

### 3. Monitor Adjudication Status

```typescript
useEffect(() => {
  if (adjudicationStatus && isAdjudicating) {
    console.log('Review: Adjudication status update:', adjudicationStatus.status);
    
    if (adjudicationStatus.status === 'extracted') {
      // Adjudication completed
      setIsAdjudicating(false);
      console.log('Review: ✓ Adjudication completed, stopping poll');
    } else if (adjudicationStatus.status === 'failed') {
      // Adjudication failed
      setIsAdjudicating(false);
      setError(adjudicationStatus.last_error || 'Adjudication failed.');
      setIsSubmitting(false);
    }
  }
}, [adjudicationStatus, isAdjudicating]);
```

### 4. Handle Adjudicated Data

```typescript
useEffect(() => {
  if (adjudicatedData) {
    console.log('Review: Adjudicated data received:', adjudicatedData);
    
    // Store in sessionStorage for processed page
    sessionStorage.setItem("adjudicatedClaimData", JSON.stringify(adjudicatedData));
    
    // Navigate to processed page
    router.push("/processed");
  }
}, [adjudicatedData, router]);
```

### 5. Submit for Adjudication

```typescript
const handleProcessNow = async () => {
  setIsSubmitting(true);
  setError("");

  try {
    // Validate required fields
    if (!claimId) {
      setError("No claim ID found. Please upload a document first.");
      setIsSubmitting(false);
      return;
    }

    // Prepare extracted data payload
    const extractedDataPayload: ExtractedData = {
      hospital_name: policyInfo.hospitalName,
      patient_name: policyInfo.patientName,
      admission_date: policyInfo.admissionDate,
      discharge_date: policyInfo.dischargeDate || null,
      net_payable_amount: itemizedCharges.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
      line_items: itemizedCharges.map((item) => ({
        description: item.costTitle,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_amount: item.quantity * item.unitPrice,
      })),
    };

    console.log("Review: Submitting adjudication for claim:", claimId);

    // Submit for adjudication (async workflow)
    const result = await adjudicateClaimMutation.mutateAsync({
      claim_id: claimId,
      extracted_data: extractedDataPayload,
    });

    console.log("Review: Adjudication submitted:", result);

    // Start polling for status
    setIsAdjudicating(true);
    
    // The useEffect hooks will handle:
    // 1. Polling status until completed
    // 2. Fetching adjudicated data
    // 3. Storing in sessionStorage
    // 4. Navigating to /processed
  } catch (err) {
    // Handle errors
    setError(errorMessage);
    setIsSubmitting(false);
  }
};
```

## API Integration

### Hooks Used

#### `useAdjudicateClaim()`
```typescript
// Submit claim for adjudication
const adjudicateClaimMutation = useAdjudicateClaim();

// Usage
const result = await adjudicateClaimMutation.mutateAsync({
  claim_id: "claim_123",
  extracted_data: { /* ... */ }
});
// Returns: { claim_id, status: "adjudicating" }
```

#### `useClaimStatus(claimId, enabled)`
```typescript
// Poll for status updates
const { data: statusData } = useClaimStatus(claimId, isAdjudicating);

// Auto-polling configuration:
refetchInterval: (query) => {
  if (!enabled) return false;
  const data = query.state.data;
  if (data?.status === 'completed' || data?.status === 'failed') {
    return false; // Stop polling
  }
  return 2000; // Poll every 2 seconds
}
```

#### `useAdjudicatedData(claimId, enabled)`
```typescript
// Fetch final adjudicated results
const { data: adjudicatedData } = useAdjudicatedData(
  claimId, 
  statusData?.status === 'extracted'
);
```

## Service Layer

### `claimsService.adjudicateClaim()`
```typescript
async adjudicateClaim(request: AdjudicateClaimRequest): Promise<ClaimIntakeResponse> {
  const response = await apiClient.post<ClaimIntakeResponse>(
    `${API_PREFIX}/adjudicate`,
    request,
    { timeout: 180000 }
  );
  return response.data;
}
```

### `claimsService.getClaimStatus()`
```typescript
async getClaimStatus(claimId: string): Promise<ClaimStatusResponse> {
  const response = await apiClient.get<ClaimStatusResponse>(
    `${API_PREFIX}/status/${claimId}`
  );
  return response.data;
}
```

### `claimsService.getAdjudicatedData()`
```typescript
async getAdjudicatedData(claimId: string): Promise<AdjudicatedClaim> {
  const response = await apiClient.get<AdjudicatedClaim>(
    `${API_PREFIX}/adjudicated/${claimId}`
  );
  return response.data;
}
```

## Type Definitions

### Request Types

```typescript
interface AdjudicateClaimRequest {
  claim_id: string;
  extracted_data: ExtractedData;
}

interface ExtractedData {
  hospital_name: string;
  patient_name: string;
  admission_date: string;
  discharge_date?: string | null;
  line_items: LineItem[];
  net_payable_amount: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}
```

### Response Types

```typescript
interface ClaimIntakeResponse {
  claim_id: string;
  status: string; // "adjudicating" after submission
}

interface ClaimStatusResponse {
  claim_id: string;
  status: 'queued' | 'processing' | 'extracted' | 'failed' | 'adjudicating';
  last_error?: string | null;
}

interface AdjudicatedClaim {
  hospital_name: string;
  patient_name: string;
  bill_no?: string | null;
  bill_date: string;
  admission_date: string;
  discharge_date?: string | null;
  adjudicated_line_items: AdjudicatedLineItem[];
  total_claimed_amount: number;
  total_amount_reimbursed: number;
  adjustments_log: string[];
  sanity_check_result?: SanityCheckResult | null;
}

interface AdjudicatedLineItem extends LineItem {
  status: string; // "approved", "partially_approved", "rejected"
  allowed_amount: number;
  disallowed_amount: number;
  reason?: string | null;
}
```

## SessionStorage Data Flow

### Upload Page → Review Page
```typescript
// Upload page stores:
sessionStorage.setItem('extractedClaimData', JSON.stringify(extractedData));
sessionStorage.setItem('uploadedFileName', fileName);
sessionStorage.setItem('currentClaimId', claimId);
sessionStorage.setItem('currentPdfId', pdfId);

// Review page loads:
const storedData = sessionStorage.getItem('extractedClaimData');
const storedFileName = sessionStorage.getItem('uploadedFileName');
const storedClaimId = sessionStorage.getItem('currentClaimId');
```

### Review Page → Processed Page
```typescript
// Review page stores:
sessionStorage.setItem('adjudicatedClaimData', JSON.stringify(adjudicatedData));

// Processed page loads:
const storedData = sessionStorage.getItem('adjudicatedClaimData');
```

## UI States During Adjudication

### 1. Submitting
```typescript
isSubmitting = true
// Button shows: "Processing..." with spinner
// Form is disabled
```

### 2. Adjudicating (Polling)
```typescript
isAdjudicating = true
adjudicationStatus.status = "adjudicating"
// UI can show: "Adjudicating claim..." with progress indicator
```

### 3. Completed
```typescript
isAdjudicating = false
adjudicationStatus.status = "extracted"
adjudicatedData = { /* results */ }
// Automatically navigates to /processed
```

### 4. Failed
```typescript
isAdjudicating = false
adjudicationStatus.status = "failed"
error = adjudicationStatus.last_error
// Shows error message to user
```

## Error Handling

### Validation Errors
```typescript
// Check required fields
if (!claimId) {
  setError("No claim ID found. Please upload a document first.");
  return;
}

if (!policyInfo.policyNumber) {
  setError("Please fill in Policy Number");
  return;
}
```

### Network Errors
```typescript
catch (err: unknown) {
  let errorMessage = "Failed to process claim. Please try again.";
  
  if (error?.code === "ECONNABORTED") {
    errorMessage = "Request timeout. Please try again.";
  } else if (error?.code === "ERR_NETWORK") {
    errorMessage = "Network error. Please check your connection.";
  } else if (error?.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  }
  
  setError(errorMessage);
}
```

### Backend Errors
```typescript
if (adjudicationStatus.status === 'failed') {
  setError(adjudicationStatus.last_error || 'Adjudication failed.');
}
```

## Testing Checklist

- [ ] Upload PDF → Extract data successfully
- [ ] Navigate to review page with claim_id loaded
- [ ] Verify extracted data is pre-filled
- [ ] Fill in policy number and insurance provider
- [ ] Click "Process Now"
- [ ] See "Processing..." state
- [ ] Backend starts adjudication (status = "adjudicating")
- [ ] Frontend polls every 2 seconds
- [ ] Status changes to "extracted" when complete
- [ ] Adjudicated data is fetched automatically
- [ ] Navigate to processed page with results
- [ ] Verify adjudication results display correctly

## Key Features

✅ **Async Workflow**: Non-blocking adjudication process
✅ **Auto Polling**: Smart polling that stops when complete
✅ **Error Handling**: Comprehensive error messages and recovery
✅ **State Management**: Clean React state with hooks
✅ **Type Safety**: Full TypeScript type coverage
✅ **User Feedback**: Clear UI states during processing
✅ **Data Persistence**: SessionStorage for page navigation
✅ **Auto Navigation**: Seamless flow to results page

## Performance Considerations

- **Polling Interval**: 2 seconds (balance between responsiveness and server load)
- **Auto-Stop**: Polling automatically stops when complete or failed
- **Request Timeout**: 180 seconds for adjudication submission
- **Stale Time**: 0 for status checks (always fresh), 5 minutes for results
- **Query Caching**: React Query handles caching and deduplication

## Next Steps

The adjudication workflow is now complete! Users can:
1. Upload documents
2. Review and correct extracted data
3. Submit for adjudication
4. See real-time status updates
5. View final adjudication results

All async workflows are implemented with proper polling mechanisms! 🎉
