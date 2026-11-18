import CampaignPickerDropdown from './CampaignPickerDropdown';
import OverviewDateFilter from '../overview/OverviewDateFilter';

const DEFAULT_STATUSES = [
  { id: 'ELIGIBLE', label: 'Eligible' },
  { id: 'LIMITED', label: 'Limited' },
  { id: 'LEARNING', label: 'Learning' },
  { id: 'NOT_ELIGIBLE', label: 'Not eligible' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PAUSED', label: 'Paused' },
  { id: 'ENDED', label: 'Ended' },
  { id: 'MISCONFIGURED', label: 'Misconfigured' },
  { id: 'REMOVED', label: 'Removed' },
];

/**
 * Shared Google Ads–style scope filters:
 * All campaigns · All statuses · Last 30 days
 */
export default function CampaignScopeFilters({
  campaignId = '',
  campaignName = '',
  status = '',
  statuses = DEFAULT_STATUSES,
  range = 'LAST_30_DAYS',
  startDate = '',
  endDate = '',
  allLabel = 'All campaigns',
  onCampaign,
  onStatus,
  onRange,
  onStart,
  onEnd,
  onApplyCustom,
  statusId = 'scope-status',
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CampaignPickerDropdown
        campaignId={campaignId}
        campaignName={campaignName}
        allowAll
        allLabel={allLabel}
        onChange={onCampaign}
      />
      <label className="sr-only" htmlFor={statusId}>Status</label>
      <select
        id={statusId}
        value={status || ''}
        onChange={(event) => onStatus?.(event.target.value)}
        className="rounded-full border border-[var(--ga-border)] bg-white px-3 py-1.5 text-sm text-[var(--ga-ink)]"
      >
        <option value="">All statuses</option>
        {statuses.map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      <OverviewDateFilter
        range={range}
        startDate={startDate}
        endDate={endDate}
        onRange={onRange}
        onStart={onStart}
        onEnd={onEnd}
        onApply={onApplyCustom}
      />
    </div>
  );
}

export { DEFAULT_STATUSES };
