import { useCallback, useEffect, useState } from 'react';
import { fetchMetaLead, importMetaLeads, syncMetaLeads } from '../api/metaLeadApi';
import { formatDay, formatNumber } from './format';

const STAGES = [
  ['', 'All'],
  ['INTAKE', 'Intake'],
  ['QUALIFIED', 'Qualified'],
  ['CONVERTED', 'Converted'],
  ['NOT_QUALIFIED', 'Not qualified'],
  ['LOST', 'Lost'],
];

const stageLabel = (stage) => STAGES.find(([value]) => value === stage)?.[1] || stage || '—';

const stageClass = (stage) => {
  if (stage === 'CONVERTED') return 'bg-emerald-700 text-white';
  if (stage === 'QUALIFIED') return 'bg-emerald-100 text-emerald-800';
  if (stage === 'LOST' || stage === 'NOT_QUALIFIED') return 'bg-slate-200 text-slate-700';
  return 'bg-sky-100 text-sky-800';
};

const MetaLeadRecords = () => {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [stageCounts, setStageCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadLeads = useCallback((signal) => {
    setLoading(true);
    setError('');
    const params = { page, limit: 25, sort: 'submittedAt', order: 'desc' };
    if (stage) params.stage = stage;
    if (search.trim()) params.search = search.trim();
    return importMetaLeads(params, signal)
      .then((data) => {
        if (signal?.aborted) return;
        setLeads(data.leads || []);
        setPagination(data.pagination || {
          page: data.page || 1,
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setStageCounts(data.stageCounts || {});
      })
      .catch((loadError) => {
        if (signal?.aborted) return;
        setLeads([]);
        setError(loadError.message || 'Could not load leads');
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, [page, search, stage]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      loadLeads(controller.signal);
    }, search ? 300 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [loadLeads, search]);

  const onSync = async () => {
    setSyncing(true);
    setError('');
    try {
      await syncMetaLeads();
      setPage(1);
      await loadLeads();
    } catch (syncError) {
      setError(syncError.message || 'Could not sync leads');
    } finally {
      setSyncing(false);
    }
  };

  const onOpen = async (lead) => {
    const id = lead._id || lead.id;
    if (!id) return;
    setDetailLoading(true);
    setSelected(lead);
    try {
      const data = await fetchMetaLead(id);
      setSelected(data.lead || lead);
    } catch (detailError) {
      setError(detailError.message || 'Could not open lead');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-w-0 max-w-full space-y-4">
      <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-brand-yellow/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-brand-navy">Leads</h2>
            <button
              type="button"
              onClick={onSync}
              disabled={syncing}
              className="min-h-11 rounded-lg bg-brand-navy px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {syncing ? 'Syncing…' : 'Sync from Meta'}
            </button>
          </div>
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search by name, email, or phone"
            aria-label="Search leads"
            className="h-11 w-full rounded-lg border border-brand-yellow/40 px-3 text-sm text-brand-navy outline-none focus:border-brand-navy md:max-w-xs"
          />
          <div className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto">
            {STAGES.map(([value, label]) => {
              const active = stage === value;
              const count = value === '' ? pagination.total : stageCounts[value];
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setStage(value); setPage(1); }}
                  className={`flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${
                    active ? 'bg-brand-navy text-white' : 'border border-brand-yellow/40 text-brand-navy'
                  }`}
                >
                  <span>{label}</span>
                  {count != null && (
                    <span className={`rounded px-1.5 text-[10px] ${active ? 'bg-brand-navy-hover text-white' : 'text-brand-muted'}`}>
                      {formatNumber(count)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <p className="px-4 py-8 text-sm text-brand-muted">Loading leads…</p>}
        {!loading && error && <p className="px-4 py-8 text-sm text-red-700">{error}</p>}
        {!loading && !error && leads.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">No leads yet. Sync from Meta to import Instant Form leads.</p>
        )}

        {!loading && !error && leads.length > 0 && (
          <>
            <div className="space-y-2 p-3 md:hidden">
              {leads.map((lead) => {
                const id = lead._id || lead.id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpen(lead)}
                    className="w-full rounded-xl border border-brand-yellow/30 p-3 text-left"
                  >
                    <span className="font-semibold text-brand-navy">{lead.fullName || 'Unnamed lead'}</span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${stageClass(lead.stage)}`}>
                      {stageLabel(lead.stage)}
                    </span>
                    <p className="mt-1 text-xs text-brand-muted">{lead.metaCampaignName || 'No campaign'} · {formatDay(lead.submittedAt || lead.createdAt)}</p>
                  </button>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-navy">
                  <tr>
                    {['Lead', 'Campaign', 'Submitted', 'Stage', 'Phone'].map((label) => (
                      <th key={label} className="px-4 py-3 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const id = lead._id || lead.id;
                    const active = selected && (selected._id === id || selected.id === id);
                    return (
                      <tr
                        key={id}
                        onClick={() => onOpen(lead)}
                        className={`cursor-pointer border-t border-brand-yellow/20 ${active ? 'bg-brand-yellow-soft/60' : 'hover:bg-brand-cream'}`}
                      >
                        <td className="px-4 py-3 font-semibold text-brand-navy">{lead.fullName || 'Unnamed lead'}</td>
                        <td className="px-4 py-3">{lead.metaCampaignName || '—'}</td>
                        <td className="px-4 py-3 text-brand-muted">{formatDay(lead.submittedAt || lead.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stageClass(lead.stage)}`}>
                            {stageLabel(lead.stage)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-brand-muted">{lead.phone || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-brand-yellow/30 px-4 py-3 text-sm">
              <p className="text-brand-muted">{formatNumber(pagination.total)} leads</p>
              <div className="flex gap-2">
                <button type="button" disabled={!pagination.hasPrevPage} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 disabled:opacity-40">Previous</button>
                <span className="py-1.5 text-brand-navy">{pagination.page || page} / {Math.max(pagination.totalPages || 1, 1)}</span>
                <button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </section>

      {selected && (
        <section className="rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Lead detail</p>
              <h3 className="mt-1 text-base font-semibold text-brand-navy">{selected.fullName || 'Unnamed lead'}</h3>
              {detailLoading && <p className="mt-1 text-xs text-brand-muted">Refreshing…</p>}
            </div>
            <button type="button" onClick={() => setSelected(null)} className="min-h-11 rounded-lg border border-brand-yellow/40 px-3 text-sm font-semibold text-brand-navy">Close</button>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs text-brand-muted">Stage</dt><dd className="text-sm font-medium text-brand-navy">{stageLabel(selected.stage)}</dd></div>
            <div><dt className="text-xs text-brand-muted">Campaign</dt><dd className="text-sm font-medium text-brand-navy">{selected.metaCampaignName || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Email</dt><dd className="text-sm font-medium text-brand-navy">{selected.email || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Phone</dt><dd className="text-sm font-medium text-brand-navy">{selected.phone || '—'}</dd></div>
            <div><dt className="text-xs text-brand-muted">Submitted</dt><dd className="text-sm font-medium text-brand-navy">{formatDay(selected.submittedAt || selected.createdAt)}</dd></div>
            <div><dt className="text-xs text-brand-muted">Form</dt><dd className="text-sm font-medium text-brand-navy">{selected.metaFormName || '—'}</dd></div>
          </dl>
        </section>
      )}
    </div>
  );
};

export default MetaLeadRecords;
