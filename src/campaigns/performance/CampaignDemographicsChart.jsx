import { useMemo, useState } from 'react';
import { CHART_COLORS, labelForMetric, metricByKey } from './metricCatalog';
import { formatMetricValue } from './formatPerformance';
import GroupedBarChart from './charts/GroupedBarChart';

const AGE_ORDER = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

const GENDER_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
];

const METRIC_OPTIONS = [
  { value: 'results', label: 'Results' },
  { value: 'spend', label: 'Amount spent' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'reach', label: 'Reach' },
  { value: 'clicks', label: 'Clicks' },
];

const normalizeGender = (value) => {
  const raw = String(value || '').toLowerCase();
  if (raw === 'male' || raw === 'man' || raw === 'men') return 'male';
  if (raw === 'female' || raw === 'woman' || raw === 'women') return 'female';
  return 'unknown';
};

export default function CampaignDemographicsChart({
  data,
  loading,
  error,
  onRetry,
}) {
  const [genderFilter, setGenderFilter] = useState('all');
  const [metricKey, setMetricKey] = useState('results');
  const currency = data?.currency || 'INR';
  const resultLabel = data?.resultLabel || 'Results';

  const { categories, legend } = useMemo(() => {
    const rows = data?.rows || [];
    const byAge = new Map();
    for (const age of AGE_ORDER) {
      byAge.set(age, { key: age, label: age, shortLabel: age, male: null, female: null });
    }

    const genderTotals = { male: 0, female: 0, maleSpend: 0, femaleSpend: 0 };

    for (const row of rows) {
      const age = row.age || 'unknown';
      const gender = normalizeGender(row.gender);
      if (!byAge.has(age)) {
        byAge.set(age, {
          key: age,
          label: age,
          shortLabel: age,
          male: null,
          female: null,
        });
      }
      const bucket = byAge.get(age);
      const value = row[metricKey];
      if (gender === 'male') {
        bucket.male = (bucket.male || 0) + (Number(value) || 0);
        genderTotals.male += Number(row.results) || 0;
        genderTotals.maleSpend += Number(row.spend) || 0;
      } else if (gender === 'female') {
        bucket.female = (bucket.female || 0) + (Number(value) || 0);
        genderTotals.female += Number(row.results) || 0;
        genderTotals.femaleSpend += Number(row.spend) || 0;
      }
    }

    let categories = Array.from(byAge.values());
    if (genderFilter === 'male') {
      categories = categories.map((row) => ({ ...row, female: null }));
    } else if (genderFilter === 'female') {
      categories = categories.map((row) => ({ ...row, male: null }));
    }

    const totalResults = genderTotals.male + genderTotals.female;
    const legend = [
      {
        key: 'male',
        label: 'Men',
        color: CHART_COLORS.purple,
        count: genderTotals.male || null,
        share: totalResults > 0 ? (genderTotals.male / totalResults) * 100 : null,
        costPerResult:
          genderTotals.male > 0
            ? Number((genderTotals.maleSpend / genderTotals.male).toFixed(4))
            : null,
      },
      {
        key: 'female',
        label: 'Women',
        color: CHART_COLORS.turquoise,
        count: genderTotals.female || null,
        share: totalResults > 0 ? (genderTotals.female / totalResults) * 100 : null,
        costPerResult:
          genderTotals.female > 0
            ? Number((genderTotals.femaleSpend / genderTotals.female).toFixed(4))
            : null,
      },
    ].filter((item) => {
      if (genderFilter === 'all') return true;
      return item.key === genderFilter;
    });

    return { categories, legend };
  }, [data, genderFilter, metricKey]);

  const series = [
    ...(genderFilter !== 'female'
      ? [{ key: 'male', label: 'Men', format: metricByKey(metricKey)?.format || 'count', color: CHART_COLORS.purple }]
      : []),
    ...(genderFilter !== 'male'
      ? [{ key: 'female', label: 'Women', format: metricByKey(metricKey)?.format || 'count', color: CHART_COLORS.turquoise }]
      : []),
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-brand-navy">Age and gender distribution</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={genderFilter}
            onChange={(event) => setGenderFilter(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-brand-navy"
            aria-label="Gender filter"
          >
            {GENDER_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={metricKey}
            onChange={(event) => setMetricKey(event.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-brand-navy"
            aria-label="Demographic metric"
          >
            {METRIC_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.value === 'results' ? labelForMetric('results', resultLabel) : item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-700">
          <p className="font-medium">Unable to load demographics</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="flex h-72 animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
          Loading demographics…
        </div>
      ) : (
        <>
          <GroupedBarChart categories={categories} series={series} currency={currency} />
          {legend.some((item) => item.count != null) ? (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
              {legend.map((item) => (
                <div key={item.key} className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: item.color }}
                  />
                  <span>
                    {item.label}:{' '}
                    {item.share != null
                      ? `${Math.round(item.share)}% (${formatMetricValue(item.count, 'count', currency)})`
                      : formatMetricValue(item.count, 'count', currency)}
                    {item.costPerResult != null
                      ? `; Cost per result: ${formatMetricValue(item.costPerResult, 'currency', currency)}`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
