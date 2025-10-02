# ClaimNow Frontend - API Integration Guide

## 🎯 Overview

This document provides a comprehensive guide to using the production-grade API integration between the ClaimNow Next.js frontend and the mediclaim-backend Python API.

## 📦 What's Included

### Core Files

1. **API Client** (`src/lib/api-client.ts`)
   - Axios instance with interceptors
   - Automatic JWT token management
   - Global error handling
   - Request/response transformation

2. **Type Definitions** (`src/lib/api-types.ts`)
   - TypeScript interfaces matching backend Pydantic schemas
   - Full type safety for all API calls

3. **Services** (`src/services/`)
   - `auth.service.ts` - Authentication operations
   - `claims.service.ts` - Claims processing operations
   - `users.service.ts` - User & policy management (Admin)

4. **React Hooks** (`src/hooks/`)
   - `use-auth.ts` - Authentication hooks
   - `use-claims.ts` - Claims hooks
   - `use-users.ts` - Admin hooks

5. **Provider** (`src/app/providers.tsx`)
   - TanStack Query client configuration
   - DevTools integration

6. **Example Components** (`src/components/examples/`)
   - `LoginExample.tsx` - Authentication example
   - `ClaimProcessingExample.tsx` - Complete claim workflow
   - `ClaimsListExample.tsx` - Claims list with pagination

## 🚀 Quick Start

### 1. Install Dependencies

Dependencies are already installed in your project:
- `@tanstack/react-query` - Data fetching & caching
- `@tanstack/react-query-devtools` - Development tools
- `axios` - HTTP client

### 2. Configure Environment

Update `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Start the Backend

```bash
cd mediclaim-backend
python -m uvicorn app.main:app --reload
```

### 4. Start the Frontend

```bash
cd claimnow-fe
pnpm dev
```

## 💡 Usage Examples

### Authentication

```tsx
import { useLogin, useCurrentUser, useLogout } from '@/hooks/use-auth';

