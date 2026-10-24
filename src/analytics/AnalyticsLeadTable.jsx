import { useEffect, useState } from 'react';
import { STAGE_LABELS, formatDay, formatNumber, stageClass } from './format';

const fieldClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy';

const STAGE_CHIPS = [
  ['', 'All leads'],
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['engaged', 'Engaged'],
  ['qualified', 'Qualified'],
  ['converted', 'Converted'],
  ['lost', 'Lost'],
];

const AnalyticsLeadTable = ({
  leads,
  pagination,
  filters,
  loading,
  error,
  onChange,
  onOpen,
  selectedId,
  stageCounts = {},
}) => {
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== (filters.search || '')) onChange({ search, page: 1 });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search, filters.search, onChange]);

  const sortBy = (sort) => {
    const direction = filters.sort === sort && filters.direction === 'desc' ? 'asc' : 'desc';
    onChange({ sort, direction, page: 1 });
  };

  return (
    <section id="lead-table" className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
      <div className="border-b border-brand-yellow/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads by name, owner, campaign..."
            aria-label="Search leads"
            className={`${fieldClass} h-12 min-w-0 flex-1 text-base md:h-10 md:min-w-[16rem] md:text-sm`}
          />
        </div>
        <div className="no-scrollbar mt-3 flex min-w-0 gap-2 overflow-x-auto">
          {STAGE_CHIPS.map(([value, label]) => {
            const active = (filters.stage || '') === value;
            const count = value === '' ? pagination.total : stageCounts[value];
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange({ stage: value, page: 1 })}
                className={`flex h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold md:h-7 md:px-2.5 md:text-xs ${
                  active ? 'bg-brand-navy text-white' : 'border border-brand-yellow/40 bg-white text-brand-navy'
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

      {loading && <div className="h-40 animate-pulse bg-brand-cream/50" />}
      {!loading && error && <p className="px-4 py-8 text-center text-sm text-red-700">{error}</p>}
      {!loading && !error && leads.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-brand-muted">No leads match these filters.</p>
      )}

      {!loading && !error && leads.length > 0 && (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-navy">
                <tr>
                  {[
                    ['name', 'Lead name'],
                    ['platform', 'Source'],
                    ['campaign', 'Campaign'],
                    ['createdAt', 'Created date'],
                    ['stage', 'Status'],
                    ['ownerName', 'Owner'],
                    ['lastContactedAt', 'Last contact'],
                  ].map(([key, label]) => (
                    <th key={key} className="px-4 py-3">
                      <button type="button" onClick={() => sortBy(key)} className="font-semibold">
                        {label}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onOpen(lead)}
                    className={`cursor-pointer border-t border-slate-100 ${selectedId === lead.id ? 'bg-brand-yellow-soft/60' : 'hover:bg-brand-cream'}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-navy">{lead.name}</p>
                    </td>
                    <td className="px-4 py-3">{lead.platformLabel}</td>
                    <td className="px-4 py-3">{lead.campaign || '—'}</td>
                    <td className="px-4 py-3 text-brand-muted">{formatDay(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stageClass(lead.stage)}`}>
                        {STAGE_LABELS[lead.stage] || lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{lead.ownerName || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-brand-muted">{formatDay(lead.lastContactedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 p-3 md:hidden">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => onOpen(lead)}
                className="w-full rounded-xl border border-brand-yellow/30 p-3 text-left"
              >
                <span className="font-semibold text-brand-navy">{lead.name}</span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${stageClass(lead.stage)}`}>
                  {STAGE_LABELS[lead.stage]}
                </span>
                <p className="mt-1 text-xs text-brand-muted">{lead.platformLabel} · {lead.campaign || 'No campaign'}</p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-brand-yellow/30 px-4 py-3 text-sm">
            <p className="text-brand-muted">{formatNumber(pagination.total)} leads</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => onChange({ page: pagination.page - 1 })}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="py-1.5 text-brand-navy">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => onChange({ page: pagination.page + 1 })}
                className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default AnalyticsLeadTable;
