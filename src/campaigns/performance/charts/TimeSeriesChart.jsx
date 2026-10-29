import { useState } from 'react';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scalePoint } from '@visx/scale';
import { Bar, LinePath } from '@visx/shape';
import { CHART_COLORS } from '../metricCatalog';
import { formatMetricValue } from '../formatPerformance';

const SERIES_COLORS = [CHART_COLORS.turquoise, CHART_COLORS.purple, CHART_COLORS.amber];

export default function TimeSeriesChart({
  points = [],
  series = [],
  currency = 'INR',
  emptyTitle = 'No delivery data available for this date range',
  emptyBody = 'Try another date range or wait until this campaign has delivery.',
}) {
  const [active, setActive] = useState(null);
  const usable = series.filter((item) => points.some((point) => point[item.key] != null));

  if (!points.length || !usable.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-sm text-slate-500">
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
        const height = 300;
        const margin = { top: 16, right: 16, bottom: 40, left: 48 };
        const max = Math.max(
          1,
          ...usable.flatMap((item) => points.map((point) => Number(point[item.key]) || 0)),
        );
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

        return (
          <div className="relative">
            <svg width={width} height={height} role="img" aria-label="Campaign performance over time">
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
                      strokeWidth="1"
                    />
                    <text x={8} y={yPos + 4} className="fill-slate-400" fontSize="11">
                      {formatMetricValue(value, usable[0]?.format === 'currency' ? 'currency' : 'count', currency)}
                    </text>
                  </g>
                );
              })}
              {usable.map((item, index) => (
                <LinePath
                  key={item.key}
                  data={points}
                  x={(point) => x(point.key) || 0}
                  y={(point) => y(Number(point[item.key]) || 0)}
                  stroke={item.color || SERIES_COLORS[index % SERIES_COLORS.length]}
                  strokeWidth={2.5}
                />
              ))}
              {points.map((point, pointIndex) => (
                <g key={point.key}>
                  {usable.map((item, index) => (
                    <circle
                      key={`${point.key}-${item.key}`}
                      cx={x(point.key) || 0}
                      cy={y(Number(point[item.key]) || 0)}
                      r="3.5"
                      fill={item.color || SERIES_COLORS[index % SERIES_COLORS.length]}
                    />
                  ))}
                  {pointIndex % labelEvery === 0 ? (
                    <text
                      x={x(point.key) || 0}
                      y={height - 14}
                      textAnchor="middle"
                      className="fill-slate-400"
                      fontSize="11"
                    >
                      {point.label}
                    </text>
                  ) : null}
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
            {active ? (
              <div className="pointer-events-none absolute left-14 top-3 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-brand-navy shadow-md">
                <p className="font-semibold">{active.label}</p>
                {usable.map((item, index) => (
                  <p key={item.key} className="mt-0.5 flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: item.color || SERIES_COLORS[index % SERIES_COLORS.length] }}
                    />
                    {item.label}: {formatMetricValue(active[item.key], item.format, currency)}
                  </p>
                ))}
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
