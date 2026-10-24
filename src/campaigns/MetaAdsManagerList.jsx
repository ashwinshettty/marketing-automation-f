import { useMemo, useState } from 'react';
import { createEmptyMetaCampaign } from './metaCampaignDefaults';

const STORAGE_KEY = 'inkstall.metaAdsCampaign.draft';

const FILTERS = ['All ads', 'Active ads', 'Had delivery', 'Actions'];

const LEVEL_TABS = [
  { id: 'campaigns', label: 'Campaigns', icon: 'folder' },
  { id: 'adSets', label: 'Ad sets', icon: 'grid' },
  { id: 'ads', label: 'Ads', icon: 'ad' },
];

const SAMPLE_ROWS = [
  {
    id: 'ad-1',
    name: 'New Leads ad',
    campaignName: 'New Leads campaign',
    adSetName: 'New Leads ad set',
    delivery: 'In draft',
    on: true,
    budget: 'Using campaign budget',
    ends: 'Ongoing',
    bidStrategy: 'Highest volume',
    bidSub: 'Conversions',
    thumb: 'leads',
  },
  {
    id: 'ad-2',
    name: 'Ad 1',
    campaignName: 'Campaign - Website visitors',
    adSetName: 'OIS & Witty',
    delivery: 'In draft',
    on: true,
    budget: 'Using campaign budget',
    ends: '25 Mar 2026',
    bidStrategy: 'Highest volume',
    bidSub: 'Conversions',
    thumb: 'generic',
  },
  {
    id: 'ad-3',
    name: 'New Traffic ad',
    campaignName: 'New Traffic campaign',
    adSetName: 'New Traffic ad set',
    delivery: 'In draft',
    on: true,
    budget: '₹500.00 Daily',
    ends: 'Ongoing',
    bidStrategy: 'Highest volume',
    bidSub: 'Link clicks',
    thumb: 'traffic',
  },
  {
    id: 'ad-4',
    name: 'New Traffic ad',
    campaignName: 'New Traffic campaign',
    adSetName: 'New Traffic ad set 2',
    delivery: 'In draft',
    on: true,
    budget: '₹1,600.00 Daily',
    ends: '2 Feb 2026',
    bidStrategy: 'Highest volume',
    bidSub: 'Link clicks',
    thumb: 'traffic',
  },
];

function loadDraftRow() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const empty = createEmptyMetaCampaign();
    const campaign = { ...empty.campaign, ...(parsed.campaign || {}) };
    const adSet = { ...empty.adSet, ...(parsed.adSet || {}) };
    const ad = { ...empty.ad, ...(parsed.ad || {}) };
    return {
      id: 'draft-current',
      name: ad.name || 'New Leads ad',
      campaignName: campaign.name || 'New Leads campaign',
      adSetName: adSet.name || 'New Leads ad set',
      delivery: 'In draft',
      on: true,
      budget:
        (campaign.budgetStrategy || 'campaign') === 'campaign'
          ? 'Using campaign budget'
          : `₹${adSet.dailyBudget || campaign.dailyBudget || '—'} Daily`,
      ends: 'Ongoing',
      bidStrategy: 'Highest volume',
      bidSub: 'Conversions',
      thumb: 'leads',
      isDraft: true,
    };
  } catch {
    return null;
  }
}

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

function Dash() {
  return <span className="text-slate-400">—</span>;
}

export default function MetaAdsManagerList({ onCreate }) {
  const [filter, setFilter] = useState('All ads');
  const [level, setLevel] = useState('ads');
  const [search, setSearch] = useState('');
  const [bannerOpen, setBannerOpen] = useState(true);
  const [selected, setSelected] = useState(() => new Set(['draft-current', 'ad-1']));
  const [rowOn, setRowOn] = useState(() => {
    const map = {};
    SAMPLE_ROWS.forEach((r) => {
      map[r.id] = r.on;
    });
    map['draft-current'] = true;
    return map;
  });

  const rows = useMemo(() => {
    const draft = loadDraftRow();
    const base = draft ? [draft, ...SAMPLE_ROWS] : SAMPLE_ROWS;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.campaignName.toLowerCase().includes(q) ||
        r.adSetName.toLowerCase().includes(q)
    );
  }, [search]);

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
            <button
              type="button"
              className="mb-1.5 inline-flex max-w-full items-center gap-1.5 self-start rounded-md border border-slate-300 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 sm:text-xs"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="truncate">Last 7 days: 17 Oct – 23 Oct 2026</span>
            </button>
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
                <th className="min-w-[90px] px-3 py-2.5">Actions</th>
                <th className="min-w-[120px] px-3 py-2.5">Attribution setting</th>
                <th className="min-w-[80px] px-3 py-2.5">Results</th>
                <th className="min-w-[110px] px-3 py-2.5">Cost per result</th>
                <th className="min-w-[150px] px-3 py-2.5">Budget (Ad set)</th>
                <th className="min-w-[110px] px-3 py-2.5">Amount spent</th>
                <th className="min-w-[100px] px-3 py-2.5">Ends</th>
                <th className="min-w-[140px] px-3 py-2.5">Bid strategy</th>
                {level === 'ads' ? (
                  <th className="min-w-[140px] px-3 py-2.5">Ad set name</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
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
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-emerald-500" />
                        {row.delivery}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Dash />
                    </td>
                    <td className="px-3 py-2.5">
                      <Dash />
                    </td>
                    <td className="px-3 py-2.5">
                      <Dash />
                    </td>
                    <td className="px-3 py-2.5">
                      <Dash />
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.budget}</td>
                    <td className="px-3 py-2.5">
                      <Dash />
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.ends}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-sm text-slate-800">{row.bidStrategy}</div>
                      <div className="text-xs text-slate-500">{row.bidSub}</div>
                    </td>
                    {level === 'ads' ? (
                      <td className="px-3 py-2.5">
                        <button type="button" className="text-sm font-medium text-[#1877F2] hover:underline">
                          {row.adSetName}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-slate-200 px-4 py-2.5 text-xs text-slate-500">
            Results from {rows.length} {level === 'campaigns' ? 'campaigns' : level === 'adSets' ? 'ad sets' : 'ads'}
          </div>
        </div>
      </div>
    </div>
  );
}
