export default function PageHeader({
  title,
  actions = null,
  filters = null,
  dateLabel = 'Nov 3, 2026',
}) {
  return (
    <header className="mb-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">{title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)]"
          >
            <span aria-hidden="true">📅</span>
            {dateLabel}
          </button>
        </div>
      </div>
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
    </header>
  );
}
