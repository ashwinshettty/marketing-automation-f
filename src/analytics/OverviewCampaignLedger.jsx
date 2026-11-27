import { motion } from 'motion/react';
import { formatMoney, formatNumber, formatPercent } from './format';

const pct = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const amount = Number(value);
  return formatPercent(amount <= 1 ? amount * 100 : amount);
};

const decimal = (value) => {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value);
};

/**
 * Compact Google Ads campaign scoreboard for Overview.
 */
export default function OverviewCampaignLedger({
  campaigns = [],
  currencyCode = 'INR',
  onSelect,
  selectedId = '',
  limit = 8,
}) {
  const ranked = [...campaigns]
    .filter((row) => row?.id && row.source !== 'local')
    .sort((a, b) => (
      (Number(b.metrics?.cost) || 0) - (Number(a.metrics?.cost) || 0)
      || (Number(b.metrics?.conversions) || 0) - (Number(a.metrics?.conversions) || 0)
    ));
  const rows = ranked.slice(0, limit);
  const maxCost = Math.max(1, ...rows.map((row) => Number(row.metrics?.cost) || 0));

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
      <header className="border-b border-brand-yellow/30 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Campaign ledger</p>
        <h2 className="mt-1 text-base font-semibold text-brand-navy">Google Ads campaigns</h2>
        <p className="mt-0.5 text-sm text-brand-muted">
          Spend, clicks, CTR, and conversions — select a row to focus the chart.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-brand-muted">
          No Google Ads campaigns in this window.
        </p>
      ) : (
        <ul className="divide-y divide-brand-yellow/20">
          {rows.map((row, index) => {
            const metrics = row.metrics || {};
            const share = Math.round(((Number(metrics.cost) || 0) / maxCost) * 100);
            const active = selectedId && String(selectedId) === String(row.id);
            return (
              <motion.li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(row.id, row)}
                  className={`relative w-full px-4 py-3.5 text-left sm:px-5 ${
                    active ? 'bg-brand-yellow-soft/50' : 'hover:bg-brand-cream'
                  }`}
                >
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 bg-brand-yellow/15"
                    style={{ width: `${share}%` }}
                    aria-hidden="true"
                  />
                  <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-navy">{row.name}</p>
                      <p className="mt-0.5 text-xs text-brand-muted">
                        {row.channelLabel || row.channelType || 'Campaign'} · {row.statusLabel || row.status || '—'}
                      </p>
                    </div>
                    <dl className="grid grid-cols-4 gap-3 text-right text-xs sm:gap-5">
                      <div>
                        <dt className="text-brand-muted">Spend</dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums text-brand-navy">
                          {formatMoney(metrics.cost, currencyCode)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-brand-muted">Clicks</dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums text-brand-navy">
                          {formatNumber(metrics.clicks)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-brand-muted">CTR</dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums text-brand-navy">
                          {pct(metrics.ctr)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-brand-muted">Conv.</dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums text-brand-navy">
                          {decimal(metrics.conversions)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <span className="sr-only">Rank {index + 1}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {ranked.length > limit ? (
        <p className="border-t border-brand-yellow/30 px-5 py-3 text-xs text-brand-muted">
          Showing top {limit} of {ranked.length} by spend.
        </p>
      ) : null}
    </section>
  );
}
