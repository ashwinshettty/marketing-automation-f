import {
  campaignBudgetDefault,
  conversionLocations,
  performanceGoals,
  placements,
} from './metaCatalog';

const newId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const allPlacementValues = placements.map((item) => item.value);

export const emptyDestination = () => ({
  websiteUrl: '',
  displayLink: '',
  appName: '',
  appStore: 'google_play',
  appUrl: '',
  deepLink: '',
  formName: '',
  pageName: '',
  instagramAccount: '',
  whatsappNumber: '',
  phoneNumber: '',
  messagingApps: [],
});

export const stampAdDestination = (ad, adSet) => {
  const destination = { ...emptyDestination(), ...(adSet.destination || {}) };
  const location = adSet.conversionLocation;
  const next = { ...ad };
  if (location === 'website' || location === 'website_and_app') {
    next.destinationUrl = destination.websiteUrl;
    next.displayLink = destination.displayLink;
  }
  if (location === 'app' || location === 'website_and_app') {
    next.deepLink = destination.deepLink;
    if (location === 'app') next.destinationUrl = destination.appUrl;
  }
  if (location === 'instant_form') next.leadFormName = destination.formName;
  if (location === 'whatsapp') next.phoneNumber = destination.whatsappNumber;
  if (location === 'calls') next.phoneNumber = destination.phoneNumber;
  if ((location === 'messenger' || location === 'page') && destination.pageName) {
    next.pageName = destination.pageName;
  }
  if (location === 'instagram' && destination.instagramAccount) {
    next.instagramAccount = destination.instagramAccount;
  }
  if (location === 'messaging') {
    const apps = destination.messagingApps || [];
    if (apps.includes('whatsapp')) next.phoneNumber = destination.whatsappNumber;
    if (apps.includes('messenger') && destination.pageName) next.pageName = destination.pageName;
    if (apps.includes('instagram') && destination.instagramAccount) next.instagramAccount = destination.instagramAccount;
  }
  return next;
};

export const applyDestinationToAds = (adSet) => ({
  ...adSet,
  ads: (adSet.ads || []).map((ad) => stampAdDestination(ad, adSet)),
});

export const createAd = (campaignName = '') => ({
  id: newId(),
  status: 'active',
  adName: campaignName ? `${campaignName} ad` : '',
  pageName: '',
  instagramAccount: '',
  adSetup: 'create',
  existingPost: '',
  format: 'single',
  mediaUrl: '',
  carouselUrls: '',
  primaryTexts: [''],
  headlines: [''],
  descriptions: [''],
  callToAction: 'learn_more',
  destinationUrl: '',
  displayLink: '',
  deepLink: '',
  leadFormName: '',
  phoneNumber: '',
  urlParameters: '',
  siteLinks: '',
  advantageCreative: true,
  multiAdvertiser: true,
});

export const createAdSet = (objective = 'leads') => {
  const locations = conversionLocations[objective] || [];
  const conversionLocation = locations[0]?.value || '';
  const goals = performanceGoals(objective, conversionLocation);
  return {
    id: newId(),
    status: 'active',
    adSetName: '',
    conversionLocation,
    performanceGoal: goals[0]?.value || '',
    dataset: '',
    conversionEvent: objective === 'sales' ? 'purchase' : objective === 'leads' ? 'lead' : '',
    attributionSetting: '7c_1v',
    chargeEvent: 'impression',
    budgetType: 'daily',
    budgetAmount: '',
    bidStrategy: 'highest_volume',
    bidAmount: '',
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    useSchedule: false,
    locations: '',
    locationTargets: [],
    excludedLocations: '',
    destination: emptyDestination(),
    locationType: 'living_or_recent',
    ageMin: '18',
    ageMax: '65',
    gender: 'all',
    languages: ['English'],
    otherLanguages: '',
    detailedTargeting: '',
    excludedTargeting: '',
    customAudiences: '',
    excludedAudiences: '',
    advantageAudience: true,
    placementMode: 'advantage',
    platforms: ['facebook', 'instagram', 'messenger', 'audience_network', 'whatsapp', 'threads'],
    placements: allPlacementValues,
    devices: ['mobile', 'desktop'],
    operatingSystem: 'all',
    limitedSpendExcluded: true,
    reachMoreDevices: true,
    ads: [createAd()],
  };
};

