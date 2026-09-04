import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Status is communicated by a label plus a tone dot, never by colour alone.
 */
const TONES = {
  neutral: { badge: 'border-border bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
  positive: { badge: 'border-success/25 bg-success-subtle text-success', dot: 'bg-success' },
  brand: { badge: 'border-brand/25 bg-brand-subtle text-brand', dot: 'bg-brand' },
  highlight: {
    badge: 'border-highlight/35 bg-highlight-subtle text-highlight-foreground',
    dot: 'bg-highlight',
  },
  warning: { badge: 'border-warning/25 bg-warning-subtle text-warning', dot: 'bg-warning' },
  danger: { badge: 'border-destructive/25 bg-destructive-subtle text-destructive', dot: 'bg-destructive' },
};

const STATUS_TONE = {
  detected: 'positive',
  likely: 'positive',
  completed: 'positive',
  completed_with_warnings: 'warning',
  analyzed: 'positive',
  sent: 'positive',

  not_detected: 'brand',
  crawling: 'brand',
  analyzing: 'brand',
  generating: 'brand',
  very_high: 'brand',
  high: 'brand',

  queued: 'neutral',
  draft: 'neutral',
  idle: 'neutral',
  unknown: 'neutral',
  not_observable: 'neutral',
  medium: 'neutral',
  low: 'neutral',

  failed: 'danger',
  error: 'danger',
};

export default function StatusBadge({ status, label, tone, showDot = true, className }) {
  const key = String(status || '').toLowerCase().replace(/\s+/g, '_');
  const resolvedTone = tone || STATUS_TONE[key] || 'neutral';
  const style = TONES[resolvedTone] || TONES.neutral;
  const text = label || key.replace(/_/g, ' ') || 'unknown';

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border px-2 capitalize', style.badge, className)}
    >
      {showDot && <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', style.dot)} />}
      {text}
    </Badge>
  );
}

export { TONES as STATUS_TONES };
