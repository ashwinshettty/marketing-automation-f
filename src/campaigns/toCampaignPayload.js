import { META_AD_ACCOUNT_ID, META_PAGE_ID } from './campaignAccount';

const OBJECTIVES = {
  awareness: 'OUTCOME_AWARENESS',
  traffic: 'OUTCOME_TRAFFIC',
  engagement: 'OUTCOME_ENGAGEMENT',
  leads: 'OUTCOME_LEADS',
  app_promotion: 'OUTCOME_APP_PROMOTION',
  sales: 'OUTCOME_SALES',
};

const WEBSITE_GOALS = {
  OUTCOME_AWARENESS: 'REACH',
  OUTCOME_TRAFFIC: 'LINK_CLICKS',
  OUTCOME_ENGAGEMENT: 'POST_ENGAGEMENT',
};

const WHATSAPP_OBJECTIVES = new Set([
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_TRAFFIC',
  'OUTCOME_LEADS',
  'OUTCOME_SALES',
]);

const WEBSITE_LOCATIONS = new Set(['website', 'website_and_forms', 'website_and_calls']);

const WEBSITE_CALLS_TO_ACTION = {
  learn_more: 'LEARN_MORE',
  sign_up: 'SIGN_UP',
  apply_now: 'APPLY_NOW',
  contact_us: 'CONTACT_US',
  get_quote: 'GET_QUOTE',
  subscribe: 'SUBSCRIBE',
  book_now: 'BOOK_NOW',
  shop_now: 'SHOP_NOW',
  download: 'DOWNLOAD',
  watch_more: 'WATCH_MORE',
  get_directions: 'GET_DIRECTIONS',
};

const COUNTRY_CODES = {
  india: 'IN',
  in: 'IN',
};

/** Meta city key confirmed for this ad account's Mumbai targeting. */
const CITY_KEYS = {
  mumbai: '1027234',
};

const LOCALE_IDS = {
  en: 6,
};

const moneyFromRupees = (value) => {
  const rupees = Number(value);
  if (!Number.isFinite(rupees) || rupees <= 0) return null;
  return Math.round(rupees * 100);
};

const clampAge = (value, fallback) => {
  const age = Number.parseInt(value, 10);
  if (!Number.isInteger(age)) return fallback;
  return Math.min(65, Math.max(18, age));
};

const toKolkataIso = (date, time) => {
  if (!date) return '';
  const clock = /^\d{2}:\d{2}$/.test(time || '') ? time : '09:00';
  const parsed = new Date(`${date}T${clock}:00+05:30`);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
};

const buildGeo = (tags, errors) => {
  const list = Array.isArray(tags) && tags.length ? tags : [{ value: 'india', label: 'India', type: 'Country' }];
  const countries = [];
  const cities = [];
  let skippedCity = false;

  list.forEach((tag) => {
    const value = String(tag?.value || '').trim().toLowerCase();
    const country = COUNTRY_CODES[value];
    if (tag?.type === 'Country' || country) {
      if (country) countries.push(country);
      else errors.push(issue(`Use India for country targeting. “${tag?.label || tag?.value}” is not available yet.`, 'adSet', 'adset-audience'));
      return;
    }
    const cityKey = CITY_KEYS[value];
    if (cityKey) {
      cities.push({
        key: cityKey,
        name: tag.label || 'Mumbai',
        radius: 25,
        distanceUnit: 'kilometer',
      });
      return;
    }
    skippedCity = true;
  });

  if (countries.length && cities.length) {
    return { countries: [], regions: [], cities, zips: [], customLocations: [] };
  }
  if (cities.length) {
    return { countries: [], regions: [], cities, zips: [], customLocations: [] };
  }
  if (countries.length) {
    return { countries: [...new Set(countries)], regions: [], cities: [], zips: [], customLocations: [] };
  }
  if (skippedCity) {
    errors.push(issue('Choose India or Mumbai. Other cities need a Meta location key before they can be published.', 'adSet', 'adset-audience'));
  } else {
    errors.push(issue('Choose at least one location.', 'adSet', 'adset-audience'));
  }
  return { countries: [], regions: [], cities: [], zips: [], customLocations: [] };
};

