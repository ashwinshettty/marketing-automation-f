import authApi from './authAxios';

const apiRoot = import.meta.env.VITE_MARKETING_AUTOMATION_API_URL;

const goalsApi = (config) => {
  if (!apiRoot) {
    return Promise.reject(new Error('VITE_MARKETING_AUTOMATION_API_URL is not set'));
  }
  return authApi.request({ ...config, baseURL: apiRoot });
};

/** Pull Google Ads goals into Mongo. */
export const syncGoogleAdsGoals = async ({ ifStale = true } = {}) => {
  const response = await goalsApi({
    url: '/google-ads/goals/sync',
    method: 'POST',
    params: { ifStale: ifStale ? 'true' : 'false' },
    timeout: 120000,
  });
  return response.data;
};

/** List synced goals from Mongo. */
export const listGoogleAdsGoals = async ({
  docType,
  includeDeleted = false,
} = {}) => {
  const response = await goalsApi({
    url: '/google-ads/goals',
    params: {
      ...(docType ? { docType } : {}),
      includeDeleted: includeDeleted ? 'true' : 'false',
    },
  });
  return response.data;
};
