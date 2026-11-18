/**
 * Pure session / route / API auth policy for frontend integration tests.
 * JWT expiry is decoded client-side for UX gating only — not signature verification.
 */

const LOGIN_PATH = '/login';

function base64UrlToJson(segment) {
  if (!segment || typeof segment !== 'string') return null;
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const json = Buffer.from(padded + pad, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Browser-safe decode when Buffer is unavailable. */
function decodeSegment(segment) {
  if (typeof Buffer !== 'undefined') return base64UrlToJson(segment);
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    return JSON.parse(atob(padded + pad));
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return decodeSegment(parts[1]);
}

export function isTokenStructurallyValid(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  return Boolean(decodeJwtPayload(token));
}

export function isTokenExpired(token, nowMs = Date.now()) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    // No exp claim: treat as non-expired structurally; server still enforces.
    return false;
  }
  return payload.exp * 1000 <= nowMs;
}

/**
 * @returns {{ authenticated: boolean, reason: string|null }}
 */
export function evaluateSession({ token, id } = {}, nowMs = Date.now()) {
  if (!token || !id) {
    return { authenticated: false, reason: 'missing_credentials' };
  }
  if (!isTokenStructurallyValid(token)) {
    return { authenticated: false, reason: 'token_invalid' };
  }
  if (isTokenExpired(token, nowMs)) {
    return { authenticated: false, reason: 'token_expired' };
  }
  return { authenticated: true, reason: null };
}

export function resolveProtectedAccess(sessionEvaluation) {
  if (sessionEvaluation?.authenticated) {
    return { allow: true, redirectTo: null };
  }
  return { allow: false, redirectTo: LOGIN_PATH };
}

/**
 * API auth failure policy.
 * 401 → clear session and leave authenticated UI.
 * 403 → keep session (authorized identity, forbidden action).
 */
export function resolveApiAuthFailure({ status, pathname = '/' } = {}) {
  if (status === 401) {
    return {
      clearSession: true,
      redirectTo: pathname === LOGIN_PATH ? null : LOGIN_PATH,
      keepUiAuthenticated: false,
    };
  }
  if (status === 403) {
    return {
      clearSession: false,
      redirectTo: null,
      keepUiAuthenticated: true,
    };
  }
  return {
    clearSession: false,
    redirectTo: null,
    keepUiAuthenticated: true,
  };
}

export function resolveLoginLanding(sessionEvaluation) {
  if (sessionEvaluation?.authenticated) {
    return { redirectTo: '/', replace: true };
  }
  return { redirectTo: null };
}

export function resolveLogoutLanding() {
  return { redirectTo: LOGIN_PATH, replace: true, clearSession: true };
}

export const AUTH_LOGIN_PATH = LOGIN_PATH;

/** Copy contract for recorded-revenue presentation. */
export const RECORDED_REVENUE_COPY = {
  label: 'Recorded revenue',
  mustInclude: [
    'Lead-stored CRM conversion amounts only',
    'not cash collected',
  ],
  mustNotInclude: ['collected revenue'],
};
