# Backend Async Workflow - Required Changes

## Problem
The frontend is trying to poll `/api/v1/claims/status/{claim_id}`, but this endpoint **doesn't exist** in the backend yet. The backend currently does synchronous extraction and returns data immediately.

## Current Backend Flow (Synchronous)
```
POST /api/v1/claims/extract
    ↓
Extract data immediately (30-60 seconds)
    ↓
Return ExtractedDataWithConfidence
```

## Required Backend Flow (Asynchronous)
```
POST /api/v1/claims/extract
    ↓
Create claim record with status="queued"
    ↓
Return { claim_id, status: "queued" } immediately
    ↓
Start background task for extraction
    ↓
Update claim status: queued → processing → completed/failed
```

## Missing Endpoints

### 1. Modified `/api/v1/claims/extract`
**Current:** Returns `ExtractedDataWithConfidence`  
**Required:** Returns `ClaimIntakeResponse { claim_id, status }`

```python
@claims_router.post("/extract", response_model=ClaimIntakeResponse)
async def create_extraction_request(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks,
):
    # 1. Create claim record with status="queued"
    claim = create_claim_record(db, user=current_user, status="queued")
    
    # 2. Start background extraction task
    background_tasks.add_task(extract_and_update, claim.claim_id, file)
    
    # 3. Return immediately
    return ClaimIntakeResponse(claim_id=str(claim.claim_id), status="queued")
```

### 2. New `/api/v1/claims/status/{claim_id}`
**Purpose:** Poll for extraction status

```python
@claims_router.get("/status/{claim_id}", response_model=ClaimStatusResponse)
async def get_claim_status(
    request: Request,
    claim_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    claim = get_claim_by_id(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    
    if claim.submitted_by_user_id != current_user.user_id:
        raise HTTPException(403, "Not authorized")
    
    return ClaimStatusResponse(
        claim_id=str(claim.claim_id),
        status=claim.status,  # queued | processing | completed | failed
        last_error=claim.error_message
    )
```

### 3. New `/api/v1/claims/extracted/{claim_id}`
**Purpose:** Get extracted data after completion

```python
@claims_router.get("/extracted/{claim_id}", response_model=ExtractedDataResponse)
async def get_extracted_data(
    request: Request,
    claim_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_user),
):
    claim = get_claim_by_id(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    
    if claim.submitted_by_user_id != current_user.user_id:
        raise HTTPException(403, "Not authorized")
    
    if claim.status != "completed":
        raise HTTPException(400, f"Extraction not completed. Status: {claim.status}")
    
    return claim.extracted_data
```

## Database Schema Changes

### Update `Claim` model:
```python
class Claim(Base):
    __tablename__ = "claims"
    claim_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submitted_by_user_id = Column(Integer, ForeignKey("users.user_id"))
    policy_id = Column(String, ForeignKey("policies.policy_id"), nullable=True)
    
    # Add status tracking
    status = Column(String, default="queued")  # queued | processing | completed | failed
    error_message = Column(String, nullable=True)
    
    original_pdf_filename = Column(String)
    extracted_data = Column(JSONB, nullable=True)  # Null until extraction completes
    adjudicated_data = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

## Background Task Implementation

### Option 1: FastAPI BackgroundTasks (Simple, but limited)
```python
from fastapi import BackgroundTasks

async def extract_and_update(claim_id: UUID, file: UploadFile):
    try:
        # Update status to processing
        update_claim_status(claim_id, "processing")
        
        # Extract data
        extracted_data = await extract_data_from_bill(file)
        
        # Update claim with data
        update_claim_extracted_data(claim_id, extracted_data, "completed")
        
    except Exception as e:
        # Update with error
        update_claim_status(claim_id, "failed", error_message=str(e))
```

### Option 2: Celery + Redis (Production-ready, recommended)
```python
from celery import Celery

celery_app = Celery('mediclaim', broker='redis://localhost:6379/0')

@celery_app.task
def extract_claim_task(claim_id: str, file_path: str):
    # Same logic as above but in Celery task
    pass
```

## Temporary Workaround for Frontend

Since the backend doesn't support async workflow yet, we have two options:

### Option A: Keep synchronous (No polling)
Revert frontend to wait for extraction to complete:
```typescript
const result = await extractClaimMutation.mutateAsync(file);
// result contains ExtractedDataWithConfidence directly
setExtractedData(result);
setUploadState('success');
```

### Option B: Simulate async (Fake polling for demo)
Keep frontend as-is, but backend returns immediately with fake status:
```python
# Quick hack - just return extracted data wrapped in ClaimIntakeResponse
@claims_router.post("/extract")
async def create_extraction_request(...):
    extracted_data = await extract_data_from_bill(file)
    
    # Create claim record immediately
    claim = create_claim_record(db, extracted_data=extracted_data, status="completed")
    
    # Return claim_id (frontend will poll, but status is already completed)
    return {"claim_id": str(claim.claim_id), "status": "completed"}
```

## Recommended Approach

1. **Short term:** Use Option A (revert frontend to synchronous)
2. **Medium term:** Implement FastAPI BackgroundTasks (Option 1)
3. **Long term:** Implement Celery + Redis (Option 2) for production scalability

## Implementation Priority

1. ✅ **High Priority:** Add `/api/v1/claims/status/{claim_id}` endpoint
2. ✅ **High Priority:** Add `/api/v1/claims/extracted/{claim_id}` endpoint
3. ✅ **High Priority:** Modify `/api/v1/claims/extract` to return `ClaimIntakeResponse`
4. ⚠️ **Medium Priority:** Add background task processing
5. 📋 **Low Priority:** Add Celery for production

## Files to Modify

### Backend:
- `app/endpoints/claims.py` - Add new endpoints
- `app/pydantic_schemas.py` - Add `ExtractedDataResponse` if missing
- `app/crud.py` - Add functions to update claim status
- `app/database_schema.py` - Add `error_message` column if needed

### Frontend:
- Already implemented! Just needs backend support.

## Testing Checklist

After backend implementation:
- [ ] POST `/api/v1/claims/extract` returns `claim_id` immediately
- [ ] GET `/api/v1/claims/status/{claim_id}` returns current status
- [ ] Status transitions: queued → processing → completed
- [ ] GET `/api/v1/claims/extracted/{claim_id}` returns data when completed
- [ ] Frontend polling starts and stops correctly
- [ ] Error handling works (failed status)
