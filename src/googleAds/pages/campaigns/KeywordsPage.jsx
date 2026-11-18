import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGoogleAdsKeywords } from '../../../api/googleAdsCampaignApi';
import CampaignScopeFilters, { DEFAULT_STATUSES } from '../../campaigns/CampaignScopeFilters';
import { formatCount, formatDay, formatMoney, formatPercent } from '../../campaigns/campaignFormat';
import useCampaignScopeParams from '../../hooks/useCampaignScopeParams';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load keywords';

export default function KeywordsPage() {
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
    listGoogleAdsKeywords({
      campaignId: applied.campaignId,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setRows(data?.keywords || []);
        setTotals(data?.totals || null);
        setCurrencyCode(data?.currencyCode || 'INR');
        setCampaign(data?.campaign || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRows([]);
        setTotals(null);
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
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Keywords</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {!applied.campaignId
              ? 'Select a campaign to view keywords'
              : loading
                ? 'Loading keywords…'
                : `${rows.length} keywords${titleName ? ` · ${titleName}` : ''}`}
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
          statusId="keywords-status"
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
          <div className="ga-scroll max-h-[calc(100vh-14rem)] overflow-auto">
            <table className="w-max min-w-full border-separate border-spacing-0 text-left text-[13px]">
              <thead className="text-[var(--ga-muted)]">
                <tr>
                  {['Keyword', 'Match type', 'Ad group', 'Status', 'Clicks', 'Impr.', 'CTR', 'Avg. CPC', 'Cost', 'Conv.', 'Conv. rate'].map((label) => (
                    <th key={label} className="sticky top-0 z-10 bg-white px-3 py-2.5 text-xs font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 text-xs font-medium" colSpan={4}>
                    Total
                  </td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals?.clicks)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals?.impressions)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatPercent(totals?.ctr)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatMoney(totals?.averageCpc, currencyCode)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatMoney(totals?.cost, currencyCode)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals?.conversions)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatPercent(totals?.conversionRate)}</td>
                </tr>
                {loading ? (
                  <tr><td colSpan={11} className="px-3 py-8 text-sm text-[var(--ga-muted)]">Loading keywords…</td></tr>
                ) : null}
                {!loading && error ? (
                  <tr><td colSpan={11} className="px-3 py-8 text-sm text-[#d93025]">{error}</td></tr>
                ) : null}
                {!loading && !error && !rows.length ? (
                  <tr><td colSpan={11} className="px-3 py-8 text-sm text-[var(--ga-muted)]">No keywords for this campaign in the selected date range.</td></tr>
                ) : null}
                {!loading && !error ? rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--ga-hover)]">
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 font-medium text-[var(--ga-blue)]">{row.keyword}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5">{row.matchTypeLabel}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5">{row.adGroupName || '—'}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${row.deliveryStatus === 'PAUSED' ? 'bg-[#5f6368]' : 'bg-[#188038]'}`} />
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.clicks)}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.impressions)}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatPercent(row.metrics?.ctr)}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatMoney(row.metrics?.averageCpc, currencyCode)}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatMoney(row.metrics?.cost, currencyCode)}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.conversions)}</td>
                    <td className="border-t border-[var(--ga-border)] px-3 py-2.5 tabular-nums">{formatPercent(row.metrics?.conversionRate)}</td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
