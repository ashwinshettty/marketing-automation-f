import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Errors explain what happened, why it may have happened and what to do next.
 * The raw backend string stays behind a disclosure when a friendlier
 * `description` is supplied.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description,
  message,
  causes,
  onRetry,
  retryLabel = 'Try again',
  className,
}) {
  const [showDetail, setShowDetail] = useState(false);
  const body = description || message;
  const hasSeparateDetail = Boolean(description && message && description !== message);

  return (
    <div
      role="alert"
      className={cn('rounded-xl border border-destructive/25 bg-destructive-subtle p-4', className)}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" strokeWidth={2} />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}

          {causes?.length > 0 && (
            <>
              <p className="mt-3 text-xs font-medium text-foreground">This usually happens when:</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {causes.map((cause) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>
            </>
          )}

          {(onRetry || hasSeparateDetail) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw />
                  {retryLabel}
                </Button>
              )}
              {hasSeparateDetail && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetail((value) => !value)}
                  aria-expanded={showDetail}
                >
                  {showDetail ? 'Hide technical details' : 'Show technical details'}
                </Button>
              )}
            </div>
          )}

          {showDetail && hasSeparateDetail && (
            <pre className="mt-3 overflow-x-auto rounded-lg border border-destructive/20 bg-card p-2.5 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
              {message}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
