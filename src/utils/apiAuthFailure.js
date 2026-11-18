import { clearAuthSession } from './authStorage.js';
import { resolveApiAuthFailure } from './authSessionPolicy.js';

/**
 * Apply shared 401/403 policy after an API response failure.
 * Returns the policy decision for callers/tests.
 */
export function applyApiAuthFailure({
  status,
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  redirect = (path) => {
    if (typeof window !== 'undefined' && path) {
      window.location.href = path;
    }
  },
  clearSession = clearAuthSession,
} = {}) {
  const decision = resolveApiAuthFailure({ status, pathname });
  if (decision.clearSession) {
    clearSession();
  }
  if (decision.redirectTo) {
    redirect(decision.redirectTo);
  }
  return decision;
}
