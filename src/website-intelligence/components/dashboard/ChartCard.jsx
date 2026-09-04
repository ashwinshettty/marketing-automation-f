import { cn } from '@/lib/utils';

export default function ChartCard({ title, description, children, className, empty }) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-4 sm:p-5', className)}>
      <header className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="body-text mt-0.5">{description}</p>}
      </header>
      {empty ? (
        <p className="body-text flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
          {empty}
        </p>
      ) : (
        <div className="min-h-[200px] w-full overflow-hidden">{children}</div>
      )}
    </section>
  );
}
