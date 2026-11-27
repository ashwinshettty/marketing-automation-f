import { formatNumber } from './format';

const panel = 'min-w-0 max-w-full break-words rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5';

const hoursLabel = (hours) => {
  if (hours == null) return '—';
  if (hours < 48) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
};

const IntelligenceSections = ({ summary, onJump, part = 'all' }) => {
  if (!summary) return null;
  const { insights, timing, delivery } = summary;
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
            <p className="mt-1 text-sm text-brand-muted">{delivery?.reason} Lead-stored CRM conversion amounts only — not cash collected. Platform conversion value is not added to CRM revenue.</p>
          </article>
        </section>
      )}
    </div>
  );
};

export default IntelligenceSections;
