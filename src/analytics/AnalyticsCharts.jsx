import { useState } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scalePoint } from '@visx/scale';
import { Bar, LinePath } from '@visx/shape';
import { formatNumber } from './format';

const panel = 'min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5';

const CRM_SERIES = [
  { key: 'leads', label: 'Leads', color: '#000080' },
  { key: 'qualified', label: 'Qualified', color: '#8a6a00' },
  { key: 'conversions', label: 'CRM conversions', color: '#047857' },
];

const Empty = ({ title, body }) => (
  <div className="flex h-56 items-center justify-center rounded-xl bg-brand-cream px-4 text-center text-sm text-brand-muted">
    <div>
      <p className="font-medium text-brand-navy">{title}</p>
      <p className="mt-1">{body}</p>
    </div>
  </div>
);

const TrendChart = ({ series, metric }) => {
  const [active, setActive] = useState(null);
  const chosen = CRM_SERIES.find((item) => item.key === metric) || CRM_SERIES[0];
  const hasData = series.points.some((point) => point[chosen.key]);
  if (!hasData) {
    return <Empty title="No values for this metric" body="Nothing was recorded in the selected dates." />;
  }

  return (
    <ParentSize>
      {({ width }) => {
        if (width < 40) return null;
        const height = 280;
        const margin = { top: 16, right: 16, bottom: 36, left: 40 };
        const max = Math.max(1, ...series.points.map((point) => point[chosen.key] || 0));
        const x = scalePoint({
          domain: series.points.map((point) => point.key),
          range: [margin.left, Math.max(margin.left + 10, width - margin.right)],
        });
        const y = scaleLinear({ domain: [0, max], range: [height - margin.bottom, margin.top], nice: true });
        const labelEvery = Math.ceil(series.points.length / 8);
        return (
          <div className="relative">
            <svg width={width} height={height} role="img" aria-label={`${chosen.label} over time`}>
              {[0, 0.5, 1].map((tick) => {
                const value = max * tick;
                const yPos = y(value);
                return (
                  <g key={tick}>
                    <line x1={margin.left} x2={width - margin.right} y1={yPos} y2={yPos} stroke="#e7e5d8" strokeWidth="1" />
                    <text x={0} y={yPos + 4} className="fill-brand-muted" fontSize="11">
                      {formatNumber(Math.round(value))}
                    </text>
                  </g>
                );
              })}
              <LinePath
                data={series.points}
                x={(point) => x(point.key) || 0}
                y={(point) => y(point[chosen.key] || 0)}
                stroke={chosen.color}
                strokeWidth={2.5}
              />
              {series.points.map((point, index) => (
                <g key={point.key}>
                  <circle cx={x(point.key) || 0} cy={y(point[chosen.key] || 0)} r="3.5" fill={chosen.color} />
                  {index % labelEvery === 0 && (
                    <text x={x(point.key) || 0} y={height - 12} textAnchor="middle" className="fill-brand-muted" fontSize="11">
                      {point.label}
                    </text>
                  )}
                  <Bar
                    x={(x(point.key) || 0) - 10}
                    y={margin.top}
                    width={20}
                    height={height - margin.top - margin.bottom}
                    fill="transparent"
                    onMouseEnter={() => setActive(point)}
                    onMouseLeave={() => setActive(null)}
                  />
                </g>
              ))}
            </svg>
            {active && (
              <div className="pointer-events-none absolute left-12 top-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-brand-navy shadow-md">
                <p className="font-semibold">{active.label}</p>
                <p className="mt-0.5">
                  {chosen.label} {formatNumber(active[chosen.key] || 0)}
                </p>
              </div>
            )}
          </div>
        );
      }}
    </ParentSize>
  );
};

const AnalyticsCharts = ({ summary, grain = '', onGrain }) => {
  const [metric, setMetric] = useState('leads');
  if (!summary) return null;

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Performance over time</h2>
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap gap-2">
          {CRM_SERIES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMetric(item.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                metric === item.key ? 'bg-brand-navy text-white' : 'border border-brand-yellow/60 bg-white text-brand-navy'
              }`}
            >
              {item.label}
            </button>
          ))}
          {onGrain && (
            <label className="flex items-center gap-2 rounded-full border border-brand-yellow/40 bg-white px-3 py-1 text-xs text-brand-muted">
              Group
              <select aria-label="Trend grouping" className="bg-transparent font-semibold text-brand-navy outline-none" value={grain} onChange={(event) => onGrain(event.target.value)}>
                <option value="">Automatic</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </label>
          )}
        </div>
      </div>
      {(summary.timeseries.undatedConversions > 0 || summary.timeseries.outsideConversions > 0) && (
        <p className="mt-2 text-xs text-brand-muted">
          {formatNumber(summary.timeseries.undatedConversions)} conversions have no date and{' '}
          {formatNumber(summary.timeseries.outsideConversions)} fall outside this chart.
        </p>
      )}
      <div className="mt-3 min-w-0 max-w-full overflow-hidden">
        <TrendChart series={summary.timeseries} metric={metric} />
      </div>
    </section>
  );
};

export default AnalyticsCharts;
