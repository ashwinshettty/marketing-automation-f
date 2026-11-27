import { useEffect, useState } from 'react';
import { listMetaAdsPerformance } from '../api/metaAdsApi';
import { formatCount, formatDay, formatMoney, formatPercent } from '../googleAds/campaigns/campaignFormat';
import OverviewDateFilter from '../googleAds/overview/OverviewDateFilter';
import '../googleAds/googleAds.css';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load Meta ads';

const SORT_OPTIONS = [
  { id: 'conversions', label: 'Most conversions' },
  { id: 'ctr', label: 'Highest CTR' },
  { id: 'conversionRate', label: 'Highest conversion rate' },
  { id: 'costPerConversion', label: 'Lowest cost per conversion' },
];

const BUDGET_BANDS = [
  { id: 'all', label: 'All budgets' },
  { id: 'under_500', label: 'Under ₹500 / day' },
  { id: '500_2000', label: '₹500–₹2,000 / day' },
  { id: '2000_5000', label: '₹2,000–₹5,000 / day' },
  { id: 'over_5000', label: 'Over ₹5,000 / day' },
];

const filterControl = 'rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)]';

const MetricCell = ({ label, value }) => (
  <div className="rounded-lg border border-teal-200/70 bg-teal-50/50 px-2.5 py-2">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
    <p className="mt-0.5 text-sm font-semibold tabular-nums text-brand-navy">{value}</p>
  </div>
);

const MetaAdCard = ({ ad, rank, currencyCode }) => {
  const title = ad.adName || ad.headlines?.[0] || 'Untitled ad';
  const budgetLabel = ad.budget?.period === 'CUSTOM_PERIOD'
    ? (ad.budget?.totalAmount != null ? `${formatMoney(ad.budget.totalAmount, currencyCode)} total` : 'Lifetime budget')
    : (ad.budget?.dailyAmount != null ? `${formatMoney(ad.budget.dailyAmount, currencyCode)}/day` : '—');

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm transition hover:border-teal-500 hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-teal-100 bg-gradient-to-br from-teal-50 to-white px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
              #{rank}
            </span>
            <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[11px] font-semibold text-white">
              Meta ad
            </span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-brand-navy">{title}</h3>
          <p className="mt-1 truncate text-xs text-brand-muted">
            {ad.campaignName || 'Campaign'}
            {ad.adGroupName ? ` · ${ad.adGroupName}` : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MetricCell label="Conv." value={formatCount(ad.metrics?.conversions)} />
          <MetricCell label="CTR" value={formatPercent(ad.metrics?.ctr)} />
          <MetricCell label="Conv. rate" value={formatPercent(ad.metrics?.conversionRate)} />
          <MetricCell label="CPA" value={formatMoney(ad.metrics?.costPerConversion, currencyCode)} />
          <MetricCell label="Spend" value={formatMoney(ad.metrics?.cost, currencyCode)} />
          <MetricCell label="Clicks" value={formatCount(ad.metrics?.clicks)} />
          <MetricCell label="Impr." value={formatCount(ad.metrics?.impressions)} />
          <MetricCell label="Budget" value={budgetLabel} />
        </div>
      </div>
    </article>
  );
};

/**
 * Analytics → Campaigns: Meta Ads active ad performance cards.
 */
