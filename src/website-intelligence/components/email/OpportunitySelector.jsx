import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCapabilityName } from '../../utils/formatters';

export default function OpportunitySelector({ opportunities, selectedIds, onChange }) {
  const toggle = (serviceId) => {
    onChange(
      selectedIds.includes(serviceId)
        ? selectedIds.filter((id) => id !== serviceId)
        : [...selectedIds, serviceId]
    );
  };

  const allSelected = opportunities.length > 0 && selectedIds.length === opportunities.length;

  return (
    <fieldset className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <legend className="text-sm font-medium">Findings to mention</legend>
        <div className="flex items-center gap-2">
          <span className="meta-text">
            {selectedIds.length} of {opportunities.length}
          </span>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => onChange(allSelected ? [] : opportunities.map((o) => o.serviceId))}
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </Button>
        </div>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {opportunities.map((opportunity) => {
          const checked = selectedIds.includes(opportunity.serviceId);
          const pct = Math.min(100, Math.max(0, opportunity.score ?? 0));

          return (
            <label
              key={opportunity.serviceId}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
                checked ? 'border-brand bg-brand-subtle' : 'border-border hover:bg-muted/50'
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opportunity.serviceId)}
                className="mt-0.5 size-4 shrink-0 accent-brand"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{opportunity.serviceName}</span>
                  {opportunity.priority && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {opportunity.priority}
                    </span>
                  )}
                  <span className="meta-text tabular-nums">{opportunity.score}/100</span>
                </div>

                {opportunity.reason && <p className="body-text mt-1">{opportunity.reason}</p>}

                {opportunity.missingPublicCapabilities?.length > 0 && (
                  <p className="meta-text mt-1">
                    Not publicly detected:{' '}
                    {opportunity.missingPublicCapabilities.map(formatCapabilityName).join(', ')}
                  </p>
                )}

                <div className="score-track mt-2 max-w-[220px]">
                  <div className="score-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
