import { useState } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { CHART_COLORS } from '../metricCatalog';
import { formatMetricValue } from '../formatPerformance';

const SERIES_COLORS = [CHART_COLORS.purple, CHART_COLORS.turquoise];

export default function GroupedBarChart({
  categories = [],
  series = [],
  currency = 'INR',
  emptyTitle = 'No breakdown data for this date range',
  emptyBody = 'Meta did not return rows for the selected filters.',
}) {
  const [active, setActive] = useState(null);
  const usable = series.filter((item) =>
    categories.some((category) => category[item.key] != null),
  );

  if (!categories.length || !usable.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm text-slate-500">
        <div>
          <p className="font-medium text-brand-navy">{emptyTitle}</p>
          <p className="mt-1">{emptyBody}</p>
        </div>
      </div>
    );
  }

  return (
    <ParentSize>
      {({ width }) => {
        if (width < 40) return null;
        const height = 320;
        const margin = { top: 16, right: 16, bottom: 56, left: 48 };
        const max = Math.max(
          1,
          ...usable.flatMap((item) => categories.map((row) => Number(row[item.key]) || 0)),
        );
        const x0 = scaleBand({
          domain: categories.map((row) => row.key),
          range: [margin.left, Math.max(margin.left + 10, width - margin.right)],
          padding: 0.25,
        });
        const x1 = scaleBand({
          domain: usable.map((item) => item.key),
          range: [0, x0.bandwidth()],
          padding: 0.15,
        });
        const y = scaleLinear({
          domain: [0, max],
          range: [height - margin.bottom, margin.top],
          nice: true,
        });

        return (
          <div className="relative">
            <svg width={width} height={height} role="img" aria-label="Grouped performance chart">
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const value = max * tick;
                const yPos = y(value);
                return (
                  <g key={tick}>
                    <line
                      x1={margin.left}
                      x2={width - margin.right}
                      y1={yPos}
                      y2={yPos}
                      stroke="#e5e7eb"
                    />
                    <text x={8} y={yPos + 4} className="fill-slate-400" fontSize="11">
                      {formatMetricValue(value, usable[0]?.format === 'currency' ? 'currency' : 'count', currency)}
                    </text>
                  </g>
                );
              })}
              {categories.map((row) => (
                <g key={row.key} transform={`translate(${x0(row.key) || 0},0)`}>
                  {usable.map((item, index) => {
                    const value = Number(row[item.key]) || 0;
                    const barHeight = Math.max(0, height - margin.bottom - y(value));
                    return (
                      <Bar
                        key={item.key}
                        x={x1(item.key) || 0}
                        y={y(value)}
                        width={x1.bandwidth()}
                        height={barHeight}
                        fill={item.color || SERIES_COLORS[index % SERIES_COLORS.length]}
                        rx={2}
                        onMouseEnter={() => setActive({ ...row, metric: item })}
                        onMouseLeave={() => setActive(null)}
                      />
                    );
                  })}
                  <text
                    x={x0.bandwidth() / 2}
                    y={height - 28}
                    textAnchor="middle"
                    className="fill-slate-500"
                    fontSize="11"
                  >
                    {row.shortLabel || row.label}
                  </text>
                </g>
              ))}
            </svg>
            {active ? (
              <div className="pointer-events-none absolute left-14 top-3 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-brand-navy shadow-md">
                <p className="font-semibold">{active.label}</p>
                <p className="mt-0.5">
                  {active.metric.label}:{' '}
                  {formatMetricValue(active[active.metric.key], active.metric.format, currency)}
                </p>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
              {usable.map((item, index) => (
                <span key={item.key} className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: item.color || SERIES_COLORS[index % SERIES_COLORS.length] }}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        );
      }}
    </ParentSize>
  );
}
