/**
 * Hooks Index
 * Centralized export for all TanStack Query hooks
 */

// Authentication Hooks
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useIsAuthenticated,
  authKeys,
} from './use-auth';

// Claims Hooks
export {
  useClaims,
  useAdminClaims,
  useClaim,
  useExtractClaim,
  useClaimStatus,
  useExtractedData,
  useAdjudicateClaim,
  useAdjudicatedData,
  claimsKeys,
} from './use-claims';

// Admin & Users Hooks
export {
  useUsers,
  useCreateUser,
  useUpdateUser,
  usePolicies,
  usePolicy,
  useCreatePolicy,
  useUpdatePolicy,
  usePartialUpdatePolicy,
  useDeletePolicy,
  usersKeys,
  policiesKeys,
} from './use-users';
