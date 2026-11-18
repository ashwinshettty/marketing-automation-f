const RANGES = [
  { id: 'LAST_7_DAYS', label: 'Last 7 days' },
  { id: 'LAST_14_DAYS', label: 'Last 14 days' },
  { id: 'LAST_30_DAYS', label: 'Last 30 days' },
  { id: 'THIS_MONTH', label: 'This month' },
  { id: 'LAST_MONTH', label: 'Last month' },
  { id: 'CUSTOM', label: 'Custom' },
];

export default function OverviewDateFilter({
  range,
  startDate,
  endDate,
  onRange,
  onStart,
  onEnd,
  onApply,
}) {
  const datesReversed = Boolean(startDate && endDate && startDate > endDate);
  const customReady = range === 'CUSTOM' && startDate && endDate && !datesReversed;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="overview-range">Date range</label>
      <select
        id="overview-range"
        value={range}
        onChange={(event) => onRange(event.target.value)}
        className="rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)]"
      >
        {RANGES.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      {range === 'CUSTOM' ? (
        <>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => onStart(event.target.value)}
            aria-label="Start date"
            className="rounded-lg border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)]"
          />
          <span className="text-sm text-[var(--ga-muted)]">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => onEnd(event.target.value)}
            aria-label="End date"
            className="rounded-lg border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)]"
          />
          <button
            type="button"
            onClick={onApply}
            disabled={!customReady}
            className="rounded-full bg-[var(--ga-blue)] px-4 py-1.5 text-sm font-medium text-white disabled:bg-[var(--ga-hover)] disabled:text-[var(--ga-muted)]"
          >
            Filter
          </button>
          {datesReversed ? (
            <p className="w-full text-xs text-[#d93025]">Start date must be on or before the end date.</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
