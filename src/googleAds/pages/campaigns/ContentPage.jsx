import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGoogleAdsCampaignContent } from '../../../api/googleAdsCampaignApi';
import CampaignScopeFilters, { DEFAULT_STATUSES } from '../../campaigns/CampaignScopeFilters';
import { formatCount, formatDay, formatMoney, formatPercent } from '../../campaigns/campaignFormat';
import useCampaignScopeParams from '../../hooks/useCampaignScopeParams';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load content';

export default function ContentPage() {
  const navigate = useNavigate();
  const {
    applied,
    range,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    chooseCampaign,
    chooseStatus,
    chooseRange,
    applyCustom,
  } = useCampaignScopeParams({ defaultRange: 'LAST_7_DAYS' });

  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(Boolean(applied.campaignId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applied.campaignId || !/^\d+$/.test(applied.campaignId)) {
      setRows([]);
      setTotals(null);
      setCampaign(null);
      setLoading(false);
      setError(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGoogleAdsCampaignContent({
      campaignId: applied.campaignId,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setRows(data?.content || []);
        setTotals(data?.totals || null);
        setCurrencyCode(data?.currencyCode || 'INR');
        setCampaign(data?.campaign || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(messageOf(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [applied]);

  const titleName = campaign?.name || applied.campaignName;
  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Content</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {!applied.campaignId
              ? 'Select a campaign to view content'
              : loading
                ? 'Loading content…'
                : `${rows.length} placements${titleName ? ` · ${titleName}` : ''}`}
            {dateLabel ? ` · ${dateLabel}` : null}
          </p>
        </div>
        <CampaignScopeFilters
          campaignId={applied.campaignId}
          campaignName={titleName}
          status={applied.status}
          statuses={DEFAULT_STATUSES}
          range={range}
          startDate={startDate}
          endDate={endDate}
          onCampaign={chooseCampaign}
          onStatus={chooseStatus}
          onRange={chooseRange}
          onStart={setStartDate}
          onEnd={setEndDate}
          onApplyCustom={applyCustom}
          statusId="content-status"
        />
      </header>

      {!applied.campaignId ? (
        <div className="rounded-xl border border-[var(--ga-border)] bg-white px-6 py-12 text-center text-sm text-[var(--ga-muted)]">
          Pick a campaign above, or open one from{' '}
          <button type="button" className="font-medium text-[var(--ga-blue)] hover:underline" onClick={() => navigate(`${GOOGLE_ADS_BASE}/campaigns/list`)}>
            Campaigns
          </button>
          .
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[var(--ga-muted)]">
              <tr>
                <th className="px-3 py-2.5 text-xs font-medium">Content</th>
                <th className="px-3 py-2.5 text-xs font-medium">Type</th>
                <th className="px-3 py-2.5 text-xs font-medium">Ad group</th>
                <th className="px-3 py-2.5 text-xs font-medium">Clicks</th>
                <th className="px-3 py-2.5 text-xs font-medium">Impr.</th>
                <th className="px-3 py-2.5 text-xs font-medium">CTR</th>
                <th className="px-3 py-2.5 text-xs font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 text-xs font-medium" colSpan={3}>Total</td>
                <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals?.clicks)}</td>
                <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals?.impressions)}</td>
                <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatPercent(totals?.ctr)}</td>
                <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatMoney(totals?.cost, currencyCode)}</td>
              </tr>
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-8 text-sm text-[var(--ga-muted)]">Loading content…</td></tr>
              ) : null}
              {!loading && error ? (
                <tr><td colSpan={7} className="px-3 py-8 text-sm text-[#d93025]">{error}</td></tr>
              ) : null}
              {!loading && !error && !rows.length ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-sm text-[var(--ga-muted)]">
                    You don’t have any content yet for this campaign in the selected date range.
                    Search campaigns often have none.
                  </td>
                </tr>
              ) : null}
              {!loading && !error ? rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--ga-border)] hover:bg-[var(--ga-hover)]">
                  <td className="px-3 py-2.5 font-medium text-[var(--ga-blue)]">{row.name}</td>
                  <td className="px-3 py-2.5">{row.typeLabel}</td>
                  <td className="px-3 py-2.5">{row.adGroupName || '—'}</td>
                  <td className="px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.clicks)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.impressions)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{formatPercent(row.metrics?.ctr)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{formatMoney(row.metrics?.cost, currencyCode)}</td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
