import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import { ASSET_PAGE_SIZE, AssetName } from './assetDisplay';

export default function AssetPerformanceCard({
  performance,
  campaignId = 'all',
  campaignName = 'all',
  range = 'LAST_7_DAYS',
  startDate = '',
  endDate = '',
  loading = false,
}) {
  const assets = performance?.assets || [];
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(assets.length / ASSET_PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = assets.slice(safePage * ASSET_PAGE_SIZE, safePage * ASSET_PAGE_SIZE + ASSET_PAGE_SIZE);
  const severalCampaigns = new Set(assets.map((row) => row.campaignId)).size > 1;

  useEffect(() => {
    setPage(0);
  }, [campaignId, assets]);

  const query = new URLSearchParams();
  query.set('range', range || 'LAST_7_DAYS');
  query.set('campaign', campaignName || 'all');
  if (startDate) query.set('startDate', startDate);
  if (endDate) query.set('endDate', endDate);
  const href = `${GOOGLE_ADS_BASE}/campaigns/asset-groups?${query}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <header className="flex items-center gap-2 border-b border-[var(--ga-border)] px-4 py-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--ga-muted)]" aria-hidden="true">
          <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" />
        </svg>
        <h2 className="text-sm font-medium text-[var(--ga-ink)]">Asset performance</h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ga-border)] text-[var(--ga-ink)]">
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">Asset type</th>
              <th className="px-4 py-3 font-medium">Policy status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-[var(--ga-muted)]">Loading assets</td>
              </tr>
            ) : null}
            {!loading && visible.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-[var(--ga-muted)]">No assets for this campaign.</td>
              </tr>
            ) : null}
            {!loading && visible.map((row) => (
              <tr key={row.id} className="border-b border-[var(--ga-border)] last:border-b-0">
                <td className="px-4 py-3">
                  <AssetName row={{ ...row, showCampaign: severalCampaigns }} />
                </td>
                <td className="px-4 py-3 text-[var(--ga-ink)]">{row.assetType}</td>
                <td className="px-4 py-3 text-[var(--ga-ink)]">{row.statusLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between px-4 py-3">
        <Link to={href} className="text-sm font-medium text-[var(--ga-blue)]">
          View asset report
        </Link>
        <span className="inline-flex items-center gap-2 text-sm text-[var(--ga-muted)]">
          <button
            type="button"
            aria-label="Previous assets"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="disabled:opacity-40"
          >
            ‹
          </button>
          {assets.length === 0 ? '0 / 0' : `${safePage + 1} / ${pages}`}
          <button
            type="button"
            aria-label="Next assets"
            disabled={safePage >= pages - 1}
            onClick={() => setPage(safePage + 1)}
            className="disabled:opacity-40"
          >
            ›
          </button>
        </span>
      </footer>
    </section>
  );
}
