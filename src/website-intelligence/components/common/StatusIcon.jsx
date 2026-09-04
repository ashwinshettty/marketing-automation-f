import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Minus,
  Loader2,
  Target,
} from 'lucide-react';

const CONFIG = {
  detected: { Icon: CheckCircle2, className: 'text-success' },
  likely: { Icon: CheckCircle2, className: 'text-brand' },
  confirmed_missing: { Icon: Target, className: 'text-brand' },
  unverified: { Icon: HelpCircle, className: 'text-muted-foreground' },
  not_observable: { Icon: Minus, className: 'text-muted-foreground' },
  stage_done: { Icon: CheckCircle2, className: 'text-success' },
  stage_active: { Icon: Loader2, className: 'text-brand animate-spin' },
  stage_pending: { Icon: Circle, className: 'text-muted-foreground' },
};

export default function StatusIcon({ kind = 'unverified', className = '' }) {
  const { Icon, className: colorClass } = CONFIG[kind] || CONFIG.unverified;
  return <Icon className={`h-4 w-4 shrink-0 ${colorClass} ${className}`} strokeWidth={1.75} aria-hidden="true" />;
}

export function capabilityStatusKind(cap) {
  if (!cap) return 'unverified';
  if (cap.status === 'detected') return 'detected';
  if (cap.status === 'likely') return 'likely';
  if (cap.status === 'not_observable') return 'not_observable';
  if (cap.status === 'not_detected') {
    if (cap.verification?.verified !== false && (cap.confidence ?? 0) >= 0.6) return 'confirmed_missing';
    return 'unverified';
  }
  return 'unverified';
}
