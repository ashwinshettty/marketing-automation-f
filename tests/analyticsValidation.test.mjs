/**
 * Phase 3 — Analytics Validation (frontend presentation contracts).
 * No Seedance / Ads architecture changes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatMoney,
  metricChange,
  metricValue,
} from '../src/analytics/format.js';
import { RECORDED_REVENUE_COPY } from '../src/utils/authSessionPolicy.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('metricValue / formatMoney handle missing, zero, mixed, and unavailable revenue', () => {
  assert.equal(metricValue({ state: 'unavailable', value: null }), '—');
  assert.equal(metricValue({ state: 'mixed', value: null }), 'Mixed');
  assert.equal(metricValue({ state: 'available', value: 0, unit: 'currency', currency: 'INR' }), formatMoney(0, 'INR'));
  assert.equal(metricValue({ state: 'available', value: 1500, unit: 'currency', currency: 'INR' }), formatMoney(1500, 'INR'));
  assert.equal(formatMoney(null, 'INR'), '—');
  assert.match(metricChange({ state: 'mixed', reason: 'Recorded revenue uses more than one currency' }), /currency|Mixed|Recorded/i);
});

test('recorded-revenue copy contract forbids collected-cash wording', () => {
  assert.equal(RECORDED_REVENUE_COPY.label, 'Recorded revenue');
  for (const phrase of RECORDED_REVENUE_COPY.mustInclude) {
    assert.ok(phrase.length > 0);
  }
  assert.ok(RECORDED_REVENUE_COPY.mustNotInclude.includes('collected revenue'));

  const intelligence = readFileSync(join(root, 'src/analytics/IntelligenceSections.jsx'), 'utf8');
  const marketing = readFileSync(join(root, 'src/analytics/MarketingStage.jsx'), 'utf8');
  const drawer = readFileSync(join(root, 'src/analytics/LeadDrawer.jsx'), 'utf8');
  const page = readFileSync(join(root, 'src/analytics/AnalyticsPage.jsx'), 'utf8');

  assert.match(intelligence, new RegExp(RECORDED_REVENUE_COPY.label));
  for (const phrase of RECORDED_REVENUE_COPY.mustInclude) {
    assert.match(intelligence, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
  for (const banned of RECORDED_REVENUE_COPY.mustNotInclude) {
    assert.doesNotMatch(intelligence, new RegExp(banned, 'i'));
    assert.doesNotMatch(marketing, new RegExp(banned, 'i'));
    assert.doesNotMatch(page, new RegExp(banned, 'i'));
  }
  assert.match(marketing, /Recorded revenue/);
  assert.match(drawer, /recorded revenue/);
  assert.match(page, /analytics-definitions/);
});

test('charts label CRM conversions (not platform cash) and empty states', () => {
  const charts = readFileSync(join(root, 'src/analytics/AnalyticsCharts.jsx'), 'utf8');
  assert.match(charts, /CRM conversions/);
  assert.match(charts, /No values for this metric/);
  assert.match(charts, /Nothing was recorded in the selected dates/);
  assert.doesNotMatch(charts, /collected revenue/i);
  assert.doesNotMatch(charts, /cash collected/i);
});

test('KPI grid and page keep loading, blank, and error affordances', () => {
  const kpi = readFileSync(join(root, 'src/analytics/KpiGrid.jsx'), 'utf8');
  const page = readFileSync(join(root, 'src/analytics/AnalyticsPage.jsx'), 'utf8');
  assert.match(kpi, /loading/);
  assert.match(kpi, /animate-pulse/);
  assert.match(kpi, /Not connected|blankNote|metric\?\.reason/);
  assert.match(page, /summaryLoading/);
  assert.match(page, /summaryError/);
  assert.match(page, /Could not load analytics/);
  assert.match(page, /setSummaryLoading\(false\)/);
});

test('analytics API client hits authenticated summary/leads endpoints', () => {
  const api = readFileSync(join(root, 'src/api/analyticsApi.js'), 'utf8');
  assert.match(api, /\/analytics\/summary/);
  assert.match(api, /\/analytics\/leads/);
  assert.match(api, /authApi\.get/);
});