const mapLanguages = (values) => (Array.isArray(values) ? values : [])
  .filter((code) => LOCALE_IDS[code])
  .map((code) => ({ code, name: code === 'en' ? 'English' : code, metaLocaleId: LOCALE_IDS[code] }));

const issue = (message, step, anchor) => ({ message, step, anchor });

/**
 * Turn the Ads Manager draft into the one-campaign body the API accepts.
 * Returns errors when the current screen cannot be submitted.
 */
export const buildCampaignRequest = (draft) => {
  const errors = [];
  const campaign = draft?.campaign || {};
  const adSet = draft?.adSet || {};
  const ad = draft?.ad || {};

  if (campaign.buyingType === 'reservation') {
    errors.push(issue('Reservation campaigns cannot be created from this screen. Choose Auction.', 'campaign', 'campaign-details'));
  }
  if (ad.format && ad.format !== 'single') {
    errors.push(issue('Only a single image ad can be published. Video and carousel are not available yet.', 'ad', 'ad-setup'));
  }
  if (ad.mediaType === 'video') {
    errors.push(issue('Video cannot be published yet. Remove the video or leave the image empty.', 'ad', 'ad-setup'));
  }

  const objective = OBJECTIVES[campaign.objective] || '';
  if (!objective) errors.push(issue('Choose a campaign objective.', 'campaign', 'campaign-details'));

  const location = adSet.conversionLocation || 'website_and_forms';
  const whatsapp = location === 'whatsapp';
  if (!whatsapp && !WEBSITE_LOCATIONS.has(location)) {
    errors.push(issue('This conversion location cannot be published yet. Use Website or WhatsApp.', 'adSet', 'adset-conversion'));
  }

  const destinationType = whatsapp ? 'WHATSAPP' : 'WEBSITE';
  if (destinationType === 'WEBSITE' && objective && !WEBSITE_GOALS[objective]) {
    errors.push(issue('A website ad can use Awareness, Traffic, or Engagement. For Leads, set the conversion location to WhatsApp.', 'adSet', 'adset-conversion'));
  }
  if (destinationType === 'WHATSAPP' && objective && !WHATSAPP_OBJECTIVES.has(objective)) {
    errors.push(issue('A WhatsApp ad can use Traffic, Engagement, Leads, or Sales.', 'campaign', 'campaign-details'));
  }

  const primaryText = String(ad.primaryText || '').trim();
  const headline = String(ad.headline || '').trim();
  if (!primaryText) errors.push(issue('Enter primary text on the ad.', 'ad', 'ad-creative'));
  if (!headline) errors.push(issue('Enter a headline on the ad.', 'ad', 'ad-creative'));

  let destinationValue = '';
  let callToAction = WEBSITE_CALLS_TO_ACTION[ad.callToAction] || 'LEARN_MORE';
  if (whatsapp) {
    destinationValue = String(ad.phoneNumber || '').replace(/\D/g, '');
    callToAction = 'WHATSAPP_MESSAGE';
    if (destinationValue.length < 10 || destinationValue.length > 15) {
      errors.push(issue('Enter the customer WhatsApp number on the ad.', 'ad', 'ad-destination'));
    }
  } else {
    destinationValue = String(ad.websiteUrl || '').trim();
    try {
      const url = new URL(destinationValue);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push(issue('The website URL must start with http:// or https://.', 'ad', 'ad-destination'));
      }
    } catch {
      errors.push(issue('Enter a website URL on the ad.', 'ad', 'ad-destination'));
    }
  }

  const adSetBudget = campaign.budgetStrategy === 'ad_set';
  const budgetSource = adSetBudget ? adSet : campaign;
  const budgetType = budgetSource.budgetType === 'lifetime' ? 'LIFETIME' : 'DAILY';
  const amountMinor = moneyFromRupees(budgetSource.dailyBudget);
  if (amountMinor == null) {
    errors.push(issue(
      'Enter a budget greater than 0.',
      adSetBudget ? 'adSet' : 'campaign',
      adSetBudget ? 'adset-schedule' : 'campaign-budget',
    ));
  }

  const startAt = toKolkataIso(adSet.startDate, adSet.startTime)
    || new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const endAt = adSet.endDateEnabled || budgetType === 'LIFETIME'
    ? toKolkataIso(adSet.endDate, adSet.endTime)
    : '';
  if ((adSet.endDateEnabled || budgetType === 'LIFETIME') && !endAt) {
    errors.push(issue('Enter an end date. A lifetime budget needs one.', 'adSet', 'adset-schedule'));
  }
  if (endAt && new Date(endAt) <= new Date(startAt)) {
    errors.push(issue('The end date must be after the start date.', 'adSet', 'adset-schedule'));
  }

  let ageMin = clampAge(adSet.ageMin, 18);
  let ageMax = clampAge(adSet.ageMax, 65);
  if (ageMin > ageMax) {
    const younger = ageMax;
    ageMax = ageMin;
    ageMin = younger;
  }

  const bidSource = campaign.bidStrategy || 'highest_volume';
  let bidStrategy = 'LOWEST_COST_WITHOUT_CAP';
  let bidAmountMinor;
  if (bidSource === 'bid_cap') {
    bidStrategy = 'LOWEST_COST_WITH_BID_CAP';
    bidAmountMinor = moneyFromRupees(campaign.bidCap);
    if (bidAmountMinor == null) errors.push(issue('Enter a bid cap amount.', 'campaign', 'campaign-budget'));
  } else if (bidSource === 'cost_per_result') {
    bidStrategy = 'COST_CAP';
    bidAmountMinor = moneyFromRupees(campaign.bidGoalValue);
    if (bidAmountMinor == null) errors.push(issue('Enter a cost per result amount.', 'campaign', 'campaign-budget'));
  } else if (bidSource === 'roas_goal') {
    errors.push(issue('ROAS goal cannot be published yet. Choose highest volume.', 'campaign', 'campaign-budget'));
  }

  const geoLocations = buildGeo(adSet.locationTags, errors);
  const languages = mapLanguages(adSet.languages);
  const name = String(campaign.name || '').trim();
  if (!name) errors.push(issue('Enter a campaign name.', 'campaign', 'campaign-name'));
  const money = amountMinor == null ? undefined : { type: budgetType, amountMinor, currency: 'INR' };

  const body = {
    name: name || 'Campaign',
    campaign: {
      adAccountId: META_AD_ACCOUNT_ID,
      buyingType: 'AUCTION',
      objective: objective || 'OUTCOME_TRAFFIC',
      name: name || 'Campaign',
      specialAdCategories: ['NONE'],
      budgetLevel: adSetBudget ? 'ADSET' : 'CAMPAIGN',
      ...(adSetBudget || !money ? {} : { budget: money }),
    },
    adSet: {
      name: String(adSet.name || `${name || 'Campaign'} ad set`).trim(),
      ...(adSetBudget && money ? { budget: money } : {}),
      schedule: {
        startAt,
        ...(endAt ? { endAt } : {}),
      },
      audience: {
        ageMin,
        ageMax,
        ...(languages.length ? { languages } : {}),
        geoLocations,
      },
      optimizationGoal: whatsapp ? 'CONVERSATIONS' : (WEBSITE_GOALS[objective] || 'LINK_CLICKS'),
      billingEvent: 'IMPRESSIONS',
      bidStrategy,
      ...(bidAmountMinor ? { bidAmountMinor } : {}),
    },
    creative: {
      name: String(ad.name || `${name || 'Campaign'} ad`).trim(),
      format: 'IMAGE',
      primaryText,
      headline,
      ...(String(ad.description || '').trim() ? { description: String(ad.description).trim() } : {}),
      callToAction,
      destinationType,
      destinationValue,
      pageId: META_PAGE_ID,
      assets: [],
    },
  };

  return { body, errors };
};

export const imageFileFromAd = (ad) => {
  const url = String(ad?.mediaUrl || '');
  const match = url.match(/^data:(image\/(?:jpeg|jpg|png));base64,(.+)$/i);
  if (!match) return null;
  const mime = /png/i.test(match[1]) ? 'image/png' : 'image/jpeg';
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const extension = mime === 'image/png' ? 'png' : 'jpg';
  return new File([bytes], ad.mediaName || `ad.${extension}`, { type: mime });
};
