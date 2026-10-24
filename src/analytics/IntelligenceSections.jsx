import { useState } from 'react';
import { formatNumber, formatPercent } from './format';

const panel = 'min-w-0 max-w-full break-words rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5';

const hoursLabel = (hours) => {
  if (hours == null) return '—';
  if (hours < 48) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
};

const IntelligenceSections = ({ summary, onJump, part = 'all' }) => {
  const [cityRank, setCityRank] = useState('volume');
  if (!summary) return null;
  const { insights, timing, geography, creatives, delivery } = summary;
  const cityRows = [...(geography?.rows || [])].sort((left, right) => (
    cityRank === 'rate'
      ? (right.conversionRate || 0) - (left.conversionRate || 0)
      : right.leads - left.leads
  ));
  const maxCity = Math.max(...cityRows.map((row) => row.leads), 1);
  const cityTotals = cityRows.reduce((total, row) => ({
    leads: total.leads + row.leads,
    qualified: total.qualified + row.qualified,
    converted: total.converted + row.converted,
  }), { leads: 0, qualified: 0, converted: 0 });
  const show = (name) => part === 'all' || part === name;
  const notes = (insights || []).filter((item) => item.id !== 'ads-disconnected');

  return (
    <div className="min-w-0 max-w-full space-y-4">
      {show('insights') && (
        <section id="insights" className={panel}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-brand-navy">Key observations</h2>
            <span className="rounded-full border border-brand-yellow/50 px-2.5 py-1 text-xs text-brand-muted">{notes.length} detected</span>
          </div>
          <div className="mt-4 space-y-3">
            {notes.length === 0 && <p className="text-sm text-brand-muted">Nothing stands out for this period.</p>}
            {notes.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-brand-yellow/40 bg-white p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${['bg-emerald-600', 'bg-brand-yellow', 'bg-brand-navy', 'bg-brand-muted'][index % 4]}`} />
                  <h3 className="text-sm font-semibold text-brand-navy">{item.title}</h3>
                </div>
                <p className="break-words text-sm leading-relaxed text-brand-muted">{item.evidence}</p>
                <div className="mt-3 flex items-center justify-between border-t border-brand-yellow/20 pt-3">
                  <span className="text-[11px] text-brand-muted">{item.confidence || item.impact}</span>
                  <button type="button" onClick={() => onJump(item)} className="text-sm font-semibold text-brand-navy underline">
                    Review
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {show('timing') && (
        <section className="grid gap-3 lg:grid-cols-2">
          <article className={panel}>
            <h2 className="text-base font-semibold text-brand-navy">Speed of follow-up</h2>
            <p className="mt-1 text-sm text-brand-muted">{timing?.note}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Time to first contact</dt>
                <dd className="mt-1 text-2xl font-semibold text-brand-navy">{hoursLabel(timing?.avgHoursToContact)}</dd>
                <dd className="text-xs text-brand-muted">{formatNumber(timing?.contactSample || 0)} leads with a contact time</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Time to conversion</dt>
                <dd className="mt-1 text-2xl font-semibold text-brand-navy">
                  {timing?.avgDaysToConversion == null ? '—' : `${timing.avgDaysToConversion.toFixed(1)} days`}
                </dd>
                <dd className="text-xs text-brand-muted">{formatNumber(timing?.conversionSample || 0)} conversions with a date</dd>
              </div>
            </dl>
          </article>
          <article className={panel}>
            <h2 className="text-base font-semibold text-brand-navy">Recorded revenue</h2>
            <p className="mt-1 text-sm text-brand-muted">{delivery?.reason} Platform conversion value is not added to CRM revenue.</p>
          </article>
        </section>
      )}

      {show('places') && (
        <section id="places" className={panel}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-brand-navy">Where leads said they are</h2>
              <p className="mt-1 text-sm text-brand-muted">{geography?.note}</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-brand-muted">Rank by</span>
              <button type="button" onClick={() => setCityRank('volume')} className={`min-h-11 rounded px-3 font-semibold ${cityRank === 'volume' ? 'bg-brand-navy text-white' : 'text-brand-muted'}`}>Total volume</button>
              <button type="button" onClick={() => setCityRank('rate')} className={`min-h-11 rounded px-3 font-semibold ${cityRank === 'rate' ? 'bg-brand-navy text-white' : 'text-brand-muted'}`}>Conversion %</button>
            </div>
          </div>
          <div className="mt-4 space-y-2 md:hidden">
            {cityRows.length === 0 && <p className="py-6 text-center text-sm text-brand-muted">No city is stored on these leads.</p>}
            {cityRows.map((row) => (
              <article key={row.city} className="rounded-xl border border-brand-yellow/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-brand-navy">{row.city}</h3>
                  <span className="rounded border border-brand-yellow/40 bg-brand-cream px-2 py-0.5 text-xs font-semibold text-brand-navy">{formatPercent(row.conversionRate)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand-cream">
                  <div className="h-full rounded-full bg-brand-navy" style={{ width: `${(row.leads / maxCity) * 100}%` }} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><dt className="text-[11px] uppercase text-brand-muted">Leads</dt><dd className="font-semibold text-brand-navy">{formatNumber(row.leads)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-brand-muted">Qualified</dt><dd className="font-semibold text-brand-navy">{formatNumber(row.qualified)}</dd></div>
                  <div><dt className="text-[11px] uppercase text-brand-muted">Converted</dt><dd className="font-semibold text-brand-navy">{formatNumber(row.converted)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden min-w-0 max-w-full overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-brand-muted">
                <tr>
                  <th className="px-3 py-3 font-semibold">City location</th>
                  <th className="px-3 py-3 font-semibold">Lead share distribution</th>
                  <th className="px-3 py-3 text-right font-semibold">Total leads</th>
                  <th className="px-3 py-3 text-right font-semibold">Qualified</th>
                  <th className="px-3 py-3 text-right font-semibold">Converted</th>
                  <th className="px-3 py-3 text-right font-semibold">Conv. rate</th>
                </tr>
              </thead>
              <tbody>
                {cityRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-brand-muted">No city is stored on these leads.</td>
                  </tr>
                )}
                {cityRows.map((row) => (
                  <tr key={row.city} className="border-t border-brand-yellow/20">
                    <td className="px-3 py-3 font-medium text-brand-navy">{row.city}</td>
                    <td className="w-56 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-cream">
                          <div className="h-full rounded-full bg-brand-navy" style={{ width: `${(row.leads / maxCity) * 100}%` }} />
                        </div>
                        <span className="w-12 text-right text-xs text-brand-muted">{formatPercent(cityTotals.leads ? (row.leads / cityTotals.leads) * 100 : null)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">{formatNumber(row.leads)}</td>
                    <td className="px-3 py-3 text-right">{formatNumber(row.qualified)}</td>
                    <td className="px-3 py-3 text-right">{formatNumber(row.converted)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="inline-block rounded border border-brand-yellow/40 bg-brand-cream px-2 py-0.5">{formatPercent(row.conversionRate)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {cityRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-brand-yellow/40 bg-brand-cream font-semibold text-brand-navy">
                    <td className="px-3 py-3">Total stored</td>
                    <td className="px-3 py-3 text-xs font-normal text-brand-muted">Cities on the lead record</td>
                    <td className="px-3 py-3 text-right">{formatNumber(cityTotals.leads)}</td>
                    <td className="px-3 py-3 text-right">{formatNumber(cityTotals.qualified)}</td>
                    <td className="px-3 py-3 text-right">{formatNumber(cityTotals.converted)}</td>
                    <td className="px-3 py-3 text-right">{formatPercent(cityTotals.leads ? (cityTotals.converted / cityTotals.leads) * 100 : null)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {geography?.hidden > 0 && (
            <p className="mt-3 text-xs text-brand-muted">{geography.hidden} more cities are hidden. Use the city filter to focus.</p>
          )}
        </section>
      )}

      {show('creatives') && (
        <section id="creatives" className={panel}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-base font-semibold text-brand-navy">Top performing creatives</h2>
            <p className="text-sm text-brand-muted">{creatives?.reason}</p>
          </div>
          {creatives?.available ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {creatives.rows.map((row) => (
                <article key={`${row.platform}-${row.name}`} className="flex flex-col rounded-xl border border-brand-yellow/40 bg-white p-4">
                  <span className="w-fit rounded-full bg-brand-navy px-2 py-0.5 text-[11px] font-semibold text-white">{row.platformLabel}</span>
                  <h3 className="mt-2 break-words text-sm font-semibold text-brand-navy">{row.name}</h3>
                  <p className="break-words text-xs text-brand-muted">{row.campaign}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-brand-yellow/30 pt-3">
                    <div className="rounded-lg border border-brand-yellow/30 p-2"><p className="text-[11px] uppercase text-brand-muted">Leads</p><p className="text-lg font-semibold text-brand-navy">{formatNumber(row.leads)}</p></div>
                    <div className="rounded-lg border border-brand-yellow/30 p-2"><p className="text-[11px] uppercase text-brand-muted">Converted</p><p className="text-lg font-semibold text-brand-navy">{formatNumber(row.converted)}</p></div>
                  </div>
                  <button type="button" onClick={() => onJump?.()} className="mt-3 inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-brand-yellow/40 px-3 py-1.5 text-sm font-semibold text-brand-navy">
                    View
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-brand-cream px-4 py-6 text-sm text-brand-muted">
              Creatives show up here when a lead has an ad or form name.
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default IntelligenceSections;
