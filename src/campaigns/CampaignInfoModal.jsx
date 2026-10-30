import { useEffect, useState } from 'react';
import { getCampaignById } from '../api/campaignApi';

const formatWhen = (value) => {
  if (!value) return { date: '—', time: '—' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '—', time: '—' };
  return {
    date: date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const actionLabel = (action) => {
  const raw = String(action || '').toLowerCase();
  if (raw === 'created') return 'Created';
  if (raw === 'updated') return 'Updated';
  if (raw === 'renamed') return 'Renamed';
  if (raw === 'submitted') return 'Submitted to Meta';
  if (raw === 'activated') return 'Turned on';
  if (raw === 'paused') return 'Turned off';
  return action || 'Changed';
};

const normalizeTrail = (doc) => {
  const root = Array.isArray(doc?.createdBy) && doc.createdBy.length && typeof doc.createdBy[0] === 'object'
    ? doc.createdBy
    : null;
  const nested = root
    || (Array.isArray(doc?.campaign?.createdByHistory) && doc.campaign.createdByHistory.length
      ? doc.campaign.createdByHistory
      : null)
    || (Array.isArray(doc?.campaign?.changeHistory) ? doc.campaign.changeHistory : [])
    || [];
  return nested.map((entry) => ({
    userId: entry.userId ? String(entry.userId) : '',
    name: entry.name || 'Unknown user',
    action: entry.action || 'updated',
    at: entry.at || null,
  }));
};

export default function CampaignInfoModal({
  open,
  onClose,
  campaignId,
  campaignName,
  createdBy = [],
}) {
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setError('');
    setTrail([...(Array.isArray(createdBy) ? createdBy : [])].slice().reverse());

    if (!campaignId) return undefined;

    setLoading(true);
    getCampaignById(campaignId)
      .then((payload) => {
        if (cancelled) return;
        const doc = payload?.campaign || payload;
        const next = normalizeTrail(doc).reverse();
        if (next.length) setTrail(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message || err.message || '');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, campaignId, createdBy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-brand-navy">Campaign info</h2>
            <p className="mt-0.5 truncate text-sm text-slate-500">{campaignName || 'Campaign'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
            aria-label="Close campaign info"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.3 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.29-6.3z" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Created by
          </p>
          {loading ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Loading trail…
            </div>
          ) : null}
          {!loading && error ? (
            <p className="mb-2 text-xs text-amber-700">{error}</p>
          ) : null}
          {!loading && trail.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No change history recorded for this campaign yet.
            </div>
          ) : null}
          {!loading && trail.length > 0 ? (
            <ul className="space-y-2">
              {trail.map((entry, index) => {
                const when = formatWhen(entry.at);
                return (
                  <li
                    key={`${entry.userId || entry.name}-${entry.at || index}`}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-navy">
                        {entry.name || 'Unknown user'}
                      </p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                        {actionLabel(entry.action)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {when.date} · {when.time}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-brand-navy hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