function MyComponent() {
  const login = useLogin();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleLogin = async () => {
    await login.mutateAsync({
      username: 'testuser',
      password: 'password123'
    });
  };

  return (
    <div>
      {user ? (
        <button onClick={() => logout.mutate()}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Extract Claim from PDF

```tsx
import { useExtractClaim } from '@/hooks/use-claims';

function UploadComponent() {
  const extract = useExtractClaim();

  const handleUpload = async (file: File) => {
    const result = await extract.mutateAsync(file);
    console.log('Extracted data:', result);
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
    />
  );
}
```

### Complete Claim Processing

```tsx
import { useProcessCompleteClaim } from '@/hooks/use-claims';

function ProcessComponent() {
  const process = useProcessCompleteClaim();

  const handleProcess = async (file: File) => {
    const result = await process.mutateAsync({
      file,
      insuranceDetails: {
        policy_number: 'POL123456',
        insurance_provider: 'HealthCare Inc.'
      }
    });

    console.log('Adjudicated:', result.adjudicated);
  };

  return (
    <button onClick={() => handleProcess(file)}>
      Process Claim
    </button>
  );
}
```

### List User Claims

```tsx
import { useClaims } from '@/hooks/use-claims';

function ClaimsList() {
  const { data: claims, isLoading } = useClaims();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {claims?.map(claim => (
        <div key={claim.claim_id}>
          <h3>{claim.adjudicated_data.patient_name}</h3>
          <p>${claim.adjudicated_data.total_amount_reimbursed}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔐 Authentication Flow

1. User enters credentials
2. `useLogin()` hook sends POST to `/api/v1/token`
3. Token is stored in localStorage
4. Token is automatically attached to all subsequent requests
5. On 401 error, user is redirected to login

## 📊 Available Hooks

### Authentication Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useCurrentUser()` | Get logged-in user | `{ data, isLoading, error }` |
| `useLogin()` | Login mutation | `{ mutate, mutateAsync, isPending }` |
| `useLogout()` | Logout mutation | `{ mutate, mutateAsync }` |
| `useIsAuthenticated()` | Check auth status | `boolean` |

### Claims Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useClaims(params?)` | Get all claims | `{ data, isLoading, error, refetch }` |
| `useClaim(id)` | Get single claim | `{ data, isLoading, error }` |
| `useExtractClaim()` | Extract from PDF | `{ mutate, mutateAsync, isPending }` |
| `useAdjudicateClaim()` | Adjudicate claim | `{ mutate, mutateAsync, isPending }` |
| `useProcessCompleteClaim()` | Full workflow | `{ mutate, mutateAsync, isPending }` |

### Admin Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useUsers(params?)` | Get all users | `{ data, isLoading, error }` |
| `useCreateUser()` | Create user | `{ mutate, mutateAsync, isPending }` |
| `useUpdateUser()` | Update user | `{ mutate, mutateAsync, isPending }` |
| `usePolicies(params?)` | Get policies | `{ data, isLoading, error }` |
| `usePolicy(id)` | Get single policy | `{ data, isLoading, error }` |
| `useUpdatePolicy()` | Update policy | `{ mutate, mutateAsync, isPending }` |

## 🎨 Loading & Error States

All hooks return loading and error states:

```tsx
const { data, isLoading, error, isError } = useClaims();

if (isLoading) return <Spinner />;
if (isError) return <Error message={error.message} />;
return <ClaimsList claims={data} />;
```

## 🔄 Cache Management

TanStack Query automatically manages caching:

- **Automatic Refetching**: Data refetches on window focus
- **Cache Invalidation**: Mutations automatically invalidate related queries
- **Optimistic Updates**: UI updates before server confirms
- **Background Refetching**: Fresh data without loading states

### Manual Refetch

```tsx
const { refetch } = useClaims();

<button onClick={() => refetch()}>Refresh</button>
```

### Manual Cache Invalidation

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['claims'] });
```

## 🛠️ API Client Features

### Automatic Token Attachment

```typescript
// Tokens are automatically attached to every request
const response = await apiClient.get('/api/v1/claims');
// Authorization: Bearer <token> is added automatically
```

### Error Handling

```typescript
try {
  await claimsService.extractClaim(file);
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message, apiError.status);
}
```

### Token Management

```typescript
import { setToken, clearAuth, getToken, isAuthenticated } from '@/lib/api-client';

// Set token
setToken('your-token-here');

// Clear authentication
clearAuth();

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}
```

## 🧪 Testing

### Test with Backend

1. Start backend: `cd mediclaim-backend && python -m uvicorn app.main:app --reload`
2. Create test user: `cd scripts && python add_sample_user.py`
3. Login with credentials in frontend
4. Upload a test PDF medical bill
5. View extracted and adjudicated results

### React Query DevTools

In development mode, DevTools are automatically available:
- Opens at bottom of screen
- Shows all queries and mutations
- Displays cache state
- Allows manual refetching

## 📝 Type Safety

All API calls are fully typed:

```typescript
// TypeScript knows the exact shape of the response
const { data } = useClaims();
data?.[0].adjudicated_data.patient_name; // ✓ Type-safe

// TypeScript validates request payloads
await login.mutateAsync({
  username: 'test',
  password: 'test'
}); // ✓ Type-safe
```

## 🚨 Error Scenarios

### 401 Unauthorized
- Token is invalid or expired
- User is automatically redirected to login
- localStorage is cleared

### 429 Rate Limited
- Too many requests
- Error logged to console
- Retry after delay

### 403 Forbidden
- User lacks permissions
- Error logged to console
- Show permission denied message

### Network Errors
- No internet connection
- Server is down
- Request timeout (30 seconds)

## 🔧 Configuration

### Change API Base URL

Update `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
```

### Change Timeout

Edit `src/lib/api-client.ts`:
```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
});
```

### Customize Query Defaults

Edit `src/app/providers.tsx`:
```typescript
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  },
}
```

## 📚 Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Backend API Docs](http://localhost:8000/docs) (when backend is running)

## 🐛 Troubleshooting

### CORS Errors

Ensure backend has CORS configured for `http://localhost:3000`

### Token Not Persisting

Check browser localStorage and ensure cookies are enabled

### Type Errors

Run `npm run type-check` to verify TypeScript compilation

### Queries Not Refetching

Check if queries are enabled and stale time is appropriate

---

**Happy Coding! 🚀**
