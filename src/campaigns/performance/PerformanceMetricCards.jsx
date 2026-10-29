import { CHART_COLORS, labelForMetric, metricByKey } from './metricCatalog';
import { formatMetricValue } from './formatPerformance';

const CARD_COLORS = [CHART_COLORS.turquoise, CHART_COLORS.purple, CHART_COLORS.amber];

export default function PerformanceMetricCards({
  selectedMetrics = [],
  totals = {},
  resultLabel,
  currency = 'INR',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-8 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {selectedMetrics.slice(0, 3).map((key, index) => {
        const metric = metricByKey(key);
        const label = labelForMetric(key, resultLabel);
        const value = totals?.[key];
        return (
          <div
            key={key}
            className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: CARD_COLORS[index % CARD_COLORS.length] }}
              />
              {label}
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-brand-navy">
              {formatMetricValue(value, metric?.format || 'count', currency)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
