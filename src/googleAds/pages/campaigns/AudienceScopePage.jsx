import CampaignScopeFilters, { DEFAULT_STATUSES } from '../../campaigns/CampaignScopeFilters';
import { formatDay } from '../../campaigns/campaignFormat';
import useCampaignScopeParams from '../../hooks/useCampaignScopeParams';

/**
 * Shared shell for Audiences / Keywords / Locations / etc.
 * Uses the same campaign · status · date filters as Campaigns & Assets.
 */
export default function AudienceScopePage({
  title,
  description = 'Filters are ready. Live data for this section will load here next.',
}) {
  const {
    applied,
    range,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    chooseCampaign,
    chooseStatus,
    chooseRange,
    applyCustom,
  } = useCampaignScopeParams({ defaultRange: 'LAST_30_DAYS' });

  const dateLabel = applied.range === 'CUSTOM' && applied.startDate
    ? `${formatDay(applied.startDate)} – ${formatDay(applied.endDate)}`
    : null;

  return (
    <div className="flex min-h-full flex-col px-6 py-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">{title}</h1>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            {applied.campaignName || (applied.campaignId ? 'Selected campaign' : 'All campaigns')}
            {applied.status ? ` · ${applied.status}` : ' · All statuses'}
            {dateLabel ? ` · ${dateLabel}` : ` · ${range.replace(/_/g, ' ').toLowerCase()}`}
          </p>
        </div>
        <CampaignScopeFilters
          campaignId={applied.campaignId}
          campaignName={applied.campaignName}
          status={applied.status}
          statuses={DEFAULT_STATUSES}
          range={range}
          startDate={startDate}
          endDate={endDate}
          onCampaign={chooseCampaign}
          onStatus={chooseStatus}
          onRange={chooseRange}
          onStart={setStartDate}
          onEnd={setEndDate}
          onApplyCustom={applyCustom}
          statusId={`${title.toLowerCase().replace(/\s+/g, '-')}-status`}
        />
      </header>

      <div className="rounded-xl border border-[var(--ga-border)] bg-white px-6 py-10">
        <p className="text-sm text-[var(--ga-muted)]">{description}</p>
        {applied.campaignId ? (
          <p className="mt-3 text-sm text-[var(--ga-ink)]">
            Scope:
            {' '}
            <span className="font-medium">{applied.campaignName || applied.campaignId}</span>
            {applied.status ? ` · status ${applied.status}` : ''}
            {` · ${applied.range}`}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--ga-muted)]">
            Choose a campaign from the filter to narrow this view.
          </p>
        )}
      </div>
    </div>
  );
}
