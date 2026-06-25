import { useMemo, useState } from 'react';
import CampaignFormSection from './CampaignFormSection';
import CampaignSummaryCard from './CampaignSummaryCard';
import {
  CampaignCheckboxGroup,
  CampaignInput,
  CampaignRadioCards,
  CampaignSelect,
  CampaignTextarea,
} from './CampaignField';
import {
  ageGroupOptions,
  audienceSuggestionOptions,
  buyingTypeOptions,
  budgetTypeOptions,
  callToActionOptions,
  deviceOptions,
  genderOptions,
  objectiveOptions,
  optimizationOptions,
  placementOptions,
  platformOptions,
  specialAdCategoryOptions,
} from './campaignOptions';

const defaultValues = {
  name: '',
  campaignObjective: 'leads',
  buyingType: 'auction',
  specialAdCategory: 'none',
  ageGroupPreset: '18-24',
  minAge: '18',
  maxAge: '34',
  gender: 'all',
  locations: 'Mumbai, Pune, Navi Mumbai',
  languages: 'English, Hindi',
  detailedTargeting:
    'Education, competitive exam prep, school admissions, tutoring, STEM learning',
  audienceSuggestions: ['students', 'parents'],
  customAudience: '',
  placements: ['facebook_feed', 'instagram_feed', 'instagram_stories'],
  platforms: ['facebook', 'instagram'],
  devices: 'all_devices',
  budgetType: 'daily',
  budgetAmount: '1500',
  currency: 'INR',
  startDate: '',
  endDate: '',
  optimizationGoal: 'leads',
  bidStrategy: 'highest_volume',
  adName: '',
  pageName: '',
  instagramAccount: '',
  headline: '',
  primaryText: '',
  description: '',
  callToAction: 'learn_more',
  destinationUrl: '',
  leadFormName: '',
  utmParameters: '',
};

const labelFromOptions = (options, value) =>
  options.find((item) => item.value === value)?.label || value;

const labelsFromOptions = (options, values) =>
  options
    .filter((item) => values.includes(item.value))
    .map((item) => item.label)
    .join(', ');

const toggleValue = (currentValues, value) =>
  currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];

