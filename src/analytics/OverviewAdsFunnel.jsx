import { formatNumber, formatPercent } from './format';

/**
 * Delivery funnel from Google Ads totals only.
 * No CRM stages. Empty stages stay blank when ads data is missing.
 */
export default function OverviewAdsFunnel({ totals, loading = false }) {
  const impressions = totals?.impressions;
  const clicks = totals?.clicks;
  const conversions = totals?.conversions;

  const hasAny = [impressions, clicks, conversions].some(
    (value) => value != null && Number.isFinite(Number(value)),
  );

  const stages = [
    {
      key: 'impressions',
      label: 'Impressions',
      value: impressions,
      rate: null,
    },
    {
      key: 'clicks',
      label: 'Clicks',
      value: clicks,
      rate: impressions ? (Number(clicks || 0) / Number(impressions)) * 100 : null,
      rateLabel: 'CTR',
    },
    {
      key: 'conversions',
      label: 'Conversions',
      value: conversions,
      rate: clicks ? (Number(conversions || 0) / Number(clicks)) * 100 : null,
      rateLabel: 'Conv. rate',
    },
  ];

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
            Lead journey & funnel velocity
          </p>
          <h2 className="mt-1 text-base font-semibold text-brand-navy">Google Ads delivery funnel</h2>
          <p className="mt-0.5 text-sm text-brand-muted">
            Impressions → clicks → conversions from the selected Google Ads scope.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stages.map((stage) => (
            <div key={stage.key} className="h-28 animate-pulse rounded-xl bg-brand-cream" />
          ))}
        </div>
      ) : !hasAny ? (
        <p className="mt-6 rounded-xl bg-brand-cream/70 px-4 py-8 text-center text-sm text-brand-muted">
          No Google Ads funnel metrics for this campaign and date range yet.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stages.map((stage, index) => (
            <article
              key={stage.key}
              className="relative rounded-xl border border-brand-yellow/40 bg-gradient-to-br from-white to-brand-cream/40 p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {index + 1}. {stage.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-brand-navy">
                {stage.value == null ? '—' : (
                  stage.key === 'conversions'
                    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(stage.value)
                    : formatNumber(stage.value)
                )}
              </p>
              <p className="mt-2 border-t border-brand-yellow/30 pt-2 text-[11px] text-brand-muted">
                {stage.rate == null
                  ? '—'
                  : `${stage.rateLabel} ${formatPercent(stage.rate)}`}
              </p>
              {index < stages.length - 1 ? (
                <span className="absolute -right-2 top-1/2 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-brand-yellow bg-white text-xs text-brand-navy sm:grid">
                  →
                </span>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
