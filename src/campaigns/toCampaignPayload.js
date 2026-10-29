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

const EMPTY_GEO = () => ({
  countries: [],
  regions: [],
  cities: [],
  zips: [],
  customLocations: [],
});

/** Meta custom_locations radius: 1–80 km */
const pinRadiusKm = (value) => {
  const km = Number(value);
  if (!Number.isFinite(km)) return 10;
  return Math.min(80, Math.max(1, Math.round(km)));
};

/** Meta cities[].radius: 17–80 km when a radius is set */
const cityRadiusKm = (value) => {
  const km = Number(value);
  if (!Number.isFinite(km)) return 25;
  return Math.min(80, Math.max(17, Math.round(km)));
};

const hasMapPin = (pin = {}) => {
  const lat = Number(pin.latitude);
  const lng = Number(pin.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    pin.latitude !== '' &&
    pin.latitude != null &&
    pin.longitude !== '' &&
    pin.longitude != null
  );
};

/** Map pin → Mongo/Meta custom_locations (name + lat/lng + radius km). */
const buildCustomLocationFromPin = (pin = {}) => {
  if (!hasMapPin(pin)) return null;
  const label = String(pin.pinLabel || '').trim();
  const entry = {
    latitude: Number(pin.latitude),
    longitude: Number(pin.longitude),
    radius: pinRadiusKm(pin.radiusKm),
    distanceUnit: 'kilometer',
    name: label || 'Selected location',
  };
  if (label) entry.address = label;
  return entry;
};

/** Haversine distance in km (matches map Distance panel). */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const parseUserCoord = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && value !== '' && value != null ? n : null;
};

/**
 * City/region chips with lat/lng → Meta custom_locations (each with its own radius).
 * Prefer coords over Meta city keys so radius + distanceFromUserKm persist in Mongo.
 */
const customLocationsFromTags = (tags = [], { action = 'include', userLat, userLng } = {}) => {
  const out = [];
  tags.forEach((tag) => {
    if (tag?.type === 'Country') return;
    const latitude = Number(tag?.lat);
    const longitude = Number(tag?.lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const label = String(tag?.label || '').trim();
    const radius =
      tag?.radiusMode === 'city_only' ? 8 : pinRadiusKm(tag?.radiusKm || 25);
    const entry = {
      latitude,
      longitude,
      radius,
      distanceUnit: 'kilometer',
      name: label || 'Selected location',
      action,
    };
    if (label) entry.address = label;
    if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
      entry.distanceFromUserKm = Number(
        haversineKm(userLat, userLng, latitude, longitude).toFixed(2),
      );
    }
    out.push(entry);
  });
  return out;
};

