import { useEffect, useMemo, useState } from 'react';
import { listCampaigns } from '../api/campaignApi';
import { META_AD_ACCOUNT_ID } from './campaignAccount';

const FILTERS = ['All ads', 'Active ads', 'Had delivery', 'Actions'];

const RANGES = [
  { id: '', label: 'All dates' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7-days', label: '7 days' },
  { id: '15-days', label: '15 days' },
  { id: '28-days', label: '28 days' },
  { id: '30-days', label: '30 days' },
  { id: 'this-week', label: 'This week' },
  { id: 'last-week', label: 'Last week' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
];

const BID_LABELS = {
  LOWEST_COST_WITHOUT_CAP: 'Highest volume',
  LOWEST_COST_WITH_BID_CAP: 'Bid cap',
  COST_CAP: 'Cost per result',
  LOWEST_COST_WITH_MIN_ROAS: 'ROAS goal',
};

const rupees = (amountMinor) =>
  `₹${(Number(amountMinor) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const deliveryLabel = (status) => {
  if (status === 'created' || status === 'paused') return 'Paused';
  if (status === 'failed') return 'Failed';
  if (status === 'draft') return 'In draft';
  if (status === 'active') return 'Active';
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'In draft';
};

const OBJECTIVES = {
  OUTCOME_AWARENESS: 'Awareness',
  OUTCOME_TRAFFIC: 'Traffic',
  OUTCOME_ENGAGEMENT: 'Engagement',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_APP_PROMOTION: 'App promotion',
  OUTCOME_SALES: 'Sales',
};

const mapCampaignRow = (doc) => {
  const status = doc.status || doc.campaign?.status || 'draft';
  const level = doc.campaign?.budgetLevel;
  const money = level === 'ADSET' ? doc.adSet?.budget : doc.campaign?.budget;
  const objective = doc.campaign?.objective || '';
  const endAt = doc.adSet?.schedule?.endAt;
  const destinationType = doc.creative?.destinationType;
  const destinationValue = doc.creative?.destinationValue || '';
  return {
    id: String(doc._id),
    name: doc.creative?.name || doc.name || 'Ad',
    campaignName: doc.campaign?.name || doc.name || 'Campaign',
    adSetName: doc.adSet?.name || 'Ad set',
    objective: OBJECTIVES[objective] || objective || '—',
    destination: destinationType === 'WHATSAPP'
      ? `WhatsApp ${destinationValue}`.trim()
      : destinationValue || destinationType || '—',
    delivery: deliveryLabel(status),
    status,
    on: status === 'active',
    budget: money?.amountMinor
      ? `${rupees(money.amountMinor)} ${money.type === 'LIFETIME' ? 'Lifetime' : 'Daily'}`
      : '—',
    ends: endAt
      ? new Date(endAt).toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Ongoing',
    bidStrategy: BID_LABELS[doc.adSet?.bidStrategy] || 'Highest volume',
    bidSub: doc.adSet?.optimizationGoal === 'CONVERSATIONS' ? 'WhatsApp' : doc.adSet?.optimizationGoal || '',
    remoteId: doc.campaign?.meta?.remoteId || '',
    detail: doc.lastError?.message || doc.campaign?.lastError?.message || '',
    thumb: objective.includes('TRAFFIC') ? 'traffic' : objective.includes('LEADS') ? 'leads' : 'generic',
  };
};

const PAGE_SIZE = 10;

const pageWindow = (current, count) => {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = [1, count, current - 1, current, current + 1].filter((page) => page >= 1 && page <= count);
  return [...new Set(pages)].sort((left, right) => left - right);
};

const LEVEL_TABS = [
  { id: 'campaigns', label: 'Campaigns', icon: 'folder' },
  { id: 'adSets', label: 'Ad sets', icon: 'grid' },
  { id: 'ads', label: 'Ads', icon: 'ad' },
];

function LevelIcon({ type }) {
  if (type === 'folder') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>
    );
  }
  if (type === 'grid') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4V6zm0 5h16v7H4v-7z" />
    </svg>
  );
}

function AdThumb({ type }) {
  const bg =
    type === 'leads' ? 'bg-[#E7F3FF]' : type === 'traffic' ? 'bg-emerald-50' : 'bg-slate-100';
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-slate-200 ${bg}`}
    >
      <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
        checked ? 'bg-[#1877F2]' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export default function MetaAdsManagerList({ onCreate }) {
  const [filter, setFilter] = useState('All ads');
  const [listQuery, setListQuery] = useState({ range: '', page: 1 });
  const [level, setLevel] = useState('campaigns');
  const [search, setSearch] = useState('');
  const [bannerOpen, setBannerOpen] = useState(true);
  const [selected, setSelected] = useState(() => new Set());
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rowOn, setRowOn] = useState({});
  const { range, page } = listQuery;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    listCampaigns({ adAccountId: META_AD_ACCOUNT_ID, range, page, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return;
        const nextPages = Number(data?.totalPages) || 0;
        if (nextPages > 0 && page > nextPages) {
          setListQuery((current) => (
            current.page === page ? { ...current, page: nextPages } : current
          ));
          return;
        }
        const next = Array.isArray(data?.campaigns) ? data.campaigns.map(mapCampaignRow) : [];
        setCampaigns(next);
        setTotal(Number(data?.total) || 0);
        setPageCount(nextPages);
        setRowOn(Object.fromEntries(next.map((row) => [row.id, row.on])));
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(error.message || 'Campaigns could not be loaded.');
        setCampaigns((current) => (current.length ? current : []));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, page]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((row) => {
      if (filter === 'Active ads' && row.status !== 'active') return false;
      if (filter === 'Had delivery' && !['created', 'paused', 'active'].includes(row.status)) return false;
      if (filter === 'Actions' && row.status !== 'failed') return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.campaignName.toLowerCase().includes(q) ||
        row.adSetName.toLowerCase().includes(q)
      );
    });
  }, [campaigns, filter, search]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearLevelSelection = (e, tabId) => {
    e.stopPropagation();
    if (tabId === level) setSelected(new Set());
  };

  const nameColumnLabel = level === 'campaigns' ? 'Campaign' : level === 'adSets' ? 'Ad set' : 'Ad';

  const displayName = (row) => {
    if (level === 'campaigns') return row.campaignName;
    if (level === 'adSets') return row.adSetName;
    return row.name;
  };

  const initialLoad = loading && campaigns.length === 0;
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);
  const pages = pageWindow(page, pageCount);

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col bg-[#F0F2F5] text-[13px] text-slate-800">
      {bannerOpen ? (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#B6D0F7] bg-[#E7F3FF] px-3 py-2.5 sm:items-center sm:px-4">
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
            Add your contact information to get important updates about your account.
          </p>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              className="flex-1 rounded-md border border-[#1877F2] bg-white px-3 py-1.5 text-xs font-semibold text-[#1877F2] hover:bg-[#1877F2]/5 sm:flex-none sm:text-sm"
            >
              Add contact information
            </button>
            <button
              type="button"
              onClick={() => setBannerOpen(false)}
              className="rounded p-1 text-slate-500 hover:bg-black/5"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {/* Top bar */}
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Ads</h2>
          <button
            type="button"
            className="inline-flex max-w-full items-center gap-2 rounded-md border border-transparent px-1.5 py-1 text-sm text-slate-700 hover:bg-slate-50 sm:px-2"
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F7B928] text-[10px] font-bold text-slate-900">
              i
            </span>
            <span className="max-w-[9.5rem] truncate font-medium sm:max-w-none">Inkstall Ad Account (6758…)</span>
            <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
            </svg>
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 sm:text-xs">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-emerald-500 text-[10px]">
              100
            </span>
            <span className="hidden sm:inline">Opportunity score</span>
            <span className="sm:hidden">Score</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex"
          >
            Discard Drafts
          </button>
          <button
            type="button"
            className="flex-1 rounded-md bg-[#1877F2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#166FE5] sm:flex-none sm:px-3.5 sm:py-1.5"
          >
            <span className="sm:hidden">Review (15)</span>
            <span className="hidden sm:inline">Review and publish (15)</span>
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 sm:h-8 sm:w-8"
            aria-label="More"
          >
            ⋯
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-2 pb-3 pt-2 sm:px-4">
        {/* Filters + search */}
        <div className="rounded-t-lg border border-b-0 border-slate-200 bg-white px-2.5 pt-3 sm:px-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="-mx-0.5 flex gap-1.5 overflow-x-auto px-0.5 pb-1 scrollbar-none">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    filter === f
                      ? 'bg-[#E7F3FF] text-[#1877F2]'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
              <button type="button" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap text-slate-600 hover:bg-slate-100">
                + See more
              </button>
            </div>
            <button
              type="button"
              className="hidden rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              Create a view
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-[#1877F2] focus-within:ring-2 focus-within:ring-[#1877F2]/15">
            <svg className="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search to filter by: name, ID or metrics"
              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Level tabs */}
          <div className="mt-3 flex flex-col gap-2 border-b border-slate-200 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="-mx-0.5 flex items-end gap-0.5 overflow-x-auto px-0.5">
              {LEVEL_TABS.map((tab) => {
                const active = level === tab.id;
                const count = selected.size;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLevel(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                      active
                        ? 'border-[#1877F2] text-[#1877F2]'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LevelIcon type={tab.icon} />
                    <span>{tab.label}</span>
                    {count > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px] ${
                          active ? 'bg-[#E7F3FF] text-[#1877F2]' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="sm:hidden">{count}</span>
                        <span className="hidden sm:inline">{count} selected</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => clearLevelSelection(e, tab.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') clearLevelSelection(e, tab.id);
                          }}
                          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10"
                          aria-label="Clear selection"
                        >
                          ×
                        </span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <label className="mb-1.5 inline-flex max-w-full items-center gap-1.5 self-start rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 sm:text-xs">
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <select
                value={range}
                onChange={(event) => setListQuery({ range: event.target.value, page: 1 })}
                className="max-w-[14rem] bg-transparent text-xs font-medium text-slate-700 outline-none"
                aria-label="Campaign date range"
              >
                {RANGES.map((item) => (
                  <option key={item.id || 'all'} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-2 border-x border-slate-200 bg-white px-2.5 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-3">
          <div className="-mx-0.5 flex items-center gap-1.5 overflow-x-auto px-0.5 pb-0.5">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#42B72A] px-3 py-2 text-sm font-semibold text-white hover:bg-[#36A420] sm:py-1.5"
            >
              <span className="text-base leading-none">+</span> Create
            </button>
            {['Publish', 'Duplicate', 'Edit', 'Preview', 'More'].map((label) => (
              <button
                key={label}
                type="button"
                className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 ${
                  label === 'Preview' || label === 'Duplicate' ? 'hidden sm:inline-flex' : ''
                }`}
              >
                {label === 'Edit' ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                ) : null}
                {label}
                {label === 'Edit' || label === 'More' ? (
                  <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                ) : null}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              aria-label="Delete"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </button>
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Columns: Performance
              <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Breakdown
              <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="min-h-0 flex-1 overflow-auto rounded-b-lg border border-slate-200 bg-white">
          <table className="min-w-[1100px] w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#F5F6F7] text-[12px] font-semibold text-slate-600">
              <tr className="border-b border-slate-200">
                <th className="w-10 px-3 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="w-12 px-1 py-2.5">Off/On</th>
                <th className="min-w-[220px] px-3 py-2.5">{nameColumnLabel}</th>
                <th className="min-w-[110px] px-3 py-2.5">Delivery</th>
                <th className="min-w-[120px] px-3 py-2.5">Objective</th>
                <th className="min-w-[160px] px-3 py-2.5">Ad set</th>
                <th className="min-w-[200px] px-3 py-2.5">Destination</th>
                <th className="min-w-[140px] px-3 py-2.5">Budget</th>
                <th className="min-w-[110px] px-3 py-2.5">Ends</th>
                <th className="min-w-[180px] px-3 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className={loading && campaigns.length ? 'opacity-60 transition-opacity duration-200' : 'transition-opacity duration-200'}>
              {initialLoad ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-sm text-slate-500">
                    Loading campaigns…
                  </td>
                </tr>
              ) : null}
              {!initialLoad && loadError && campaigns.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-sm text-red-600">
                    {loadError}
                  </td>
                </tr>
              ) : null}
              {!initialLoad && !loadError && campaigns.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-sm text-slate-500">
                    No campaigns for this account yet. Create one to publish a paused ad.
                  </td>
                </tr>
              ) : null}
              {!initialLoad && campaigns.length
                ? rows.map((row) => {
                const isSelected = selected.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100 ${
                      isSelected ? 'bg-[#E8F5E9]' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(row.id)}
                        aria-label={`Select ${displayName(row)}`}
                      />
                    </td>
                    <td className="px-1 py-2.5">
                      <Toggle
                        checked={Boolean(rowOn[row.id])}
                        onChange={(v) => setRowOn((prev) => ({ ...prev, [row.id]: v }))}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <AdThumb type={row.thumb} />
                        <button
                          type="button"
                          onClick={row.isDraft ? onCreate : undefined}
                          className={`truncate text-left text-sm font-medium ${
                            row.isDraft ? 'text-[#1877F2] hover:underline' : 'text-slate-900'
                          }`}
                        >
                          {displayName(row)}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                        <span
                          className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${
                            row.status === 'failed'
                              ? 'border-red-500'
                              : row.status === 'draft'
                                ? 'border-slate-400'
                                : 'border-emerald-500'
                          }`}
                        />
                        {row.delivery}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.objective}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.adSetName}</td>
                    <td className="max-w-[240px] truncate px-3 py-2.5 text-sm text-slate-700" title={row.destination}>
                      {row.destination}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.budget}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.ends}</td>
                    <td className="max-w-[280px] px-3 py-2.5">
                      <div className="text-sm text-slate-800">{row.bidStrategy}</div>
                      {row.remoteId ? (
                        <div className="truncate text-xs text-slate-500">Meta {row.remoteId}</div>
                      ) : null}
                      {row.detail ? (
                        <div className="truncate text-xs text-red-600" title={row.detail}>{row.detail}</div>
                      ) : null}
                    </td>
                    </tr>
                );
              })
                : null}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
            <span>
              {initialLoad
                ? 'Loading campaigns…'
                : total
                  ? `${fromRow}–${toRow} of ${total}`
                  : '0 campaigns'}
              {loadError && campaigns.length ? ` · ${loadError}` : ''}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setListQuery((current) => ({ ...current, page: current.page - 1 }))}
                className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              {pages.map((item, index) => {
                const previous = pages[index - 1];
                return (
                  <span key={item} className="inline-flex items-center gap-1">
                    {previous && item - previous > 1 ? <span className="px-1 text-slate-400">…</span> : null}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setListQuery((current) => ({ ...current, page: item }))}
                      className={`h-7 min-w-7 rounded-md px-2 font-semibold ${
                        item === page
                          ? 'bg-[#1877F2] text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      } disabled:opacity-40`}
                    >
                      {item}
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                disabled={loading || pageCount === 0 || page >= pageCount}
                onClick={() => setListQuery((current) => ({ ...current, page: current.page + 1 }))}
                className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
