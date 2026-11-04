import authApi from './authAxios';

const apiRoot = import.meta.env.VITE_MARKETING_AUTOMATION_API_URL;

const googleAdsCampaignApi = (config) => {
  if (!apiRoot) {
    return Promise.reject(new Error('VITE_MARKETING_AUTOMATION_API_URL is not set'));
  }
  return authApi.request({ ...config, baseURL: apiRoot });
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
export const submitGoogleAdsCampaign = async (campaignId) => {
  const response = await googleAdsCampaignApi({
    url: `/google-ads/campaigns/${campaignId}/submit`,
    method: 'POST',
    timeout: 180000,
  });
  return response.data;
};
