import { CHART_COLORS, labelForMetric, metricByKey } from './metricCatalog';
import { formatDisplayDate } from './formatPerformance';
import PerformanceFilters from './PerformanceFilters';
import PerformanceMetricCards from './PerformanceMetricCards';
import TimeSeriesChart from './charts/TimeSeriesChart';

const SERIES_COLORS = [CHART_COLORS.turquoise, CHART_COLORS.purple, CHART_COLORS.amber];

export default function PerformanceOverview({
  rangePreset,
  startDate,
  endDate,
  interval,
  activityHistory,
  selectedMetrics,
  overview,
  overviewPoints,
  loading,
  error,
  onPreset,
  onCustomDates,
  onInterval,
  onActivityHistory,
  onCustomise,
  onRetry,
}) {
  const currency = overview?.currency || 'INR';
  const resultLabel = overview?.resultLabel || 'Results';
  const totals = {
    ...(overview?.totals || {}),
  };

  if (overviewPoints?.length) {
    const last = overviewPoints[overviewPoints.length - 1];
    totals.resultsCumulative = last.resultsCumulative;
    totals.reachCumulative = last.reachCumulative;
    totals.spendCumulative = last.spendCumulative;
  }

  const series = selectedMetrics.slice(0, 3).map((key, index) => ({
    key,
    label: labelForMetric(key, resultLabel),
    format: metricByKey(key)?.format || 'count',
    color: SERIES_COLORS[index % SERIES_COLORS.length],
  }));

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Performance overview</h2>
          {overview?.fetchedAt ? (
            <p className="mt-0.5 text-xs text-slate-500">
              Last updated {formatDisplayDate(overview.fetchedAt.slice(0, 10))}{' '}
              {new Date(overview.fetchedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {overview.timeZone ? ` · ${overview.timeZone}` : ''}
            </p>
          ) : null}
        </div>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
          >
            Retry
          </button>
        ) : null}
      </div>

      <PerformanceFilters
        rangePreset={rangePreset}
        startDate={startDate}
        endDate={endDate}
        interval={interval}
        activityHistory={activityHistory}
        onPreset={onPreset}
        onCustomDates={onCustomDates}
        onInterval={onInterval}
        onActivityHistory={onActivityHistory}
        onCustomise={onCustomise}
        activityHistoryAvailable={Boolean(overview?.activityHistoryAvailable)}
      />

      <div className="mt-5">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-700">
            <p className="font-medium">Unable to load campaign performance</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <PerformanceMetricCards
              selectedMetrics={selectedMetrics}
              totals={totals}
              resultLabel={resultLabel}
              currency={currency}
              loading={loading}
            />
            <div className="mt-5">
              {loading ? (
                <div className="flex h-64 animate-pulse items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                  Loading chart…
                </div>
              ) : (
                <TimeSeriesChart
                  points={overviewPoints}
                  series={series}
                  currency={currency}
                />
              )}
              {!overview?.activityHistoryAvailable ? (
                <p className="mt-2 text-xs text-slate-400">
                  Historical edits are not shown — no verified activity-history data source is connected.
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
