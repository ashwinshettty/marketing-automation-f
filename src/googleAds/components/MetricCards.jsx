const METRICS = [
  { id: 'clicks', label: 'Clicks', value: '39', tone: 'blue' },
  { id: 'impressions', label: 'Impressions', value: '874', tone: 'rose' },
  { id: 'cpc', label: 'Avg. CPC', value: '₹6.06', tone: 'plain' },
  { id: 'cost', label: 'Cost', value: '₹237', tone: 'plain' },
];

export default function MetricCards({ metrics = METRICS }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <button
          key={metric.id}
          type="button"
          className={`rounded-xl border px-4 py-3 text-left transition-colors ${
            metric.tone === 'blue'
              ? 'border-transparent bg-[var(--ga-metric-blue)] text-white'
              : metric.tone === 'rose'
                ? 'border-transparent bg-[var(--ga-metric-rose)] text-white'
                : 'border-[var(--ga-border)] bg-white text-[var(--ga-ink)] hover:bg-[var(--ga-hover)]'
          }`}
        >
          <div className="text-xs opacity-90">{metric.label}</div>
          <div className="mt-1 text-2xl font-medium tracking-tight">{metric.value}</div>
        </button>
      ))}
    </div>
  );
}
