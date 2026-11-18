import authApi from './authAxios';

const apiRoot = import.meta.env.VITE_MARKETING_AUTOMATION_API_URL;

const googleAdsCampaignApi = (config) => {
  if (!apiRoot) {
    return Promise.reject(new Error('VITE_MARKETING_AUTOMATION_API_URL is not set'));
  }
  return authApi.request({ ...config, baseURL: apiRoot });
};

/** Account overview for a date window. campaignId limits totals and the chart. */
export const getGoogleAdsOverview = async ({
  range = 'LAST_7_DAYS',
  startDate,
  endDate,
  campaign = 'all',
  campaignId,
} = {}) => {
  const response = await googleAdsCampaignApi({
    url: '/google-ads/campaigns/overview',
    params: {
      range,
      campaign,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(campaignId ? { campaignId } : {}),
    },
  });
  return response.data;
};

/** Live Google Ads campaigns plus local drafts. Custom uses startDate and endDate. */
export const listGoogleAdsCampaigns = async ({
  range = 'LAST_30_DAYS',
  startDate,
  endDate,
  query,
  page = 1,
  status,
} = {}) => {
  const response = await googleAdsCampaignApi({
    url: '/google-ads/campaigns',
    params: {
      range,
      page,
      ...(query ? { q: query } : {}),
      ...(status ? { status } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  });
  return response.data;
};

/**
 * Lean campaign names for the All campaigns dropdown.
 * 15 per page; pass page=2+ for Load more. q= filters by name.
 */
export const listGoogleAdsCampaignPicker = async ({
  query,
  page = 1,
  status,
  range = 'LAST_30_DAYS',
  startDate,
  endDate,
} = {}) => {
  const response = await googleAdsCampaignApi({
    url: '/google-ads/campaigns/picker',
    params: {
      range,
      page,
      ...(query ? { q: query } : {}),
      ...(status ? { status } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  });
  return response.data;
};

/** Create a Mongo draft (status always draft; account stamps from env). */
export const createGoogleAdsCampaignDraft = async (body) => {
  const response = await googleAdsCampaignApi({
    url: '/google-ads/campaigns',
    method: 'POST',
    data: body,
  });
  return response.data;
};

export const getGoogleAdsCampaignById = async (campaignId) => {
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/${campaignId}`,
  });
  return response.data;
};

export const validateGoogleAdsCampaign = async (campaignId) => {
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/${campaignId}/validate`,
    method: 'POST',
  });
  return response.data;
};

/**
 * Submit draft to Google Ads.
 * Create status comes from backend GOOGLE_AD_STATUS (PAUSED → created_paused).
 */
/** Pause or resume a live Google Ads campaign. status is ENABLED or PAUSED. */
export const setGoogleAdsCampaignDelivery = async ({ campaignId, status }) => {
  const response = await googleAdsCampaignApi({
    url: '/google-ads/campaigns/live/status',
    method: 'POST',
    data: { campaignId, status },
  });
  return response.data;
};

/**
 * Ad groups for one live Google Ads campaign.
 * GET /google-ads/campaigns/live/:campaignId/ad-groups
 */
export const listGoogleAdsAdGroups = async ({
  campaignId,
  range = 'LAST_30_DAYS',
  startDate,
  endDate,
} = {}) => {
  if (!campaignId) {
    return Promise.reject(new Error('campaignId is required'));
  }
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/live/${campaignId}/ad-groups`,
    params: {
      range,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  });
  return response.data;
};

/**
 * Assets for one live Google Ads campaign (Assets page).
 * type=all|sitelink|callout|image|call|text
 * status + range match the Campaigns filters.
 */
export const listGoogleAdsCampaignAssets = async ({
  campaignId,
  type = 'all',
  status,
  range = 'LAST_30_DAYS',
  startDate,
  endDate,
} = {}) => {
  if (!campaignId) {
    return Promise.reject(new Error('campaignId is required'));
  }
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/live/${campaignId}/assets`,
    params: {
      type,
      range,
      ...(status ? { status } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  });
  return response.data;
};

const liveCampaignScopedGet = async (path, { campaignId, range = 'LAST_30_DAYS', startDate, endDate } = {}) => {
  if (!campaignId) {
    return Promise.reject(new Error('campaignId is required'));
  }
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/live/${campaignId}/${path}`,
    params: {
      range,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  });
  return response.data;
};

/** Keywords for one campaign (Audiences → Keywords). */
export const listGoogleAdsKeywords = (scope) => liveCampaignScopedGet('keywords', scope);

/** Audience segments + demographics for one campaign. */
export const listGoogleAdsAudiences = (scope) => liveCampaignScopedGet('audiences', scope);

/** Targeted / excluded locations for one campaign. */
export const listGoogleAdsCampaignLocations = (scope) => liveCampaignScopedGet('locations', scope);

/** Content / placements for one campaign (often empty on Search). */
export const listGoogleAdsCampaignContent = (scope) => liveCampaignScopedGet('content', scope);

/** Live campaign settings for the edit drawer. */
export const getGoogleAdsCampaignSettings = async (campaignId) => {
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/live/${campaignId}`,
  });
  return response.data;
};

/** Push campaign setting changes to Google Ads. */
export const editGoogleAdsCampaign = async (campaignId, patch) => {
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/live/${campaignId}`,
    method: 'PATCH',
    data: patch,
  });
  return response.data;
};

export const submitGoogleAdsCampaign = async (campaignId) => {
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/${campaignId}/submit`,
    method: 'POST',
    timeout: 180000,
  });
  return response.data;
};
