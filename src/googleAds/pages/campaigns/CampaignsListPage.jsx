import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { listGoogleAdsCampaigns, setGoogleAdsCampaignDelivery } from '../../../api/googleAdsCampaignApi';
import { toast } from '../../../utils/toast';
import CampaignPickerDropdown from '../../campaigns/CampaignPickerDropdown';
import CampaignSettingsDrawer from '../../campaigns/CampaignSettingsDrawer';
import CampaignsTable from '../../campaigns/CampaignsTable';
import { formatDay } from '../../campaigns/campaignFormat';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const STATUSES = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'VALIDATED', label: 'Validated' },
  { id: 'SUBMITTING', label: 'Submitting' },
  { id: 'FAILED', label: 'Failed' },
  { id: 'ELIGIBLE', label: 'Eligible' },
  { id: 'LIMITED', label: 'Limited' },
  { id: 'LEARNING', label: 'Learning' },
  { id: 'NOT_ELIGIBLE', label: 'Not eligible' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PAUSED', label: 'Paused' },
  { id: 'ENDED', label: 'Ended' },
  { id: 'MISCONFIGURED', label: 'Misconfigured' },
  { id: 'REMOVED', label: 'Removed' },
];

const RANGES = [
  { id: 'LAST_7_DAYS', label: 'Last 7 days' },
  { id: 'LAST_30_DAYS', label: 'Last 30 days' },
  { id: 'THIS_MONTH', label: 'This month' },
  { id: 'LAST_MONTH', label: 'Last month' },
  { id: 'CUSTOM', label: 'Custom' },
];

const messageOf = (error, fallback = 'Could not load campaigns') => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 429 || /429|rate.?limit|RESOURCE_EXHAUSTED/i.test(String(data?.message || error?.message || ''))) {
    return 'Google Ads is rate limiting right now. Wait a moment and try again.';
  }
  if (!error?.response && /network|failed to fetch|ECONNREFUSED/i.test(String(error?.message || ''))) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  const message = data?.message || error?.message || fallback;
  if (/Google Ads API 429/i.test(message)) {
    return 'Google Ads is rate limiting right now. Wait a moment and try again.';
  }
  return message;
};

