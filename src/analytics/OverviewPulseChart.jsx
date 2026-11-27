import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scalePoint } from '@visx/scale';
import { Bar, LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { formatMoney, formatNumber, formatPercent } from './format';

const ADS_METRICS = [
  { id: 'ads-conversions', field: 'conversions', label: 'Conversions', color: '#047857', format: 'decimal', source: 'ads' },
  { id: 'ads-ctr', field: 'ctr', label: 'CTR', color: '#b45309', format: 'percent', source: 'ads' },
  { id: 'ads-clicks', field: 'clicks', label: 'Clicks', color: '#1d4ed8', format: 'count', source: 'ads' },
  { id: 'ads-impressions', field: 'impressions', label: 'Impr.', color: '#64748b', format: 'count', source: 'ads' },
  { id: 'ads-cost', field: 'cost', label: 'Spend', color: '#be123c', format: 'money', source: 'ads' },
];

const LOCATION_METRIC = { id: 'location', field: 'location', label: 'Location', color: '#0f766e', format: 'count', source: 'location' };

const formatValue = (value, format, currency = 'INR') => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  if (format === 'percent') {
    const amount = Number(value);
    // Google CTR often arrives as a ratio (0.04); CRM percents are already 0–100.
    return formatPercent(amount <= 1 ? amount * 100 : amount);
  }
  if (format === 'money') return formatMoney(value, currency);
  if (format === 'decimal') {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);
  }
  return formatNumber(value);
};

const Empty = ({ title, body }) => (
  <div className="flex h-64 items-center justify-center rounded-xl bg-brand-cream/80 px-4 text-center text-sm text-brand-muted">
    <div>
      <p className="font-medium text-brand-navy">{title}</p>
      <p className="mt-1">{body}</p>
    </div>
  </div>
);

