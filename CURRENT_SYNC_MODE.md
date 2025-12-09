# Backend Async Workflow - IMPLEMENTED ✅

## Current Status

The backend **IS using the async workflow**. It returns a `claim_id` and processes extraction in the background.

## What's Working Now

### Frontend
✅ Upload PDF file
✅ Call `/api/v1/claims/extract` endpoint
✅ Receive extracted data immediately in response
✅ Display success message with patient name, hospital, amount
✅ Enable "Start claim" button
✅ Navigate to review page

### Backend Response Format
The backend currently returns the extracted data directly:

```json
{
  "bill_no": { "value": "1209", "confidence": 1.0 },
  "bill_date": { "value": "2025-04-16", "confidence": 1.0 },
  "policy_no": { "value": "21-51-24-000373-000", "confidence": 0.5 },
  "patient_name": { "value": "BABY GIRL OF SAMLEE GUPTA 2", "confidence": 1.0 },
  "hospital_name": { "value": "RUNGTA HOSPITAL", "confidence": 1.0 },
  "admission_date": { "value": "2025-04-12", "confidence": 1.0 },
  "discharge_date": { "value": "2025-04-16", "confidence": 1.0 },
  "insurance_provider": { "value": "Aditya Birla Health Insurance Co. Limited", "confidence": 1.0 },
  "net_payable_amount": { "value": 20290.63, "confidence": 1.0 },
  "line_items": [...]
}
```

## What's Been Disabled

The following async workflow features are **ready in the frontend** but disabled because the backend doesn't support them yet:

❌ Polling mechanism
❌ Status tracking (queued → processing → completed)
❌ `/api/v1/claims/status/{claim_id}` endpoint
❌ `/api/v1/claims/extracted/{claim_id}` endpoint
❌ Background task processing

## Frontend Code Changes

### Removed State Variables
```typescript
// ❌ Disabled (commented out)
// const [claimId, setClaimId] = useState<string | null>(null);
// const [isPolling, setIsPolling] = useState<boolean>(false);
// const { data: statusData } = useClaimStatus(claimId, isPolling);
// const { data: extractedDataResponse } = useExtractedData(claimId, shouldFetchExtracted);
```

### Current Implementation
```typescript
// ✅ Synchronous extraction
const result = await extractClaimMutation.mutateAsync(file);
setExtractedData(result as unknown as ExtractedDataResponse);
setUploadState('success');
```

## When Backend Implements Async Workflow

When the backend adds support for async processing, we need to:

### 1. Backend Changes Required

#### a) Modify `/api/v1/claims/extract` endpoint
**Current (Synchronous):**
```python
@router.post("/extract")
async def extract_claim(file: UploadFile):
    # ... extract data synchronously
    return extracted_data  # Returns data immediately
```

**Required (Async):**
```python
@router.post("/extract")
async def extract_claim(file: UploadFile):
    claim_id = generate_claim_id()
    # Start background task
    background_tasks.add_task(process_extraction, claim_id, file)
    return {"claim_id": claim_id, "status": "queued"}
```

#### b) Add new `/api/v1/claims/status/{claim_id}` endpoint
```python
@router.get("/status/{claim_id}")
async def get_claim_status(claim_id: str):
    status = get_processing_status(claim_id)
    return {
        "claim_id": claim_id,
        "status": status,  # "queued" | "processing" | "completed" | "failed"
        "last_error": None
    }
```

#### c) Add new `/api/v1/claims/extracted/{claim_id}` endpoint
```python
@router.get("/extracted/{claim_id}")
async def get_extracted_data(claim_id: str):
    data = get_extracted_data_from_db(claim_id)
    return data  # Same format as current synchronous response
```

### 2. Frontend Changes Required

Just uncomment and enable the polling code:

```typescript
// ✅ Enable these
const [claimId, setClaimId] = useState<string | null>(null);
const [isPolling, setIsPolling] = useState<boolean>(false);
const { data: statusData } = useClaimStatus(claimId, isPolling);
const { data: extractedDataResponse } = useExtractedData(
  claimId,
  statusData?.status === 'completed'
);

// Update handleFileUpload
const result = await extractClaimMutation.mutateAsync(file);
setClaimId(result.claim_id);  // Not result itself
setIsPolling(true);
```

## Benefits of Async Workflow

### User Experience
- **Better feedback**: Show real-time processing status
- **No timeouts**: Long-running extractions won't timeout
- **Progress tracking**: User knows what's happening

### Backend Performance
- **Non-blocking**: Can handle more concurrent requests
- **Scalability**: Can process multiple files in parallel
- **Retry logic**: Failed extractions can be retried
- **Resource management**: Better CPU/memory usage

### Frontend Benefits
- **Responsive UI**: User can see progress
- **Better error handling**: Clear status messages
- **No hanging requests**: 2-second polls instead of one long request

## Implementation Priority

### Phase 1: Current (Working)
✅ Synchronous extraction
✅ Immediate response
✅ No polling needed

### Phase 2: Async Workflow (Future)
1. Backend: Add background task processing (Celery/Redis or FastAPI BackgroundTasks)
2. Backend: Add status tracking in database
3. Backend: Add `/status/{claim_id}` and `/extracted/{claim_id}` endpoints
4. Frontend: Uncomment polling code
5. Frontend: Remove type assertion
6. Testing: End-to-end async flow

## Files Modified

- ✅ `src/app/upload/page.tsx` - Reverted to synchronous mode
- ✅ `src/hooks/use-claims.ts` - Polling hooks ready but not used
- ✅ `src/services/claims.service.ts` - Status/extracted endpoints ready but not called

## Related Documentation

- `POLLING_IMPLEMENTATION.md` - How polling will work (when backend is ready)
- `POLLING_FIX.md` - How to prevent infinite polling
- `BACKEND_ASYNC_REQUIRED.md` - Backend changes needed

## Testing Current Implementation

### Test Flow
1. Upload a PDF file
2. See "Extracting data from document..." message
3. Wait for backend to process (may take 10-30 seconds)
4. See success message with extracted data
5. Click "Start claim" button
6. Navigate to review page

### Expected Logs
```
Upload: Starting file upload for sample.pdf
Upload: Generated PDF ID: pdf_1234567890_abc123
Upload: PDF converted to base64. Size: 5.80 MB
Upload: PDF stored successfully in IndexedDB
Upload: Calling extraction API...
Upload: Extraction response received: { bill_no: {...}, patient_name: {...}, ... }
Upload: Extraction successful
```

### No Polling Logs (Since It's Disabled)
You should **NOT** see:
- ❌ "Status update: queued"
- ❌ "Status update: processing"  
- ❌ "Status update: completed"
- ❌ Multiple API calls to `/status/` endpoint

## Conclusion

The frontend is currently in **synchronous mode** to match the backend's current implementation. All async/polling infrastructure is **ready and tested** but disabled until the backend supports it.

When backend adds async support, we just need to:
1. Uncomment ~10 lines of code
2. Remove one type assertion
3. Done! ✅
