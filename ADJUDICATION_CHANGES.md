# Adjudication Workflow - Changes Summary

## Files Modified

### 1. `/src/app/review/page.tsx` ✅
**Changes:**
- Added state for adjudication polling: `claimId`, `isAdjudicating`
- Added hooks: `useClaimStatus`, `useAdjudicatedData`
- Added 2 new useEffect hooks for monitoring adjudication workflow
- Updated data loading to get `currentClaimId` from sessionStorage
- Modified `handleProcessNow()` to use async adjudication workflow
- Removed unused `AdjudicatedClaim` import
- Fixed request payload format (use `extracted_data` instead of `extractedData`)

**Key Logic:**
```typescript
// 1. Submit for adjudication
const result = await adjudicateClaimMutation.mutateAsync({
  claim_id: claimId,
  extracted_data: extractedDataPayload,
});

// 2. Start polling
setIsAdjudicating(true);

// 3. useEffect monitors status and auto-stops polling
// 4. useEffect handles adjudicated data and navigates to /processed
```

### 2. `/src/app/upload/page.tsx` ✅
**Changes:**
- Added storing of `currentClaimId` in sessionStorage when navigating to review

**Code Added:**
```typescript
// Store claim_id for adjudication workflow
if (claimId) {
  sessionStorage.setItem('currentClaimId', claimId);
  console.log('Upload: Stored claim ID:', claimId);
}
```

### 3. `/src/hooks/use-claims.ts` ✅
**Already implemented** (no changes needed):
- `useAdjudicateClaim()` - Submit for adjudication
- `useClaimStatus()` - Poll status with auto-stop
- `useAdjudicatedData()` - Fetch final results

### 4. `/src/services/claims.service.ts` ✅
**Already implemented** (no changes needed):
- `adjudicateClaim()` - POST /adjudicate
- `getClaimStatus()` - GET /status/{claim_id}
- `getAdjudicatedData()` - GET /adjudicated/{claim_id}

### 5. `/src/lib/api-client.ts` ✅
**Already fixed**:
- Added `ngrok-skip-browser-warning` header

## Workflow Flow

```
┌─────────────┐
│ Upload Page │
│   stores:   │
│ - claimId   │──┐
│ - data      │  │
│ - filename  │  │
└─────────────┘  │
                 ↓
         ┌──────────────┐
         │ Review Page  │
         │  loads data  │
         │  + claimId   │
         └──────────────┘
                 ↓
         User clicks "Process Now"
                 ↓
         ┌──────────────────────┐
         │ POST /adjudicate     │
         │ {claim_id, data}     │
         │ → status: "adjudic.."│
         └──────────────────────┘
                 ↓
         ┌──────────────────────┐
         │ Poll /status         │
         │ every 2 seconds      │
         │ until "extracted"    │
         └──────────────────────┘
                 ↓
         ┌──────────────────────┐
         │ GET /adjudicated     │
         │ fetch final results  │
         └──────────────────────┘
                 ↓
         ┌──────────────────────┐
         │ Store in session     │
         │ Navigate /processed  │
         └──────────────────────┘
```

## State Management

### Review Page States
```typescript
// Adjudication polling state
const [claimId, setClaimId] = useState<string | null>(null);
const [isAdjudicating, setIsAdjudicating] = useState(false);

// React Query hooks
const { data: adjudicationStatus } = useClaimStatus(claimId, isAdjudicating);
const { data: adjudicatedData } = useAdjudicatedData(claimId, shouldFetch);
```

### State Transitions
```
1. Initial:           claimId=null, isAdjudicating=false
2. Load from storage: claimId="claim_123", isAdjudicating=false
3. Submit button:     claimId="claim_123", isAdjudicating=true
4. Polling active:    status="adjudicating"
5. Complete:          status="extracted", fetch data
6. Navigate:          → /processed
```

## Error States

### No Claim ID
```typescript
if (!claimId) {
  setError("No claim ID found. Please upload a document first.");
}
```

### Adjudication Failed
```typescript
if (adjudicationStatus.status === 'failed') {
  setError(adjudicationStatus.last_error || 'Adjudication failed.');
  setIsSubmitting(false);
}
```

### Network Errors
```typescript
catch (err) {
  // Handle ECONNABORTED, ERR_NETWORK, etc.
  setError(errorMessage);
  setIsSubmitting(false);
}
```

## Testing the Flow

### 1. Upload & Extract
```bash
# Upload a PDF
curl -X POST http://localhost:3000/upload
# Result: claim_id stored in sessionStorage
```

### 2. Review & Submit
```bash
# Navigate to /review
# Fill in policy details
# Click "Process Now"
# Watch console logs:
```

**Expected Console Output:**
```
Review: Submitting adjudication for claim: claim_abc123
Review: Adjudication submitted: {claim_id: "claim_abc123", status: "adjudicating"}
Review: Adjudication status update: adjudicating
Review: Adjudication status update: adjudicating (every 2s)
Review: Adjudication status update: extracted
Review: ✓ Adjudication completed, stopping poll
Review: Adjudicated data received: {...}
Navigation: → /processed
```

### 3. Processed Page
```bash
# Should automatically navigate
# Load adjudicatedClaimData from sessionStorage
# Display results with breakdowns
```

## API Calls Sequence

```
1. POST /api/v1/claims/adjudicate
   Body: {
     claim_id: "claim_abc123",
     extracted_data: { hospital_name, patient_name, ... }
   }
   Response: { claim_id: "claim_abc123", status: "adjudicating" }

2. GET /api/v1/claims/status/claim_abc123
   Response: { claim_id, status: "adjudicating", last_error: null }
   (Repeat every 2 seconds)

3. GET /api/v1/claims/status/claim_abc123
   Response: { claim_id, status: "extracted", last_error: null }
   (Polling stops)

4. GET /api/v1/claims/adjudicated/claim_abc123
   Response: {
     hospital_name, patient_name,
     adjudicated_line_items: [...],
     total_claimed_amount: 51450,
     total_amount_reimbursed: 45000,
     adjustments_log: [...],
     sanity_check_result: {...}
   }
```

## Key Benefits

✅ **Non-blocking**: User sees progress, not frozen UI
✅ **Automatic**: Polling and navigation happen automatically
✅ **Resilient**: Handles errors gracefully with clear messages
✅ **Efficient**: Polling stops automatically when done
✅ **Type-safe**: Full TypeScript coverage
✅ **User-friendly**: Clear status updates and error messages

## Next Steps

1. **Test end-to-end flow** with real backend
2. **Add UI progress indicator** during adjudication (optional)
3. **Test error scenarios** (network failures, timeouts, etc.)
4. **Verify processed page** displays adjudication results correctly

## Status: ✅ COMPLETE

The adjudication workflow is fully implemented and ready for testing!
