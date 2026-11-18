import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function installLocalStorage() {
  const store = new Map();
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

test('auth session save/get/clear and isAuthenticated gate', async () => {
  installLocalStorage();
  const {
    saveAuthSession,
    getAuthSession,
    clearAuthSession,
    isAuthenticated,
  } = await import('../src/utils/authStorage.js');

  assert.equal(isAuthenticated(), false);

  const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
  saveAuthSession({
    token,
    id: 'user-1',
    role: 'sales',
    username: 'ada',
  });

  assert.deepEqual(getAuthSession(), {
    token,
    _id: 'user-1',
    role: 'sales',
    username: 'ada',
  });
  assert.equal(isAuthenticated(), true);

  clearAuthSession();
  assert.equal(isAuthenticated(), false);
  assert.deepEqual(getAuthSession(), {
    token: null,
    _id: null,
    role: null,
    username: null,
  });
});

test('token alone is not enough to be authenticated', async () => {
  installLocalStorage();
  const { saveAuthSession, isAuthenticated } = await import('../src/utils/authStorage.js');
  saveAuthSession({ token: 'only-token' });
  assert.equal(isAuthenticated(), false);
});

test('ProtectedRoute redirects unauthenticated users to /login', () => {
  const source = readFileSync(join(root, 'src/components/ProtectedRoute.jsx'), 'utf8');
  assert.match(source, /resolveProtectedAccess/);
  assert.match(source, /getSessionEvaluation/);
  assert.match(source, /Navigate\s+to=\{access\.redirectTo\}/);
});

test('analytics UI labels revenue as recorded CRM amounts, not collected cash', () => {
  const intelligence = readFileSync(join(root, 'src/analytics/IntelligenceSections.jsx'), 'utf8');
  const marketing = readFileSync(join(root, 'src/analytics/MarketingStage.jsx'), 'utf8');
  const drawer = readFileSync(join(root, 'src/analytics/LeadDrawer.jsx'), 'utf8');

  assert.match(intelligence, /Recorded revenue/);
  assert.match(intelligence, /Lead-stored CRM conversion amounts only/);
  assert.match(intelligence, /not cash collected/);
  assert.match(intelligence, /Platform conversion value is not added to CRM revenue/);
  assert.match(marketing, /Recorded revenue/);
  assert.doesNotMatch(intelligence, /collected revenue/i);
  assert.doesNotMatch(marketing, /collected revenue/i);
  assert.match(drawer, /recorded revenue/);
});
