export default function ContentCard({ title, action = null, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)] ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--ga-border)] px-5 py-3">
          {title ? <h2 className="text-sm font-medium text-[var(--ga-ink)]">{title}</h2> : <span />}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
