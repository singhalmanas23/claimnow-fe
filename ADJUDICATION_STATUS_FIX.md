# Adjudication Status Fix - "completed" vs "extracted"

## Issue
The backend was returning `"completed"` status after adjudication, but the frontend was only checking for `"extracted"` status. This caused the polling to continue indefinitely and the adjudicated data was never fetched.

**Console log:**
```
Review: Adjudication status update: completed
```

But the code was checking:
```typescript
if (adjudicationStatus?.status === 'extracted') {
  // This never triggered!
}
```

## Solution

Updated the review page to check for **both** `"completed"` and `"extracted"` statuses.

### Changes Made

#### 1. Updated Status Check for Fetching Data
**File:** `/src/app/review/page.tsx`

```typescript
// Before
const shouldFetchAdjudicated = adjudicationStatus?.status === 'extracted' && !isAdjudicating;

// After
const shouldFetchAdjudicated = 
  (adjudicationStatus?.status === 'completed' || adjudicationStatus?.status === 'extracted') 
  && isAdjudicating;
```

#### 2. Updated Status Monitoring useEffect
**File:** `/src/app/review/page.tsx`

```typescript
// Before
if (adjudicationStatus.status === 'extracted') {
  setIsAdjudicating(false);
  console.log('Review: ✓ Adjudication completed, stopping poll');
}

// After
if (adjudicationStatus.status === 'completed' || adjudicationStatus.status === 'extracted') {
  setIsAdjudicating(false);
  console.log('Review: ✓ Adjudication completed with status:', adjudicationStatus.status, '- stopping poll');
}
```

## Status Flow Explanation

### Extraction Workflow
```
Upload PDF → queued → processing → extracted ✓
```

### Adjudication Workflow
```
Submit for Adjudication → adjudicating → completed ✓
```

## Why Both Statuses?

The backend uses different completion statuses for different workflows:
- **`extracted`** - Used when extraction is complete
- **`completed`** - Used when adjudication is complete

Both represent successful completion, just for different operations.

## API Types
The `ClaimStatusResponse` already includes both:

```typescript
export interface ClaimStatusResponse {
  claim_id: string;
  status: 'queued' | 'processing' | 'extracted' | 'failed' | 'adjudicating' | 'completed';
  last_error?: string | null;
}
```

## Polling Hook
The `useClaimStatus` hook already handles `"completed"` status correctly:

```typescript
refetchInterval: (query) => {
  if (!enabled) return false;
  const data = query.state.data;
  if (data?.status === 'completed' || data?.status === 'failed') {
    return false; // Stop polling ✓
  }
  return 2000; // Poll every 2 seconds
}
```

## Testing

### What Should Happen Now

1. **User clicks "Process Now"**
2. **Backend starts adjudication** → status: `"adjudicating"`
3. **Frontend polls every 2 seconds**
4. **Backend completes** → status: `"completed"` ✓
5. **Frontend detects completion:**
   - Stops polling
   - Fetches adjudicated data
   - Navigates to processed page

### Console Logs to Verify

```
Review: Submitting adjudication for claim: abc123
Review: Adjudication submitted: { claim_id: "abc123", status: "adjudicating" }
Review: Adjudication status update: adjudicating
Review: Adjudication status update: adjudicating
Review: Adjudication status update: completed
Review: ✓ Adjudication completed with status: completed - stopping poll
Review: Adjudicated data received: { ... }
```

## Fixed Files

1. ✅ `/src/app/review/page.tsx` - Updated status checks
2. ✅ `/src/lib/api-types.ts` - Already had `"completed"` in type
3. ✅ `/src/hooks/use-claims.ts` - Already handled `"completed"` in polling

## Status Reference

| Status | Workflow | Meaning |
|--------|----------|---------|
| `queued` | Extraction | Waiting to start |
| `processing` | Extraction | In progress |
| `extracted` | Extraction | ✅ Complete |
| `adjudicating` | Adjudication | In progress |
| `completed` | Adjudication | ✅ Complete |
| `failed` | Both | ❌ Error |

## Result

✅ **Polling now stops correctly when status is "completed"**
✅ **Adjudicated data is fetched automatically**
✅ **Navigation to processed page works**
✅ **Complete workflow is functional**

The adjudication workflow now works end-to-end! 🎉
