import { formatCount, formatDecimal, formatMoney, formatPercent } from '../campaigns/campaignFormat';

/** Metrics the overview chart can plot from the account series. */
export const CHART_METRICS = [
  { id: 'clicks', label: 'Clicks', kind: 'count' },
  { id: 'impressions', label: 'Impressions', kind: 'count' },
  { id: 'ctr', label: 'CTR', kind: 'percent' },
  { id: 'averageCpc', label: 'Avg. CPC', kind: 'money' },
  { id: 'averageCpm', label: 'Avg. CPM', kind: 'money' },
  { id: 'cost', label: 'Cost', kind: 'money' },
  { id: 'conversions', label: 'Conversions', kind: 'decimal' },
  { id: 'conversionsValue', label: 'Conv. value', kind: 'money' },
  { id: 'costPerConversion', label: 'Cost / conv.', kind: 'money' },
  { id: 'conversionRate', label: 'Conv. rate', kind: 'percent' },
  { id: 'conversionValuePerCost', label: 'Conv. value / cost', kind: 'decimal' },
  { id: 'interactions', label: 'Interactions', kind: 'count' },
  { id: 'interactionRate', label: 'Interaction rate', kind: 'percent' },
  { id: 'engagements', label: 'Engagements', kind: 'count' },
  { id: 'searchImpressionShare', label: 'Search impr. share', kind: 'percent' },
  { id: 'trueviewViews', label: 'TrueView views', kind: 'count' },
  { id: 'trueviewViewRate', label: 'View rate (TrueView)', kind: 'percent' },
  { id: 'trueviewAverageCpv', label: 'Avg. CPV (TrueView)', kind: 'money' },
];

export const chartMetricById = (id) => CHART_METRICS.find((metric) => metric.id === id);

export function formatChartMetric(metric, value, currencyCode) {
  if (!metric || value == null || !Number.isFinite(Number(value))) return '—';
  if (metric.kind === 'money') return formatMoney(value, currencyCode);
  if (metric.kind === 'percent') return formatPercent(value);
  if (metric.kind === 'decimal') return formatDecimal(value);
  return formatCount(value);
}

export function seriesValue(point, metricId) {
  const value = Number(point?.metrics?.[metricId]);
  return Number.isFinite(value) ? value : 0;
}
