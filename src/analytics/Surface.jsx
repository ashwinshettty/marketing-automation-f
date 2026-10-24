import { MagicCard } from '../components/magicui/magic-card';
import { cn } from '../lib/utils';

export const fieldClass =
  'rounded-lg border border-brand-navy/15 bg-white px-3 py-2 text-sm text-brand-navy outline-none transition-colors placeholder:text-brand-muted/70 focus:border-brand-navy focus-visible:ring-2 focus-visible:ring-brand-yellow';

export const quietButton =
  'rounded-lg border border-brand-navy/15 bg-white px-3 py-2 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-cream focus-visible:ring-2 focus-visible:ring-brand-yellow disabled:cursor-not-allowed disabled:opacity-50';

export function Surface({ children, className, padded = true, id }) {
  return (
    <MagicCard
      gradientSize={240}
      gradientOpacity={0.4}
      gradientColor="rgba(255, 211, 0, 0.2)"
      className={cn('bg-white shadow-[0_1px_2px_rgba(0,0,128,0.05)]', className)}
    >
      <div id={id} className={cn('relative', padded && 'p-4 sm:p-5')}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-brand-yellow" aria-hidden="true" />
        {children}
      </div>
    </MagicCard>
  );
}
