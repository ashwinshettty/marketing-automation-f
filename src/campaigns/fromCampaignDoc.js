import { createEmptyMetaCampaign } from './metaCampaignDefaults';

const OBJECTIVE_FROM_META = {
  OUTCOME_AWARENESS: 'awareness',
  OUTCOME_TRAFFIC: 'traffic',
  OUTCOME_ENGAGEMENT: 'engagement',
  OUTCOME_LEADS: 'leads',
  OUTCOME_APP_PROMOTION: 'app_promotion',
  OUTCOME_SALES: 'sales',
};

const CTA_FROM_META = {
  LEARN_MORE: 'learn_more',
  SIGN_UP: 'sign_up',
  APPLY_NOW: 'apply_now',
  CONTACT_US: 'contact_us',
  GET_QUOTE: 'get_quote',
  SUBSCRIBE: 'subscribe',
  BOOK_NOW: 'book_now',
  SHOP_NOW: 'shop_now',
  DOWNLOAD: 'download',
  WATCH_MORE: 'watch_more',
  GET_DIRECTIONS: 'get_directions',
  WHATSAPP_MESSAGE: 'learn_more',
};

const BID_FROM_META = {
  LOWEST_COST_WITHOUT_CAP: 'highest_volume',
  LOWEST_COST_WITH_BID_CAP: 'bid_cap',
  COST_CAP: 'cost_per_result',
};

const kolkataParts = (iso) => {
  if (!iso) return { date: '', time: '09:00' };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { date: '', time: '09:00' };
  const parts = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date).forEach((part) => {
    if (part.type !== 'literal') parts[part.type] = part.value;
  });
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
};

const rupeesFromMinor = (amountMinor) => {
  if (amountMinor == null || amountMinor === '') return '';
  const value = Number(amountMinor) / 100;
  if (!Number.isFinite(value)) return '';
  return String(value);
};

const locationTagsFromGeo = (geo = {}) => {
  const tags = [];
  (geo.cities || []).forEach((city) => {
    const key = String(city?.key || '');
    const isMumbai = key === '1027234' || /mumbai/i.test(city?.name || '');
    tags.push({
      value: isMumbai ? 'mumbai' : key || 'mumbai',
      label: city?.name || 'Mumbai',
      type: 'City',
      radiusKm: city?.radius,
    });
  });
  (geo.countries || []).forEach((code) => {
    if (String(code).toUpperCase() === 'IN') {
      tags.push({ value: 'india', label: 'India', type: 'Country' });
      return;
    }
    tags.push({
      value: String(code || '').toLowerCase(),
      label: String(code || ''),
      type: 'Country',
    });
  });
  return tags;
};

/**
 * Map a GET /campaigns/:id document into MetaAdsCampaign draft state.
 */
export const draftFromCampaignDoc = (doc = {}) => {
  const empty = createEmptyMetaCampaign();
  const campaign = doc.campaign || {};
  const adSet = doc.adSet || {};
  const creative = doc.creative || {};
  const audience = adSet.audience || {};
  const geo = audience.geoLocations || {};
  const pin = Array.isArray(geo.customLocations) ? geo.customLocations[0] : null;
  const adSetBudget = campaign.budgetLevel === 'ADSET';
  const money = adSetBudget ? adSet.budget : campaign.budget;
  const start = kolkataParts(adSet.schedule?.startAt);
  const end = kolkataParts(adSet.schedule?.endAt);
  const whatsapp = creative.destinationType === 'WHATSAPP';
  const locationTags = pin ? [] : locationTagsFromGeo(geo);

  return {
    ...empty,
    campaign: {
      ...empty.campaign,
      name: campaign.name || doc.name || '',
      buyingType: 'auction',
      objective: OBJECTIVE_FROM_META[campaign.objective] || empty.campaign.objective,
      budgetStrategy: adSetBudget ? 'ad_set' : 'campaign',
      budgetType: money?.type === 'LIFETIME' ? 'lifetime' : 'daily',
      dailyBudget: adSetBudget ? '' : rupeesFromMinor(money?.amountMinor),
      bidStrategy: BID_FROM_META[adSet.bidStrategy] || 'highest_volume',
      bidCap:
        adSet.bidStrategy === 'LOWEST_COST_WITH_BID_CAP'
          ? rupeesFromMinor(adSet.bidAmountMinor)
          : '',
      bidGoalValue:
        adSet.bidStrategy === 'COST_CAP' ? rupeesFromMinor(adSet.bidAmountMinor) : '',
    },
    adSet: {
      ...empty.adSet,
      name: adSet.name || '',
      conversionLocation: whatsapp ? 'whatsapp' : 'website',
      budgetType: money?.type === 'LIFETIME' ? 'lifetime' : 'daily',
      dailyBudget: adSetBudget ? rupeesFromMinor(money?.amountMinor) : '',
      startDate: start.date,
      startTime: start.time,
      endDateEnabled: Boolean(adSet.schedule?.endAt),
      endDate: end.date || '',
      endTime: end.time || '21:00',
      ageMin: String(audience.ageMin ?? 18),
      ageMax: String(audience.ageMax ?? 65),
      languages: (audience.languages || []).map((item) => item.code).filter(Boolean),
      locationTags: locationTags.length
        ? locationTags
        : pin
          ? []
          : [{ value: 'india', label: 'India', type: 'Country' }],
      latitude: pin?.latitude != null ? String(pin.latitude) : '',
      longitude: pin?.longitude != null ? String(pin.longitude) : '',
      radiusKm: pin?.radius != null ? String(pin.radius) : '10',
    },
    ad: {
      ...empty.ad,
      name: creative.name || '',
      primaryText: creative.primaryText || '',
      headline: creative.headline || '',
      description: creative.description || '',
      callToAction: CTA_FROM_META[creative.callToAction] || 'learn_more',
      websiteUrl: whatsapp ? '' : creative.destinationValue || '',
      phoneNumber: whatsapp ? creative.destinationValue || '' : '',
      format: 'single',
      mediaType: creative.format === 'IMAGE' ? 'image' : '',
    },
  };
};

export const isRemoteLockedCampaign = (doc = {}) => {
  const status = doc.status || doc.campaign?.status || '';
  return Boolean(
    doc.campaign?.meta?.remoteId
    || ['created', 'paused', 'active', 'failed'].includes(status)
  );
};
