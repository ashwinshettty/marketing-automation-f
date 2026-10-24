import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchAnalyticsExport,
  fetchAnalyticsLeads,
  fetchAnalyticsSummary,
  startAnalyticsExport,
} from '../api/analyticsApi';
import { fetchCounsellors } from '../api/lookupApi';
import { toast } from '../utils/toast';
import { PRESETS, formatNumber } from './format';
import ActionCenter from './ActionCenter';
import AnalyticsCharts from './AnalyticsCharts';
import AnalyticsLeadTable from './AnalyticsLeadTable';
import FunnelSection from './FunnelSection';
import IntelligenceSections from './IntelligenceSections';
import KpiGrid from './KpiGrid';
import LeadDrawer from './LeadDrawer';
import MarketingStage from './MarketingStage';
import PerformanceTables, { ChannelBreakdown } from './PerformanceTables';

const VIEWS = [
  ['overview', 'Overview'],
  ['campaigns', 'Campaigns'],
  ['leads', 'Leads'],
  ['places', 'Places'],
  ['creatives', 'Creatives'],
];

const EMPTY_TABLE = {
  search: '',
  stage: '',
  qualification: '',
  converted: '',
  noFollowUp: '',
  missingAttribution: '',
  sort: 'createdAt',
  direction: 'desc',
  page: 1,
};

