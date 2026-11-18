import {
  formatCount,
  formatDecimal,
  formatMoney,
  formatPercent,
} from './campaignFormat';

/** Scrollable columns, Budget through Shares. Campaign name stays outside this list. */
export const CAMPAIGN_COLUMNS = [
  { key: 'budget', label: 'Budget', align: 'left', width: 168 },
  { key: 'status', label: 'Status', align: 'left', width: 168 },
  { key: 'optimizationScore', label: 'Optimization score', align: 'left', width: 148 },
  { key: 'subtype', label: 'Campaign subtype', align: 'left', width: 132 },
  { key: 'type', label: 'Campaign type', align: 'left', width: 148 },
  { key: 'bidding', label: 'Bid strategy type', align: 'left', width: 176 },
  { key: 'conversionsValue', label: 'Conv. value', align: 'right', width: 112, metric: true },
  { key: 'trueviewAverageCpv', label: 'TrueView avg. CPV', align: 'right', width: 136, metric: true },
  { key: 'trueviewViews', label: 'TrueView views', align: 'right', width: 124, metric: true },
  { key: 'impressions', label: 'Impr.', align: 'right', width: 96, metric: true },
  { key: 'averageCpm', label: 'Avg. CPM', align: 'right', width: 112, metric: true },
  { key: 'cost', label: 'Cost', align: 'right', width: 112, metric: true },
  { key: 'conversions', label: 'Conversions', align: 'right', width: 116, metric: true },
  { key: 'conversionRate', label: 'Conv. rate', align: 'right', width: 108, metric: true },
  { key: 'costPerConversion', label: 'Cost / conv.', align: 'right', width: 120, metric: true },
  { key: 'clicks', label: 'Clicks', align: 'right', width: 88, metric: true },
  { key: 'ctr', label: 'CTR', align: 'right', width: 88, metric: true },
  { key: 'uniqueUsers', label: 'Unique users', align: 'right', width: 120, metric: true },
  { key: 'likes', label: 'Likes', align: 'right', width: 88, metric: true },
  { key: 'comments', label: 'Comments', align: 'right', width: 108, metric: true },
  { key: 'shares', label: 'Shares', align: 'right', width: 88, metric: true },
];

export function metricText(key, metrics, currencyCode) {
  const value = metrics?.[key];
  if (key === 'conversionsValue' || key === 'trueviewAverageCpv' || key === 'averageCpm' || key === 'cost' || key === 'costPerConversion') {
    return formatMoney(value, currencyCode);
  }
  if (key === 'conversionRate' || key === 'ctr') return formatPercent(value);
  if (key === 'conversions') return formatDecimal(value);
  if (key === 'likes' || key === 'comments' || key === 'shares') return '—';
  return formatCount(value);
}
