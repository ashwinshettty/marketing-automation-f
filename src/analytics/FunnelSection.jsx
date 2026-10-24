import { formatNumber, formatPercent } from './format';

const FunnelSection = ({ funnel, onSelectStage }) => {
  if (!funnel) return null;
  const lost = (funnel.outcomes?.lost || 0) + (funnel.outcomes?.disqualified || 0);
  const first = funnel.stages[0]?.count || 0;
  const lossRate = first ? (lost / first) * 100 : null;

  return (
    <section className="min-w-0 max-w-full break-words rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">Lead journey & funnel velocity</h2>
          <p className="mt-1 max-w-3xl text-sm text-brand-muted">{funnel.note}</p>
        </div>
        <span className="text-xs font-medium text-brand-muted">Cohort for the selected dates</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:col-span-10">
          {funnel.stages.map((stage, index) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => onSelectStage(stage.key)}
              className={`relative rounded-xl border bg-white p-3 text-left hover:border-brand-yellow focus-visible:ring-2 focus-visible:ring-brand-navy ${
                stage.key === 'converted' ? 'border-2 border-brand-yellow' : 'border-brand-yellow/40'
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {index + 1}. {stage.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-brand-navy">{formatNumber(stage.count)}</p>
              <p className="mt-2 border-t border-brand-yellow/30 pt-2 text-[11px] text-brand-muted">
                {formatPercent(stage.percentOfCohort)} of cohort
                {stage.dropOffPercent != null ? ` · drop ${formatPercent(stage.dropOffPercent)}` : ''}
              </p>
              {index < funnel.stages.length - 1 && (
                <span className="absolute -right-2 top-1/2 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-brand-yellow bg-white text-xs text-brand-navy lg:grid">
                  →
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectStage('lost')}
          className="flex flex-col justify-between rounded-xl border border-brand-yellow/40 bg-brand-cream p-3 text-left xl:col-span-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">Exit / lost</p>
          <p className="mt-2 text-2xl font-semibold text-brand-navy">{formatNumber(lost)}</p>
          <p className="mt-1 text-xs text-brand-muted">
            Lost {formatNumber(funnel.outcomes?.lost || 0)} · Disqualified {formatNumber(funnel.outcomes?.disqualified || 0)}
          </p>
          <p className="mt-2 border-t border-brand-yellow/30 pt-2 text-[11px] text-brand-navy">
            Loss rate {formatPercent(lossRate)}
          </p>
        </button>
      </div>
    </section>
  );
};

export default FunnelSection;
