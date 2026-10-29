import { useMemo, useState } from 'react';
import { CHART_COLORS, labelForMetric, metricByKey } from './metricCatalog';
import GroupedBarChart from './charts/GroupedBarChart';

const DEVICE_OPTIONS = [
  { value: 'all', label: 'Mobile and desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'desktop', label: 'Desktop' },
];

const PRIMARY_METRICS = [
  { value: 'reach', label: 'Reach' },
  { value: 'impressions', label: 'Impressions' },
];

const SECONDARY_METRICS = [
  { value: 'results', label: 'Results' },
  { value: 'spend', label: 'Amount spent' },
  { value: 'clicks', label: 'Clicks' },
];

const PLATFORM_SHORT = {
  audience_network: 'Audience Network',
  facebook: 'Facebook',
  instagram: 'Instagram',
  messenger: 'Messenger',
  oculus: 'Oculus',
  threads: 'Threads',
  whatsapp: 'WhatsApp',
};

const titleCase = (value) =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isMobileDevice = (value) => {
  const raw = String(value || '').toLowerCase();
  if (!raw) return true;
  if (raw === 'desktop') return false;
  return true;
};

export default function CampaignPlatformChart({
  data,
  loading,
  error,
  onRetry,
}) {
  const [metricA, setMetricA] = useState('reach');
  const [metricB, setMetricB] = useState('results');
  const [deviceType, setDeviceType] = useState('all');
  const currency = data?.currency || 'INR';
  const resultLabel = data?.resultLabel || 'Results';

  const categories = useMemo(() => {
    const rows = data?.rows || [];
    const filtered = rows.filter((row) => {
      if (deviceType === 'all') return true;
      if (!row.impressionDevice) return deviceType === 'all';
      const mobile = isMobileDevice(row.impressionDevice);
      return deviceType === 'mobile' ? mobile : !mobile;
    });

    const byPlatform = new Map();
    for (const row of filtered) {
      const key = row.publisherPlatform || row.platformPosition || 'unknown';
      if (!byPlatform.has(key)) {
        const label = PLATFORM_SHORT[key] || titleCase(key);
        byPlatform.set(key, {
          key,
          label,
          shortLabel: label.length > 8 ? `${label.slice(0, 7)}…` : label,
          reach: null,
          impressions: null,
          results: null,
          spend: null,
          clicks: null,
        });
      }
      const bucket = byPlatform.get(key);
      for (const field of ['reach', 'impressions', 'results', 'spend', 'clicks']) {
        if (row[field] != null) {
          bucket[field] = (bucket[field] || 0) + (Number(row[field]) || 0);
        }
      }
    }
    return Array.from(byPlatform.values());
  }, [data, deviceType]);

  const series = [
    {
      key: metricA,
      label: labelForMetric(metricA, resultLabel),
      format: metricByKey(metricA)?.format || 'count',
      color: CHART_COLORS.purple,
    },
    {
      key: metricB,
      label: labelForMetric(metricB, resultLabel),
      format: metricByKey(metricB)?.format || 'count',
      color: CHART_COLORS.turquoise,
    },
  ];

  const hasDeviceDimension = (data?.rows || []).some((row) => row.impressionDevice);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-brand-navy">Placement per platform</h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-sm text-brand-navy">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: CHART_COLORS.purple }}
              />
              <select
                value={metricA}
                onChange={(event) => setMetricA(event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                aria-label="Primary platform metric"
              >
                {PRIMARY_METRICS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5 text-sm text-brand-navy">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: CHART_COLORS.turquoise }}
              />
              <select
                value={metricB}
                onChange={(event) => setMetricB(event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                aria-label="Secondary platform metric"
              >
                {SECONDARY_METRICS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.value === 'results'
                      ? labelForMetric('results', resultLabel)
                      : item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-700">
            <p className="font-medium">Unable to load platform breakdown</p>
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
            Loading platforms…
          </div>
        ) : (
          <GroupedBarChart categories={categories} series={series} currency={currency} />
        )}
      </div>

      <aside className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Device type</p>
        <p className="mt-1 text-sm font-semibold text-brand-navy">
          {DEVICE_OPTIONS.find((item) => item.value === deviceType)?.label}
        </p>
        <select
          value={deviceType}
          onChange={(event) => setDeviceType(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-brand-navy"
          aria-label="Device type"
        >
          {DEVICE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {!hasDeviceDimension && deviceType !== 'all' ? (
          <p className="mt-2 text-[11px] text-amber-700">
            Device-level rows were not returned for this report. Showing platform totals only.
          </p>
        ) : null}
        <div className="mt-5">
          <p className="text-sm font-semibold text-brand-navy">About placement results</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Ad delivery is optimised to allocate your budget to the placements likely to perform
            best with your audience, based on your targeting and bid amount.
          </p>
          <a
            href="https://www.facebook.com/business/help/202918586402783"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-blue-600 hover:underline"
          >
            Learn more
          </a>
        </div>
      </aside>
    </div>
  );
}
