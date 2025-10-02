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
  useClaim,
  useExtractClaim,
  useAdjudicateClaim,
  useProcessCompleteClaim,
  claimsKeys,
} from './use-claims';

// Admin & Users Hooks
export {
  useUsers,
  useCreateUser,
  useUpdateUser,
  usePolicies,
  usePolicy,
  useUpdatePolicy,
  usersKeys,
  policiesKeys,
} from './use-users';