const CampaignsPage = () => {
  const [values, setValues] = useState(defaultValues);
  const [submitted, setSubmitted] = useState(false);

  const summaryValues = useMemo(
    () => ({
      name: values.name,
      objectiveLabel: labelFromOptions(
        objectiveOptions,
        values.campaignObjective,
      ),
      budgetTypeLabel: labelFromOptions(budgetTypeOptions, values.budgetType),
      genderLabel: labelFromOptions(genderOptions, values.gender),
      platformLabels: labelsFromOptions(platformOptions, values.platforms),
      placementLabels: labelsFromOptions(placementOptions, values.placements),
      callToActionLabel: labelFromOptions(
        callToActionOptions,
        values.callToAction,
      ),
      minAge: values.minAge,
      maxAge: values.maxAge,
      budgetAmount: values.budgetAmount,
      currency: values.currency,
    }),
    [values],
  );

  const setField = (field) => (event) => {
    setSubmitted(false);
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleToggle = (field, value) => {
    setSubmitted(false);
    setValues((current) => ({
      ...current,
      [field]: toggleValue(current[field], value),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="px-8 py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <CampaignFormSection
            title="Campaign Setup"
            description="Core settings similar to the first step of Meta Ads Manager."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <CampaignInput
                label="Campaign name"
                placeholder="June admissions lead gen"
                value={values.name}
                onChange={setField('name')}
              />
              <CampaignSelect
                label="Buying type"
                value={values.buyingType}
                onChange={setField('buyingType')}
                options={buyingTypeOptions}
              />
            </div>

            <CampaignRadioCards
              label="Campaign objective"
              value={values.campaignObjective}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  campaignObjective: value,
                }))
              }
              options={objectiveOptions}
            />

            <CampaignSelect
              label="Special ad category"
              value={values.specialAdCategory}
              onChange={setField('specialAdCategory')}
              options={specialAdCategoryOptions}
              hint="Required for regulated industries like housing, employment, and credit."
            />
          </CampaignFormSection>

          <CampaignFormSection
            title="Audience Targeting"
            description="Define who should see the campaign across Facebook and Instagram."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <CampaignSelect
                label="Age group preset"
                value={values.ageGroupPreset}
                onChange={setField('ageGroupPreset')}
                options={ageGroupOptions}
              />
              <CampaignInput
                label="Minimum age"
                type="number"
                min="13"
                max="65"
                value={values.minAge}
                onChange={setField('minAge')}
              />
              <CampaignInput
                label="Maximum age"
                type="number"
                min="13"
                max="65"
                value={values.maxAge}
                onChange={setField('maxAge')}
              />
            </div>

            <CampaignSelect
              label="Gender"
              value={values.gender}
              onChange={setField('gender')}
              options={genderOptions}
            />

            <CampaignTextarea
              label="Locations"
              value={values.locations}
              onChange={setField('locations')}
              placeholder="Mumbai, Pune, Thane"
              hint="Use cities, states, pin codes, or radius targeting."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <CampaignInput
                label="Languages"
                value={values.languages}
                onChange={setField('languages')}
                placeholder="English, Hindi"
              />
              <CampaignInput
                label="Custom / lookalike audience"
                value={values.customAudience}
                onChange={setField('customAudience')}
                placeholder="Website visitors, CRM lookalike, engaged users"
              />
            </div>

            <CampaignTextarea
              label="Detailed targeting"
              value={values.detailedTargeting}
              onChange={setField('detailedTargeting')}
              placeholder="Interests, behaviors, demographics"
            />

            <CampaignCheckboxGroup
              label="Suggested audience buckets"
              values={values.audienceSuggestions}
              onToggle={(value) => handleToggle('audienceSuggestions', value)}
              options={audienceSuggestionOptions}
            />
          </CampaignFormSection>

          <CampaignFormSection
            title="Placements and Devices"
            description="Choose where the ads will show up across Meta surfaces."
          >
            <CampaignCheckboxGroup
              label="Platforms"
              values={values.platforms}
              onToggle={(value) => handleToggle('platforms', value)}
              options={platformOptions}
            />

            <CampaignCheckboxGroup
              label="Placements"
              values={values.placements}
              onToggle={(value) => handleToggle('placements', value)}
              options={placementOptions}
            />

            <CampaignSelect
              label="Devices"
              value={values.devices}
              onChange={setField('devices')}
              options={deviceOptions}
            />
          </CampaignFormSection>

          <CampaignFormSection
            title="Budget, Schedule and Delivery"
            description="Set the spend level, dates, and optimization preference."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <CampaignSelect
                label="Budget type"
                value={values.budgetType}
                onChange={setField('budgetType')}
                options={budgetTypeOptions}
              />
              <CampaignInput
                label="Budget amount"
                type="number"
                min="0"
                value={values.budgetAmount}
                onChange={setField('budgetAmount')}
              />
              <CampaignInput
                label="Currency"
                value={values.currency}
                onChange={setField('currency')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CampaignInput
                label="Start date"
                type="datetime-local"
                value={values.startDate}
                onChange={setField('startDate')}
              />
              <CampaignInput
                label="End date"
                type="datetime-local"
                value={values.endDate}
                onChange={setField('endDate')}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CampaignSelect
                label="Optimization goal"
                value={values.optimizationGoal}
                onChange={setField('optimizationGoal')}
                options={optimizationOptions}
              />
              <CampaignInput
                label="Bid strategy"
                value={values.bidStrategy}
                onChange={setField('bidStrategy')}
                placeholder="highest_volume / cost_cap / bid_cap"
              />
            </div>
          </CampaignFormSection>

          <CampaignFormSection
            title="Ad Creative"
            description="Capture the creative details typically configured at the ad level."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <CampaignInput
                label="Ad name"
                value={values.adName}
                onChange={setField('adName')}
                placeholder="Admissions video - parents"
              />
              <CampaignInput
                label="Facebook page"
                value={values.pageName}
                onChange={setField('pageName')}
                placeholder="Inkstall Learning"
              />
            </div>

            <CampaignInput
              label="Instagram account"
              value={values.instagramAccount}
              onChange={setField('instagramAccount')}
              placeholder="@inkstall"
            />

            <CampaignInput
              label="Headline"
              value={values.headline}
              onChange={setField('headline')}
              placeholder="Boost your child's exam confidence"
            />

            <CampaignTextarea
              label="Primary text"
              value={values.primaryText}
              onChange={setField('primaryText')}
              placeholder="Describe the offer, value proposition, and urgency."
            />

            <CampaignTextarea
              label="Description"
              value={values.description}
              onChange={setField('description')}
              placeholder="Optional extra line for feed placements."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <CampaignSelect
                label="Call to action"
                value={values.callToAction}
                onChange={setField('callToAction')}
                options={callToActionOptions}
              />
              <CampaignInput
                label="Destination URL"
                value={values.destinationUrl}
                onChange={setField('destinationUrl')}
                placeholder="https://inkstall.in/admissions"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CampaignInput
                label="Lead form name"
                value={values.leadFormName}
                onChange={setField('leadFormName')}
                placeholder="Admissions Lead Form"
              />
              <CampaignInput
                label="UTM parameters"
                value={values.utmParameters}
                onChange={setField('utmParameters')}
                placeholder="utm_source=facebook&utm_campaign=admissions_june"
              />
            </div>
          </CampaignFormSection>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-hover"
            >
              Save Campaign Draft
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setValues(defaultValues);
              }}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-yellow"
            >
              Reset Form
            </button>
            {submitted ? (
              <span className="text-sm text-emerald-700">
                Draft captured locally. Hook this form to your Meta campaign API next.
              </span>
            ) : null}
          </div>
        </form>

        <div className="space-y-6">
          <CampaignSummaryCard values={summaryValues} />

          <div className="rounded-2xl border border-brand-yellow/30 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-navy">What’s Included</h2>
            <ul className="mt-4 space-y-3 text-sm text-brand-muted">
              <li>Campaign name, objective, buying type, and special ad category.</li>
              <li>Age group, gender, locations, languages, interests, and audience lists.</li>
              <li>Platform selection, manual placements, devices, budgets, and schedule.</li>
              <li>Optimization goal, bid strategy, CTA, creative copy, destination URL, and lead form details.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;