export const createCampaign = () => ({
  id: newId(),
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  buyingType: 'auction',
  objective: '',
  campaignName: '',
  specialAdCategories: [],
  budgetLevel: 'adset',
  campaignBudgetType: 'daily',
  campaignBudgetAmount: '',
  campaignBidStrategy: 'highest_volume',
  campaignBidAmount: '',
  abTest: false,
  advantageCatalog: false,
  campaignSpendingLimit: '',
  adSets: [],
});

export const applyObjective = (campaign, objective) => {
  const next = {
    ...campaign,
    objective,
    budgetLevel: campaignBudgetDefault(objective),
    advantageCatalog: false,
  };
  if (!next.adSets.length) {
    next.adSets = [createAdSet(objective)];
  } else {
    next.adSets = next.adSets.map((adSet) => {
      const locations = conversionLocations[objective] || [];
      const conversionLocation = locations.some((item) => item.value === adSet.conversionLocation)
        ? adSet.conversionLocation
        : (locations[0]?.value || '');
      const goals = performanceGoals(objective, conversionLocation);
      const performanceGoal = goals.some((item) => item.value === adSet.performanceGoal)
        ? adSet.performanceGoal
        : (goals[0]?.value || '');
      return { ...adSet, conversionLocation, performanceGoal };
    });
  }
  return next;
};

const text = (value) => String(value || '').trim();

const amountOk = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

