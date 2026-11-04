const ITEMS = [
  { name: 'Leads-Performance Max-25m…', status: 'Eligible (Limited)' },
  { name: 'Leads-Search-25 march2026', status: 'Eligible' },
  { name: 'Local store push', status: 'Paused' },
];

export default function DiagnosticsCard({ items = ITEMS }) {
  return (
    <section className="rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <div className="flex items-center justify-between border-b border-[var(--ga-border)] px-5 py-3">
        <h2 className="text-sm font-medium text-[var(--ga-ink)]">Account diagnostics</h2>
      </div>
      <div className="px-5 py-4">
        <p className="mb-4 text-sm text-[var(--ga-muted)]">
          A few of your most recent campaigns need attention
        </p>
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <div
              key={item.name}
              className="min-w-[180px] flex-1 rounded-xl border border-[var(--ga-border)] bg-[var(--ga-surface)] px-4 py-3"
            >
              <div className="truncate text-sm font-medium text-[var(--ga-ink)]">{item.name}</div>
              <div className="mt-1 text-xs text-[var(--ga-muted)]">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
