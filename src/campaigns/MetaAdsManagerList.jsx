import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '../components/ConfirmModal';
import {
  deleteCampaign,
  listCampaigns,
  setCampaignStatus,
  updateCampaignName,
} from '../api/campaignApi';
import { toast } from '../utils/toast';
import { META_AD_ACCOUNT_ID } from './campaignAccount';

const FILTERS = ['All ads', 'Active ads', 'Had delivery', 'Actions'];
const EXTRA_FILTERS = ['In draft', 'Off', 'Failed'];

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

const ATTRIBUTION_DEFAULT = {
  primary: '7-day click or 1-day view',
  secondary: 'All conversions',
};

const RESULT_LABELS = {
  OUTCOME_AWARENESS: 'Reach',
  OUTCOME_TRAFFIC: 'Link clicks',
  OUTCOME_ENGAGEMENT: 'Post engagement',
  OUTCOME_LEADS: 'Leads',
  OUTCOME_APP_PROMOTION: 'App installs',
  OUTCOME_SALES: 'Purchases',
};

const mapCampaignRow = (doc) => {
  const status = doc.status || doc.campaign?.status || 'draft';
  const budgetLevel = doc.campaign?.budgetLevel;
  const money = budgetLevel === 'ADSET' ? doc.adSet?.budget : doc.campaign?.budget;
  const objective = doc.campaign?.objective || '';
  const endAt = doc.adSet?.schedule?.endAt;
  const destinationType = doc.creative?.destinationType;
  const destinationValue = doc.creative?.destinationValue || '';
  const insights = doc.insights || doc.campaign?.insights || {};
  const results = insights.results ?? insights.actions ?? null;
  const spendMinor = insights.spendMinor ?? insights.amountSpentMinor ?? null;
  const impressions = insights.impressions ?? null;
  const reach = insights.reach ?? null;
  const costPerResultMinor =
    insights.costPerResultMinor ??
    (spendMinor != null && results ? Math.round(Number(spendMinor) / Number(results)) : null);

    return {
    id: String(doc._id),
    name: doc.creative?.name || doc.name || 'Ad',
    campaignName: doc.campaign?.name || doc.name || 'Campaign',
    adSetName: doc.adSet?.name || 'Ad set',
    objective: OBJECTIVES[objective] || objective || '—',
    objectiveKey: objective,
    destination:
      destinationType === 'WHATSAPP'
        ? `WhatsApp ${destinationValue}`.trim()
        : destinationValue || destinationType || '—',
    delivery: deliveryLabel(status),
    status,
    on: status === 'active',
    budgetAmount: money?.amountMinor != null ? rupees(money.amountMinor) : '—',
    budgetType: money?.amountMinor
      ? money.type === 'LIFETIME'
        ? 'Lifetime'
        : budgetLevel === 'ADSET'
          ? 'Using ad set budget'
          : 'Daily'
      : '',
    amountSpent: spendMinor != null ? rupees(spendMinor) : '—',
    results: results != null ? Number(results).toLocaleString('en-IN') : '—',
    resultLabel: RESULT_LABELS[objective] || 'Results',
    costPerResult: costPerResultMinor != null ? rupees(costPerResultMinor) : '—',
    costPerResultLabel:
      objective === 'OUTCOME_AWARENESS'
        ? 'Per 1,000 people reached'
        : RESULT_LABELS[objective]
          ? `Per ${RESULT_LABELS[objective].toLowerCase().replace(/s$/, '')}`
          : 'Per result',
    impressions: impressions != null ? Number(impressions).toLocaleString('en-IN') : '—',
    reach: reach != null ? Number(reach).toLocaleString('en-IN') : '—',
    attributionPrimary: insights.attributionPrimary || ATTRIBUTION_DEFAULT.primary,
    attributionSecondary: insights.attributionSecondary || ATTRIBUTION_DEFAULT.secondary,
    ends: endAt
      ? new Date(endAt).toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Ongoing',
    bidStrategy: BID_LABELS[doc.adSet?.bidStrategy] || 'Highest volume',
    bidSub:
      doc.adSet?.optimizationGoal === 'CONVERSATIONS'
        ? 'WhatsApp'
        : doc.adSet?.optimizationGoal || '',
    remoteId: doc.campaign?.meta?.remoteId || '',
    detail: doc.lastError?.message || doc.campaign?.lastError?.message || '',
    thumb: objective.includes('TRAFFIC')
      ? 'traffic'
      : objective.includes('LEADS')
        ? 'leads'
        : 'generic',
  };
};

