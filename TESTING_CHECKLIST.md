# ✅ Integration Testing Checklist

## 🎯 Pre-Testing Setup

- [ ] Backend server is running on `http://localhost:8000`
- [ ] Frontend server is running on `http://localhost:3000`
- [ ] `.env.local` file is configured with correct API URL
- [ ] Database is initialized with sample users
- [ ] Test PDF medical bills are available

## 🔐 Authentication Testing

### Login Page (`/`)

- [ ] Page loads without errors
- [ ] Form validation works (empty fields disabled)
- [ ] Terms checkbox must be checked to enable button
- [ ] **Test successful login:**
  - [ ] Enter valid credentials
  - [ ] Click "Sign In"
  - [ ] See "Signing in..." loading state
  - [ ] Redirected to `/upload` page
  - [ ] Token stored in localStorage
  
- [ ] **Test failed login:**
  - [ ] Enter invalid credentials
  - [ ] See error message displayed
  - [ ] Stay on login page
  - [ ] No token in localStorage

## 📤 Upload & Extract Testing

### Upload Page (`/upload`)

- [ ] Page loads without errors
- [ ] Header displays user info
- [ ] Welcome message shows correct name
- [ ] Upload component is visible

- [ ] **Test file upload - drag & drop:**
  - [ ] Drag PDF file over upload area
  - [ ] Drop file
  - [ ] See processing state
  - [ ] After ~2-3 seconds, see success state
  - [ ] "Start claim" button appears
  
- [ ] **Test file upload - click:**
  - [ ] Click upload area
  - [ ] Select PDF file from dialog
  - [ ] See processing state
  - [ ] See success state with extracted info
  
- [ ] **Test extraction success:**
  - [ ] Green success message appears
  - [ ] Shows patient name
  - [ ] Shows hospital name
  - [ ] Shows amount
  - [ ] "Start claim" button is enabled
  
- [ ] **Test extraction error:**
  - [ ] Upload invalid file (e.g., .txt)
  - [ ] See error message in red
  - [ ] Button returns to disabled state
  
- [ ] **Test navigation:**
  - [ ] Click "Start claim" button
  - [ ] Redirected to `/review` page
  - [ ] Extracted data available on review page

## 📝 Review & Adjudicate Testing

### Review Page (`/review`)

- [ ] Page loads without errors
- [ ] Progress steps displayed correctly
- [ ] PDF preview pane visible
- [ ] Form pre-filled with extracted data

- [ ] **Test form fields:**
  - [ ] Hospital name is editable
  - [ ] Patient name is editable
  - [ ] Bill number is editable
  - [ ] Dates are editable
  - [ ] Policy number field exists
  - [ ] Insurance provider field exists
  
- [ ] **Test line items:**
  - [ ] All extracted line items displayed
  - [ ] Can increase quantity with + button
  - [ ] Can decrease quantity with - button
  - [ ] Can edit item description
  - [ ] Can edit unit price
  - [ ] Total amount updates automatically
  - [ ] Can add new line item
  - [ ] Can remove line item
  - [ ] Grand total calculates correctly
  
- [ ] **Test validation:**
  - [ ] Policy number is required
  - [ ] Insurance provider is required
  - [ ] Cannot process with empty fields
  
- [ ] **Test adjudication:**
  - [ ] Fill all required fields
  - [ ] Click "Process Now" button
  - [ ] See loading state
  - [ ] Button shows "Processing..."
  - [ ] After processing:
    - [ ] Redirected to `/processed` page
    - [ ] No errors in console
    
- [ ] **Test error handling:**
  - [ ] If backend is down, see error message
  - [ ] Error message is user-friendly
  - [ ] Can retry after error
  
- [ ] **Test reset:**
  - [ ] Click "Reset" button
  - [ ] Confirmation dialog appears
  - [ ] Data resets to original state

## 📊 Results Display Testing

### Processed Page (`/processed`)

- [ ] Page loads without errors
- [ ] Success icon displayed
- [ ] File name shown in header

- [ ] **Test summary section:**
  - [ ] Total claim requested amount displayed
  - [ ] Claimed amount shown in green
  - [ ] Unclaimed amount shown in red
  - [ ] Claim percentage calculated correctly
  - [ ] Progress bar width matches percentage
  
- [ ] **Test AI sanity check:**
  - [ ] Sanity check result displayed (if available)
  - [ ] Shows green for reasonable / yellow for flags
  - [ ] Reasoning text is readable
  - [ ] Flags list displayed if any
  
