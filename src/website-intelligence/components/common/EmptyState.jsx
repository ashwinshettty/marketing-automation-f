import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { duration, easeOut } from '@/lib/motion';

/**
 * Every empty state answers three questions: what is happening, why it matters,
 * and what to do next — with exactly one primary action.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  hint,
  actionLabel,
  actionTo,
  onAction,
  secondary,
  className,
}) {
  const action = actionLabel ? (
    actionTo ? (
      <Button render={<Link to={actionTo} />}>{actionLabel}</Button>
    ) : (
      <Button onClick={onAction}>{actionLabel}</Button>
    )
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.panel, ease: easeOut }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-dashed border-border bg-card px-6 py-10 text-left sm:px-8 sm:py-12',
        className
      )}
    >
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative flex max-w-xl flex-col items-start">
        {Icon && (
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
        )}
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && <p className="body-text mt-2">{description}</p>}
        {hint && <p className="meta-text mt-3">{hint}</p>}

        {(action || secondary) && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {action}
            {secondary}
          </div>
        )}
      </div>
    </motion.div>
  );
}
