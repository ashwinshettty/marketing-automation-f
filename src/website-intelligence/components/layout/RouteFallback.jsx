import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shown while a lazily loaded route chunk is fetched. Mirrors the standard page
 * rhythm (title, description, content) so the swap does not shift layout.
 */
export default function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8" role="status" aria-label="Loading page">
      <Skeleton className="h-7 w-52" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
