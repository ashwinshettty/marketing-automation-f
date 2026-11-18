import { useEffect, useRef, useState } from 'react';
import { listGoogleAdsCampaignPicker } from '../../api/googleAdsCampaignApi';
import { GaIcon } from '../icons/GoogleAdsIcons';

const TYPE_MARK = {
  SEARCH: 'S',
  DISPLAY: 'D',
  VIDEO: 'V',
  PERFORMANCE_MAX: 'P',
  SHOPPING: 'Sh',
  SMART: 'Sm',
  DEMAND_GEN: 'Dg',
  MULTI_CHANNEL: 'A',
};

function DeliveryMark({ row }) {
  const delivery = String(row.deliveryStatus || row.status || '').toUpperCase();
  if (delivery === 'PAUSED') {
    return (
      <span
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#5f6368]"
        title="Paused"
        aria-hidden="true"
      >
        <span className="flex h-2 w-2 items-center justify-center gap-[1.5px]">
          <span className="h-2 w-[1.5px] rounded-sm bg-white" />
          <span className="h-2 w-[1.5px] rounded-sm bg-white" />
        </span>
      </span>
    );
  }
  if (delivery === 'REMOVED') {
    return (
      <span
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#d93025] text-[9px] font-bold leading-none text-white"
        title="Removed"
        aria-hidden="true"
      >
        ×
      </span>
    );
  }
  if (row.source !== 'google' || delivery === 'DRAFT' || delivery === 'SUBMITTING' || delivery === 'VALIDATED') {
    return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ga-blue)]" aria-hidden="true" />;
  }
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#188038]" title="Enabled" aria-hidden="true" />;
}

function ChannelMark({ channelType }) {
  const mark = TYPE_MARK[String(channelType || '').toUpperCase()] || '•';
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-[#dadce0] text-[9px] font-semibold text-[#5f6368]"
      aria-hidden="true"
    >
      {mark}
    </span>
  );
}

/**
 * Google Ads–style campaign filter dropdown.
 * Loads 15 names at a time from /campaigns/picker, with name search and Load more.
 */
export default function CampaignPickerDropdown({
  campaignId = '',
  campaignName = '',
  allowAll = true,
  allLabel = 'All campaigns',
  onChange,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [anchor, setAnchor] = useState(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);

  const label = campaignName || (campaignId ? 'Campaign' : allLabel);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = query.trim();
      setAppliedQuery((prev) => (prev === next ? prev : next));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    listGoogleAdsCampaignPicker({ query: appliedQuery, page: 1 })
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data?.campaigns || []);
        setPage(data?.page || 1);
        setTotal(data?.total || 0);
        setHasMore(Boolean(data?.hasMore));
      })
      .catch((err) => {
        if (cancelled) return;
        setCampaigns([]);
        setTotal(0);
        setHasMore(false);
        setError(err?.response?.data?.message || err?.message || 'Could not load campaigns');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, appliedQuery]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!panelRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    setQuery('');
    setAppliedQuery('');
    return undefined;
  }, [open]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    listGoogleAdsCampaignPicker({ query: appliedQuery, page: nextPage })
      .then((data) => {
        setCampaigns((prev) => {
          const seen = new Set(prev.map((row) => row.id));
          const extra = (data?.campaigns || []).filter((row) => !seen.has(row.id));
          return [...prev, ...extra];
        });
        setPage(data?.page || nextPage);
        setTotal(data?.total || total);
        setHasMore(Boolean(data?.hasMore));
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || 'Could not load more campaigns');
      })
      .finally(() => setLoadingMore(false));
  };

  const choose = (id, campaign = null) => {
    onChange?.(id, campaign);
    setOpen(false);
  };

  const toggle = (event) => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(420, Math.max(320, window.innerWidth - 16));
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    setAnchor({
      top: rect.bottom + 4,
      left,
      width,
      maxHeight: Math.max(280, Math.min(480, spaceBelow)),
    });
    setOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className="inline-flex max-w-[280px] items-center gap-2 rounded-full border border-[var(--ga-border)] bg-white px-2.5 py-1.5 text-sm text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]"
      >
        <GaIcon name="home" className="h-3.5 w-3.5 shrink-0 text-[var(--ga-muted)]" />
        <span className="truncate">{label}</span>
        <span aria-hidden="true" className="text-[10px] text-[var(--ga-muted)]">▼</span>
      </button>

      {open && anchor ? (
        <div
          ref={panelRef}
          role="listbox"
          aria-label="Campaigns"
          style={{
            top: anchor.top,
            left: anchor.left,
            width: anchor.width,
            maxHeight: anchor.maxHeight,
          }}
          className="fixed z-50 flex flex-col overflow-hidden rounded-lg border border-[var(--ga-border)] bg-white shadow-[0_8px_24px_rgba(32,33,36,0.16)]"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--ga-border)] px-3 py-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0fe] px-2.5 py-1 text-xs font-medium text-[var(--ga-blue)]">
              Campaign status: All
            </span>
            <span className="text-xs text-[var(--ga-muted)]">Alphabetical</span>
          </div>

          <div className="border-b border-[var(--ga-border)] px-3 py-2">
            <label className="relative block">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[var(--ga-muted)]">
                <GaIcon name="search" className="h-3.5 w-3.5" />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={total ? `Search ${total} campaigns` : 'Search campaigns by name'}
                aria-label="Search campaigns by name"
                className="w-full rounded-md border border-[var(--ga-border)] bg-white py-2 pr-3 pl-8 text-sm text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)]"
              />
            </label>
            <p className="mt-2 text-xs text-[var(--ga-muted)]">
              {loading && !campaigns.length
                ? 'Loading campaigns…'
                : `View ${total ? `all ${total}` : '0'} campaigns in this view`}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            {allowAll ? (
              <button
                type="button"
                role="option"
                aria-selected={!campaignId}
                onClick={() => choose('')}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--ga-blue-soft)] ${!campaignId ? 'bg-[var(--ga-blue-soft)] text-[var(--ga-blue)]' : 'text-[var(--ga-ink)]'}`}
              >
                {allLabel}
              </button>
            ) : null}

            {campaigns.map((campaign) => {
              const selected = campaign.id === campaignId;
              return (
                <button
                  key={campaign.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => choose(campaign.id, campaign)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--ga-blue-soft)] ${selected ? 'bg-[var(--ga-blue-soft)] text-[var(--ga-blue)]' : 'text-[var(--ga-ink)]'}`}
                >
                  <DeliveryMark row={campaign} />
                  <ChannelMark channelType={campaign.channelType} />
                  <span className="min-w-0 flex-1 truncate">{campaign.name}</span>
                </button>
              );
            })}

            {!loading && campaigns.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[var(--ga-muted)]">
                {appliedQuery ? 'No campaigns match that name.' : 'No campaigns available.'}
              </p>
            ) : null}

            {error ? <p className="px-3 py-2 text-sm text-[#d93025]">{error}</p> : null}

            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="block w-full px-3 py-2.5 text-left text-sm font-medium text-[var(--ga-blue)] hover:bg-[var(--ga-blue-soft)] disabled:text-[var(--ga-muted)]"
              >
                {loadingMore ? 'Loading…' : 'Load more campaigns'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
