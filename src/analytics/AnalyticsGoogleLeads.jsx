import { useCallback, useEffect, useState } from 'react';
import { listGoogleAdsLeads } from '../api/googleAdsCampaignApi';
import { formatDay, formatNumber } from './format';

const PAGE_SIZE = 25;

const AnalyticsGoogleLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  const loadLeads = useCallback(async ({ nextOffset = 0, append = false, signal } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');

    try {
      const data = await listGoogleAdsLeads({
        limit: PAGE_SIZE,
        offset: nextOffset,
        signal,
      });
      if (signal?.aborted) return;

      const nextLeads = data.leads || [];
      setLeads((current) => (append ? [...current, ...nextLeads] : nextLeads));
      setOffset(nextOffset);
      setHasMore(Boolean(data.hasMore));
      setTotal(Number(data.total) || nextLeads.length);
      if (!append && nextLeads.length === 0) setSelected(null);
    } catch (loadError) {
      if (signal?.aborted) return;
      if (!append) {
        setLeads([]);
        setSelected(null);
      }
      setError(loadError.message || 'Could not load Google Ads leads');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadLeads({ nextOffset: 0, append: false, signal: controller.signal });
    return () => controller.abort();
  }, [loadLeads]);

  const onLoadMore = () => {
    if (loadingMore || !hasMore) return;
    loadLeads({ nextOffset: offset + PAGE_SIZE, append: true });
  };

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-brand-yellow/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-brand-navy">Google Ads leads</h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              Lead form submissions pulled live from Google Ads automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadLeads({ nextOffset: 0, append: false })}
            disabled={loading}
            className="min-h-11 rounded-lg border border-brand-yellow/40 px-3 text-sm font-semibold text-brand-navy disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {loading && <p className="px-4 py-8 text-sm text-brand-muted">Loading Google Ads leads…</p>}
        {!loading && error && <p className="px-4 py-8 text-sm text-red-700">{error}</p>}
        {!loading && !error && leads.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">
            No Google Ads lead form submissions yet. New form leads will appear here automatically.
          </p>
        )}

        {!loading && !error && leads.length > 0 && (
          <>
            <div className="space-y-2 p-3 md:hidden">
              {leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => setSelected(lead)}
                  className="w-full rounded-xl border border-brand-yellow/30 p-3 text-left"
                >
                  <span className="font-semibold text-brand-navy">{lead.fullName || 'Unnamed lead'}</span>
                  <p className="mt-1 text-xs text-brand-muted">
                    {lead.campaignName || 'No campaign'} · {formatDay(lead.submittedAt)}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">{lead.email || lead.phone || '—'}</p>
                </button>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-navy">
                  <tr>
                    {['Lead', 'Campaign', 'Form', 'Submitted', 'Contact'].map((label) => (
                      <th key={label} className="px-4 py-3 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const active = selected?.id === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelected(lead)}
                        className={`cursor-pointer border-t border-brand-yellow/20 ${active ? 'bg-brand-yellow-soft/60' : 'hover:bg-brand-cream'}`}
                      >
                        <td className="px-4 py-3 font-semibold text-brand-navy">{lead.fullName || 'Unnamed lead'}</td>
                        <td className="px-4 py-3">{lead.campaignName || '—'}</td>
                        <td className="px-4 py-3 text-brand-muted">{lead.formName || '—'}</td>
                        <td className="px-4 py-3 text-brand-muted">{formatDay(lead.submittedAt)}</td>
                        <td className="px-4 py-3 text-brand-muted">{lead.phone || lead.email || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-yellow/30 px-4 py-3 text-sm">
              <p className="text-brand-muted">{formatNumber(total)} lead{total === 1 ? '' : 's'} loaded</p>
              {hasMore ? (
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 font-semibold text-brand-navy disabled:opacity-40"
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              ) : null}
            </div>
          </>
        )}
      </section>

      {selected && (
        <section className="rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Google lead detail</p>
              <h3 className="mt-1 text-base font-semibold text-brand-navy">{selected.fullName || 'Unnamed lead'}</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="min-h-11 rounded-lg border border-brand-yellow/40 px-3 text-sm font-semibold text-brand-navy"
            >
              Close
            </button>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs text-brand-muted">Campaign</dt><dd className="text-sm font-medium text-brand-navy">{selected.campaignName || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Form</dt><dd className="text-sm font-medium text-brand-navy">{selected.formName || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Email</dt><dd className="text-sm font-medium text-brand-navy">{selected.email || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Phone</dt><dd className="text-sm font-medium text-brand-navy">{selected.phone || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Submitted</dt><dd className="text-sm font-medium text-brand-navy">{formatDay(selected.submittedAt)}</dd></div>
            <div><dt className="text-xs text-brand-muted">GCLID</dt><dd className="truncate text-sm font-medium text-brand-navy">{selected.gclid || '—'}</dd></div>
          </dl>
          {Array.isArray(selected.answers) && selected.answers.length > 0 && (
            <div className="mt-4 border-t border-brand-yellow/30 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Form answers</p>
              <ul className="mt-2 space-y-2">
                {selected.answers.map((answer) => (
                  <li key={`${answer.key}-${answer.label}`} className="text-sm">
                    <span className="text-brand-muted">{answer.label}: </span>
                    <span className="font-medium text-brand-navy">{answer.value || '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default AnalyticsGoogleLeads;