/** Meta-style metric cell: primary value + grey sublabel */
function MetricCell({ value, sub }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-sm text-slate-800">{value}</div>
      {sub ? <div className="truncate text-[11px] text-slate-500">{sub}</div> : null}
    </div>
  );
}

const TABLE_COL_COUNT = 14;

const PAGE_SIZE = 10;

/** Meta Ads Manager–style frozen columns (before Delivery) */
const STICKY_W = { check: 40, on: 48, name: 300 };
const STICKY_LEFT = 'sticky z-20';
const STICKY_EDGE =
  'border-r border-brand-yellow/40 shadow-[4px_0_8px_-4px_rgba(0,0,128,0.18)]';
const STICKY_HEAD = 'sticky top-0 z-30 border-b border-brand-yellow/30 bg-brand-cream';
const STICKY_CORNER = 'sticky z-40 border-b border-brand-yellow/30 bg-brand-cream';

const pageWindow = (current, count) => {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = [1, count, current - 1, current, current + 1].filter(
    (page) => page >= 1 && page <= count
  );
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
    type === 'leads' ? 'bg-brand-yellow-soft' : type === 'traffic' ? 'bg-emerald-50' : 'bg-slate-100';
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-brand-yellow/30 ${bg}`}
    >
      <svg className="h-4 w-4 text-brand-muted" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    </span>
  );
}

/** Leading icon beside the name (Meta: folder / grid / creative thumb) */
function NameLeadingIcon({ level, thumb }) {
  if (level === 'ads') return <AdThumb type={thumb} />;
  if (level === 'adSets') {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-brand-yellow/30 bg-brand-cream text-brand-navy">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-brand-yellow/30 bg-brand-yellow-soft text-brand-navy">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>
    </span>
  );
}

/** Campaign / ad set / ad name + Meta-style rename pencil */
function NameWithIcon({
  level,
  thumb,
  name,
  pinned,
  renaming,
  draftName,
  onDraftChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onOpen,
  renameSaving = false,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!renaming || renameSaving) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [renaming, renameSaving]);

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <NameLeadingIcon level={level} thumb={thumb} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1">
          {renaming ? (
            <>
              <input
                ref={inputRef}
                value={draftName}
                disabled={renameSaving}
                onChange={(e) => onDraftChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (renameSaving) return;
                  if (e.key === 'Enter') onCommitRename();
                  if (e.key === 'Escape') onCancelRename();
                }}
                className="min-w-0 flex-1 rounded border border-brand-navy bg-white px-1.5 py-0.5 text-sm font-medium text-brand-navy outline-none ring-2 ring-brand-navy/20 disabled:opacity-60"
                aria-label="Rename"
              />
              <button
                type="button"
                title="Save name"
                aria-label="Save name"
                disabled={renameSaving}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCommitRename();
                }}
                className="shrink-0 rounded bg-brand-navy px-2 py-0.5 text-xs font-semibold text-white hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {renameSaving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpen}
                className="truncate text-left text-sm font-semibold text-brand-navy hover:underline"
              >
                {name}
              </button>
              {pinned ? (
                <svg
                  className="h-3 w-3 shrink-0 text-brand-navy"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-label="Pinned"
                >
                  <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                </svg>
              ) : null}
              <button
                type="button"
                title="Edit name"
                aria-label="Edit name"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartRename();
                }}
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-brand-navy/70 opacity-0 transition hover:bg-brand-navy/10 hover:text-brand-navy group-hover:opacity-100"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
        checked ? 'bg-brand-navy' : 'bg-slate-300'
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

function HoverIconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-brand-muted hover:bg-brand-navy/10 hover:text-brand-navy"
    >
      {children}
    </button>
  );
}

/** Meta-style row hover actions under the name */
function RowHoverActions({
  rowId,
  name,
  pinned,
  moreOpen,
  onToggleMore,
  onCloseMore,
  onEdit,
  onDelete,
  onDuplicate,
  onCharts,
  onCompare,
  onPin,
  onHistory,
  onRules,
}) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!moreOpen || !triggerRef.current) return undefined;
    const place = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 168;
      const pad = 8;
      let left = rect.left;
      if (left + menuWidth > window.innerWidth - pad) {
        left = Math.max(pad, window.innerWidth - menuWidth - pad);
      }
      setMenuPos({ top: rect.bottom + 4, left });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const onDoc = (e) => {
      const t = e.target;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      onCloseMore();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseMore();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, onCloseMore]);

  const menu =
    moreOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-[200] min-w-[10.5rem] rounded-md border border-brand-yellow/40 bg-white py-1 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              onClick={onPin}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-navy hover:bg-brand-cream"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
              {pinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={onHistory}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-navy hover:bg-brand-cream"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 117 7 7.1 7.1 0 01-5.3-2.3l-1.4 1.42A9 9 0 1013 3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
              </svg>
              View history
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={onRules}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-navy hover:bg-brand-cream"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
              </svg>
              Rules
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCloseMore();
                onCharts?.();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-navy hover:bg-brand-cream"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v8H3v-8zm5-6h2v14H8V7zm5 3h2v11h-2V10zm5-5h2v16h-2V5z" />
              </svg>
              Charts
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onCloseMore();
                onCompare?.();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-navy hover:bg-brand-cream"
            >
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 17l6-6 4 4 7-7" />
                <path d="M14 8h6v6" />
              </svg>
              Compare
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      className={`mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] ${
        moreOpen ? 'flex' : 'hidden group-hover:flex'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onEdit}
        className="font-medium text-brand-navy hover:underline"
      >
        Edit
      </button>
      <span className="text-slate-300">|</span>
      <button
        type="button"
        onClick={onDuplicate}
        className="font-medium text-brand-navy hover:underline"
      >
        Duplicate
      </button>
      <span className="text-slate-300">|</span>
      <button
        type="button"
        onClick={onDelete}
        className="font-medium text-rose-700 hover:underline"
      >
        Delete
      </button>
      <span className="text-slate-300">|</span>
      <button
        type="button"
        onClick={onCharts}
        className="font-medium text-brand-navy hover:underline"
      >
        Charts
      </button>
      <span className="text-slate-300">|</span>
      <span ref={triggerRef} className="inline-flex items-center">
        <HoverIconBtn label="More" onClick={() => onToggleMore(rowId)}>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </HoverIconBtn>
      </span>
      {menu}
      <span className="sr-only">{name}</span>
    </div>
  );
}

