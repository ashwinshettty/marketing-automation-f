import { cn } from '@/lib/utils';

/**
 * Page shell widths:
 * - default: primary app pages (fills typical laptop/desktop without large gutters)
 * - narrow: reading-focused detail (service copy, long prose)
 * - wide: tables / dense tooling (emails, pages, outreach)
 */
export default function PageContainer({ children, className = '', narrow = false, wide = false }) {
  const max = narrow ? 'max-w-3xl' : wide ? 'max-w-[1520px]' : 'max-w-7xl';
  return (
    <div className={cn('mx-auto w-full px-4 py-5 sm:px-6 sm:py-6', max, className)}>{children}</div>
  );
}

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-3', className)}>
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {description && <p className="body-text mt-1 max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