const uniqueByKey = (rows, keyName = 'key') => {
  const seen = new Set();
  return rows.filter((row) => {
    const key = String(row?.[keyName] || '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const geoHasTargets = (geo) =>
  Boolean(
    geo &&
      (geo.countries?.length ||
        geo.regions?.length ||
        geo.cities?.length ||
        geo.zips?.length ||
        geo.customLocations?.length),
  );

const isIsoCountry = (value) => /^[A-Z]{2}$/.test(String(value || '').trim());

/**
 * Classify chips using dynamic Meta keys stored on each tag (from adgeolocation search).
 * No static city/region key maps — keys come from Meta Targeting Search at selection time.
 */
const geoFromTags = (tags, errors, { allowSkip = false, action = 'include', userLat, userLng } = {}) => {
  const list = Array.isArray(tags) ? tags : [];
  const countries = [];
  const regions = [];
  const cities = [];
  const zips = [];
  const coordTags = [];
  let skippedCity = false;

  list.forEach((tag) => {
    const type = tag?.type || '';
    const label = String(tag?.label || tag?.name || '').trim();
    const hasCoords = Number.isFinite(Number(tag?.lat)) && Number.isFinite(Number(tag?.lng));
    const metaKey = String(tag?.metaKey || tag?.key || '').trim();
    const countryCode = String(tag?.countryCode || '').trim().toUpperCase();
    const regionKey = String(tag?.regionKey || '').trim();

    if (type === 'Country') {
      const fromValue = String(tag?.value || '').match(/^country:([a-z]{2})$/i);
      const code = isIsoCountry(metaKey)
        ? metaKey
        : isIsoCountry(countryCode)
          ? countryCode
          : fromValue
            ? fromValue[1].toUpperCase()
            : '';
      if (code) countries.push(code);
      else {
        errors.push(
          issue(
            `Could not resolve a Meta country key for “${label || 'country'}”. Search again and re-add it.`,
            'adSet',
            'adset-audience',
          ),
        );
      }
      return;
    }

    if (type === 'Zip' || type === 'Postal') {
      if (metaKey) {
        zips.push({ key: metaKey });
        if (isIsoCountry(countryCode)) countries.push(countryCode);
      } else {
        skippedCity = true;
      }
      return;
    }

    if (isIsoCountry(countryCode)) countries.push(countryCode);

    if (type === 'Region') {
      if (/^\d+$/.test(regionKey) || /^\d+$/.test(metaKey)) {
        regions.push({
          key: /^\d+$/.test(metaKey) ? metaKey : regionKey,
          name: tag.regionName || tag.metaName || label || 'Region',
        });
      } else {
        skippedCity = true;
      }
      return;
    }

    if (/^\d+$/.test(regionKey)) {
      regions.push({
        key: regionKey,
        name: tag.regionName || 'Region',
      });
    }

    if (/^\d+$/.test(metaKey) && (type === 'City' || type === 'Location' || !type || hasCoords)) {
      const entry = {
        key: metaKey,
        name: tag.metaName || label || 'City',
      };
      if (tag?.radiusMode !== 'city_only') {
        entry.radius = cityRadiusKm(tag?.radiusKm || 25);
        entry.distanceUnit = 'kilometer';
      }
      if (hasCoords) {
        entry.latitude = Number(tag.lat);
        entry.longitude = Number(tag.lng);
        if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
          entry.distanceFromUserKm = Number(
            haversineKm(userLat, userLng, entry.latitude, entry.longitude).toFixed(2),
          );
        }
      }
      cities.push(entry);
    }

    if (hasCoords) {
      coordTags.push(tag);
      return;
    }

    if (!/^\d+$/.test(metaKey) && type !== 'Region') skippedCity = true;
  });

  const customLocations = customLocationsFromTags(coordTags, { action, userLat, userLng });
  const geo = {
    countries: [...new Set(countries)],
    regions: uniqueByKey(regions),
    cities: uniqueByKey(cities),
    zips: uniqueByKey(zips),
    customLocations,
  };

  if (geoHasTargets(geo)) return geo;

  if (skippedCity && !allowSkip) {
    errors.push(
      issue(
        'Choose a searchable city (Meta key required for cities without map coordinates).',
        'adSet',
        'adset-audience',
      ),
    );
  }
  return null;
};

/** Per-chip Include/Exclude (set when the location is added). Dropdown only affects new chips. */
const tagAction = (tag) =>
  (tag?.action || 'include') === 'exclude' ? 'exclude' : 'include';

const sameCoords = (a, b) =>
  Math.abs(Number(a.latitude) - Number(b.latitude)) < 0.0001 &&
  Math.abs(Number(a.longitude) - Number(b.longitude)) < 0.0001;

/**
 * Build included + excluded geo for MongoDB and Meta (Ads Manager Include / Exclude).
 */
const buildGeoAudience = (adSet, errors) => {
  const pin = {
    latitude: adSet.latitude,
    longitude: adSet.longitude,
    radiusKm: adSet.radiusKm,
    pinLabel: adSet.pinLabel,
  };
  const userLat = parseUserCoord(adSet.userLatitude);
  const userLng = parseUserCoord(adSet.userLongitude);
  const tags = Array.isArray(adSet.locationTags) ? adSet.locationTags : [];
  // Meta: each location chip keeps its own include/exclude (not the current dropdown)
  const includeTags = tags.filter((tag) => tagAction(tag) === 'include');
  const excludeTags = tags.filter((tag) => tagAction(tag) === 'exclude');
  const pinCustom = buildCustomLocationFromPin(pin);
  if (pinCustom && Number.isFinite(userLat) && Number.isFinite(userLng)) {
    pinCustom.distanceFromUserKm = Number(
      haversineKm(userLat, userLng, pinCustom.latitude, pinCustom.longitude).toFixed(2),
    );
    pinCustom.action = 'include';
  }

  const excludedFromTags = excludeTags.length
    ? geoFromTags(excludeTags, errors, {
        allowSkip: true,
        action: 'exclude',
        userLat,
        userLng,
      })
    : null;
  const excludedGeoLocations = excludedFromTags || EMPTY_GEO();

  let geoLocations = includeTags.length
    ? geoFromTags(includeTags, errors, {
        allowSkip: Boolean(pinCustom),
        action: 'include',
        userLat,
        userLng,
      })
    : null;

  if (!geoLocations && pinCustom) {
    geoLocations = { ...EMPTY_GEO(), customLocations: [] };
  }

  if (pinCustom) {
    const base = geoLocations || EMPTY_GEO();
    const customs = [...(base.customLocations || [])];
    if (!customs.some((item) => sameCoords(item, pinCustom))) {
      customs.push(pinCustom);
    }
    geoLocations = {
      ...EMPTY_GEO(),
      cities: base.cities || [],
      customLocations: customs,
    };
  }

  if (!geoHasTargets(geoLocations)) {
    if (!includeTags.length && !pinCustom) {
      geoLocations = {
        ...EMPTY_GEO(),
        countries: ['IN'],
      };
    } else if (excludeTags.length && !pinCustom) {
      errors.push(
        issue(
          'Excluded locations need at least one included location (Meta Ads Manager). Switch a city to Include, or add another include location.',
          'adSet',
          'adset-audience',
        ),
      );
      return {
        geoLocations: EMPTY_GEO(),
        excludedGeoLocations,
        userLat,
        userLng,
      };
    } else if (!errors.some((item) => item.anchor === 'adset-audience')) {
      errors.push(
        issue(
          'Choose at least one include location, or drop a pin and set a radius in km.',
          'adSet',
          'adset-audience',
        ),
      );
      return {
        geoLocations: EMPTY_GEO(),
        excludedGeoLocations,
        userLat,
        userLng,
      };
    }
  }

  return {
    geoLocations: geoLocations || EMPTY_GEO(),
    excludedGeoLocations,
    userLat,
    userLng,
  };
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

  const { geoLocations, excludedGeoLocations, userLat, userLng } = buildGeoAudience(adSet, errors);
  const hasExcludedGeo = geoHasTargets(excludedGeoLocations);
  const languages = mapLanguages(adSet.languages);
  const name = String(campaign.name || '').trim();
  if (!name) errors.push(issue('Enter a campaign name.', 'campaign', 'campaign-name'));
  const money = amountMinor == null ? undefined : { type: budgetType, amountMinor, currency: 'INR' };

  const userLocationLabel = String(adSet.userLocationLabel || '').trim();
  const userLocation =
    Number.isFinite(userLat) && Number.isFinite(userLng)
      ? {
          latitude: userLat,
          longitude: userLng,
          ...(userLocationLabel ? { label: userLocationLabel } : {}),
        }
      : undefined;

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
        ...(userLocation ? { userLocation } : {}),
        // Meta: Include → geo_locations, Exclude → excluded_geo_locations
        geoLocations,
        ...(hasExcludedGeo ? { excludedGeoLocations } : {}),
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
