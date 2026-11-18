import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAuthHeaders, isProtectedWiUrl } from '../src/website-intelligence/api/requestAuth.js';

const API = 'http://localhost:3000';

test('website intelligence requests attach a bearer token when a session exists', () => {
  const headers = buildAuthHeaders('staff-token', { 'Content-Type': 'application/json' });
  assert.equal(headers.Authorization, 'Bearer staff-token');
  assert.equal(headers['Content-Type'], 'application/json');
});

test('website intelligence requests omit Authorization when no token is stored', () => {
  const headers = buildAuthHeaders('', { Accept: 'application/json' });
  assert.equal(Object.hasOwn(headers, 'Authorization'), false);
  assert.equal(headers.Accept, 'application/json');
});

test('audit and catalog asset URLs are protected and other URLs are not', () => {
  assert.equal(isProtectedWiUrl(`${API}/api/audits/1/screenshot`, API), true);
  assert.equal(isProtectedWiUrl(`${API}/api/catalogs/2/image`, API), true);
  assert.equal(isProtectedWiUrl(`${API}/api/health`, API), false);
  assert.equal(isProtectedWiUrl('https://example.com/api/audits/1', API), false);
  assert.equal(isProtectedWiUrl('', API), false);
});
