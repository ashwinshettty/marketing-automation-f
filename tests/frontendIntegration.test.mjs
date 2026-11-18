import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function installLocalStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  return store;
}

function fakeJwt({ exp, sub = 'user-1' } = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub, exp })).toString('base64url');
  return `${header}.${payload}.sig`;
}

test('session restoration after refresh keeps authenticated staff', async () => {
  const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
  installLocalStorage({
    token,
    _id: 'user-1',
    role: 'sales',
    username: 'ada',
  });

  // Simulate a new page load by re-importing against the same localStorage.
  const storage = await import(`../src/utils/authStorage.js?restore=${Date.now()}`);
  assert.equal(storage.isAuthenticated(), true);
  assert.equal(storage.getAuthSession().token, token);
  assert.equal(storage.getSessionEvaluation().reason, null);
});

test('ProtectedRoute allows authenticated users and sends others to /login', async () => {
  const {
    evaluateSession,
    resolveProtectedAccess,
  } = await import('../src/utils/authSessionPolicy.js');

  const ok = evaluateSession({
    token: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 60 }),
    id: 'u1',
  });
  assert.deepEqual(resolveProtectedAccess(ok), { allow: true, redirectTo: null });

  const anon = evaluateSession({ token: '', id: '' });
  assert.deepEqual(resolveProtectedAccess(anon), { allow: false, redirectTo: '/login' });

  const source = readFileSync(join(root, 'src/components/ProtectedRoute.jsx'), 'utf8');
  assert.match(source, /resolveProtectedAccess/);
  assert.match(source, /getSessionEvaluation/);
});

test('expired and invalid tokens are not authenticated', async () => {
  const { evaluateSession } = await import('../src/utils/authSessionPolicy.js');
  const now = Date.now();

  const expired = evaluateSession(
    {
      token: fakeJwt({ exp: Math.floor(now / 1000) - 30 }),
      id: 'u1',
    },
    now,
  );
  assert.equal(expired.authenticated, false);
  assert.equal(expired.reason, 'token_expired');

  const invalid = evaluateSession({ token: 'not-a-jwt', id: 'u1' }, now);
  assert.equal(invalid.authenticated, false);
  assert.equal(invalid.reason, 'token_invalid');

  installLocalStorage({
    token: fakeJwt({ exp: Math.floor(now / 1000) - 5 }),
    _id: 'u1',
  });
  const storage = await import(`../src/utils/authStorage.js?expired=${now}`);
  assert.equal(storage.isAuthenticated(now), false);
  assert.equal(storage.getSessionEvaluation(now).reason, 'token_expired');
});

test('login and logout landings stay consistent with session state', async () => {
  const {
    evaluateSession,
    resolveLoginLanding,
    resolveLogoutLanding,
  } = await import('../src/utils/authSessionPolicy.js');

  const authed = evaluateSession({
    token: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 120 }),
    id: 'u1',
  });
  assert.deepEqual(resolveLoginLanding(authed), { redirectTo: '/', replace: true });
  assert.deepEqual(resolveLoginLanding(evaluateSession({})), { redirectTo: null });
  assert.deepEqual(resolveLogoutLanding(), {
    redirectTo: '/login',
    replace: true,
    clearSession: true,
  });

  installLocalStorage();
  const storage = await import(`../src/utils/authStorage.js?logout=${Date.now()}`);
  storage.saveAuthSession({
    token: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 120 }),
    id: 'u1',
    role: 'sales',
    username: 'ada',
  });
  assert.equal(storage.isAuthenticated(), true);
  storage.clearAuthSession();
  assert.equal(storage.isAuthenticated(), false);
});

test('API 401 clears session; 403 keeps session and authenticated UI', async () => {
  installLocalStorage({
    token: fakeJwt({ exp: Math.floor(Date.now() / 1000) + 600 }),
    _id: 'u1',
    role: 'sales',
    username: 'ada',
  });
  const storage = await import(`../src/utils/authStorage.js?api=${Date.now()}`);
  const redirects = [];
  const { applyApiAuthFailure } = await import('../src/utils/apiAuthFailure.js');

  const forbidden = applyApiAuthFailure({
    status: 403,
    pathname: '/analytics',
    redirect: (path) => redirects.push(path),
    clearSession: storage.clearAuthSession,
  });
  assert.equal(forbidden.clearSession, false);
  assert.equal(forbidden.keepUiAuthenticated, true);
  assert.equal(storage.isAuthenticated(), true);
  assert.deepEqual(redirects, []);

  const unauthorized = applyApiAuthFailure({
    status: 401,
    pathname: '/analytics',
    redirect: (path) => redirects.push(path),
    clearSession: storage.clearAuthSession,
  });
  assert.equal(unauthorized.clearSession, true);
  assert.equal(unauthorized.keepUiAuthenticated, false);
  assert.equal(storage.isAuthenticated(), false);
  assert.deepEqual(redirects, ['/login']);
});

test('recorded-revenue labels stay lead-stored CRM amounts, not cash collected', () => {
  const intelligence = readFileSync(join(root, 'src/analytics/IntelligenceSections.jsx'), 'utf8');
  const marketing = readFileSync(join(root, 'src/analytics/MarketingStage.jsx'), 'utf8');
  const drawer = readFileSync(join(root, 'src/analytics/LeadDrawer.jsx'), 'utf8');

  assert.match(intelligence, /Recorded revenue/);
  assert.match(intelligence, /Lead-stored CRM conversion amounts only/);
  assert.match(intelligence, /not cash collected/);
  assert.match(marketing, /Recorded revenue/);
  assert.doesNotMatch(intelligence, /collected revenue/i);
  assert.doesNotMatch(marketing, /collected revenue/i);
  assert.match(drawer, /recorded revenue/);
});

test('analytics page keeps loading, failed-fetch, and navigation affordances', () => {
  const page = readFileSync(join(root, 'src/analytics/AnalyticsPage.jsx'), 'utf8');
  assert.match(page, /summaryLoading/);
  assert.match(page, /Could not load analytics/);
  assert.match(page, /setView|useSearchParams|VIEWS/);
  assert.match(page, /\.catch\(/);
  assert.match(page, /setSummaryLoading\(true\)/);
  assert.match(page, /setSummaryLoading\(false\)/);
});

test('axios clients wire shared 401\/403 policy (no stale authenticated UI on 401)', () => {
  const axiosSrc = readFileSync(join(root, 'src/api/axios.js'), 'utf8');
  const authAxiosSrc = readFileSync(join(root, 'src/api/authAxios.js'), 'utf8');
  const wiClient = readFileSync(join(root, 'src/website-intelligence/api/client.js'), 'utf8');

  assert.match(axiosSrc, /applyApiAuthFailure/);
  assert.match(authAxiosSrc, /applyApiAuthFailure/);
  assert.match(wiClient, /applyApiAuthFailure/);
  assert.match(axiosSrc, /401/);
  assert.match(axiosSrc, /403/);
});
