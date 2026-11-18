import { useState } from 'react';
import { chartMetricById, formatChartMetric } from './chartMetrics';
import MetricSelectMenu from './MetricSelectMenu';

const PINNED = [
  { id: 'averageCpc', tone: 'plain' },
  { id: 'cost', tone: 'plain' },
];

function openAnchor(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = 224;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  const maxHeight = Math.max(180, Math.min(360, spaceBelow));
  return { top: rect.bottom + 4, left, maxHeight };
}

function ChartMetricCard({
  metricId,
  tone,
  totals,
  currencyCode,
  menuOpen,
  onOpen,
  onClose,
  onChoose,
}) {
  const metric = chartMetricById(metricId);
  const colored = tone === 'blue' || tone === 'rose';
  const shell = tone === 'blue'
    ? 'border-transparent bg-[var(--ga-metric-blue)] text-white'
    : tone === 'rose'
      ? 'border-transparent bg-[var(--ga-metric-rose)] text-white'
      : 'border-[var(--ga-border)] bg-white text-[var(--ga-ink)]';

  return (
    <div className={`relative rounded-xl border px-4 py-3 text-left ${shell}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={Boolean(menuOpen)}
        onClick={onOpen}
        className={`inline-flex items-center gap-1 text-xs ${colored ? 'text-white/90' : 'text-[var(--ga-muted)]'}`}
      >
        {metric?.label}
        <span aria-hidden="true" className="text-[10px]">▼</span>
      </button>
      <div className="mt-1 text-2xl font-medium tracking-tight">
        {formatChartMetric(metric, totals?.[metricId], currencyCode)}
      </div>
      {menuOpen ? (
        <MetricSelectMenu
          metricId={metricId}
          anchor={menuOpen}
          onChoose={onChoose}
          onClose={onClose}
        />
      ) : null}
    </div>
  );
}

export default function MetricCards({
  totals,
  currencyCode = 'INR',
  primaryId,
  secondaryId,
  onPrimary,
  onSecondary,
}) {
  const [menu, setMenu] = useState(null);

  const choose = (slot, metricId) => {
    if (slot === 'primary') onPrimary(metricId);
    else onSecondary(metricId);
    setMenu(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <ChartMetricCard
        metricId={primaryId}
        tone="blue"
        totals={totals}
        currencyCode={currencyCode}
        menuOpen={menu?.slot === 'primary' ? menu : null}
        onOpen={(event) => setMenu(menu?.slot === 'primary' ? null : { slot: 'primary', ...openAnchor(event) })}
        onClose={() => setMenu(null)}
        onChoose={(metricId) => choose('primary', metricId)}
      />
      <ChartMetricCard
        metricId={secondaryId}
        tone="rose"
        totals={totals}
        currencyCode={currencyCode}
        menuOpen={menu?.slot === 'secondary' ? menu : null}
        onOpen={(event) => setMenu(menu?.slot === 'secondary' ? null : { slot: 'secondary', ...openAnchor(event) })}
        onClose={() => setMenu(null)}
        onChoose={(metricId) => choose('secondary', metricId)}
      />
      {PINNED.map((item) => {
        const metric = chartMetricById(item.id);
        return (
          <div key={item.id} className="rounded-xl border border-[var(--ga-border)] bg-white px-4 py-3 text-[var(--ga-ink)]">
            <div className="text-xs text-[var(--ga-muted)]">{metric.label}</div>
            <div className="mt-1 text-2xl font-medium tracking-tight">
              {formatChartMetric(metric, totals?.[item.id], currencyCode)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
