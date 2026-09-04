import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AILoader from '@/components/smoothui/ai-loader';
import SmoothSkeleton from '@/components/smoothui/skeleton-loader';
import { cn } from '@/lib/utils';

export default function LoadingState({ message = 'Loading…', className }) {
  return (
    <div
      className={cn('flex items-center gap-2.5 text-sm text-muted-foreground', className)}
      role="status"
    >
      <AILoader variant="dots" className="text-brand" />
      <span>{message}</span>
      <Loader2 className="sr-only" aria-hidden="true" />
    </div>
  );
}

/** Placeholder for a grid of metric tiles. */
export function StatSkeleton({ count = 4, className }) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <SmoothSkeleton className="h-3 w-24" />
          <SmoothSkeleton className="mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder for list/table rows. */
export function RowSkeleton({ count = 5, className }) {
  return (
    <div className={cn('divide-y divide-border overflow-hidden rounded-xl border border-border bg-card', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <SmoothSkeleton className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SmoothSkeleton className="h-3.5 w-1/3" />
            <SmoothSkeleton className="h-3 w-1/2" />
          </div>
          <SmoothSkeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder for opportunity/insight cards. */
export function CardSkeleton({ count = 3, className }) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2 xl:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5">
          <SmoothSkeleton className="h-3 w-20" />
          <SmoothSkeleton className="h-5 w-2/3" />
          <SmoothSkeleton className="h-1.5 w-full rounded-full" />
          <SmoothSkeleton className="h-3 w-full" />
          <SmoothSkeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
