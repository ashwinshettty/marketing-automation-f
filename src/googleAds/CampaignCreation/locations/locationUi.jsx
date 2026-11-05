import { formatReach, radiusKey } from './locationSelection';

const fieldClass = 'min-w-0 rounded-lg border border-[var(--ga-border)] bg-white px-3 py-2.5 text-sm text-[var(--ga-ink)] outline-none focus:border-[var(--ga-blue)]';

export function Field({ className = '', ...props }) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function LocationMatchRow({ match, onInclude, onExclude }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 text-sm">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[var(--ga-ink)]">{match.name}</div>
        {match.type ? (
          <div className="truncate text-xs text-[var(--ga-muted)]">{match.type}</div>
        ) : null}
      </div>
      <span className="w-24 shrink-0 text-right text-xs tabular-nums text-[var(--ga-muted)]">
        {formatReach(match.reach)}
      </span>
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onInclude(match)}
        className="text-xs font-medium text-[var(--ga-blue)]"
      >
        Include
      </button>
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onExclude(match)}
        className="text-xs font-medium text-[var(--ga-blue)]"
      >
        Exclude
      </button>
    </div>
  );
}

export function SelectedTargets({ items = [], radii = [], onRemoveItem, onRemoveRadius }) {
  if (!items.length && !radii.length) return null;

  return (
    <ul className="divide-y divide-[var(--ga-border)] rounded-lg border border-[var(--ga-border)]">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate text-[var(--ga-ink)]">{item.name}</span>
          <span className="text-xs text-[var(--ga-muted)]">
            {item.action === 'exclude' ? 'Excluded' : 'Included'}
          </span>
          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            className="text-xs text-[var(--ga-muted)] hover:text-[var(--ga-ink)]"
            aria-label={`Remove ${item.name}`}
          >
            Remove
          </button>
        </li>
      ))}
      {radii.map((item) => {
        const unit = item.radiusUnits === 'MILES' ? 'mi' : 'km';
        const key = radiusKey(item);
        return (
          <li key={key} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-[var(--ga-ink)]">
              {item.radius} {unit} around {item.label}
            </span>
            <span className="text-xs text-[var(--ga-muted)]">Radius</span>
            <button
              type="button"
              onClick={() => onRemoveRadius(key)}
              className="text-xs text-[var(--ga-muted)] hover:text-[var(--ga-ink)]"
              aria-label={`Remove radius around ${item.label}`}
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}
