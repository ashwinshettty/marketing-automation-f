import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listGoogleAdsCampaignAssets } from '../../../api/googleAdsCampaignApi';
import CampaignScopeFilters from '../../campaigns/CampaignScopeFilters';
import { formatDay } from '../../campaigns/campaignFormat';
import useCampaignScopeParams from '../../hooks/useCampaignScopeParams';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const ASSET_TABS = [
  { id: 'all', label: 'All' },
  { id: 'sitelink', label: 'Sitelinks' },
  { id: 'callout', label: 'Callouts' },
  { id: 'image', label: 'Images' },
  { id: 'call', label: 'Call' },
  { id: 'text', label: 'Headlines & descriptions' },
];

const ASSET_STATUSES = [
  { id: 'ELIGIBLE', label: 'Eligible' },
  { id: 'LIMITED', label: 'Limited' },
  { id: 'PAUSED', label: 'Paused' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'UNDER_REVIEW', label: 'Under review' },
  { id: 'NOT_ELIGIBLE', label: 'Not eligible' },
  { id: 'REMOVED', label: 'Removed' },
];

const messageOf = (error, fallback = 'Could not load assets') => {
  const data = error?.response?.data;
  return data?.message || error?.message || fallback;
};

function statusTone(label) {
  if (/paused/i.test(label)) return 'text-[#5f6368]';
  if (/not eligible|removed|disapproved/i.test(label)) return 'text-[#d93025]';
  return 'text-[var(--ga-ink)]';
}

function statusDot(label) {
  if (/paused/i.test(label)) return 'bg-[#5f6368]';
  if (/not eligible|removed|disapproved/i.test(label)) return 'bg-[#d93025]';
  return 'bg-[#188038]';
}

export default function CampaignAssetsPage() {
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
    chooseType,
    chooseRange,
    applyCustom,
  } = useCampaignScopeParams({
    defaultRange: 'LAST_30_DAYS',
    defaultType: 'all',
  });

  const tab = ASSET_TABS.some((item) => item.id === applied.type) ? applied.type : 'all';

  const [assets, setAssets] = useState([]);
  const [counts, setCounts] = useState({});
  const [statuses, setStatuses] = useState(ASSET_STATUSES);
  const [campaign, setCampaign] = useState(
    applied.campaignId ? { id: applied.campaignId, name: applied.campaignName } : null,
  );
  const [loading, setLoading] = useState(Boolean(applied.campaignId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!applied.campaignId || !/^\d+$/.test(applied.campaignId)) {
      setAssets([]);
      setCounts({});
      setCampaign(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    listGoogleAdsCampaignAssets({
      campaignId: applied.campaignId,
      type: tab,
      status: applied.status,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setAssets(data?.assets || []);
        setCounts(data?.counts || {});
        if (Array.isArray(data?.statuses) && data.statuses.length) {
          setStatuses(data.statuses);
        }
        setCampaign(data?.campaign || {
          id: applied.campaignId,
          name: applied.campaignName,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setAssets([]);
        setCounts({});
        setError(messageOf(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applied, tab]);

  const titleName = campaign?.name || applied.campaignName;
  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Assets</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {!applied.campaignId
              ? 'Select a campaign to view its assets'
              : loading
                ? 'Loading assets…'
                : `${assets.length} assets${titleName ? ` · ${titleName}` : ''}`}
            {dateLabel ? <span>{` · ${dateLabel}`}</span> : null}
          </p>
        </div>
        <CampaignScopeFilters
          campaignId={applied.campaignId}
          campaignName={titleName}
          status={applied.status}
          statuses={statuses}
          range={range}
          startDate={startDate}
          endDate={endDate}
          allLabel="All campaigns"
          onCampaign={chooseCampaign}
          onStatus={chooseStatus}
          onRange={chooseRange}
          onStart={setStartDate}
          onEnd={setEndDate}
          onApplyCustom={applyCustom}
          statusId="asset-status"
        />
      </header>

      {!applied.campaignId ? (
        <div className="rounded-xl border border-[var(--ga-border)] bg-white px-6 py-12 text-center">
          <p className="text-sm text-[var(--ga-muted)]">
            Pick a campaign above, or open one from the{' '}
            <button
              type="button"
              className="font-medium text-[var(--ga-blue)] hover:underline"
              onClick={() => navigate(`${GOOGLE_ADS_BASE}/campaigns/list`)}
            >
              Campaigns
            </button>
            {' '}
            list.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-1 border-b border-[var(--ga-border)]">
            {ASSET_TABS.map((item) => {
              const active = tab === item.id;
              const count = counts[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseType(item.id)}
                  className={`rounded-t-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'border-b-2 border-[var(--ga-blue)] font-medium text-[var(--ga-blue)]'
                      : 'text-[var(--ga-muted)] hover:text-[var(--ga-ink)]'
                  }`}
                >
                  {item.label}
                  {typeof count === 'number' ? (
                    <span className="ml-1 text-xs opacity-70">{count}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[var(--ga-muted)]">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-medium">Asset</th>
                  <th className="px-4 py-2.5 text-xs font-medium">Type</th>
                  <th className="px-4 py-2.5 text-xs font-medium">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium">Campaign</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-sm text-[var(--ga-muted)]">
                      Loading assets…
                    </td>
                  </tr>
                ) : null}
                {!loading && error ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-sm text-[#d93025]">
                      {error}
                    </td>
                  </tr>
                ) : null}
                {!loading && !error && assets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-sm text-[var(--ga-muted)]">
                      No assets match these filters.
                    </td>
                  </tr>
                ) : null}
                {!loading && !error
                  ? assets.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--ga-border)] hover:bg-[var(--ga-hover)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {row.imageUrl ? (
                            <img
                              src={row.imageUrl}
                              alt=""
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : null}
                          <span className="font-medium text-[var(--ga-blue)]">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--ga-ink)]">{row.type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 ${statusTone(row.statusLabel)}`}>
                          <span
                            className={`h-2 w-2 rounded-full ${statusDot(row.statusLabel)}`}
                            aria-hidden="true"
                          />
                          {row.statusLabel}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-[var(--ga-muted)]">
                        {row.campaignName || titleName || '—'}
                      </td>
                    </tr>
                  ))
                  : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
