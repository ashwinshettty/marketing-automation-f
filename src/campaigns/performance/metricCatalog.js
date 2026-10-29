export const CHART_COLORS = Object.freeze({
  purple: '#7C3AED',
  turquoise: '#14B8A6',
  navy: '#000080',
  amber: '#D97706',
});

export const ACTIVITY_HISTORY_OPTIONS = Object.freeze([
  'All',
  'Account',
  'Ads',
  'Ad Sets',
  'Audience',
  'Bid',
  'Budget',
  'Campaigns',
  'Schedule',
  'Run Status',
  'Targeting',
]);

export const INTERVAL_OPTIONS = Object.freeze([
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]);

export const DATE_RANGE_PRESETS = Object.freeze([
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7-days', label: 'Last 7 days' },
  { value: '30-days', label: 'Last 30 days' },
  { value: 'this-month', label: 'This month' },
  { value: 'last-month', label: 'Last month' },
  { value: 'custom', label: 'Custom' },
]);

export const METRIC_CATALOG = Object.freeze([
  {
    key: 'results',
    label: 'Results',
    format: 'count',
    cumulative: false,
    overview: true,
    defaultSelected: true,
  },
  {
    key: 'spend',
    label: 'Amount spent',
    format: 'currency',
    cumulative: false,
    overview: true,
    defaultSelected: true,
  },
  {
    key: 'costPerResult',
    label: 'Cost per result',
    format: 'currency',
    cumulative: false,
    overview: true,
    defaultSelected: true,
  },
  {
    key: 'resultsCumulative',
    label: 'Results (cumulative)',
    format: 'count',
    cumulative: true,
    overview: true,
  },
  {
    key: 'reach',
    label: 'Reach',
    format: 'count',
    cumulative: false,
    overview: true,
    platform: true,
  },
  {
    key: 'reachCumulative',
    label: 'Reach (cumulative)',
    format: 'count',
    cumulative: true,
    overview: true,
  },
  {
    key: 'spendCumulative',
    label: 'Amount spent (cumulative)',
    format: 'currency',
    cumulative: true,
    overview: true,
  },
  {
    key: 'impressions',
    label: 'Impressions',
    format: 'count',
    cumulative: false,
    platform: true,
  },
]);

export const DEFAULT_METRIC_KEYS = METRIC_CATALOG
  .filter((item) => item.defaultSelected)
  .map((item) => item.key);

export const metricByKey = (key) => METRIC_CATALOG.find((item) => item.key === key);

export const labelForMetric = (key, resultLabel) => {
  if (key === 'results' || key === 'resultsCumulative') {
    return key === 'resultsCumulative'
      ? `${resultLabel || 'Results'} (cumulative)`
      : (resultLabel || 'Results');
  }
  if (key === 'costPerResult') {
    const base = resultLabel || 'result';
    const singular = base.endsWith('s') ? base.slice(0, -1) : base;
    return `Cost per ${singular.toLowerCase()}`;
  }
  return metricByKey(key)?.label || key;
};
