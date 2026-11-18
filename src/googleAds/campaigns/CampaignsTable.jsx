import { CAMPAIGN_COLUMNS, metricText } from './campaignColumns';
import { formatBudget, formatScore } from './campaignFormat';

const DOT = {
  enabled: 'bg-[#188038]',
  eligible: 'bg-[#188038]',
  paused: 'bg-[#5f6368]',
  removed: 'bg-[#d93025]',
  draft: 'bg-[var(--ga-blue)]',
};

const TYPE_MARK = {
  SEARCH: 'S',
  DISPLAY: 'D',
  VIDEO: 'V',
  PERFORMANCE_MAX: 'P',
  SHOPPING: 'Sh',
  SMART: 'Sm',
  DEMAND_GEN: 'Dg',
};

const stickyName = 'sticky left-0 z-20 min-w-[320px] max-w-[320px] border-r border-[var(--ga-border)] bg-white shadow-[4px_0_8px_-6px_rgba(32,33,36,0.35)]';

function deliveryOf(row) {
  const delivery = String(row.deliveryStatus || '').toUpperCase();
  if (delivery) return delivery;
  if (row.source !== 'google') return 'DRAFT';
  if (row.status === 'PAUSED') return 'PAUSED';
  if (row.status === 'REMOVED') return 'REMOVED';
  return 'ENABLED';
}

