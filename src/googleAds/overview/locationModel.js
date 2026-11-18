import { chartMetricById } from './chartMetrics';

const LOCATION_METRIC_IDS = [
  'clicks',
  'impressions',
  'ctr',
  'averageCpc',
  'cost',
  'conversions',
  'conversionsValue',
  'costPerConversion',
  'conversionRate',
  'conversionValuePerCost',
];

export const LOCATION_METRICS = LOCATION_METRIC_IDS.map((id) => chartMetricById(id)).filter(Boolean);

const ADDITIVE = ['clicks', 'impressions', 'cost', 'conversions', 'conversionsValue'];

export function placeLabel(row) {
  const canonical = String(row?.canonicalName || '').trim();
  if (canonical) return canonical.replace(/,/g, ', ');
  return row?.name || 'Untitled location';
}

export function sumLocationMetrics(rows) {
  const totals = {
    clicks: 0,
    impressions: 0,
    cost: 0,
    conversions: 0,
    conversionsValue: 0,
  };
  for (const row of rows || []) {
    for (const key of ADDITIVE) {
      totals[key] += Number(row?.metrics?.[key]) || 0;
    }
  }
  const { clicks, impressions, cost, conversions, conversionsValue } = totals;
  return {
    ...totals,
    ctr: impressions ? clicks / impressions : null,
    averageCpc: clicks ? cost / clicks : null,
    conversionRate: clicks ? conversions / clicks : null,
    costPerConversion: conversions ? cost / conversions : null,
    conversionValuePerCost: cost ? conversionsValue / cost : null,
  };
}

const radiusMeters = (row) => {
  const distance = Number(row?.radius);
  if (!Number.isFinite(distance) || distance <= 0) return 20000;
  return row.radiusUnits === 'MILES' ? distance * 1609.34 : distance * 1000;
};

/**
 * One map shape per region. Cities that share a state become one highlighted area.
 * A radius target keeps its own center.
 */
export function groupLocationsForMap(rows) {
  const groups = [];
  const index = new Map();
  for (const row of rows || []) {
    const latitude = Number(row?.latitude);
    const longitude = Number(row?.longitude);
    if (row?.kind === 'PROXIMITY' && Number.isFinite(latitude) && Number.isFinite(longitude)) {
      groups.push({
        id: `prox-${row.campaignId}-${row.id}`,
        name: row.name || 'Radius',
        query: '',
        latitude,
        longitude,
        radiusMeters: radiusMeters(row),
        metrics: row.metrics || sumLocationMetrics([]),
      });
      continue;
    }
    const name = row?.parentName || row?.name || 'Location';
    const key = `${name}|${row?.countryCode || ''}`;
    let group = index.get(key);
    if (!group) {
      const countryWide = !row?.parentName && row?.targetType === 'Country';
      group = {
        id: key,
        name,
        queries: [],
        latitude: null,
        longitude: null,
        radiusMeters: countryWide ? 450000 : 150000,
        rows: [],
      };
      index.set(key, group);
      groups.push(group);
    }
    group.rows.push(row);
    [row?.name, row?.parentName, row?.parentName ? `${row.name}, ${row.parentName}` : '']
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .forEach((value) => {
        if (!group.queries.includes(value)) group.queries.push(value);
      });
    group.queries.sort((left, right) => {
      const rank = (value) => (/^\d/.test(value) ? 2 : value.includes(',') ? 1 : 0);
      return rank(left) - rank(right) || left.length - right.length;
    });
  }
  return groups.map((group) => (
    group.rows
      ? { ...group, metrics: sumLocationMetrics(group.rows) }
      : group
  ));
}