export default function MetaAdsManagerList({ onCreate, onEdit, onCharts }) {
  const [filter, setFilter] = useState('All ads');
  const [extraFilter, setExtraFilter] = useState('');
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [listQuery, setListQuery] = useState({ range: '', page: 1 });
  const [level, setLevel] = useState('campaigns');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rowOn, setRowOn] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);
  const [hoverMoreId, setHoverMoreId] = useState(null);
  const [pinnedIds, setPinnedIds] = useState(() => new Set());
  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
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
          setListQuery((current) =>
            current.page === page ? { ...current, page: nextPages } : current
          );
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
    const filtered = campaigns.filter((row) => {
      if (filter === 'Active ads' && row.status !== 'active') return false;
      if (filter === 'Had delivery' && !['created', 'paused', 'active'].includes(row.status))
        return false;
      if (filter === 'Actions' && row.status !== 'failed') return false;
      if (extraFilter === 'In draft' && row.status !== 'draft') return false;
      if (extraFilter === 'Off') {
        const isOff = rowOn[row.id] === false || row.status === 'paused' || row.status === 'created';
        if (!isOff) return false;
      }
      if (extraFilter === 'Failed' && row.status !== 'failed') return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.campaignName.toLowerCase().includes(q) ||
        row.adSetName.toLowerCase().includes(q) ||
        row.destination.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      const ap = pinnedIds.has(a.id) ? 0 : 1;
      const bp = pinnedIds.has(b.id) ? 0 : 1;
      return ap - bp;
    });
  }, [campaigns, filter, extraFilter, search, rowOn, pinnedIds]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const selectedRows = rows.filter((r) => selected.has(r.id));

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

  const clearLevelSelection = (e) => {
    e.stopPropagation();
    setSelected(new Set());
  };

  const nameColumnLabel = level === 'campaigns' ? 'Campaign' : level === 'adSets' ? 'Ad set' : 'Ad';

  const displayName = (row) => {
    if (level === 'campaigns') return row.campaignName;
    if (level === 'adSets') return row.adSetName;
    return row.name;
  };

  const startRename = (row) => {
    setRenamingId(row.id);
    setRenameDraft(displayName(row));
    setHoverMoreId(null);
  };

  const cancelRename = () => {
    if (renameSaving) return;
    setRenamingId(null);
    setRenameDraft('');
  };

  const commitRename = async () => {
    if (!renamingId || renameSaving) return;
    const nextName = renameDraft.trim();
    if (!nextName) {
      cancelRename();
      return;
    }

    if (level !== 'campaigns') {
      setCampaigns((prev) =>
        prev.map((row) => {
          if (row.id !== renamingId) return row;
          if (level === 'adSets') return { ...row, adSetName: nextName };
          return { ...row, name: nextName };
        })
      );
      setRenamingId(null);
      setRenameDraft('');
      toast.success('Name updated');
      return;
    }

    const campaignId = renamingId;
    setRenameSaving(true);
    try {
      const result = await updateCampaignName(campaignId, nextName);
      const savedName = result?.name || result?.campaign?.campaign?.name || nextName;
      setCampaigns((prev) =>
        prev.map((row) =>
          row.id === campaignId ? { ...row, campaignName: savedName } : row
        )
      );
      setRenamingId(null);
      setRenameDraft('');
      toast.success(
        result?.remoteUpdated
          ? 'Campaign name updated on Meta'
          : 'Campaign name updated'
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Name could not be updated.');
    } finally {
      setRenameSaving(false);
    }
  };

  const requireSelection = (action) => {
    if (selectedRows.length === 0) {
      toast.info(`Select at least one item to ${action}.`);
      return false;
    }
    return true;
  };

  const requestDelete = (ids) => {
    const list = Array.isArray(ids) && ids.length
      ? ids
      : selectedRows.map((row) => row.id);
    if (!list.length) {
      toast.info('Select at least one item to delete.');
      return;
    }
    setPendingDeleteIds(list);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const ids = pendingDeleteIds.length
      ? pendingDeleteIds
      : selectedRows.map((row) => row.id);
    if (!ids.length || deleting) return;

    setDeleting(true);
    const removed = [];
    const failures = [];
    for (const id of ids) {
      try {
        await deleteCampaign(id);
        removed.push(id);
      } catch (error) {
        failures.push(
          error?.response?.data?.message || error.message || 'Delete failed'
        );
      }
    }

    if (removed.length) {
      const removedSet = new Set(removed);
      setCampaigns((prev) => prev.filter((row) => !removedSet.has(row.id)));
      setSelected((prev) => {
        const next = new Set(prev);
        removed.forEach((id) => next.delete(id));
        return next;
      });
      setTotal((t) => Math.max(0, t - removed.length));
      toast.success(
        removed.length === 1
          ? 'Campaign deleted on Meta and locally'
          : `Deleted ${removed.length} campaigns`
      );
    }
    if (failures.length) {
      toast.error(failures[0]);
    }

    setDeleting(false);
    setDeleteConfirmOpen(false);
    setPendingDeleteIds([]);
  };

  const handlePublish = () => {
    if (!requireSelection('publish')) return;
    toast.success(`Publish queued for ${selectedRows.length} item${selectedRows.length > 1 ? 's' : ''}`);
  };

  const handleDuplicate = () => {
    if (!requireSelection('duplicate')) return;
    toast.info('Duplicate is not available for live Meta campaigns yet.');
  };

  const handleEdit = () => {
    if (!requireSelection('edit')) return;
    const row = selectedRows[0];
    if (!row?.id) return;
    onEdit?.(row.id);
  };

  const openEdit = (row) => {
    if (!row?.id) return;
    onEdit?.(row.id);
  };

  const toggleDelivery = async (row, nextOn) => {
    if (!row?.id || statusBusyId) return;
    if (row.status === 'draft') {
      toast.info('Submit this campaign to Meta before turning delivery on.');
      return;
    }

    const previous = Boolean(rowOn[row.id]);
    setRowOn((prev) => ({ ...prev, [row.id]: nextOn }));
    setStatusBusyId(row.id);
    try {
      const result = await setCampaignStatus(row.id, nextOn ? 'ACTIVE' : 'PAUSED');
      const active = result?.status === 'active' || result?.paused === false;
      setRowOn((prev) => ({ ...prev, [row.id]: active }));
      setCampaigns((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: result?.status || (active ? 'active' : 'paused'),
                on: active,
                delivery: active ? 'Active' : 'Paused',
              }
            : item
        )
      );
      toast.success(active ? 'Campaign turned on on Meta' : 'Campaign paused on Meta');
    } catch (error) {
      setRowOn((prev) => ({ ...prev, [row.id]: previous }));
      toast.error(
        error?.response?.data?.message || error.message || 'Delivery status could not be updated.'
      );
    } finally {
      setStatusBusyId(null);
    }
  };

  const handlePreview = () => {
    if (!requireSelection('preview')) return;
    toast.info(selectedRows.map((r) => displayName(r)).join(', '));
  };

  const initialLoad = loading && campaigns.length === 0;
  const fromRow = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);
  const pages = pageWindow(page, pageCount);

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col bg-brand-cream text-[13px] text-brand-navy">
      <div className="flex min-h-0 flex-1 flex-col px-2 pb-3 pt-2 sm:px-4">
        <div className="rounded-t-lg border border-b-0 border-brand-yellow/40 bg-white px-2.5 pt-3 sm:px-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              {FILTERS.map((f) => (
            <button
                  key={f}
              type="button"
                  onClick={() => {
                    setFilter(f);
                    setExtraFilter('');
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    filter === f && !extraFilter
                      ? 'bg-brand-yellow-soft text-brand-navy'
                      : 'text-brand-muted hover:bg-brand-yellow/20'
                  }`}
                >
                  {f}
            </button>
              ))}

              {(seeMoreOpen || extraFilter ? EXTRA_FILTERS : []).map((f) => (
          <button
                  key={f}
            type="button"
                  onClick={() => {
                    setExtraFilter(f);
                    setFilter('All ads');
                    setSeeMoreOpen(true);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    extraFilter === f
                      ? 'bg-brand-yellow-soft text-brand-navy'
                      : 'text-brand-muted hover:bg-brand-yellow/20'
                  }`}
                >
                  {f}
          </button>
              ))}

                <button
                  type="button"
                onClick={() => {
                  setSeeMoreOpen((v) => {
                    const next = !v;
                    if (!next) setExtraFilter('');
                    return next;
                  });
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${
                  seeMoreOpen || extraFilter
                    ? 'bg-brand-navy text-white hover:bg-brand-navy-hover'
                    : 'text-brand-navy hover:bg-brand-yellow/20'
                }`}
              >
                {seeMoreOpen || extraFilter ? 'See less' : '+ See more'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => toast.info('Custom views coming soon')}
              className="hidden shrink-0 rounded-md border border-brand-yellow/40 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-cream sm:inline-flex"
            >
              Create a view
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-brand-yellow/40 bg-white px-3 py-2 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy/15">
            <svg
              className="h-4 w-4 shrink-0 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-semibold text-brand-muted hover:text-brand-navy"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-b border-brand-yellow/30 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-end gap-0.5">
              {LEVEL_TABS.map((tab) => {
                const active = level === tab.id;
                const count = selected.size;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setLevel(tab.id);
                      setSelected(new Set());
                    }}
                    className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                      active
                        ? 'border-brand-navy text-brand-navy'
                        : 'border-transparent text-brand-muted hover:text-brand-navy'
                    }`}
                  >
                    <LevelIcon type={tab.icon} />
                    <span>{tab.label}</span>
                    {active && count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-navy sm:text-[11px]">
                        <span className="sm:hidden">{count}</span>
                        <span className="hidden sm:inline">{count} selected</span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={clearLevelSelection}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') clearLevelSelection(e);
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

            <label className="mb-1.5 inline-flex max-w-full items-center gap-1.5 self-start rounded-md border border-brand-yellow/40 bg-white px-2.5 py-1.5 text-[11px] font-medium text-brand-navy sm:text-xs">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <select
                value={range}
                onChange={(event) => setListQuery({ range: event.target.value, page: 1 })}
                className="max-w-[14rem] bg-transparent text-xs font-medium text-brand-navy outline-none"
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

        <div className="flex flex-col gap-2 border-x border-brand-yellow/40 bg-white px-2.5 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand-yellow px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-yellow-hover sm:py-1.5"
            >
              <span className="text-base leading-none">+</span> Create
            </button>
              <button
                type="button"
              onClick={handlePublish}
              className="inline-flex shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-cream"
            >
              Publish
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              className="hidden shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-cream sm:inline-flex"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-cream"
            >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
              Edit
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="hidden shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-cream sm:inline-flex"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => toast.info('More actions coming soon')}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-cream"
            >
              More
                  <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
              </button>
            <button
              type="button"
              onClick={() => requestDelete()}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-rose-600 hover:bg-rose-50"
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
              onClick={() => toast.info('Columns: Performance')}
              className="inline-flex items-center gap-1 rounded-md border border-brand-yellow/40 px-2.5 py-1.5 text-xs font-medium text-brand-navy hover:bg-brand-cream"
            >
              Columns: Performance
              <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => toast.info('Breakdown')}
              className="inline-flex items-center gap-1 rounded-md border border-brand-yellow/40 px-2.5 py-1.5 text-xs font-medium text-brand-navy hover:bg-brand-cream"
            >
              Breakdown
              <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-lg border border-brand-yellow/40 bg-white">
          {/* Horizontal scroll starts at Delivery; checkbox / Off-On / name stay pinned */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[1680px] w-full border-separate border-spacing-0 text-left">
              <thead className="text-[12px] font-semibold text-brand-muted">
                <tr>
                  <th
                    className={`${STICKY_CORNER} px-3 py-2.5`}
                    style={{
                      top: 0,
                      left: 0,
                      width: STICKY_W.check,
                      minWidth: STICKY_W.check,
                      maxWidth: STICKY_W.check,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                </th>
                  <th
                    className={`${STICKY_CORNER} px-1 py-2.5`}
                    style={{
                      top: 0,
                      left: STICKY_W.check,
                      width: STICKY_W.on,
                      minWidth: STICKY_W.on,
                      maxWidth: STICKY_W.on,
                    }}
                  >
                    Off/On
                  </th>
                  <th
                    className={`${STICKY_CORNER} ${STICKY_EDGE} px-3 py-2.5`}
                    style={{
                      top: 0,
                      left: STICKY_W.check + STICKY_W.on,
                      width: STICKY_W.name,
                      minWidth: STICKY_W.name,
                    }}
                  >
                    {nameColumnLabel}
                  </th>
                  <th className={`${STICKY_HEAD} min-w-[110px] px-3 py-2.5`}>Delivery</th>
                  <th className={`${STICKY_HEAD} min-w-[88px] px-3 py-2.5`}>Actions</th>
                  <th className={`${STICKY_HEAD} min-w-[160px] px-3 py-2.5`}>Attribution setting</th>
                  <th className={`${STICKY_HEAD} min-w-[110px] px-3 py-2.5`}>Results</th>
                  <th className={`${STICKY_HEAD} min-w-[140px] px-3 py-2.5`}>Cost per result</th>
                  <th className={`${STICKY_HEAD} min-w-[120px] px-3 py-2.5`}>Budget</th>
                  <th className={`${STICKY_HEAD} min-w-[120px] px-3 py-2.5`}>Amount spent</th>
                  <th className={`${STICKY_HEAD} min-w-[110px] px-3 py-2.5`}>Impressions</th>
                  <th className={`${STICKY_HEAD} min-w-[100px] px-3 py-2.5`}>Reach</th>
                  <th className={`${STICKY_HEAD} min-w-[110px] px-3 py-2.5`}>Ends</th>
                  <th className={`${STICKY_HEAD} min-w-[150px] px-3 py-2.5`}>Bid strategy</th>
              </tr>
            </thead>
              <tbody
                className={
                  loading && campaigns.length
                    ? 'opacity-60 transition-opacity duration-200'
                    : 'transition-opacity duration-200'
                }
              >
                {initialLoad ? (
                  <tr>
                    <td colSpan={TABLE_COL_COUNT} className="px-4 py-8 text-sm text-brand-muted">
                      Loading campaigns…
                    </td>
                  </tr>
                ) : null}
                {!initialLoad && loadError && campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COL_COUNT} className="px-4 py-8 text-sm text-rose-600">
                      {loadError}
                    </td>
                  </tr>
                ) : null}
                {!initialLoad && !loadError && campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COL_COUNT} className="px-4 py-8 text-sm text-brand-muted">
                      No campaigns for this account yet. Create one to publish a paused ad.
                    </td>
                  </tr>
                ) : null}
                {!initialLoad && campaigns.length
                  ? rows.map((row) => {
                const isSelected = selected.has(row.id);
                      const stickyBg = isSelected
                        ? 'bg-brand-yellow-soft'
                        : 'bg-white group-hover:bg-brand-cream';
                return (
                  <tr
                    key={row.id}
                          onClick={() => toggleOne(row.id)}
                          className={`group cursor-pointer border-b border-slate-100 ${
                            isSelected ? 'bg-brand-yellow-soft' : 'bg-white hover:bg-brand-cream'
                          }`}
                        >
                          <td
                            className={`${STICKY_LEFT} ${stickyBg} px-3 py-2.5`}
                            style={{
                              left: 0,
                              width: STICKY_W.check,
                              minWidth: STICKY_W.check,
                              maxWidth: STICKY_W.check,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(row.id)}
                        aria-label={`Select ${displayName(row)}`}
                      />
                    </td>
                          <td
                            className={`${STICKY_LEFT} ${stickyBg} px-1 py-2.5`}
                            style={{
                              left: STICKY_W.check,
                              width: STICKY_W.on,
                              minWidth: STICKY_W.on,
                              maxWidth: STICKY_W.on,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                      <Toggle
                        checked={Boolean(rowOn[row.id])}
                        onChange={(v) => {
                          if (statusBusyId === row.id) return;
                          toggleDelivery(row, v);
                        }}
                      />
                    </td>
                          <td
                            className={`${STICKY_LEFT} ${STICKY_EDGE} ${stickyBg} px-3 py-2 align-top`}
                            style={{
                              left: STICKY_W.check + STICKY_W.on,
                              width: STICKY_W.name,
                              minWidth: STICKY_W.name,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="min-w-0">
                              <NameWithIcon
                                level={level}
                                thumb={row.thumb}
                                name={displayName(row)}
                                pinned={pinnedIds.has(row.id)}
                                renaming={renamingId === row.id}
                                draftName={renameDraft}
                                onDraftChange={setRenameDraft}
                                onStartRename={() => startRename(row)}
                                onCommitRename={commitRename}
                                onCancelRename={cancelRename}
                                onOpen={() => openEdit(row)}
                                renameSaving={renamingId === row.id && renameSaving}
                              />
                              {renamingId === row.id ? null : (
                                <div className="pl-[2.625rem]">
                                  <RowHoverActions
                                    rowId={row.id}
                                    name={displayName(row)}
                                    pinned={pinnedIds.has(row.id)}
                                    moreOpen={hoverMoreId === row.id}
                                    onToggleMore={(id) =>
                                      setHoverMoreId((cur) => (cur === id ? null : id))
                                    }
                                    onCloseMore={() => setHoverMoreId(null)}
                                    onCharts={() => {
                                      if (onCharts) onCharts(row);
                                      else toast.info(`Charts for “${displayName(row)}”`);
                                    }}
                                    onEdit={() => openEdit(row)}
                                    onDelete={() => requestDelete([row.id])}
                                    onDuplicate={() => {
                                      setCampaigns((prev) => {
                                        const copy = {
                                          ...row,
                                          id: `${row.id}-copy-${Date.now()}`,
                                          name: `${row.name} (copy)`,
                                          campaignName: `${row.campaignName} (copy)`,
                                          status: 'draft',
                                          delivery: 'In draft',
                                          on: false,
                                          remoteId: '',
                                        };
                                        return [copy, ...prev];
                                      });
                                      setTotal((t) => t + 1);
                                      toast.success(`Duplicated “${displayName(row)}”`);
                                    }}
                                    onCompare={() =>
                                      toast.info(`Compare “${displayName(row)}”`)
                                    }
                                    onPin={() => {
                                      setPinnedIds((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(row.id)) next.delete(row.id);
                                        else next.add(row.id);
                                        return next;
                                      });
                                      setHoverMoreId(null);
                                      toast.success(
                                        pinnedIds.has(row.id)
                                          ? `Unpinned “${displayName(row)}”`
                                          : `Pinned “${displayName(row)}”`
                                      );
                                    }}
                                    onHistory={() => {
                                      setHoverMoreId(null);
                                      toast.info(`History for “${displayName(row)}”`);
                                    }}
                                    onRules={() => {
                                      setHoverMoreId(null);
                                      toast.info(`Rules for “${displayName(row)}”`);
                                    }}
                                  />
                                </div>
                              )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                              <span
                                className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${
                                  row.status === 'failed'
                                    ? 'border-red-500'
                                    : row.status === 'draft' || !rowOn[row.id]
                                      ? 'border-slate-400'
                                      : 'border-emerald-500'
                                }`}
                              />
                              {!rowOn[row.id] && row.status !== 'failed' && row.status !== 'draft'
                                ? 'Off'
                                : row.delivery}
                      </span>
                    </td>
                          <td className="px-3 py-2.5 text-sm text-slate-500">
                            {row.status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 text-rose-600" title={row.detail || 'Needs review'}>
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                </svg>
                                Review
                              </span>
                            ) : (
                              '—'
                            )}
                    </td>
                    <td className="px-3 py-2.5">
                            <MetricCell
                              value={row.attributionPrimary}
                              sub={row.attributionSecondary}
                            />
                    </td>
                    <td className="px-3 py-2.5">
                            <MetricCell value={row.results} sub={row.resultLabel} />
                    </td>
                    <td className="px-3 py-2.5">
                            <MetricCell value={row.costPerResult} sub={row.costPerResultLabel} />
                    </td>
                    <td className="px-3 py-2.5">
                            <MetricCell value={row.budgetAmount} sub={row.budgetType} />
                    </td>
                          <td className="px-3 py-2.5 text-sm text-slate-800">{row.amountSpent}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-800">{row.impressions}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-800">{row.reach}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">{row.ends}</td>
                    <td className="px-3 py-2.5">
                            <MetricCell value={row.bidStrategy} sub={row.bidSub || undefined} />
                    </td>
                  </tr>
                );
                    })
                  : null}
            </tbody>
          </table>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-brand-yellow/30 px-4 py-2.5 text-xs text-brand-muted">
            <span>
              {initialLoad
                ? 'Loading campaigns…'
                : total
                  ? `${fromRow}–${toRow} of ${total}`
                  : '0 campaigns'}
              {loadError && campaigns.length ? ` · ${loadError}` : ''}
              {selected.size ? ` · ${selected.size} selected` : ''}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setListQuery((current) => ({ ...current, page: current.page - 1 }))
                }
                className="rounded-md border border-brand-yellow/40 px-2.5 py-1 font-medium text-brand-navy hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              {pages.map((item, index) => {
                const previous = pages[index - 1];
                return (
                  <span key={item} className="inline-flex items-center gap-1">
                    {previous && item - previous > 1 ? (
                      <span className="px-1 text-slate-400">…</span>
                    ) : null}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setListQuery((current) => ({ ...current, page: item }))}
                      className={`h-7 min-w-7 rounded-md px-2 font-semibold ${
                        item === page
                          ? 'bg-brand-navy text-white'
                          : 'text-brand-navy hover:bg-brand-cream'
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
                onClick={() =>
                  setListQuery((current) => ({ ...current, page: current.page + 1 }))
                }
                className="rounded-md border border-brand-yellow/40 px-2.5 py-1 font-medium text-brand-navy hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
        </div>
      </div>
        </div>
      </div>

      {deleteConfirmOpen ? (
        <ConfirmModal
          title={pendingDeleteIds.length === 1 ? 'Delete campaign?' : 'Delete selected?'}
          message={(() => {
            const pendingRows = pendingDeleteIds
              .map((id) => campaigns.find((row) => row.id === id))
              .filter(Boolean);
            if (pendingRows.length === 1) {
              return `Delete “${displayName(pendingRows[0])}”? This removes it from Meta and this list.`;
            }
            return `Delete ${pendingDeleteIds.length} campaigns from Meta and this list? This can’t be undone.`;
          })()}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isLoading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => {
            if (deleting) return;
            setDeleteConfirmOpen(false);
            setPendingDeleteIds([]);
          }}
        />
      ) : null}
    </div>
  );
}