export default function AnalyticsMetaCreatives() {
  const [range, setRange] = useState('LAST_7_DAYS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('conversions');
  const [sortDir, setSortDir] = useState('best');
  const [budgetBand, setBudgetBand] = useState('all');
  const [applied, setApplied] = useState({
    range: 'LAST_7_DAYS',
    sortBy: 'conversions',
    sortDir: 'best',
    budgetBand: 'all',
  });

  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setAds([]);
    setHasMore(false);
    setNextOffset(0);
    listMetaAdsPerformance({
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
      sortBy: applied.sortBy,
      sortDir: applied.sortDir,
      budgetBand: applied.budgetBand,
      limit: 5,
      offset: 0,
    })
      .then((data) => {
        if (cancelled) return;
        setAds(data?.ads || []);
        setTotal(data?.total || 0);
        setNextOffset(data?.nextOffset || (data?.ads || []).length);
        setHasMore(Boolean(data?.hasMore));
        setCurrencyCode(data?.currencyCode || 'INR');
      })
      .catch((err) => {
        if (cancelled) return;
        setAds([]);
        setTotal(0);
        setHasMore(false);
        setError(messageOf(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [applied]);

  const pushApplied = (patch) => {
    setApplied((current) => ({ ...current, ...patch }));
  };

  const chooseRange = (value) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      setStartDate('');
      setEndDate('');
      pushApplied({ range: value, startDate: undefined, endDate: undefined });
    }
  };

  const applyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    pushApplied({ range: 'CUSTOM', startDate, endDate });
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    listMetaAdsPerformance({
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
      sortBy: applied.sortBy,
      sortDir: applied.sortDir,
      budgetBand: applied.budgetBand,
      limit: 5,
      offset: nextOffset,
    })
      .then((data) => {
        const next = data?.ads || [];
        setAds((current) => [...current, ...next]);
        setTotal(data?.total || 0);
        setNextOffset(data?.nextOffset || nextOffset + next.length);
        setHasMore(Boolean(data?.hasMore));
        setCurrencyCode(data?.currencyCode || 'INR');
      })
      .catch((err) => setError(messageOf(err)))
      .finally(() => setLoadingMore(false));
  };

  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;
  const sortLabel = SORT_OPTIONS.find((item) => item.id === applied.sortBy)?.label || 'Most conversions';
  const orderLabel = applied.sortDir === 'worst' ? 'Worst → best' : 'Best → worst';

  return (
    <section className="google-ads-shell min-w-0 max-w-full space-y-4">
      <div className="rounded-2xl border border-teal-200 bg-white p-4 shadow-sm sm:p-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Meta Ads</p>
            <h2 className="mt-1 text-xl font-semibold text-brand-navy">Top performing ads</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {loading
                ? 'Loading active Meta ads…'
                : `Showing ${ads.length} of ${total} active ad${total === 1 ? '' : 's'} · all campaigns`}
              {dateLabel ? ` · ${dateLabel}` : null}
              {` · ${sortLabel} · ${orderLabel}`}
            </p>
          </div>
        </header>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <OverviewDateFilter
            range={range}
            startDate={startDate}
            endDate={endDate}
            onRange={chooseRange}
            onStart={setStartDate}
            onEnd={setEndDate}
            onApply={applyCustom}
          />
          <label className="sr-only" htmlFor="meta-creatives-sort-by">Rank by</label>
          <select
            id="meta-creatives-sort-by"
            value={sortBy}
            onChange={(event) => {
              const value = event.target.value;
              setSortBy(value);
              pushApplied({ sortBy: value });
            }}
            className={filterControl}
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <div className="inline-flex overflow-hidden rounded-full border border-[var(--ga-border)] bg-white text-sm">
            {[
              { id: 'best', label: 'Best → worst' },
              { id: 'worst', label: 'Worst → best' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSortDir(item.id);
                  pushApplied({ sortDir: item.id });
                }}
                className={`px-3 py-1.5 font-medium ${
                  sortDir === item.id
                    ? 'bg-teal-700 text-white'
                    : 'text-brand-muted hover:bg-teal-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="meta-creatives-budget-band">Daily budget</label>
          <select
            id="meta-creatives-budget-band"
            value={budgetBand}
            onChange={(event) => {
              const value = event.target.value;
              setBudgetBand(value);
              pushApplied({ budgetBand: value });
            }}
            className={filterControl}
          >
            {BUDGET_BANDS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-2xl border border-teal-200 bg-teal-50/60" />
          ))}
        </div>
      ) : null}

      {!loading && !error && ads.length === 0 ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/70 px-6 py-12 text-center text-sm text-brand-muted">
          No active Meta ads match these filters for the selected date range.
        </div>
      ) : null}

      {!loading && ads.length > 0 ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ads.map((ad, index) => (
              <MetaAdCard
                key={`${ad.campaignId}-${ad.adId}`}
                ad={ad}
                rank={index + 1}
                currencyCode={currencyCode}
              />
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-h-11 rounded-full border border-teal-300 bg-white px-5 text-sm font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-60"
              >
                {loadingMore ? 'Loading…' : `Load more (${Math.min(5, total - ads.length)} more)`}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
