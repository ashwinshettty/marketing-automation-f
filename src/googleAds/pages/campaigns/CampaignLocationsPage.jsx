import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGoogleAdsCampaignLocations } from '../../../api/googleAdsCampaignApi';
import CampaignScopeFilters, { DEFAULT_STATUSES } from '../../campaigns/CampaignScopeFilters';
import { formatCount, formatDay, formatMoney, formatPercent } from '../../campaigns/campaignFormat';
import useCampaignScopeParams from '../../hooks/useCampaignScopeParams';
import { placeLabel, sumLocationMetrics } from '../../overview/locationModel';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load locations';

export default function CampaignLocationsPage() {
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

  const [tab, setTab] = useState('targeted');
  const [targeted, setTargeted] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(Boolean(applied.campaignId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applied.campaignId || !/^\d+$/.test(applied.campaignId)) {
      setTargeted([]);
      setExcluded([]);
      setCampaign(null);
      setLoading(false);
      setError(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGoogleAdsCampaignLocations({
      campaignId: applied.campaignId,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setTargeted(data?.targeted || []);
        setExcluded(data?.excluded || []);
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

  const rows = tab === 'excluded' ? excluded : targeted;
  const totals = useMemo(() => sumLocationMetrics(rows), [rows]);
  const titleName = campaign?.name || applied.campaignName;
  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Locations</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {!applied.campaignId
              ? 'Select a campaign to view locations'
              : loading
                ? 'Loading locations…'
                : `${rows.length} locations${titleName ? ` · ${titleName}` : ''}`}
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
          statusId="locations-status"
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
        <>
          <div className="mb-4 flex gap-1 border-b border-[var(--ga-border)]">
            {[
              { id: 'targeted', label: 'Locations' },
              { id: 'excluded', label: 'Location exclusions' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-t-lg px-3 py-2 text-sm ${tab === item.id ? 'border-b-2 border-[var(--ga-blue)] font-medium text-[var(--ga-blue)]' : 'text-[var(--ga-muted)]'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {error ? <p className="mb-3 text-sm text-[#d93025]">{error}</p> : null}
          <div className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[var(--ga-muted)]">
                <tr>
                  <th className="px-3 py-2.5 text-xs font-medium">{tab === 'excluded' ? 'Excluded location' : 'Targeted location'}</th>
                  <th className="px-3 py-2.5 text-xs font-medium">Clicks</th>
                  <th className="px-3 py-2.5 text-xs font-medium">Impr.</th>
                  <th className="px-3 py-2.5 text-xs font-medium">CTR</th>
                  <th className="px-3 py-2.5 text-xs font-medium">Avg. CPC</th>
                  <th className="px-3 py-2.5 text-xs font-medium">Cost</th>
                  <th className="px-3 py-2.5 text-xs font-medium">Conv.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 text-xs font-medium">Total</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals.clicks)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals.impressions)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatPercent(totals.ctr)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatMoney(totals.averageCpc, currencyCode)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatMoney(totals.cost, currencyCode)}</td>
                  <td className="border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)]">{formatCount(totals.conversions)}</td>
                </tr>
                {loading ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-sm text-[var(--ga-muted)]">Loading locations…</td></tr>
                ) : null}
                {!loading && !rows.length ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-sm text-[var(--ga-muted)]">No locations in this view.</td></tr>
                ) : null}
                {!loading ? rows.map((row) => (
                  <tr key={`${row.id}-${row.campaignId}`} className="border-t border-[var(--ga-border)] hover:bg-[var(--ga-hover)]">
                    <td className="px-3 py-2.5 font-medium text-[var(--ga-blue)]">
                      {placeLabel(row)}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.clicks)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.impressions)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatPercent(row.metrics?.ctr)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatMoney(row.metrics?.averageCpc, currencyCode)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatMoney(row.metrics?.cost, currencyCode)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{formatCount(row.metrics?.conversions)}</td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
