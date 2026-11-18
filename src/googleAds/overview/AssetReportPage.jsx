import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getGoogleAdsOverview } from '../../api/googleAdsCampaignApi';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import { chartMetricById, formatChartMetric } from './chartMetrics';
import { AssetName } from './assetDisplay';

const COLUMNS = [
  { id: 'conversions', label: 'Conversions' },
  { id: 'conversionsValue', label: 'Conv. value' },
  { id: 'impressions', label: 'Impr.' },
  { id: 'clicks', label: 'Clicks' },
  { id: 'cost', label: 'Cost' },
];

const PAGE_SIZE = 10;

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load assets';

export default function AssetReportPage({ campaignId = '' }) {
  const [params] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [notices, setNotices] = useState([]);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const range = params.get('range') || 'LAST_7_DAYS';
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';
  const campaign = params.get('campaign') || 'all';

  useEffect(() => {
    let cancelled = false;
    setPage(1);
    setLoading(true);
    setError(null);
    const request = campaignId && campaignId !== 'all'
      ? { campaignId, range, startDate, endDate }
      : { campaign: campaign || 'all', range, startDate, endDate };
    getGoogleAdsOverview(request)
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data?.assetPerformance?.assets) ? data.assetPerformance.assets : []);
        setNotices(Array.isArray(data?.assetPerformance?.notices) ? data.assetPerformance.notices : []);
        setCurrencyCode(data?.currencyCode || 'INR');
      })
      .catch((err) => {
        if (!cancelled) {
          setRows([]);
          setNotices([]);
          setError(messageOf(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaign, campaignId, endDate, range, startDate]);

  const backQuery = new URLSearchParams();
  backQuery.set('range', range);
  backQuery.set('campaign', campaign);
  if (startDate) backQuery.set('startDate', startDate);
  if (endDate) backQuery.set('endDate', endDate);
  const severalCampaigns = new Set(rows.map((row) => row.campaignId)).size > 1;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);
  const from = rows.length === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, rows.length);

  return (
    <div className="px-6 py-5">
      <Link
        to={`${GOOGLE_ADS_BASE}/campaigns/overview?${backQuery}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ga-blue)]"
      >
        <span aria-hidden="true">←</span>
        Back
      </Link>
      <h1 className="mt-3 text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Asset report</h1>
      {notices.length > 0 ? (
        <p className="mt-4 rounded bg-[#fef7e0] px-4 py-2 text-sm text-[var(--ga-ink)]">
          Asset group may be limited by policy: {notices.join(', ')}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#d93025]">{error}</p> : null}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--ga-border)] bg-white">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ga-border)] text-[var(--ga-ink)]">
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Asset type</th>
              <th className="px-4 py-3 font-medium">Last updated</th>
              {COLUMNS.map((column) => (
                <th key={column.id} className="px-4 py-3 text-right font-medium">{column.label}</th>
              ))}
              <th className="px-4 py-3 font-medium">Added by</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-[var(--ga-muted)]">Loading assets</td>
              </tr>
            ) : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-[var(--ga-muted)]">No assets for this campaign.</td>
              </tr>
            ) : null}
            {!loading && visible.map((row) => (
              <tr key={row.id} className="border-b border-[var(--ga-border)]">
                <td className="px-4 py-3">
                  <AssetName row={{ ...row, showCampaign: severalCampaigns }} />
                </td>
                <td className="px-4 py-3 text-[var(--ga-ink)]">{row.level}</td>
                <td className="px-4 py-3 text-[var(--ga-blue)]">{row.statusLabel}</td>
                <td className="px-4 py-3 text-[var(--ga-ink)]">{row.assetType}</td>
                <td className="px-4 py-3 text-[var(--ga-muted)]">—</td>
                {COLUMNS.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-right tabular-nums text-[var(--ga-ink)]">
                    {formatChartMetric(chartMetricById(column.id), row.metrics?.[column.id], currencyCode)}
                  </td>
                ))}
                <td className="px-4 py-3 text-[var(--ga-ink)]">{row.addedBy || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && rows.length > 0 ? (
        <nav className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ga-ink)]">
          <p className="text-[var(--ga-muted)]">{from}–{to} of {rows.length}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ga-border)] bg-white disabled:text-[var(--ga-muted)]"
            >
              ‹
            </button>
            <label className="relative">
              <span className="sr-only">Page</span>
              <select
                aria-label="Page"
                value={currentPage}
                onChange={(event) => setPage(Number(event.target.value))}
                className="h-9 appearance-none rounded-full border border-[var(--ga-border)] bg-white pl-3 pr-8 tabular-nums"
              >
                {Array.from({ length: pageCount }, (_, index) => (
                  <option key={index + 1} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--ga-muted)]">▾</span>
            </label>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= pageCount}
              onClick={() => setPage(currentPage + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ga-border)] bg-white disabled:text-[var(--ga-muted)]"
            >
              ›
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