const isUrl = (value) => {
  try {
    const url = new URL(text(value));
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateCampaignLevel = (campaign) => {
  const errors = [];
  if (!campaign.objective) errors.push('Choose a campaign objective.');
  if (campaign.buyingType === 'reservation' && campaign.objective && campaign.objective !== 'awareness') {
    errors.push('Reservation buying is available for the Awareness objective.');
  }
  if (!text(campaign.campaignName)) errors.push('Enter a campaign name.');
  if (campaign.budgetLevel === 'campaign' && !amountOk(campaign.campaignBudgetAmount)) {
    errors.push('Enter a campaign budget.');
  }
  if (['cost_per_result', 'bid_cap', 'roas_goal'].includes(campaign.campaignBidStrategy) && campaign.budgetLevel === 'campaign' && !amountOk(campaign.campaignBidAmount)) {
    errors.push('Enter an amount for the campaign bid strategy.');
  }
  return errors;
};

export const validateAdSet = (campaign, adSet) => {
  const errors = [];
  if (!text(adSet.adSetName)) errors.push('Enter an ad set name.');
  const locations = conversionLocations[campaign.objective] || [];
  if (locations.length && !adSet.conversionLocation) errors.push('Choose a conversion location.');
  if (!adSet.performanceGoal) errors.push('Choose a performance goal.');
  if (campaign.budgetLevel === 'adset' && !amountOk(adSet.budgetAmount)) errors.push('Enter an ad set budget.');
  const budgetType = campaign.budgetLevel === 'campaign' ? campaign.campaignBudgetType : adSet.budgetType;
  if (budgetType === 'lifetime' && !adSet.endDate) errors.push('A lifetime budget needs an end date.');
  if (adSet.startDate && adSet.endDate && adSet.endDate < adSet.startDate) {
    errors.push('The end date has to be on or after the start date.');
  }
  if (['cost_per_result', 'bid_cap', 'roas_goal'].includes(adSet.bidStrategy) && campaign.budgetLevel === 'adset' && !amountOk(adSet.bidAmount)) {
    errors.push('Enter an amount for the ad set bid strategy.');
  }
  const targets = Array.isArray(adSet.locationTargets) ? adSet.locationTargets : [];
  if (!targets.length && !text(adSet.locations)) errors.push('Choose at least one location.');
  if (targets.some((item) => !Number(item.radiusKm))) errors.push('Choose a radius in kilometres for each location.');
  errors.push(...destinationErrors(adSet));
  if (adSet.placementMode === 'manual' && !adSet.placements?.length) {
    errors.push('Select at least one placement, or switch back to Advantage+ placements.');
  }
  if (!adSet.devices?.length) errors.push('Select at least one device.');
  const minAge = Number(adSet.ageMin);
  const maxAge = Number(adSet.ageMax);
  if (!Number.isFinite(minAge) || !Number.isFinite(maxAge) || minAge < 13 || maxAge > 65 || minAge > maxAge) {
    errors.push('Use an age range from 13 to 65.');
  }
  return errors;
};

const digits = (value) => text(value).replace(/\D/g, '');

const destinationErrors = (adSet) => {
  const destination = { ...emptyDestination(), ...(adSet.destination || {}) };
  const location = adSet.conversionLocation;
  const errors = [];
  if (location === 'website' || location === 'website_and_app') {
    if (!isUrl(destination.websiteUrl)) errors.push('Enter the website for this conversion. Include https://.');
  }
  if (location === 'app' || location === 'website_and_app') {
    if (!text(destination.appName)) errors.push('Enter the app name.');
    if (!isUrl(destination.appUrl)) errors.push('Enter the app store link. Include https://.');
  }
  if (location === 'instant_form' && !text(destination.formName)) {
    errors.push('Name the instant form people will submit.');
  }
  if (location === 'whatsapp' && digits(destination.whatsappNumber).length < 8) {
    errors.push('Enter the WhatsApp number for this conversion.');
  }
  if (location === 'calls' && digits(destination.phoneNumber).length < 8) {
    errors.push('Enter the phone number people will call.');
  }
  if ((location === 'messenger' || location === 'page') && !text(destination.pageName)) {
    errors.push('Enter the Facebook Page for this conversion.');
  }
  if (location === 'instagram' && !text(destination.instagramAccount)) {
    errors.push('Enter the Instagram account for this conversion.');
  }
  if (location === 'messaging') {
    const apps = destination.messagingApps || [];
    if (!apps.length) errors.push('Choose the messaging app for this conversion.');
    if (apps.includes('whatsapp') && digits(destination.whatsappNumber).length < 8) {
      errors.push('Enter the WhatsApp number.');
    }
    if (apps.includes('messenger') && !text(destination.pageName)) {
      errors.push('Enter the Facebook Page for Messenger.');
    }
    if (apps.includes('instagram') && !text(destination.instagramAccount)) {
      errors.push('Enter the Instagram account.');
    }
  }
  return errors;
};

const needsWebsite = (location) => ['website', 'website_and_app', 'app'].includes(location);
const needsForm = (location) => location === 'instant_form';
const needsPhone = (location) => location === 'calls' || location === 'whatsapp';

export const validateAd = (adSet, ad) => {
  const errors = [];
  if (!text(ad.adName)) errors.push('Enter an ad name.');
  if (!text(ad.pageName)) errors.push('Select a Facebook Page.');
  if (ad.adSetup === 'existing') {
    if (!text(ad.existingPost)) errors.push('Enter the existing post you want to use.');
    return errors;
  }
  const primary = (ad.primaryTexts || []).some((item) => text(item).length >= 1);
  if (!primary) errors.push('Enter primary text.');
  const headline = (ad.headlines || []).some((item) => text(item));
  if (!headline && adSet.conversionLocation !== 'on_ad') errors.push('Enter a headline.');
  if (needsWebsite(adSet.conversionLocation) && !isUrl(ad.destinationUrl)) {
    errors.push('Enter a destination URL that starts with https://.');
  }
  if (needsForm(adSet.conversionLocation) && !text(ad.leadFormName)) {
    errors.push('Enter an instant form name.');
  }
  if (needsPhone(adSet.conversionLocation) && text(ad.phoneNumber).length < 8 && !isUrl(ad.destinationUrl)) {
    errors.push(adSet.conversionLocation === 'whatsapp'
      ? 'Enter a WhatsApp number or wa.me link.'
      : 'Enter the phone number for calls.');
  }
  if (ad.format === 'carousel') {
    const lines = text(ad.carouselUrls).split('\n').filter(Boolean);
    if (lines.length < 2) errors.push('Add at least two carousel image links, one per line.');
  } else if (!text(ad.mediaUrl)) {
    errors.push('Add an image or video.');
  }
  return errors;
};

export const validateAll = (campaign) => {
  const campaignErrors = validateCampaignLevel(campaign);
  const adSetErrors = [];
  (campaign.adSets || []).forEach((adSet, index) => {
    validateAdSet(campaign, adSet).forEach((message) => {
      adSetErrors.push({ adSetId: adSet.id, index, message });
    });
    (adSet.ads || []).forEach((ad) => {
      validateAd(adSet, ad).forEach((message) => {
        adSetErrors.push({ adSetId: adSet.id, adId: ad.id, message });
      });
    });
  });
  if (!campaign.adSets?.length) campaignErrors.push('Add an ad set.');
  return { campaignErrors, adSetErrors };
};

export const canPublish = (campaign) => {
  const { campaignErrors, adSetErrors } = validateAll(campaign);
  return campaignErrors.length === 0 && adSetErrors.length === 0;
};

export const objectiveLabel = (value) => {
  const found = {
    awareness: 'Awareness',
    traffic: 'Traffic',
    engagement: 'Engagement',
    leads: 'Leads',
    app_promotion: 'App promotion',
    sales: 'Sales',
  }[value];
  return found || 'No objective';
};

export const budgetLabel = (campaign, adSet) => {
  if (campaign.budgetLevel === 'campaign') {
    const amount = campaign.campaignBudgetAmount || '0';
    return campaign.campaignBudgetType === 'lifetime' ? `₹${amount} lifetime` : `₹${amount} daily`;
  }
  if (!adSet) return 'Ad set budget';
  const amount = adSet.budgetAmount || '0';
  return adSet.budgetType === 'lifetime' ? `₹${amount} lifetime` : `₹${amount} daily`;
};

const normalizeAdSet = (adSet, objective) => {
  const fresh = createAdSet(objective || 'leads');
  return {
    ...fresh,
    ...adSet,
    locationTargets: Array.isArray(adSet?.locationTargets) ? adSet.locationTargets : [],
    destination: { ...emptyDestination(), ...(adSet?.destination || {}) },
    languages: adSet?.languages?.length ? adSet.languages : fresh.languages,
    platforms: adSet?.platforms?.length ? adSet.platforms : fresh.platforms,
    placements: adSet?.placements?.length ? adSet.placements : fresh.placements,
    devices: adSet?.devices?.length ? adSet.devices : fresh.devices,
    ads: adSet?.ads?.length ? adSet.ads.map((ad) => ({ ...createAd(), ...ad })) : fresh.ads,
  };
};

export const migrateCampaign = (item) => {
  if (!item || typeof item !== 'object') return null;
  if (item.campaignName || item.objective || Array.isArray(item.adSets)) {
    const base = { ...createCampaign(), ...item, adSets: item.adSets?.length ? item.adSets : [createAdSet(item.objective || 'leads')] };
    base.adSets = base.adSets.map((adSet) => normalizeAdSet(adSet, base.objective || 'leads'));
    return base;
  }
  if (!item.draft) return null;
  const draft = item.draft;
  const objective = draft.campaignObjective || draft.objective || '';
  const campaign = applyObjective({
    ...createCampaign(),
    id: item.id,
    status: item.status || 'draft',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    buyingType: draft.buyingType || 'auction',
    campaignName: draft.name || draft.campaignName || '',
    specialAdCategories: draft.specialAdCategory && draft.specialAdCategory !== 'none'
      ? [draft.specialAdCategory === 'credit' ? 'financial_products_services' : draft.specialAdCategory]
      : [],
  }, objective || 'leads');
  const adSet = campaign.adSets[0];
  adSet.adSetName = `${campaign.campaignName || 'Ad set'} audience`;
  adSet.locations = draft.locations || '';
  adSet.ageMin = draft.minAge || '18';
  adSet.ageMax = draft.maxAge || '65';
  adSet.gender = draft.gender === 'men' || draft.gender === 'women' ? draft.gender : 'all';
  adSet.budgetType = draft.budgetType || 'daily';
  adSet.budgetAmount = draft.budgetAmount || '';
  adSet.placementMode = draft.placementMode === 'manual' ? 'manual' : 'advantage';
  const ad = adSet.ads[0];
  ad.adName = draft.adName || '';
  ad.pageName = draft.pageName || '';
  ad.instagramAccount = draft.instagramAccount || '';
  ad.primaryTexts = [draft.primaryText || ''];
  ad.headlines = [draft.headline || ''];
  ad.descriptions = [draft.description || ''];
  ad.callToAction = draft.callToAction || 'learn_more';
  ad.destinationUrl = draft.destinationUrl || '';
  ad.leadFormName = draft.leadFormName || '';
  ad.urlParameters = draft.utmParameters || '';
  ad.mediaUrl = draft.mediaUrl || '';
  return campaign;
};