- [ ] **Test unclaimed breakdown:**
  - [ ] Table header displayed correctly
  - [ ] All unclaimed items listed
  - [ ] Serial numbers sequential
  - [ ] Amounts shown with ₹ symbol
  - [ ] Reasons are descriptive
  - [ ] Total row calculates correctly
  
- [ ] **Test claimed breakdown:**
  - [ ] Table header displayed correctly
  - [ ] All claimed items listed
  - [ ] Quantities displayed
  - [ ] Unit prices shown
  - [ ] Total amounts calculated
  - [ ] Claim status percentages shown
  - [ ] Total row calculates correctly
  
- [ ] **Test actions:**
  - [ ] "Download PDF" button visible
  - [ ] Click "Download PDF" (logs to console for now)
  - [ ] "Go Home" button visible
  - [ ] Click "Go Home"
  - [ ] Redirected to `/upload` page
  - [ ] sessionStorage cleared

## 🔄 Integration Flow Testing

### Complete End-to-End Flow

- [ ] Start at login page
- [ ] Login with valid credentials
- [ ] Upload a medical bill PDF
- [ ] Wait for extraction
- [ ] See extracted data
- [ ] Navigate to review page
- [ ] Verify pre-filled data is correct
- [ ] Edit some fields (optional)
- [ ] Add policy information
- [ ] Process claim
- [ ] View results on processed page
- [ ] Verify all calculations are correct
- [ ] Return to home
- [ ] Upload another claim (repeat)

## 🛠️ Technical Testing

### API Integration

- [ ] **Check network tab:**
  - [ ] Login request goes to `/api/v1/token`
  - [ ] Extract request goes to `/api/v1/claims/extract`
  - [ ] Adjudicate request goes to `/api/v1/claims/adjudicate`
  - [ ] All requests include Authorization header
  - [ ] Responses are valid JSON
  
- [ ] **Check localStorage:**
  - [ ] `access_token` stored after login
  - [ ] `token_type` is "bearer"
  - [ ] Token cleared on logout/401
  
- [ ] **Check sessionStorage:**
  - [ ] `extractedClaimData` stored after extraction
  - [ ] `adjudicatedClaimData` stored after adjudication
  - [ ] Both cleared when returning home

### Error Scenarios

- [ ] **Backend down:**
  - [ ] Appropriate error messages shown
  - [ ] App doesn't crash
  - [ ] User can retry
  
- [ ] **Invalid token:**
  - [ ] Auto-logout on 401
  - [ ] Redirect to login page
  - [ ] Token cleared from storage
  
- [ ] **Rate limiting:**
  - [ ] Handle 429 responses gracefully
  - [ ] Show rate limit message
  
- [ ] **Network timeout:**
  - [ ] Show timeout error
  - [ ] Allow retry

## 🎨 UI/UX Testing

### Responsive Design

- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Forms are readable
- [ ] Tables scroll horizontally if needed
- [ ] Buttons are clickable

### Loading States

- [ ] Login button shows "Signing in..."
- [ ] Upload shows processing animation
- [ ] Review shows "Processing..." during adjudication
- [ ] Processed page shows loading spinner initially

### Visual Feedback

- [ ] Success messages are green
- [ ] Error messages are red
- [ ] Hover states on buttons
- [ ] Disabled states clear
- [ ] Progress indicators work

## 📱 Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🔍 Console Testing

- [ ] No errors in browser console
- [ ] No React warnings
- [ ] No TypeScript errors
- [ ] API calls logged (if debugging)

## 📊 Performance Testing

- [ ] Initial page load < 3 seconds
- [ ] Login response < 1 second
- [ ] Extraction completes in reasonable time
- [ ] Adjudication completes in reasonable time
- [ ] Page transitions are smooth

## 🔒 Security Testing

- [ ] Cannot access `/upload` without login
- [ ] Cannot access `/review` without extracted data
- [ ] Cannot access `/processed` without adjudicated data
- [ ] Token expires appropriately
- [ ] Sensitive data not logged to console

## 📋 Final Checklist

- [ ] All tests passed
- [ ] No critical bugs found
- [ ] Documentation is complete
- [ ] Code is production-ready
- [ ] Backend is compatible
- [ ] Error handling is robust

## 🎉 Testing Complete!

Once all items are checked, the integration is ready for:
- ✅ Staging deployment
- ✅ User acceptance testing
- ✅ Production deployment

---

**Testing Notes:**
- Document any issues found during testing
- Create tickets for bugs that need fixing
- Note any edge cases discovered
- Record any improvements needed
