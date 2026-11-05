import authApi from './authAxios';

const apiRoot = import.meta.env.VITE_MARKETING_AUTOMATION_API_URL;

const geoApi = (config) => {
  if (!apiRoot) {
    return Promise.reject(new Error('VITE_MARKETING_AUTOMATION_API_URL is not set'));
  }
  return authApi.request({ ...config, baseURL: apiRoot });
};

/** Google Ads geo target suggestions (city, region, postal code, country). */
export const suggestGeoTargets = async ({ names, countryCode, locale } = {}) => {
  const response = await geoApi({
    url: '/google-ads/geo-targets/suggest',
    method: 'POST',
    data: {
      names,
      ...(countryCode ? { countryCode } : {}),
      ...(locale ? { locale } : {}),
    },
  });
  return response.data;
};

/** Business and address matches for a radius search. */
export const suggestPlaces = async (query) => {
  const response = await geoApi({
    url: '/google-ads/geo-targets/places',
    method: 'POST',
    data: { query },
  });
  return response.data;
};

/** Resolve a radius center from a selected place or a typed name. */
export const geocodePlace = async ({ query, placeId } = {}) => {
  const response = await geoApi({
    url: '/google-ads/geo-targets/geocode',
    method: 'POST',
    data: { query, ...(placeId ? { placeId } : {}) },
  });
  return response.data;
};
