import CampaignFormSection from './CampaignFormSection';
import { CampaignInput, CampaignSelect, CampaignSwitch, CampaignTextarea } from './CampaignField';
import LocationRadiusField from './LocationRadiusField';
import { applyDestinationToAds, emptyDestination } from './campaignEntity';
import {
  appStores,
  attributionSettings,
  bidStrategies,
  budgetTypes,
  chargeEvents,
  conversionEvents,
  conversionLocations,
  devices,
  genders,
  languages,
  locationTypes,
  messagingApps,
  needsDataset,
  operatingSystems,
  performanceGoals,
  placements,
  platforms,
} from './metaCatalog';

const Chip = ({ active, children, onClick, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    aria-pressed={active}
    onClick={onClick}
    className={`rounded-full border px-3 py-1.5 text-sm disabled:opacity-40 ${active ? 'border-brand-yellow bg-brand-cream font-semibold text-brand-navy' : 'border-brand-yellow/40 bg-white text-brand-navy'}`}
  >
    {children}
  </button>
);

const AdSetLevelForm = ({ campaign, adSet, onChange }) => {
  const locked = campaign.specialAdCategories.length > 0;
  const set = (field) => (event) => onChange({ ...adSet, [field]: event.target.value });
  const locations = conversionLocations[campaign.objective] || [];
  const goals = performanceGoals(campaign.objective, adSet.conversionLocation);
  const showDataset = needsDataset(campaign.objective, adSet.conversionLocation);
  const showBidAmount = ['cost_per_result', 'bid_cap', 'roas_goal'].includes(adSet.bidStrategy);
  const budgetType = campaign.budgetLevel === 'campaign' ? campaign.campaignBudgetType : adSet.budgetType;

  const destination = { ...emptyDestination(), ...(adSet.destination || {}) };

  const commitAdSet = (next) => onChange(applyDestinationToAds(next));

  const setLocation = (conversionLocation) => {
    const nextGoals = performanceGoals(campaign.objective, conversionLocation);
    commitAdSet({
      ...adSet,
      conversionLocation,
      performanceGoal: nextGoals.some((item) => item.value === adSet.performanceGoal)
        ? adSet.performanceGoal
        : (nextGoals[0]?.value || ''),
    });
  };

  const setDestination = (field) => (event) => {
    commitAdSet({
      ...adSet,
      destination: { ...destination, [field]: event.target.value },
    });
  };

  const toggleMessagingApp = (value) => {
    const current = destination.messagingApps || [];
    commitAdSet({
      ...adSet,
      destination: {
        ...destination,
        messagingApps: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      },
    });
  };

  const toggleList = (field, value) => {
    const current = adSet[field] || [];
    onChange({
      ...adSet,
      [field]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    });
  };

  return (
    <div className="space-y-5">
      <CampaignFormSection title="Ad set name" description="All ads in this ad set share the audience, placements, budget, and schedule.">
        <CampaignInput label="Ad set name" value={adSet.adSetName} onChange={set('adSetName')} placeholder="Mumbai parents 25-44" />
      </CampaignFormSection>

      <CampaignFormSection title="Conversion" description="Conversion location is where the result happens. Performance goal is what delivery optimizes for.">
        {locations.length ? (
          <div>
            <p className="text-sm font-medium text-brand-navy">Conversion location</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {locations.map((item) => (
                <Chip key={item.value} active={adSet.conversionLocation === item.value} onClick={() => setLocation(item.value)}>
                  {item.label}
                </Chip>
              ))}
            </div>
            <ConversionDetails
              location={adSet.conversionLocation}
              destination={destination}
              setDestination={setDestination}
              toggleMessagingApp={toggleMessagingApp}
            />
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Awareness does not use a conversion location. Choose a performance goal instead.</p>
        )}
        <CampaignSelect label="Performance goal" value={adSet.performanceGoal} onChange={set('performanceGoal')} options={goals} />
        {showDataset ? (
          <div className="grid gap-4 md:grid-cols-2">
            <CampaignInput label="Dataset" value={adSet.dataset} onChange={set('dataset')} placeholder="Pixel or dataset name" hint="The dataset that records the conversion event." />
            <CampaignSelect label="Conversion event" value={adSet.conversionEvent} onChange={set('conversionEvent')} options={conversionEvents} />
          </div>
        ) : null}
        {showDataset ? (
          <CampaignSelect label="Attribution setting" value={adSet.attributionSetting} onChange={set('attributionSetting')} options={attributionSettings} />
        ) : null}
        <CampaignSelect label="When you are charged" value={adSet.chargeEvent} onChange={set('chargeEvent')} options={chargeEvents} />
      </CampaignFormSection>

      <CampaignFormSection
        title="Budget & schedule"
        description={campaign.budgetLevel === 'campaign' ? 'This ad set uses the campaign budget. Set the schedule here.' : 'Set how much this ad set can spend and when it runs.'}
      >
        {campaign.budgetLevel === 'adset' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <CampaignSelect label="Budget type" value={adSet.budgetType} onChange={set('budgetType')} options={budgetTypes} />
            <CampaignInput label="Budget amount (₹)" type="number" min="1" value={adSet.budgetAmount} onChange={set('budgetAmount')} />
            <CampaignSelect label="Bid strategy" value={adSet.bidStrategy} onChange={set('bidStrategy')} options={bidStrategies} />
            {showBidAmount ? <CampaignInput label="Amount (₹)" type="number" min="0" value={adSet.bidAmount} onChange={set('bidAmount')} /> : null}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Budget is set on the campaign. Daily and lifetime still decide whether this ad set needs an end date.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignInput label="Start date" type="date" value={adSet.startDate} onChange={set('startDate')} hint="Leave blank to start when you publish." />
          <CampaignInput label="Start time" type="time" value={adSet.startTime} onChange={set('startTime')} />
          <CampaignInput label="End date" type="date" value={adSet.endDate} onChange={set('endDate')} hint={budgetType === 'lifetime' ? 'Required for a lifetime budget.' : 'Optional when the budget is daily.'} />
          <CampaignInput label="End time" type="time" value={adSet.endTime} onChange={set('endTime')} />
        </div>
        <CampaignSwitch
          label="Run ads on a schedule"
          description="Limit delivery to hours you choose. The ad set still needs at least one hour, and a lifetime budget is the usual pairing."
          checked={adSet.useSchedule}
          onChange={(useSchedule) => onChange({ ...adSet, useSchedule })}
        />
      </CampaignFormSection>

      <CampaignFormSection title="Audience controls" description="Locations are required. A special ad category locks age to 18–65 and gender to All.">
        <LocationRadiusField
          targets={adSet.locationTargets || []}
          onChange={(locationTargets) => onChange({
            ...adSet,
            locationTargets,
            locations: locationTargets.map((item) => `${item.name} (+${item.radiusKm} km)`).join(', '),
          })}
        />
        <CampaignTextarea label="Exclude locations" value={adSet.excludedLocations} onChange={set('excludedLocations')} placeholder="Optional" />
        <CampaignSelect label="Location type" value={adSet.locationType} onChange={set('locationType')} options={locationTypes} />
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignInput label="Minimum age" type="number" min="13" max="65" value={adSet.ageMin} onChange={set('ageMin')} disabled={locked} />
          <CampaignInput label="Maximum age" type="number" min="13" max="65" value={adSet.ageMax} onChange={set('ageMax')} disabled={locked} hint="65 includes 65+." />
        </div>
      </CampaignFormSection>

      <CampaignSwitch
        label="Advantage+ audience"
        description="On: age maximum, gender, and detailed targeting are suggestions. Off: they limit who can see the ad."
        checked={adSet.advantageAudience}
        onChange={(advantageAudience) => onChange({ ...adSet, advantageAudience: locked ? true : advantageAudience })}
      />

      <CampaignFormSection
        title={adSet.advantageAudience ? 'Suggestions' : 'Further limit the reach'}
        description={locked ? 'Detailed targeting is limited because a special ad category is selected.' : 'Languages, gender, interests, and audiences you already have in the ad account.'}
      >
        <div>
          <p className="text-sm font-medium text-brand-navy">Gender</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {genders.map((item) => (
              <Chip key={item.value} disabled={locked && item.value !== 'all'} active={adSet.gender === item.value} onClick={() => !locked && onChange({ ...adSet, gender: item.value })}>
                {item.label}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-brand-navy">Languages</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((language) => (
              <Chip key={language} active={adSet.languages.includes(language)} onClick={() => toggleList('languages', language)}>
                {language}
              </Chip>
            ))}
          </div>
          <div className="mt-3">
            <CampaignInput label="Other languages" value={adSet.otherLanguages} onChange={set('otherLanguages')} placeholder="Arabic, French" />
          </div>
        </div>
        <CampaignTextarea label="Detailed targeting" value={adSet.detailedTargeting} onChange={set('detailedTargeting')} disabled={locked} placeholder="Interests, demographics, behaviors" />
        <CampaignTextarea label="Exclude detailed targeting" value={adSet.excludedTargeting} onChange={set('excludedTargeting')} disabled={locked} placeholder="Optional" />
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignInput label="Custom audiences" value={adSet.customAudiences} onChange={set('customAudiences')} placeholder="Website visitors, customer list" />
          <CampaignInput label="Exclude audiences" value={adSet.excludedAudiences} onChange={set('excludedAudiences')} placeholder="Existing customers" />
        </div>
      </CampaignFormSection>

      <CampaignFormSection title="Placements" description="Advantage+ placements is selected by default. Edit it to choose manual placements.">
        <div className="flex flex-wrap gap-2">
          <Chip active={adSet.placementMode === 'advantage'} onClick={() => onChange({ ...adSet, placementMode: 'advantage' })}>Advantage+ placements</Chip>
          <Chip active={adSet.placementMode === 'manual'} onClick={() => onChange({ ...adSet, placementMode: 'manual' })}>Manual placements</Chip>
        </div>
        {adSet.placementMode === 'advantage' ? (
          <p className="text-sm text-brand-muted">Ads can run on Facebook, Instagram, Messenger, Audience Network, WhatsApp, and Threads wherever they are eligible.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-brand-navy">Platforms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <Chip key={platform.value} active={adSet.platforms.includes(platform.value)} onClick={() => {
                    const enabling = !adSet.platforms.includes(platform.value);
                    const nextPlatforms = enabling
                      ? [...adSet.platforms, platform.value]
                      : adSet.platforms.filter((item) => item !== platform.value);
                    const platformPlacements = placements.filter((item) => item.platform === platform.value).map((item) => item.value);
                    const nextPlacements = enabling
                      ? [...new Set([...adSet.placements, ...platformPlacements])]
                      : adSet.placements.filter((value) => !platformPlacements.includes(value));
                    onChange({ ...adSet, platforms: nextPlatforms, placements: nextPlacements });
                  }}
                  >
                    {platform.label}
                  </Chip>
                ))}
              </div>
            </div>
            {platforms.filter((platform) => adSet.platforms.includes(platform.value)).map((platform) => (
              <div key={platform.value}>
                <p className="text-sm font-medium text-brand-navy">{platform.label} placements</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {placements.filter((item) => item.platform === platform.value).map((item) => (
                    <label key={item.value} className="flex items-center gap-2 rounded-xl border border-brand-yellow/30 bg-white px-3 py-2 text-sm text-brand-navy">
                      <input type="checkbox" className="h-4 w-4 accent-brand-navy" checked={adSet.placements.includes(item.value)} onChange={() => toggleList('placements', item.value)} />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-brand-navy">Devices and operating systems</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {devices.map((item) => (
              <Chip key={item.value} active={adSet.devices.includes(item.value)} onClick={() => toggleList('devices', item.value)}>{item.label}</Chip>
            ))}
          </div>
          <div className="mt-3 max-w-xs">
            <CampaignSelect label="Operating system" value={adSet.operatingSystem} onChange={set('operatingSystem')} options={operatingSystems} />
          </div>
        </div>
        {campaign.objective === 'sales' ? (
          <CampaignSwitch label="Reach more people across other mobile devices" checked={adSet.reachMoreDevices} onChange={(reachMoreDevices) => onChange({ ...adSet, reachMoreDevices })} />
        ) : null}
        {adSet.placementMode === 'manual' && campaign.objective !== 'awareness' ? (
          <CampaignSwitch
            label="Allow limited spend to excluded placements"
            description="Up to about 5% of the budget can go to an excluded placement when that is likely to improve performance."
            checked={adSet.limitedSpendExcluded}
            onChange={(limitedSpendExcluded) => onChange({ ...adSet, limitedSpendExcluded })}
          />
        ) : null}
      </CampaignFormSection>
    </div>
  );
};

const ConversionDetails = ({ location, destination, setDestination, toggleMessagingApp }) => {
  const website = location === 'website' || location === 'website_and_app';
  const app = location === 'app' || location === 'website_and_app';
  const apps = destination.messagingApps || [];
  const showPage = location === 'messenger' || location === 'page' || (location === 'messaging' && apps.includes('messenger'));
  const showInstagram = location === 'instagram' || (location === 'messaging' && apps.includes('instagram'));
  const showWhatsapp = location === 'whatsapp' || (location === 'messaging' && apps.includes('whatsapp'));

  if (location === 'on_ad') {
    return <p className="text-sm text-brand-muted">People engage with the ad itself. No website, form, or phone number is required.</p>;
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-yellow/30 bg-brand-cream/60 p-4">
      <p className="text-sm font-medium text-brand-navy">Details for this conversion</p>
      {location === 'messaging' ? (
        <div>
          <p className="text-sm font-medium text-brand-navy">Messaging app</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {messagingApps.map((item) => (
              <Chip key={item.value} active={apps.includes(item.value)} onClick={() => toggleMessagingApp(item.value)}>
                {item.label}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      {website ? (
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignInput label="Website" value={destination.websiteUrl} onChange={setDestination('websiteUrl')} placeholder="https://yourwebsite.com" hint="The site people land on after they tap the ad." />
          <CampaignInput label="Display link" value={destination.displayLink} onChange={setDestination('displayLink')} placeholder="yourwebsite.com/admissions" hint="Optional. The short address shown on the ad." />
        </div>
      ) : null}
      {app ? (
        <div className="grid gap-4 md:grid-cols-2">
          <CampaignInput label="App name" value={destination.appName} onChange={setDestination('appName')} placeholder="Inkstall" />
          <CampaignSelect label="App store" value={destination.appStore} onChange={setDestination('appStore')} options={appStores} />
          <CampaignInput label="App store link" value={destination.appUrl} onChange={setDestination('appUrl')} placeholder="https://play.google.com/store/apps/details?id=" />
          <CampaignInput label="Deep link" value={destination.deepLink} onChange={setDestination('deepLink')} placeholder="inkstall://course/12" hint="Optional. Opens a specific screen in the app." />
        </div>
      ) : null}
      {location === 'instant_form' ? (
        <CampaignInput label="Instant form name" value={destination.formName} onChange={setDestination('formName')} placeholder="Admission enquiry" hint="People submit this form on Facebook or Instagram." />
      ) : null}
      {showPage ? (
        <CampaignInput label="Facebook Page" value={destination.pageName} onChange={setDestination('pageName')} placeholder="Inkstall Learning" hint={location === 'page' ? 'The Page this campaign promotes.' : 'Chats open on this Page.'} />
      ) : null}
      {showInstagram ? (
        <CampaignInput label="Instagram account" value={destination.instagramAccount} onChange={setDestination('instagramAccount')} placeholder="@inkstall" hint="The Instagram profile this conversion uses." />
      ) : null}
      {showWhatsapp ? (
        <CampaignInput label="WhatsApp number" value={destination.whatsappNumber} onChange={setDestination('whatsappNumber')} placeholder="+91 98765 43210" hint="People message this number on WhatsApp." />
      ) : null}
      {location === 'calls' ? (
        <CampaignInput label="Phone number" value={destination.phoneNumber} onChange={setDestination('phoneNumber')} placeholder="+91 98765 43210" hint="People call this number from the ad." />
      ) : null}
    </div>
  );
};

export default AdSetLevelForm;