function DeliverySwitch({ row, busy, onChange }) {
  const live = row.source === 'google' && /^\d+$/.test(String(row.id || ''));
  const delivery = deliveryOf(row);
  const removed = delivery === 'REMOVED';
  const on = live && delivery === 'ENABLED';
  const disabled = !live || removed || busy;
  const label = !live
    ? 'This draft is not on Google Ads yet'
    : removed
      ? 'A removed campaign cannot be turned back on'
      : on
        ? `Pause ${row.name}`
        : `Turn on ${row.name}`;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onChange(row, !on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'bg-[var(--ga-blue)]' : 'bg-[#dadce0]'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 motion-reduce:transition-none ${on ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

/** Google Ads-style name light: green enabled, gray pause bars, red removed. */
function DeliveryMark({ row }) {
  const delivery = deliveryOf(row);
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
  const tone = DOT[row.dot] || (delivery === 'REMOVED' ? DOT.removed : delivery === 'ENABLED' ? DOT.enabled : DOT.draft);
  const label = delivery === 'REMOVED' ? 'Removed' : delivery === 'ENABLED' ? 'Enabled' : 'Draft';
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${tone}`}
      title={label}
      aria-label={label}
    />
  );
}

function TypeMark({ type }) {
  return (
    <span
      className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-[3px] bg-[var(--ga-blue-soft)] px-0.5 text-[9px] font-semibold leading-none text-[var(--ga-blue)]"
      aria-hidden="true"
    >
      {TYPE_MARK[type] || '•'}
    </span>
  );
}

function EditButton({ row, onEdit }) {
  const live = row.source === 'google' && /^\d+$/.test(String(row.id || ''));
  if (!live) return null;
  return (
    <button
      type="button"
      aria-label={`Edit ${row.name}`}
      title="Edit campaign"
      onClick={(event) => {
        event.stopPropagation();
        onEdit?.(row);
      }}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--ga-muted)] opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-[var(--ga-blue-soft)] hover:text-[var(--ga-blue)] focus-visible:opacity-100"
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.6 2.9a1.5 1.5 0 0 1 2.1 0l1.4 1.4a1.5 1.5 0 0 1 0 2.1l-8.8 8.8-3.2.8a.75.75 0 0 1-.9-.9l.8-3.2 8.6-9Zm1.1 1.1-1 1 1.3 1.3 1-1-1.3-1.3ZM4.9 12.6l-.4 1.6 1.6-.4 7.2-7.2-1.2-1.2-7.2 7.2Z"
        />
      </svg>
    </button>
  );
}

function ScoreCell({ score }) {
  const percent = formatScore(score);
  if (percent == null) return <span className="text-[var(--ga-muted)]">—</span>;
  return (
    <div className="flex min-w-[92px] items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8eaed]">
        <span className="block h-full rounded-full bg-[var(--ga-blue)]" style={{ width: `${Math.min(percent, 100)}%` }} />
      </span>
      <span className="tabular-nums text-[var(--ga-ink)]">{percent.toFixed(1)}%</span>
    </div>
  );
}

function BudgetCell({ budget, currencyCode }) {
  const formatted = formatBudget(budget, currencyCode);
  if (formatted === '—') return '—';
  return (
    <span className="block">
      <span className="text-[var(--ga-blue)]">{formatted.primary}</span>
      {formatted.secondary ? (
        <span className="mt-0.5 block text-xs text-[var(--ga-muted)]">{formatted.secondary}</span>
      ) : null}
    </span>
  );
}

function StatusCell({ row }) {
  const alert = row.status === 'REMOVED' || row.status === 'NOT_ELIGIBLE' || row.status === 'FAILED';
  return (
    <span className="block">
      <span className={alert ? 'text-[#d93025]' : 'text-[var(--ga-ink)]'}>{row.statusLabel}</span>
      {row.statusReasons?.length ? (
        <span className="mt-0.5 block text-xs text-[var(--ga-muted)]">{row.statusReasons.join(' · ')}</span>
      ) : null}
    </span>
  );
}

function MetricCell({ column, metrics, currencyCode }) {
  return metricText(column.key, metrics, currencyCode);
}

function ScrollCell({ column, row, currencyCode, total = false }) {
  if (total && !column.metric) return '—';
  if (column.key === 'budget') {
    return total ? '—' : <BudgetCell budget={row.budget} currencyCode={currencyCode} />;
  }
  if (column.key === 'status') return total ? '—' : <StatusCell row={row} />;
  if (column.key === 'optimizationScore') return total ? '—' : <ScoreCell score={row.optimizationScore} />;
  if (column.key === 'subtype') return total ? '—' : row.subtypeLabel;
  if (column.key === 'type') return total ? '—' : row.channelLabel;
  if (column.key === 'bidding') return total ? '—' : row.biddingLabel;
  return <MetricCell column={column} metrics={total ? row : row.metrics} currencyCode={currencyCode} />;
}

export default function CampaignsTable({
  campaigns,
  totals,
  currencyCode,
  selected,
  onToggle,
  onToggleAll,
  loading,
  error,
  emptyText = 'No campaigns in this date range.',
  onDelivery,
  onSelect,
  onEdit,
  busyId = '',
}) {
  const allSelected = campaigns.length > 0 && campaigns.every((row) => selected.has(row.id));

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--ga-border)] bg-white">
      <div className="ga-scroll ga-campaign-scroll max-h-[calc(100vh-13.5rem)] overflow-auto">
        <table className="w-max min-w-full border-separate border-spacing-0 text-left text-[13px]">
          <thead className="text-[var(--ga-muted)]">
            <tr>
              <th className={`${stickyName} sticky top-0 z-30 bg-white px-3 py-2.5 text-xs font-medium`}>
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    aria-label="Select all campaigns"
                    className="h-4 w-4 accent-[var(--ga-blue)]"
                  />
                  Campaign
                </span>
              </th>
              {CAMPAIGN_COLUMNS.map((column) => (
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
            <tr className="text-[var(--ga-ink)]">
              <th className={`${stickyName} !bg-[var(--ga-surface)] px-3 py-2.5 text-left text-xs font-medium`}>
                Total: Campaigns in your current view
              </th>
              {CAMPAIGN_COLUMNS.map((column) => (
                <td
                  key={column.key}
                  className={`bg-[var(--ga-surface)] px-3 py-2.5 tabular-nums ${column.align === 'right' ? 'text-right' : 'text-left'} text-[var(--ga-muted)]`}
                >
                  <ScrollCell column={column} row={totals || {}} currencyCode={currencyCode} total />
                </td>
              ))}
            </tr>
            {loading ? (
              <tr>
                <td colSpan={CAMPAIGN_COLUMNS.length + 1} className="px-3 py-8 text-sm text-[var(--ga-muted)]">
                  Loading campaigns…
                </td>
              </tr>
            ) : null}
            {!loading && error ? (
              <tr>
                <td colSpan={CAMPAIGN_COLUMNS.length + 1} className="px-3 py-8 text-sm text-red-600">
                  {error}
                </td>
              </tr>
            ) : null}
            {!loading && !error && !campaigns.length ? (
              <tr>
                <td colSpan={CAMPAIGN_COLUMNS.length + 1} className="px-3 py-8 text-sm text-[var(--ga-muted)]">
                  {emptyText}
                </td>
              </tr>
            ) : null}
            {!loading && !error ? campaigns.map((row) => (
              <tr key={row.id} className="group">
                <th className={`${stickyName} border-t border-[var(--ga-border)] px-3 py-2.5 text-left font-normal group-hover:bg-[var(--ga-hover)]`}>
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => onToggle(row.id)}
                      aria-label={`Select ${row.name}`}
                      className="h-4 w-4 accent-[var(--ga-blue)]"
                    />
                    <DeliverySwitch row={row} busy={busyId === row.id} onChange={onDelivery} />
                    <DeliveryMark row={row} />
                    <TypeMark type={row.channelType} />
                    <button
                      type="button"
                      title={row.name}
                      onClick={() => onSelect?.(row)}
                      className="min-w-0 truncate text-left font-medium text-[var(--ga-blue)] hover:underline"
                    >
                      {row.name}
                    </button>
                    <EditButton row={row} onEdit={onEdit} />
                  </span>
                </th>
                {CAMPAIGN_COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={`border-t border-[var(--ga-border)] px-3 py-2.5 align-top tabular-nums group-hover:bg-[var(--ga-hover)] ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <ScrollCell column={column} row={row} currencyCode={currencyCode} />
                  </td>
                ))}
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