const TrendChart = ({ points, metric, currency }) => {
  const [active, setActive] = useState(null);
  const hasData = points.some((point) => Number(point.value) > 0);
  if (!hasData) {
    return <Empty title="No values for this metric" body="Nothing was recorded in the selected dates." />;
  }

  return (
    <ParentSize>
      {({ width }) => {
        if (width < 40) return null;
        const height = 280;
        const margin = { top: 20, right: 16, bottom: 36, left: 44 };
        const max = Math.max(1, ...points.map((point) => Number(point.value) || 0));
        const x = scalePoint({
          domain: points.map((point) => point.key),
          range: [margin.left, Math.max(margin.left + 10, width - margin.right)],
          padding: 0.4,
        });
        const y = scaleLinear({
          domain: [0, max],
          range: [height - margin.bottom, margin.top],
          nice: true,
        });
        const labelEvery = Math.max(1, Math.ceil(points.length / 8));
        const areaPath = (() => {
          if (!points.length) return '';
          const line = points
            .map((point, index) => {
              const px = x(point.key) || 0;
              const py = y(point.value || 0);
              return `${index === 0 ? 'M' : 'L'}${px},${py}`;
            })
            .join(' ');
          const firstX = x(points[0].key) || 0;
          const lastX = x(points[points.length - 1].key) || 0;
          const base = height - margin.bottom;
          return `${line} L${lastX},${base} L${firstX},${base} Z`;
        })();

        return (
          <div className="relative">
            <svg width={width} height={height} role="img" aria-label={`${metric.label} over time`}>
              <defs>
                <linearGradient id={`pulse-fill-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={metric.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 0.5, 1].map((tick) => {
                const value = max * tick;
                const yPos = y(value);
                return (
                  <g key={tick}>
                    <line x1={margin.left} x2={width - margin.right} y1={yPos} y2={yPos} stroke="#efe9d4" strokeWidth="1" />
                    <text x={4} y={yPos + 4} className="fill-brand-muted" fontSize="11">
                      {formatValue(value, metric.format === 'percent' ? 'decimal' : metric.format === 'money' ? 'money' : 'count', currency)}
                    </text>
                  </g>
                );
              })}
              {areaPath ? <path d={areaPath} fill={`url(#pulse-fill-${metric.id})`} /> : null}
              <LinePath
                data={points}
                x={(point) => x(point.key) || 0}
                y={(point) => y(point.value || 0)}
                stroke={metric.color}
                strokeWidth={2.75}
                curve={curveMonotoneX}
              />
              {points.map((point, index) => (
                <g key={point.key}>
                  <circle
                    cx={x(point.key) || 0}
                    cy={y(point.value || 0)}
                    r={active?.key === point.key ? 5 : 3.5}
                    fill={metric.color}
                  />
                  {index % labelEvery === 0 && (
                    <text x={x(point.key) || 0} y={height - 12} textAnchor="middle" className="fill-brand-muted" fontSize="11">
                      {point.label}
                    </text>
                  )}
                  <Bar
                    x={(x(point.key) || 0) - 12}
                    y={margin.top}
                    width={24}
                    height={height - margin.top - margin.bottom}
                    fill="transparent"
                    onMouseEnter={() => setActive(point)}
                    onMouseLeave={() => setActive(null)}
                  />
                </g>
              ))}
            </svg>
            {active && (
              <div className="pointer-events-none absolute left-12 top-3 rounded-lg border border-brand-yellow/40 bg-white px-3 py-2 text-xs text-brand-navy shadow-md">
                <p className="font-semibold">{active.label}</p>
                <p className="mt-0.5">
                  {metric.label} {formatValue(active.value, metric.format, currency)}
                </p>
              </div>
            )}
          </div>
        );
      }}
    </ParentSize>
  );
};

const LocationBars = ({ locations = [], currency }) => {
  const [metricKey, setMetricKey] = useState('conversions');
  const locationMetrics = [
    { key: 'conversions', label: 'Conversions', format: 'decimal' },
    { key: 'ctr', label: 'CTR', format: 'percent' },
    { key: 'clicks', label: 'Clicks', format: 'count' },
    { key: 'cost', label: 'Spend', format: 'money' },
  ];
  const chosen = locationMetrics.find((item) => item.key === metricKey) || locationMetrics[0];

  const rows = useMemo(() => {
    const totals = new Map();
    for (const row of Array.isArray(locations) ? locations : []) {
      const name = row.name || row.canonicalName || '';
      if (!name) continue;
      const metrics = row.metrics || {};
      const prev = totals.get(name) || { value: 0, clicks: 0, impressions: 0 };
      const raw = Number(metrics[chosen.key] ?? row[chosen.key] ?? 0);
      const clicks = Number(metrics.clicks) || 0;
      const impressions = Number(metrics.impressions) || 0;
      totals.set(name, {
        value: Number.isFinite(raw) ? prev.value + raw : prev.value,
        clicks: prev.clicks + clicks,
        impressions: prev.impressions + impressions,
      });
    }
    return [...totals.entries()]
      .map(([name, bag]) => ({
        key: name,
        name,
        value: chosen.key === 'ctr' && bag.impressions
          ? bag.clicks / bag.impressions
          : bag.value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [locations, chosen.key]);

  if (!rows.length) {
    return <Empty title="No location performance yet" body="Google Ads location metrics will appear here when available." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {locationMetrics.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetricKey(item.key)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              metricKey === item.key ? 'bg-teal-800 text-white' : 'border border-brand-yellow/50 text-brand-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ParentSize>
        {({ width }) => {
          if (width < 40) return null;
          const height = Math.max(220, rows.length * 34 + 24);
          const margin = { top: 8, right: 72, bottom: 8, left: 108 };
          const max = Math.max(1, ...rows.map((row) => row.value));
          const y = scaleBand({
            domain: rows.map((row) => row.key),
            range: [margin.top, height - margin.bottom],
            padding: 0.28,
          });
          const x = scaleLinear({
            domain: [0, max],
            range: [margin.left, width - margin.right],
            nice: true,
          });
          return (
            <svg width={width} height={height} role="img" aria-label={`Locations by ${chosen.label}`}>
              {rows.map((row) => {
                const barWidth = Math.max(2, (x(row.value) || margin.left) - margin.left);
                return (
                  <g key={row.key}>
                    <text
                      x={margin.left - 10}
                      y={(y(row.key) || 0) + y.bandwidth() / 2 + 4}
                      textAnchor="end"
                      className="fill-brand-navy"
                      fontSize="11"
                    >
                      {row.name.length > 16 ? `${row.name.slice(0, 15)}…` : row.name}
                    </text>
                    <rect
                      x={margin.left}
                      y={y(row.key) || 0}
                      width={barWidth}
                      height={y.bandwidth()}
                      rx={6}
                      fill="#0f766e"
                      opacity={0.85}
                    />
                    <text
                      x={margin.left + barWidth + 8}
                      y={(y(row.key) || 0) + y.bandwidth() / 2 + 4}
                      className="fill-brand-muted"
                      fontSize="11"
                    >
                      {formatValue(row.value, chosen.format, currency)}
                    </text>
                  </g>
                );
              })}
            </svg>
          );
        }}
      </ParentSize>
    </div>
  );
};

export default function OverviewPulseChart({
  adsOverview,
  adsLoading = false,
  scopeLabel = 'All campaigns',
}) {
  const reduceMotion = useReducedMotion();
  const tabs = useMemo(() => [...ADS_METRICS, LOCATION_METRIC], []);
  const [metricId, setMetricId] = useState('ads-conversions');
  const metric = tabs.find((item) => item.id === metricId) || tabs[0];
  const currency = adsOverview?.currencyCode || adsOverview?.currency || 'INR';

  const adsPoints = useMemo(() => (
    (adsOverview?.series || []).map((point, index) => {
      const metrics = point.metrics || {};
      const date = point.date || `p-${index}`;
      const label = point.hour != null
        ? `${point.hour}:00`
        : String(date).slice(5);
      return {
        key: `${date}-${point.hour ?? 'd'}`,
        label,
        value: Number(metrics[metric.field]) || 0,
      };
    })
  ), [adsOverview, metric.field]);

  const locations = adsOverview?.locations?.targeted || [];
  const isLocation = metric.source === 'location';

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Pulse</p>
          <h2 className="mt-1 text-base font-semibold text-brand-navy">Performance graph</h2>
          <p className="mt-0.5 text-sm text-brand-muted">
            Google Ads only · {scopeLabel}
          </p>
        </div>
      </div>

      <div className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => {
          const active = metric.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMetricId(item.id)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'border border-brand-yellow/50 bg-white text-brand-navy hover:bg-brand-cream'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={metric.id}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-4 min-w-0"
        >
          {adsLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-brand-cream" />
          ) : isLocation ? (
            <LocationBars locations={locations} currency={currency} />
          ) : (
            <TrendChart points={adsPoints} metric={metric} currency={currency} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
