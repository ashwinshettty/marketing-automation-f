import authApi from './authAxios';

const apiRoot = import.meta.env.VITE_MARKETING_AUTOMATION_API_URL;

/** Active Meta ads performance for Analytics → Campaigns. */
export const listMetaAdsPerformance = async ({
  campaignId,
  range = 'LAST_7_DAYS',
  startDate,
  endDate,
  sortBy = 'conversions',
  sortDir = 'best',
  budgetBand = 'all',
  limit = 5,
  offset = 0,
} = {}) => {
  if (!apiRoot) {
    return Promise.reject(new Error('VITE_MARKETING_AUTOMATION_API_URL is not set'));
  }
  const response = await authApi.get('/campaigns/ads/performance', {
    baseURL: apiRoot,
    params: {
      range,
      sortBy,
      sortDir,
      budgetBand,
      limit,
      offset,
      ...(campaignId ? { campaignId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
  });
  return response.data;
};