export default function CampaignsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [range, setRange] = useState('LAST_30_DAYS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [query, setQuery] = useState(() => searchParams.get('campaign') || '');
  const [pickedCampaign, setPickedCampaign] = useState(() => ({
    id: searchParams.get('campaignId') || '',
    name: searchParams.get('campaign') || '',
  }));
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({
    range: 'LAST_30_DAYS',
    page: 1,
    query: searchParams.get('campaign') || '',
  });
  const [campaigns, setCampaigns] = useState([]);
  const [totals, setTotals] = useState(null);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [editCampaignId, setEditCampaignId] = useState('');

  const datesReversed = Boolean(startDate && endDate && startDate > endDate);
  const customReady = range === 'CUSTOM' && startDate && endDate && !datesReversed;
  const from = meta.total === 0 ? 0 : ((meta.page - 1) * meta.pageSize) + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);

  const syncCampaignParams = (id, name) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!id) {
        next.delete('campaignId');
        next.delete('campaign');
      } else {
        next.set('campaignId', id);
        next.set('campaign', name || '');
      }
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = query.trim();
      setApplied((prev) => (prev.query === next ? prev : { ...prev, query: next, page: 1 }));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const chooseCampaignName = (id, campaign) => {
    if (!id) {
      setPickedCampaign({ id: '', name: '' });
      setQuery('');
      setApplied((prev) => ({ ...prev, query: '', page: 1 }));
      syncCampaignParams('', '');
      return;
    }
    const name = campaign?.name || '';
    setPickedCampaign({ id, name });
    setQuery(name);
    setApplied((prev) => ({ ...prev, query: name, page: 1 }));
    syncCampaignParams(id, name);
  };

  const selectCampaignFromTable = (row) => {
    if (!row?.id || row.source !== 'google' || !/^\d+$/.test(String(row.id))) return;
    const params = new URLSearchParams();
    params.set('campaignId', row.id);
    params.set('campaign', row.name || '');
    params.set('range', applied.range || 'LAST_30_DAYS');
    if (applied.range === 'CUSTOM') {
      if (applied.startDate) params.set('startDate', applied.startDate);
      if (applied.endDate) params.set('endDate', applied.endDate);
    }
    navigate(`${GOOGLE_ADS_BASE}/campaigns/ad-groups?${params.toString()}`);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listGoogleAdsCampaigns(applied)
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data?.campaigns || []);
        setTotals(data?.totals || null);
        setCurrencyCode(data?.currencyCode || 'INR');
        setMeta({
          page: data?.page || 1,
          pageSize: data?.pageSize || 10,
          total: data?.total || 0,
          totalPages: data?.totalPages || 0,
        });
        setSelected(new Set());
      })
      .catch((err) => {
        if (cancelled) return;
        setCampaigns([]);
        setTotals(null);
        setMeta({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
        setError(messageOf(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied]);

  const chooseRange = (value) => {
    setRange(value);
    if (value !== 'CUSTOM') {
      setApplied((prev) => ({
        range: value,
        page: 1,
        query: prev.query,
        status: prev.status,
      }));
    }
  };

  const applyCustom = () => {
    if (!customReady) return;
    setApplied((prev) => ({
      range: 'CUSTOM',
      startDate,
      endDate,
      page: 1,
      query: prev.query,
      status: prev.status,
    }));
  };

  const chooseStatus = (value) => {
    setStatus(value);
    setApplied((prev) => ({ ...prev, status: value, page: 1 }));
  };

  const goToPage = (page) => {
    setApplied((prev) => ({ ...prev, page }));
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (
      prev.size === campaigns.length ? new Set() : new Set(campaigns.map((row) => row.id))
    ));
  };

  const refreshList = async () => {
    const data = await listGoogleAdsCampaigns(applied);
    setCampaigns(data?.campaigns || []);
    setTotals(data?.totals || null);
    setCurrencyCode(data?.currencyCode || 'INR');
    setMeta({
      page: data?.page || 1,
      pageSize: data?.pageSize || 10,
      total: data?.total || 0,
      totalPages: data?.totalPages || 0,
    });
  };

  const changeDelivery = async (row, on) => {
    const previous = campaigns;
    setBusyId(row.id);
    setCampaigns((list) => list.map((item) => (
      item.id === row.id
        ? {
          ...item,
          deliveryStatus: on ? 'ENABLED' : 'PAUSED',
          dot: on ? 'enabled' : 'paused',
        }
        : item
    )));
    try {
      await setGoogleAdsCampaignDelivery({
        campaignId: row.id,
        status: on ? 'ENABLED' : 'PAUSED',
      });
      await refreshList();
      toast.success(
        on
          ? `"${row.name}" enabled on Google Ads.`
          : `"${row.name}" paused on Google Ads.`,
      );
    } catch (err) {
      setCampaigns(previous);
      toast.error(messageOf(err) || 'Campaign status could not be updated on Google Ads.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">Campaigns</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {loading ? 'Syncing with Google Ads…' : `${meta.total} campaigns`}
            {applied.range === 'CUSTOM' && applied.startDate ? (
              <span>{` · ${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`}</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CampaignPickerDropdown
            campaignId={pickedCampaign.id}
            campaignName={pickedCampaign.name || (applied.query ? applied.query : '')}
            allowAll
            allLabel="All campaigns"
            onChange={chooseCampaignName}
          />
          <label className="sr-only" htmlFor="campaign-status">Campaign status</label>
          <select
            id="campaign-status"
            value={status}
            onChange={(event) => chooseStatus(event.target.value)}
            className="rounded-full border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)]"
          >
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="campaign-range">Date range</label>
          <select
            id="campaign-range"
            value={range}
            onChange={(event) => chooseRange(event.target.value)}
            className="rounded-full border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)]"
          >
            {RANGES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          {range === 'CUSTOM' ? (
            <>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                aria-label="Start date"
                className="rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)]"
              />
              <span className="text-sm text-[var(--ga-muted)]">to</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                aria-label="End date"
                className="rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2 text-sm text-[var(--ga-ink)]"
              />
              <button
                type="button"
                onClick={applyCustom}
                disabled={!customReady}
                className="rounded-full border border-[var(--ga-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--ga-ink)] disabled:text-[var(--ga-muted)]"
              >
                Filter
              </button>
              {datesReversed ? (
                <p className="w-full text-xs text-red-600">Start date must be on or before the end date.</p>
              ) : null}
            </>
          ) : null}
          <Link
            to={`${GOOGLE_ADS_BASE}/create/objective`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            + New campaign
          </Link>
        </div>
      </header>

      <CampaignsTable
        campaigns={campaigns}
        totals={totals}
        currencyCode={currencyCode}
        selected={selected}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onDelivery={changeDelivery}
        onSelect={selectCampaignFromTable}
        onEdit={(row) => setEditCampaignId(row.id)}
        busyId={busyId}
        loading={loading}
        error={error}
        emptyText={
          applied.query
            ? `No campaigns named “${applied.query}”.`
            : (applied.status ? 'No campaigns with that status.' : 'No campaigns in this date range.')
        }
      />

      <CampaignSettingsDrawer
        open={Boolean(editCampaignId)}
        campaignId={editCampaignId}
        onClose={() => setEditCampaignId('')}
        onSaved={() => {
          refreshList().catch((err) => {
            toast.error(messageOf(err) || 'Campaign list could not be refreshed.');
          });
        }}
      />

      <nav className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ga-ink)]">
        <p className="text-[var(--ga-muted)]">
          {meta.total ? `${from}–${to} of ${meta.total}` : '0 campaigns'}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(meta.page - 1)}
            disabled={loading || meta.page <= 1}
            className="rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 disabled:text-[var(--ga-muted)]"
          >
            Previous
          </button>
          <span className="tabular-nums text-[var(--ga-muted)]">
            {meta.totalPages ? `Page ${meta.page} of ${meta.totalPages}` : 'Page 1'}
          </span>
          <button
            type="button"
            onClick={() => goToPage(meta.page + 1)}
            disabled={loading || meta.page >= meta.totalPages}
            className="rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 disabled:text-[var(--ga-muted)]"
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}
