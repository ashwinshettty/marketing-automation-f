import { formatCount, formatMoney, formatPercent } from './campaignFormat';

const DOT = {
  enabled: 'bg-[#188038]',
  paused: 'bg-[#5f6368]',
  removed: 'bg-[#d93025]',
};

function DeliveryMark({ row }) {
  const delivery = String(row.deliveryStatus || '').toUpperCase();
  if (delivery === 'PAUSED') {
    return (
      <span
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#5f6368]"
        title="Paused"
        aria-label="Paused"
      >
        <span className="flex h-2 w-2 items-center justify-center gap-[1.5px]" aria-hidden="true">
          <span className="h-2 w-[1.5px] rounded-sm bg-white" />
          <span className="h-2 w-[1.5px] rounded-sm bg-white" />
        </span>
      </span>
    );
  }
  const tone = DOT[row.dot] || (delivery === 'REMOVED' ? DOT.removed : DOT.enabled);
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${tone}`}
      title={row.statusLabel || delivery}
      aria-hidden="true"
    />
  );
}

function StatusCell({ row }) {
  const alert = row.status === 'REMOVED' || row.status === 'NOT_ELIGIBLE';
  return (
    <span className="flex items-start gap-2">
      <DeliveryMark row={row} />
      <span className="block">
        <span className={alert ? 'text-[#d93025]' : 'text-[var(--ga-ink)]'}>{row.statusLabel || '—'}</span>
        {row.statusReasons?.length ? (
          <span className="mt-0.5 block text-xs text-[var(--ga-muted)]">{row.statusReasons.join(' · ')}</span>
        ) : null}
      </span>
    </span>
  );
}

const COLUMNS = [
  { key: 'status', label: 'Status', width: 160 },
  { key: 'type', label: 'Ad group type', width: 140 },
  { key: 'impressions', label: 'Impr.', width: 100, align: 'right', metric: true },
  { key: 'ctr', label: 'CTR', width: 90, align: 'right', metric: true },
  { key: 'cost', label: 'Cost', width: 110, align: 'right', metric: true },
  { key: 'clicks', label: 'Clicks', width: 90, align: 'right', metric: true },
  { key: 'conversions', label: 'Conv.', width: 90, align: 'right', metric: true },
  { key: 'avgCpc', label: 'Avg. CPC', width: 110, align: 'right', metric: true },
];

function metricCell(key, metrics, currencyCode) {
  if (!metrics) return '—';
  if (key === 'impressions' || key === 'clicks') return formatCount(metrics[key]);
  if (key === 'conversions') return formatCount(metrics.conversions);
  if (key === 'cost') return formatMoney(metrics.cost, currencyCode);
  if (key === 'avgCpc') return formatMoney(metrics.averageCpc, currencyCode);
  if (key === 'ctr') return formatPercent(metrics.ctr);
  return '—';
}

export default function AdGroupsTable({
  adGroups = [],
  totals,
  currencyCode = 'INR',
  loading,
  error,
  emptyText = 'No ad groups for this campaign.',
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
      <div className="ga-scroll max-h-[calc(100vh-16rem)] overflow-auto">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left text-[13px]">
          <thead className="text-[var(--ga-muted)]">
            <tr>
              <th className="sticky top-0 left-0 z-20 min-w-[280px] border-r border-[var(--ga-border)] bg-white px-3 py-2.5 text-xs font-medium">
                Ad group
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  style={{ minWidth: column.width }}
                  className={`sticky top-0 z-10 bg-white px-3 py-2.5 text-xs font-medium ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="sticky left-0 z-10 border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 text-left text-xs font-medium text-[var(--ga-ink)]">
                Total: Ad groups in your current view
              </th>
              {COLUMNS.map((column) => (
                <td
                  key={column.key}
                  className={`border-t border-[var(--ga-border)] bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums text-[var(--ga-muted)] ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.key === 'status' || column.key === 'type'
                    ? '—'
                    : metricCell(column.key, totals, currencyCode)}
                </td>
              ))}
            </tr>

            {loading ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-8 text-sm text-[var(--ga-muted)]">
                  Loading ad groups…
                </td>
              </tr>
            ) : null}

            {!loading && error ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-8 text-sm text-[#d93025]">
                  {error}
                </td>
              </tr>
            ) : null}

            {!loading && !error && !adGroups.length ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-8 text-sm text-[var(--ga-muted)]">
                  {emptyText}
                </td>
              </tr>
            ) : null}

            {!loading && !error
              ? adGroups.map((row) => (
                <tr key={row.id} className="group">
                  <th className="sticky left-0 z-10 border-t border-[var(--ga-border)] bg-white px-3 py-2.5 text-left font-normal group-hover:bg-[var(--ga-hover)]">
                    <span className="font-medium text-[var(--ga-blue)]">{row.name}</span>
                  </th>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={`border-t border-[var(--ga-border)] px-3 py-2.5 align-top tabular-nums group-hover:bg-[var(--ga-hover)] ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {column.key === 'status' ? (
                        <StatusCell row={row} />
                      ) : column.key === 'type' ? (
                        row.typeLabel || '—'
                      ) : (
                        metricCell(column.key, row.metrics, currencyCode)
                      )}
                    </td>
                  ))}
                </tr>
              ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
