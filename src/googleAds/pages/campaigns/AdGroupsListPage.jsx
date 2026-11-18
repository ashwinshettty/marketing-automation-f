import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listGoogleAdsAdGroups } from '../../../api/googleAdsCampaignApi';
import AdGroupsTable from '../../campaigns/AdGroupsTable';
import CampaignPickerDropdown from '../../campaigns/CampaignPickerDropdown';
import { formatCount, formatDay, formatMoney } from '../../campaigns/campaignFormat';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';
import OverviewDateFilter from '../../overview/OverviewDateFilter';

const messageOf = (error, fallback = 'Could not load ad groups') => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 429 || /429|rate.?limit|RESOURCE_EXHAUSTED/i.test(String(data?.message || error?.message || ''))) {
    return 'Google Ads is rate limiting right now. Wait a moment and try again.';
  }
  if (!error?.response && /network|failed to fetch|ECONNREFUSED/i.test(String(error?.message || ''))) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  return data?.message || error?.message || fallback;
};

function MetricCard({ label, value }) {
  return (
    <div className="min-w-[140px] flex-1 rounded-xl border border-[var(--ga-border)] bg-white px-4 py-3">
      <p className="text-xs text-[var(--ga-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-normal tabular-nums text-[var(--ga-ink)]">{value}</p>
    </div>
  );
}

export default function AdGroupsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCampaignId = searchParams.get('campaignId') || '';
  const urlCampaignName = searchParams.get('campaign') || '';
  const urlRange = searchParams.get('range') || 'LAST_7_DAYS';
  const urlStart = searchParams.get('startDate') || '';
  const urlEnd = searchParams.get('endDate') || '';

  const [range, setRange] = useState(urlRange);
  const [startDate, setStartDate] = useState(urlStart);
  const [endDate, setEndDate] = useState(urlEnd);
  const [applied, setApplied] = useState({
    campaignId: urlCampaignId,
    campaignName: urlCampaignName,
    range: urlRange,
    ...(urlRange === 'CUSTOM' && urlStart && urlEnd ? { startDate: urlStart, endDate: urlEnd } : {}),
  });
  const [adGroups, setAdGroups] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [campaign, setCampaign] = useState(
    urlCampaignId ? { id: urlCampaignId, name: urlCampaignName } : null,
  );
  const [loading, setLoading] = useState(Boolean(urlCampaignId));
  const [error, setError] = useState(null);

  useEffect(() => {
    const nextId = searchParams.get('campaignId') || '';
    const nextName = searchParams.get('campaign') || '';
    const nextRange = searchParams.get('range') || 'LAST_7_DAYS';
    const nextStart = searchParams.get('startDate') || '';
    const nextEnd = searchParams.get('endDate') || '';
    setRange(nextRange);
    setStartDate(nextStart);
    setEndDate(nextEnd);
    setApplied({
      campaignId: nextId,
      campaignName: nextName,
      range: nextRange,
      ...(nextRange === 'CUSTOM' && nextStart && nextEnd
        ? { startDate: nextStart, endDate: nextEnd }
        : {}),
    });
  }, [searchParams]);

  useEffect(() => {
    if (!applied.campaignId || !/^\d+$/.test(applied.campaignId)) {
      setAdGroups([]);
      setTotals(null);
      setCampaign(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    listGoogleAdsAdGroups({
      campaignId: applied.campaignId,
      range: applied.range,
      startDate: applied.startDate,
      endDate: applied.endDate,
    })
      .then((data) => {
        if (cancelled) return;
        setAdGroups(data?.adGroups || []);
        setTotals(data?.totals || null);
        setCurrencyCode(data?.currencyCode || 'INR');
        setCampaign(data?.campaign || {
          id: applied.campaignId,
          name: applied.campaignName,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setAdGroups([]);
        setTotals(null);
        setError(messageOf(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applied]);

  const writeParams = (next) => {
    const params = new URLSearchParams();
    if (next.campaignId) {
      params.set('campaignId', next.campaignId);
      if (next.campaignName) params.set('campaign', next.campaignName);
    }
    params.set('range', next.range || 'LAST_7_DAYS');
    if (next.range === 'CUSTOM') {
      if (next.startDate) params.set('startDate', next.startDate);
      if (next.endDate) params.set('endDate', next.endDate);
    }
    setSearchParams(params, { replace: true });
  };

  const chooseCampaign = (id, row) => {
    if (!id) {
      writeParams({ ...applied, campaignId: '', campaignName: '' });
      return;
    }
    writeParams({
      ...applied,
      campaignId: id,
      campaignName: row?.name || '',
    });
  };

  const chooseRange = (value) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      writeParams({
        ...applied,
        range: value,
        startDate: undefined,
        endDate: undefined,
      });
    }
  };

  const applyCustom = () => {
    if (!startDate || !endDate || startDate > endDate) return;
    writeParams({
      ...applied,
      range: 'CUSTOM',
      startDate,
      endDate,
    });
  };

  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Ad groups</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {applied.campaignId
              ? (loading ? 'Loading ad groups…' : `${adGroups.length} ad groups`)
              : 'Select a campaign to view its ad groups'}
            {dateLabel ? <span>{` · ${dateLabel}`}</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--ga-muted)]">Campaign</span>
            <CampaignPickerDropdown
              campaignId={applied.campaignId}
              campaignName={campaign?.name || applied.campaignName}
              allowAll
              allLabel="Select a campaign"
              onChange={chooseCampaign}
            />
          </div>
          <OverviewDateFilter
            range={range}
            startDate={startDate}
            endDate={endDate}
            onRange={chooseRange}
            onStart={setStartDate}
            onEnd={setEndDate}
            onApply={applyCustom}
          />
        </div>
      </header>

      {applied.campaignId ? (
        <div className="mb-4 flex flex-wrap gap-3">
          <MetricCard label="Clicks" value={loading ? '…' : formatCount(totals?.clicks)} />
          <MetricCard label="Impr." value={loading ? '…' : formatCount(totals?.impressions)} />
          <MetricCard
            label="Avg. CPC"
            value={loading ? '…' : formatMoney(totals?.averageCpc, currencyCode)}
          />
          <MetricCard
            label="Cost"
            value={loading ? '…' : formatMoney(totals?.cost, currencyCode)}
          />
        </div>
      ) : null}

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
        <AdGroupsTable
          adGroups={adGroups}
          totals={totals}
          currencyCode={currencyCode}
          loading={loading}
          error={error}
          emptyText={
            campaign?.channelType === 'PERFORMANCE_MAX'
              ? 'Performance Max campaigns use asset groups, not ad groups.'
              : 'No ad groups for this campaign in the selected date range.'
          }
        />
      )}
    </div>
  );
}
