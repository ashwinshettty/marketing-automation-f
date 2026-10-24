import CampaignFormSection from './CampaignFormSection';
import { CampaignInput, CampaignSelect, CampaignSwitch } from './CampaignField';
import { bidStrategies, budgetTypes, specialAdCategories } from './metaCatalog';
import { objectiveLabel } from './campaignEntity';

const CampaignLevelForm = ({ campaign, onChange }) => {
  const set = (field) => (event) => onChange({ ...campaign, [field]: event.target.value });
  const showBidAmount = ['cost_per_result', 'bid_cap', 'roas_goal'].includes(campaign.campaignBidStrategy);

  return (
    <div className="space-y-5">
      {['sales', 'leads', 'app_promotion'].includes(campaign.objective) ? (
        <p className="rounded-xl bg-brand-yellow-soft px-4 py-3 text-sm leading-6 text-brand-navy">
          {objectiveLabel(campaign.objective)} starts with Advantage+ campaign budget on. You can switch to an ad set budget below.
        </p>
      ) : null}

      <CampaignFormSection title="Campaign name" description="Use a name you can find later, such as Sales | Website | June admissions.">
        <CampaignInput label="Campaign name" value={campaign.campaignName} onChange={set('campaignName')} placeholder="Summer Sale - Website Traffic - June 2026" />
        <p className="text-sm text-brand-muted">Objective: {objectiveLabel(campaign.objective)}. Buying type: {campaign.buyingType === 'reservation' ? 'Reservation' : 'Auction'}.</p>
      </CampaignFormSection>

      <CampaignFormSection
        title="Special ad categories"
        description="Declare a category if your ads are about financial products and services, employment, housing, or social issues, elections or politics. Leave this blank if none apply. Financial products and services is required for ads aimed at the United States."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {specialAdCategories.map((item) => {
            const checked = campaign.specialAdCategories.includes(item.value);
            return (
              <label key={item.value} className="flex items-start gap-3 rounded-xl border border-brand-yellow/40 bg-white px-4 py-3 text-sm text-brand-navy">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-brand-navy"
                  checked={checked}
                  onChange={() => {
                    const specialAdCategoriesNext = checked
                      ? campaign.specialAdCategories.filter((value) => value !== item.value)
                      : [...campaign.specialAdCategories, item.value];
                    const locked = specialAdCategoriesNext.length > 0;
                    onChange({
                      ...campaign,
                      specialAdCategories: specialAdCategoriesNext,
                      adSets: campaign.adSets.map((adSet) => (locked
                        ? { ...adSet, ageMin: '18', ageMax: '65', gender: 'all', detailedTargeting: '', excludedTargeting: '', advantageAudience: true }
                        : adSet)),
                    });
                  }}
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </CampaignFormSection>

      <CampaignFormSection title="Budget" description="Campaign budget shares one amount across ad sets. Ad set budget sets the amount on each ad set.">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['campaign', 'Campaign budget', 'Advantage+ campaign budget. Meta distributes this amount across ad sets.'],
            ['adset', 'Ad set budget', 'You set how much each ad set can spend.'],
          ].map(([value, label, description]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...campaign, budgetLevel: value })}
              className={`rounded-2xl border px-4 py-4 text-left ${campaign.budgetLevel === value ? 'border-brand-yellow bg-brand-cream shadow-sm' : 'border-brand-yellow/30 bg-white'}`}
            >
              <span className="block text-sm font-semibold text-brand-navy">{label}</span>
              <span className="mt-1 block text-sm text-brand-muted">{description}</span>
            </button>
          ))}
        </div>
        {campaign.budgetLevel === 'campaign' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <CampaignSelect label="Budget type" value={campaign.campaignBudgetType} onChange={set('campaignBudgetType')} options={budgetTypes} />
            <CampaignInput label="Budget amount (₹)" type="number" min="1" value={campaign.campaignBudgetAmount} onChange={set('campaignBudgetAmount')} />
            <CampaignSelect label="Campaign bid strategy" value={campaign.campaignBidStrategy} onChange={set('campaignBidStrategy')} options={bidStrategies} />
            {showBidAmount ? (
              <CampaignInput
                label={campaign.campaignBidStrategy === 'roas_goal' ? 'ROAS goal' : 'Bid amount (₹)'}
                type="number"
                min="0"
                value={campaign.campaignBidAmount}
                onChange={set('campaignBidAmount')}
              />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">You will enter the daily or lifetime budget on the ad set.</p>
        )}
        <CampaignInput
          label="Campaign spending limit (optional)"
          type="number"
          min="0"
          value={campaign.campaignSpendingLimit}
          onChange={set('campaignSpendingLimit')}
          hint="A cap on total spend for this campaign. Leave blank for no limit."
        />
      </CampaignFormSection>

      <CampaignSwitch
        label="A/B test"
        description="Compare versions after you publish. The test itself is set up once the campaign exists."
        checked={campaign.abTest}
        onChange={(abTest) => onChange({ ...campaign, abTest })}
      />

      {campaign.objective === 'sales' ? (
        <CampaignSwitch
          label="Advantage+ catalog ads"
          description="Use a catalog to show products. Turn this off to build a manual creative."
          checked={campaign.advantageCatalog}
          onChange={(advantageCatalog) => onChange({ ...campaign, advantageCatalog })}
        />
      ) : null}
    </div>
  );
};

export default CampaignLevelForm;
