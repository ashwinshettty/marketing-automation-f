import { changeTone, metricChange, metricValue } from './format';

const OVERVIEW_CARDS = [
  ['totalLeads', 'Total leads', ''],
  ['qualifiedLeads', 'Qualified', ''],
  ['convertedLeads', 'Converted', ''],
  ['conversionRate', 'Conversion rate', ''],
];

const CAMPAIGN_CARDS = [
  ['campaigns', 'Campaigns', ''],
  ['totalLeads', 'Leads', ''],
  ['qualifiedLeads', 'Qualified', ''],
  ['convertedLeads', 'Converted', ''],
];

const isBlank = (metric) =>
  !metric || metric.state === 'unavailable' || metric.state === 'not_applicable' || metric.value == null;

const Card = ({ label, metric, blankNote, footnote }) => {
  const blank = isBlank(metric);
  const change = metricChange(metric);
  return (
    <article className="flex min-w-0 flex-col justify-between break-words rounded-2xl border border-brand-yellow/40 bg-white p-4 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-muted">{label}</h3>
      <p className="my-2 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">{metricValue(metric)}</p>
      {blank ? (
        <span className="w-fit rounded border border-brand-yellow/40 bg-brand-yellow-soft px-2 py-0.5 text-[11px] text-brand-muted">
          {blankNote || metric?.reason || 'Not connected'}
        </span>
      ) : (
        <p className={`text-xs ${changeTone(metric)}`}>
          {footnote || change || 'No change'}
          {!footnote && <span className="ml-1 font-normal text-brand-muted">vs last period</span>}
        </p>
      )}
    </article>
  );
};

const KpiGrid = ({ kpis, loading, variant = 'overview', campaignCount = 0 }) => {
  const cards = variant === 'campaigns' ? CAMPAIGN_CARDS : OVERVIEW_CARDS;
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([key]) => (
          <div key={key} className="h-[7.5rem] animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }
  if (!kpis) return null;

  const qualRate = kpis.totalLeads?.value
    ? `${((kpis.qualifiedLeads?.value || 0) / kpis.totalLeads.value * 100).toFixed(1)}% qual. rate`
    : null;
  const closeRate = kpis.totalLeads?.value
    ? `${((kpis.convertedLeads?.value || 0) / kpis.totalLeads.value * 100).toFixed(1)}% close rate`
    : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(([key, label, blankNote]) => {
        const metric = key === 'campaigns'
          ? { state: 'available', value: campaignCount, unit: 'count', absoluteChange: null }
          : kpis[key];
        const footnote = key === 'campaigns'
          ? `${campaignCount} in this period`
          : key === 'qualifiedLeads'
            ? qualRate
            : key === 'convertedLeads' && variant === 'campaigns'
              ? closeRate
              : '';
        return <Card key={key} label={label} blankNote={blankNote} metric={metric} footnote={footnote} />;
      })}
    </div>
  );
};

export default KpiGrid;
