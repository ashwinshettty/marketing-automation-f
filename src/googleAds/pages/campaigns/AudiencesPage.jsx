import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGoogleAdsAudiences } from '../../../api/googleAdsCampaignApi';
import CampaignScopeFilters, { DEFAULT_STATUSES } from '../../campaigns/CampaignScopeFilters';
import { formatCount, formatDay, formatMoney } from '../../campaigns/campaignFormat';
import useCampaignScopeParams from '../../hooks/useCampaignScopeParams';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const messageOf = (error) => error?.response?.data?.message || error?.message || 'Could not load audiences';

function DemoBars({ title, rows, currencyCode }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.metrics?.clicks || 0)));
  return (
    <div className="rounded-xl border border-[var(--ga-border)] bg-white p-4">
      <h2 className="text-sm font-medium text-[var(--ga-ink)]">{title}</h2>
      {!rows.length ? (
        <p className="mt-6 text-sm text-[var(--ga-muted)]">No demographic data in this range.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.id}>
              <div className="mb-1 flex items-center justify-between text-xs text-[var(--ga-muted)]">
                <span>{row.label}</span>
                <span className="tabular-nums">{formatCount(row.metrics?.clicks)} clicks · {formatMoney(row.metrics?.cost, currencyCode)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e8eaed]">
                <div
                  className="h-full rounded-full bg-[var(--ga-blue)]"
                  style={{ width: `${Math.max(4, (Number(row.metrics?.clicks || 0) / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AudiencesPage() {
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

  const [segments, setSegments] = useState([]);
  const [demographics, setDemographics] = useState({ age: [], gender: [] });
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(Boolean(applied.campaignId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applied.campaignId || !/^\d+$/.test(applied.campaignId)) {
      setSegments([]);
      setDemographics({ age: [], gender: [] });
      setCampaign(null);
      setLoading(false);
      setError(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGoogleAdsAudiences({
      campaignId: applied.campaignId,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setSegments(data?.segments || []);
        setDemographics(data?.demographics || { age: [], gender: [] });
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
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Audiences</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {!applied.campaignId
              ? 'Select a campaign to view audiences'
              : loading
                ? 'Loading audiences…'
                : `${segments.length} segments${titleName ? ` · ${titleName}` : ''}`}
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
          statusId="audiences-status"
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
        <div className="space-y-4">
          {error ? <p className="text-sm text-[#d93025]">{error}</p> : null}
          <div className="rounded-xl border border-[var(--ga-border)] bg-white p-4">
            <h2 className="text-sm font-medium text-[var(--ga-ink)]">Audience segments</h2>
            {loading ? (
              <p className="mt-4 text-sm text-[var(--ga-muted)]">Loading…</p>
            ) : !segments.length ? (
              <p className="mt-4 text-sm text-[var(--ga-muted)]">No audience segments on this campaign yet.</p>
            ) : (
              <table className="mt-3 w-full text-left text-[13px]">
                <thead className="text-[var(--ga-muted)]">
                  <tr>
                    <th className="py-2 text-xs font-medium">Segment</th>
                    <th className="py-2 text-xs font-medium">Ad group</th>
                    <th className="py-2 text-xs font-medium">Clicks</th>
                    <th className="py-2 text-xs font-medium">Impr.</th>
                    <th className="py-2 text-xs font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--ga-border)]">
                      <td className="py-2 font-medium text-[var(--ga-blue)]">{row.name}</td>
                      <td className="py-2">{row.adGroupName || '—'}</td>
                      <td className="py-2 tabular-nums">{formatCount(row.metrics?.clicks)}</td>
                      <td className="py-2 tabular-nums">{formatCount(row.metrics?.impressions)}</td>
                      <td className="py-2 tabular-nums">{formatMoney(row.metrics?.cost, currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <DemoBars title="Age" rows={demographics.age || []} currencyCode={currencyCode} />
            <DemoBars title="Gender" rows={demographics.gender || []} currencyCode={currencyCode} />
          </div>
        </div>
      )}
    </div>
  );
}
