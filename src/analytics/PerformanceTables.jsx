import { useMemo, useState } from 'react';
import { formatNumber, formatPercent } from './format';

const panel = 'min-w-0 max-w-full overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm';

const CHANNEL_DOT = {
  meta: 'bg-brand-navy',
  google: 'bg-brand-yellow',
  organic: 'bg-brand-muted',
  other: 'bg-brand-muted',
  unknown: 'bg-brand-yellow-soft',
};

export const ChannelBreakdown = ({ channels }) => {
  const served = channels.filter((row) => row.key === 'meta' || row.key === 'google');
  return (
  <section className={`${panel} flex h-full flex-col p-5`}>
    <div className="flex items-start justify-between gap-3 border-b border-brand-yellow/40 pb-4">
      <div>
        <h2 className="text-base font-semibold text-brand-navy">Channel breakdown</h2>
        <p className="mt-0.5 text-sm text-brand-muted">Meta Ads and Google Ads.</p>
      </div>
    </div>
    <div className="mt-2 min-w-0 max-w-full overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b-2 border-brand-yellow/40 text-[11px] uppercase tracking-wider text-brand-muted">
            <th className="px-3 py-3 font-semibold">Channel</th>
            <th className="px-2 py-3 text-right font-semibold">Leads</th>
            <th className="px-2 py-3 text-right font-semibold">Qualified</th>
            <th className="px-2 py-3 text-right font-semibold">Converted</th>
            <th className="px-2 py-3 text-right font-semibold">Conv. rate</th>
          </tr>
        </thead>
        <tbody>
          {served.map((row) => (
            <tr key={row.key} className="border-t border-brand-yellow/20 hover:bg-brand-cream">
              <td className="px-3 py-3.5 font-semibold text-brand-navy">
                <span className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${CHANNEL_DOT[row.key] || 'bg-brand-navy'}`} />
                  {row.label}
                </span>
              </td>
              <td className="px-2 py-3.5 text-right font-medium">{formatNumber(row.leads)}</td>
              <td className="px-2 py-3.5 text-right">{formatNumber(row.qualified)}</td>
              <td className="px-2 py-3.5 text-right font-semibold text-brand-navy">{formatNumber(row.converted)}</td>
              <td className="px-2 py-3.5 text-right">{formatPercent(row.conversionRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
  );
};

const SERVED = new Set(['meta', 'google']);

const PLATFORM_PILLS = [
  ['all', 'All'],
  ['meta', 'Meta Ads'],
  ['google', 'Google Ads'],
];

const PerformanceTables = ({ channels, campaigns, onCampaign, showChannels = true, onExport, exporting = false }) => {
  const [sort, setSort] = useState('leads');
  const [direction, setDirection] = useState('desc');
  const [query, setQuery] = useState('');
  const [platformPill, setPlatformPill] = useState('all');
  const [page, setPage] = useState(1);
  const sortedCampaigns = useMemo(() => {
    const factor = direction === 'asc' ? 1 : -1;
    return campaigns.filter((row) => SERVED.has(row.platform)).sort((left, right) => {
      const a = left[sort] ?? -1;
      const b = right[sort] ?? -1;
      if (typeof a === 'string') return a.localeCompare(b) * factor;
      return (a - b) * factor;
    });
  }, [campaigns, sort, direction]);

  const visibleCampaigns = sortedCampaigns.filter((row) => {
    const matchesQuery = row.name.toLowerCase().includes(query.trim().toLowerCase());
    const matchesPlatform = platformPill === 'all' || row.platform === platformPill;
    return matchesQuery && matchesPlatform;
  });
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(visibleCampaigns.length / pageSize));
  const pageRows = visibleCampaigns.slice((page - 1) * pageSize, page * pageSize);

  const sortBy = (key) => {
    if (sort === key) setDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
    else {
      setSort(key);
      setDirection('desc');
    }
  };

  return (
  <div className="min-w-0 max-w-full space-y-3">
    {showChannels && <section className={panel}>
      <div className="border-b border-brand-yellow/30 px-4 py-4">
        <h2 className="text-base font-semibold text-brand-navy">Channel comparison</h2>
        <p className="mt-1 text-sm text-brand-muted">Leads, qualified, and converted by source.</p>
      </div>
      <div className="min-w-0 max-w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-navy">
            <tr>
              {['Channel', 'Leads', 'Qualified', 'Converted', 'Conv. rate'].map((label) => (
                <th key={label} className="px-4 py-3 font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.filter((row) => SERVED.has(row.key)).map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-brand-navy">{row.label}</td>
                <td className="px-4 py-3">{formatNumber(row.leads)}</td>
                <td className="px-4 py-3">{formatNumber(row.qualified)}</td>
                <td className="px-4 py-3">{formatNumber(row.converted)}</td>
                <td className="px-4 py-3">{formatPercent(row.conversionRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>}

    <section className={panel}>
      <div className="flex flex-col gap-4 border-b border-brand-yellow/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-brand-navy">Campaign performance</h2>
            <p className="mt-0.5 text-sm text-brand-muted">Who came in, who was qualified, and who converted.</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2">
            <button type="button" onClick={onExport} disabled={exporting || !onExport} className="rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-semibold text-brand-navy disabled:opacity-50">
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            placeholder="Search campaigns..."
            aria-label="Search campaigns"
            className="h-12 w-full rounded-lg border border-brand-yellow/40 px-3 text-base text-brand-navy outline-none focus:border-brand-navy md:h-10 md:max-w-xs md:text-sm"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORM_PILLS.map(([value, label]) => {
              const count = sortedCampaigns.filter((row) => value === 'all' || row.platform === value).length;
              if (value !== 'all' && count === 0) return null;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setPlatformPill(value); setPage(1); }}
                  className={`h-7 rounded-lg px-3 text-xs font-semibold ${
                    platformPill === value ? 'bg-brand-navy text-white' : 'border border-brand-yellow/40 bg-white text-brand-muted'
                  }`}
                >
                  {label} ({formatNumber(count)})
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="space-y-2 p-3 md:hidden">
        {pageRows.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-brand-muted">No campaigns in this period.</p>
        ) : pageRows.map((row) => (
          <article key={`${row.platform}-${row.key}`} className="rounded-xl border border-brand-yellow/30 p-3">
            <button type="button" onClick={() => onCampaign(row.key)} className="min-h-11 w-full text-left text-sm font-semibold text-brand-navy">
              {row.name}
            </button>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded border border-brand-yellow/40 bg-brand-cream px-2 py-0.5 font-semibold text-brand-navy">{row.platformLabel}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-[11px] uppercase text-brand-muted">Leads</dt><dd className="font-semibold text-brand-navy">{formatNumber(row.leads)}</dd></div>
              <div><dt className="text-[11px] uppercase text-brand-muted">Qualified</dt><dd className="font-semibold text-brand-navy">{formatNumber(row.qualified)}</dd></div>
              <div><dt className="text-[11px] uppercase text-brand-muted">Converted</dt><dd className="font-semibold text-brand-navy">{formatNumber(row.converted)}</dd></div>
              <div><dt className="text-[11px] uppercase text-brand-muted">Conv. rate</dt><dd className="font-semibold text-brand-navy">{formatPercent(row.conversionRate)}</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <div className="hidden min-w-0 max-w-full overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-brand-cream text-xs uppercase tracking-wide text-brand-navy">
            <tr>
              {[['name', 'Campaign name'], ['platformLabel', 'Platform']].map(([key, label]) => (
                <th key={label} className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => sortBy(key)} className="font-semibold uppercase">{label}</button>
                </th>
              ))}
              {[['leads', 'Leads'], ['qualified', 'Qualified'], ['converted', 'Converted'], ['conversionRate', 'Conv. rate']].map(([key, label]) => (
                <th key={label} className="px-4 py-3 text-right font-semibold">
                  <button type="button" onClick={() => sortBy(key)} className="font-semibold uppercase">{label}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-muted">No campaigns in this period.</td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={`${row.platform}-${row.key}`} className="border-t border-brand-yellow/20">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => onCampaign(row.key)} className="text-left font-semibold text-brand-navy">
                      {row.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-brand-yellow/40 bg-brand-cream px-2 py-0.5 text-xs font-semibold text-brand-navy">{row.platformLabel}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatNumber(row.leads)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(row.qualified)}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(row.converted)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-navy">{formatPercent(row.conversionRate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-brand-yellow/30 px-4 py-3 text-sm">
        <p className="text-brand-muted">{formatNumber(visibleCampaigns.length)} campaigns</p>
        <div className="flex items-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-brand-yellow/50 px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span className="text-brand-navy">{page} / {pageCount}</span>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-brand-yellow/50 px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      </div>
    </section>
  </div>
  );
};

export default PerformanceTables;
