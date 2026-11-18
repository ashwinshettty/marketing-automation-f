import CampaignPickerDropdown from '../campaigns/CampaignPickerDropdown';

/** Overview campaign scope — same picker as the shell All campaigns control. */
export default function OverviewCampaignFilter({
  campaignId = '',
  campaignName = '',
  onChange,
}) {
  return (
    <CampaignPickerDropdown
      campaignId={campaignId}
      campaignName={campaignName}
      allowAll
      allLabel="All campaigns"
      onChange={(id, campaign) => onChange?.(id, campaign)}
    />
  );
}