const Glyph = ({ children, className = 'h-4 w-4 text-brand-muted' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Chevron = () => (
  <Glyph>
    <path d="m6 9 6 6 6-6" />
  </Glyph>
);

const FilterMenu = ({ label, display, icon, children, className = '', ...selectProps }) => (
  <label className={`relative flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-brand-yellow/40 bg-white px-3 py-2 text-sm text-brand-navy hover:border-brand-yellow ${className}`}>
    {icon}
    {label ? <span className="font-normal text-brand-muted">{label}</span> : null}
    <span className="max-w-[12rem] truncate font-medium">{display}</span>
    <Chevron />
    <select {...selectProps} className="absolute inset-0 cursor-pointer opacity-0">
      {children}
    </select>
  </label>
);

const PLATFORM_LABELS = {
  all: 'All',
  meta: 'Meta Ads',
  google: 'Google Ads',
};

const AnalyticsPage = () => {
  const [params, setParams] = useSearchParams();
  const initialView = params.get('view');
  const [preset, setPreset] = useState(params.get('preset') || 'last_30');
  const [from, setFrom] = useState(params.get('from') || '');
  const [to, setTo] = useState(params.get('to') || '');
  const [platform, setPlatform] = useState(() => {
    const value = params.get('platform');
    return value === 'meta' || value === 'google' ? value : 'all';
  });
  const [campaign, setCampaign] = useState(params.get('campaign') || '');
  const [ownerId, setOwnerId] = useState(params.get('owner') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [grain, setGrain] = useState(params.get('grain') || '');
  const [view, setView] = useState(VIEWS.some(([id]) => id === initialView) ? initialView : 'overview');
  const [owners, setOwners] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [tableFilters, setTableFilters] = useState(EMPTY_TABLE);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState('');
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 1279px)').matches);

  useEffect(() => {
    fetchCounsellors().then(setOwners).catch(() => setOwners([]));
  }, []);

  useEffect(() => {
    const onOpen = (event) => {
      if (VIEWS.some(([id]) => id === event.detail)) setView(event.detail);
    };
    const onFilters = () => setFiltersOpen((open) => !open);
    const media = window.matchMedia('(max-width: 1279px)');
    const onMedia = () => setNarrow(media.matches);
    media.addEventListener('change', onMedia);
    window.addEventListener('analytics-open-view', onOpen);
    window.addEventListener('analytics-toggle-filters', onFilters);
    return () => {
      window.removeEventListener('analytics-open-view', onOpen);
      window.removeEventListener('analytics-toggle-filters', onFilters);
      media.removeEventListener('change', onMedia);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('analytics-filters-state', { detail: filtersOpen }));
  }, [filtersOpen]);

  const globalParams = useMemo(() => {
    const next = { preset, platform, campaign, ownerId, location };
    if (grain) next.grain = grain;
    if (preset === 'custom') {
      next.from = from;
      next.to = to;
    }
    return next;
  }, [preset, from, to, platform, campaign, ownerId, location, grain]);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set('preset', preset);
    if (platform !== 'all') next.set('platform', platform);
    if (campaign) next.set('campaign', campaign);
    if (ownerId) next.set('owner', ownerId);
    if (location) next.set('location', location);
    if (grain) next.set('grain', grain);
    if (preset === 'custom') {
      if (from) next.set('from', from);
      if (to) next.set('to', to);
    }
    if (view !== 'overview') next.set('view', view);
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [preset, from, to, platform, campaign, ownerId, location, grain, view, params, setParams]);

  const customReady = preset !== 'custom' || (from && to);

  useEffect(() => {
    if (!customReady) return undefined;
    const controller = new AbortController();
    setSummaryLoading(true);
    setSummaryError('');
    fetchAnalyticsSummary(globalParams)
      .then((data) => {
        if (!controller.signal.aborted) setSummary(data);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSummary(null);
        setSummaryError(error.message || 'Could not load analytics');
      })
      .finally(() => {
        if (!controller.signal.aborted) setSummaryLoading(false);
      });
    return () => controller.abort();
  }, [globalParams, customReady, reloadKey]);

  useEffect(() => {
    if (!customReady) return undefined;
    const controller = new AbortController();
    setTableLoading(true);
    setTableError('');
    fetchAnalyticsLeads({ ...globalParams, ...tableFilters, limit: 25 }, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setLeads(data.leads || []);
        setPagination(data.pagination);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setLeads([]);
        setTableError(error.message || 'Could not load leads');
      })
      .finally(() => {
        if (!controller.signal.aborted) setTableLoading(false);
      });
    return () => controller.abort();
  }, [globalParams, tableFilters, customReady, reloadKey]);

  const onTableChange = useCallback((patch) => {
    setTableFilters((current) => ({ ...current, ...patch }));
  }, []);

  const downloadExport = async (kind) => {
    setExporting(true);
    try {
      const started = await startAnalyticsExport({ ...globalParams, ...tableFilters, kind });
      const payload = typeof started.data === 'string' ? JSON.parse(started.data) : started.data;
      if (!payload?.jobId) throw new Error(payload?.message || 'Export did not start');
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const file = await fetchAnalyticsExport(payload.jobId);
        const type = file.headers?.['content-type'] || '';
        if (file.status === 200 && type.includes('csv')) {
          const blob = new Blob([file.data], { type: 'text/csv;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const match = /filename="([^"]+)"/.exec(file.headers?.['content-disposition'] || '');
          link.href = url;
          link.download = match?.[1] || `${kind}.csv`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Export downloaded');
          return;
        }
        if (file.status >= 400) {
          const body = typeof file.data === 'string' ? JSON.parse(file.data) : file.data;
          throw new Error(body?.message || 'Export failed');
        }
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }
      throw new Error('The export is still running. Try a shorter date range.');
    } catch (error) {
      toast.error(error.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setPreset('last_30');
    setFrom('');
    setTo('');
    setPlatform('all');
    setCampaign('');
    setOwnerId('');
    setLocation('');
    setGrain('');
    setTableFilters(EMPTY_TABLE);
  };

  const openStage = (move) => {
    if (!move) return;
    if (move.go === 'city' && move.city) {
      setLocation(move.city);
      return;
    }
    if (move.go === 'attribution') {
      setTableFilters((current) => ({ ...current, missingAttribution: 'yes', page: 1 }));
      setView('leads');
      return;
    }
    if (move.go === 'campaigns' || move.go === 'leads' || move.go === 'places' || move.go === 'creatives' || move.go === 'overview') {
      setView(move.go);
    }
  };

  return (
    <div className="min-w-0 max-w-full px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:pb-5">
      <div
        id="analytics-filters"
        className={`grid grid-rows-[0fr] motion-safe:transition-[grid-template-rows,margin-bottom] motion-safe:duration-300 motion-safe:ease-out ${
          filtersOpen ? 'lg:mb-5 lg:grid-rows-[1fr]' : 'lg:mb-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
      <section className={`hidden rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out lg:block ${
        filtersOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-muted/10 pb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterMenu
              aria-label="Date range"
              display={PRESETS.find((item) => item.value === preset)?.label || 'Last 30 days'}
              icon={(
                <Glyph>
                  <rect x="4" y="5" width="16" height="15" rx="2" />
                  <path d="M8 3v4M16 3v4M4 10h16" />
                </Glyph>
              )}
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
            >
              {PRESETS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </FilterMenu>
            {preset === 'custom' && (
              <>
                <input aria-label="From" type="date" className="rounded-lg border border-brand-yellow/40 bg-white px-3 py-2 text-sm font-medium text-brand-navy" value={from} onChange={(event) => setFrom(event.target.value)} />
                <input aria-label="To" type="date" className="rounded-lg border border-brand-yellow/40 bg-white px-3 py-2 text-sm font-medium text-brand-navy" value={to} onChange={(event) => setTo(event.target.value)} />
              </>
            )}
            <FilterMenu
              aria-label="Platform"
              label="Platform:"
              display={PLATFORM_LABELS[platform] || 'All'}
              value={platform}
              onChange={(event) => { setPlatform(event.target.value); setCampaign(''); }}
            >
              <option value="all">All</option>
              <option value="meta">Meta Ads</option>
              <option value="google">Google Ads</option>
            </FilterMenu>
            <FilterMenu
              aria-label="Campaign"
              label="Campaign:"
              display={campaign ? ((summary?.campaignOptions || []).find((item) => item.key === campaign)?.name || 'All Campaigns') : 'All Campaigns'}
              value={campaign}
              onChange={(event) => setCampaign(event.target.value)}
            >
              <option value="">All Campaigns</option>
              {(summary?.campaignOptions || []).map((item) => (
                <option key={item.key} value={item.key}>{item.name} ({item.count})</option>
              ))}
            </FilterMenu>
            <FilterMenu
              aria-label="City"
              label="City:"
              display={location || 'All Cities'}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option value="">All Cities</option>
              {(summary?.locationOptions || []).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </FilterMenu>
            <FilterMenu
              aria-label="Owner"
              label="Owner:"
              display={owners.find((owner) => owner.id === ownerId)?.name || 'All Owners'}
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
            >
              <option value="">All Owners</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>{owner.name}</option>
              ))}
            </FilterMenu>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetFilters} className="flex items-center gap-1.5 rounded-lg border border-brand-yellow bg-white px-3 py-2 text-sm font-medium text-brand-navy hover:bg-brand-cream">
              <Glyph className="h-4 w-4 text-brand-navy">
                <path d="M21 12a9 9 0 1 1-2.2-5.8" />
                <path d="M21 3v6h-6" />
              </Glyph>
              Reset
            </button>
            <button type="button" onClick={() => downloadExport(view === 'campaigns' ? 'campaigns' : 'leads')} disabled={exporting} className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-hover disabled:opacity-60">
              <Glyph className="h-4 w-4 text-white">
                <path d="M12 4v10" />
                <path d="m8 10 4 4 4-4" />
                <path d="M5 19h14" />
              </Glyph>
              {exporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
        </div>
        <p className="flex items-center gap-2 pt-2.5 text-xs text-brand-muted">
          <Glyph className="h-3.5 w-3.5 shrink-0 text-brand-yellow">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          </Glyph>
          <span>
            Timezone: {summary?.reporting?.timezone || 'Asia/Kolkata'} • Currency {summary?.reporting?.currency || 'not connected'} • Meta Ads {summary?.sync?.meta?.connected ? 'connected' : 'not connected'} • Google Ads {summary?.sync?.google?.connected ? 'connected' : 'not connected'}
          </span>
        </p>
      </section>
        </div>
      </div>

      <div className="min-w-0 max-w-full space-y-5">
      <div
        className="grid grid-cols-5 border-b border-brand-yellow/40 lg:flex lg:gap-8"
        role="tablist"
        aria-label="Analytics sections"
      >
        {VIEWS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`min-h-12 whitespace-nowrap border-b-2 px-1 py-2 text-center text-[11px] font-semibold leading-none sm:text-sm lg:shrink-0 lg:px-0 lg:pb-3 lg:text-left lg:text-sm ${
              view === id ? 'border-brand-yellow text-brand-navy' : 'border-transparent text-brand-muted'
            }`}
          >
            {label}{id === 'leads' && pagination.total > 0 ? ` ${formatNumber(pagination.total)}` : ''}
          </button>
        ))}
      </div>

      {summaryError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {summaryError}
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="ml-3 font-semibold underline">Retry</button>
        </div>
      )}

      {preset === 'custom' && (!from || !to) && (
        <p className="rounded-xl border border-brand-yellow/40 bg-brand-yellow-soft px-4 py-3 text-sm text-brand-navy">Choose a start and end date to load this range.</p>
      )}

      {view === 'overview' && (
        <div className="min-w-0 max-w-full space-y-6">
          {!summaryLoading && summary && (
            <MarketingStage summary={summary} onGo={openStage} />
          )}
          <KpiGrid kpis={summary?.kpis} loading={summaryLoading} />
          {!summaryLoading && summary && <AnalyticsCharts summary={summary} grain={grain} onGrain={setGrain} />}
          {!summaryLoading && summary && <ChannelBreakdown channels={summary.channels || []} />}
        </div>
      )}

      {view === 'campaigns' && (
        summaryLoading ? <p className="text-sm text-brand-muted">Loading campaigns…</p> : summary && (
          <div className="min-w-0 max-w-full space-y-4">
            <PerformanceTables
              channels={summary.channels || []}
              campaigns={summary.campaigns || []}
              onCampaign={setCampaign}
              showChannels={false}
              onExport={() => downloadExport('campaigns')}
              exporting={exporting}
            />
          </div>
        )
      )}

      {view === 'leads' && (
        <div className="min-w-0 max-w-full space-y-4">
          {!summaryLoading && summary && (
            <FunnelSection funnel={summary.funnel} onSelectStage={(stage) => onTableChange({ stage, page: 1 })} />
          )}
          <div className="grid min-w-0 items-start gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <AnalyticsLeadTable
                leads={leads}
                pagination={pagination}
                filters={tableFilters}
                loading={tableLoading}
                error={tableError}
                onChange={onTableChange}
                onOpen={setSelected}
                selectedId={selected?.id}
                stageCounts={Object.fromEntries((summary?.funnel?.stages || []).map((stage) => [stage.key, stage.count]).concat([['lost', summary?.funnel?.outcomes?.lost || 0]]))}
              />
            </div>
            <div className="hidden xl:col-span-4 xl:block">
              {selected && !narrow ? (
                <LeadDrawer embedded lead={selected} owners={owners} onClose={() => setSelected(null)} onSaved={() => setReloadKey((value) => value + 1)} />
              ) : (
                <div className="rounded-2xl border border-brand-yellow/40 bg-white px-4 py-10 text-center text-sm text-brand-muted">
                  Select a lead to see contact details, the activity timeline, notes, and follow-up actions.
                </div>
              )}
            </div>
          </div>
          {!summaryLoading && summary && (
            <ActionCenter
              actions={summary.actions}
              onOpenLead={setSelected}
              onViewCampaign={(key) => {
                setCampaign(key);
                setView('campaigns');
              }}
            />
          )}
        </div>
      )}

      {view === 'places' && (
        summaryLoading ? <p className="text-sm text-brand-muted">Loading places…</p> : summary && (
          <div className="min-w-0 max-w-full space-y-4">
            <IntelligenceSections summary={summary} part="places" onJump={() => setView('leads')} />
          </div>
        )
      )}

      {view === 'creatives' && (
        summaryLoading ? <p className="text-sm text-brand-muted">Loading creatives…</p> : summary && (
          <div className="min-w-0 max-w-full space-y-4">
            <IntelligenceSections summary={summary} part="creatives" onJump={() => setView('campaigns')} />
          </div>
        )
      )}

      <details id="analytics-definitions" className="rounded-2xl border border-brand-yellow/40 bg-white px-4 py-3 text-sm text-brand-muted shadow-sm">
        <summary className="cursor-pointer font-semibold text-brand-navy">How these numbers are calculated</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {summary?.definitions && Object.values(summary.definitions).map((line) => <li key={line}>{line}</li>)}
          {(summary?.limitations || []).map((line) => <li key={line}>{line}</li>)}
        </ul>
      </details>

      {selected && (view !== 'leads' || narrow) && (
        <LeadDrawer lead={selected} owners={owners} onClose={() => setSelected(null)} onSaved={() => setReloadKey((value) => value + 1)} />
      )}

      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-brand-navy/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-brand-yellow/70" />
            <h2 className="text-base font-semibold text-brand-navy">Filters</h2>
            <div className="mt-3 flex flex-col gap-3">
              <FilterMenu className="w-full" aria-label="Date range" display={PRESETS.find((item) => item.value === preset)?.label || 'Last 30 days'} value={preset} onChange={(event) => setPreset(event.target.value)}>
                {PRESETS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </FilterMenu>
              {preset === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <input aria-label="From" type="date" className="min-h-12 rounded-lg border border-brand-yellow/40 px-3 text-sm text-brand-navy" value={from} onChange={(event) => setFrom(event.target.value)} />
                  <input aria-label="To" type="date" className="min-h-12 rounded-lg border border-brand-yellow/40 px-3 text-sm text-brand-navy" value={to} onChange={(event) => setTo(event.target.value)} />
                </div>
              )}
              <FilterMenu className="w-full" aria-label="Platform" label="Platform:" display={PLATFORM_LABELS[platform] || 'All'} value={platform} onChange={(event) => { setPlatform(event.target.value); setCampaign(''); }}>
                <option value="all">All</option>
                <option value="meta">Meta Ads</option>
                <option value="google">Google Ads</option>
              </FilterMenu>
              <FilterMenu className="w-full" aria-label="Campaign" label="Campaign:" display={campaign ? ((summary?.campaignOptions || []).find((item) => item.key === campaign)?.name || 'All Campaigns') : 'All Campaigns'} value={campaign} onChange={(event) => setCampaign(event.target.value)}>
                <option value="">All Campaigns</option>
                {(summary?.campaignOptions || []).map((item) => (
                  <option key={item.key} value={item.key}>{item.name} ({item.count})</option>
                ))}
              </FilterMenu>
              <FilterMenu className="w-full" aria-label="City" label="City:" display={location || 'All Cities'} value={location} onChange={(event) => setLocation(event.target.value)}>
                <option value="">All Cities</option>
                {(summary?.locationOptions || []).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </FilterMenu>
              <FilterMenu className="w-full" aria-label="Owner" label="Owner:" display={owners.find((owner) => owner.id === ownerId)?.name || 'All Owners'} value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
                <option value="">All Owners</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </FilterMenu>
            </div>
            <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 bg-white pt-2">
              <button type="button" onClick={resetFilters} className="min-h-12 rounded-xl border border-brand-yellow text-sm font-semibold text-brand-navy">Reset</button>
              <button type="button" onClick={() => downloadExport(view === 'campaigns' ? 'campaigns' : 'leads')} disabled={exporting} className="min-h-12 rounded-xl border border-brand-yellow/50 text-sm font-semibold text-brand-navy disabled:opacity-60">
                {exporting ? 'Exporting…' : 'Export'}
              </button>
              <button type="button" onClick={() => setFiltersOpen(false)} className="col-span-2 min-h-12 rounded-xl bg-brand-navy text-sm font-semibold text-white">Done</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
