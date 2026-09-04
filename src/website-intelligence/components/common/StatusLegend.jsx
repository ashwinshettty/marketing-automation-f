import StatusIcon from './StatusIcon';
import { cn } from '@/lib/utils';

const ITEMS = [
  { kind: 'detected', label: 'Detected on site' },
  { kind: 'confirmed_missing', label: 'Not publicly detected' },
  { kind: 'unverified', label: 'Could not verify' },
];

export default function StatusLegend({ className }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {ITEMS.map(({ kind, label }) => (
        <li key={kind} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <StatusIcon kind={kind} className="size-3.5!" />
          {label}
        </li>
      ))}
    </ul>
  );
}
