import authApi from './authAxios';

const textConfig = {
  responseType: 'text',
  transformResponse: [(data) => data],
  validateStatus: (status) => status < 500,
};

export const fetchAnalyticsSummary = async (params) => {
  const response = await authApi.get('/analytics/summary', { params });
  return response.data;
};

export const fetchAnalyticsLeads = async (params, signal) => {
  const response = await authApi.get('/analytics/leads', { params, signal });
  return response.data;
};

export const fetchAnalyticsLead = async (id, type) => {
  const response = await authApi.get(`/analytics/leads/${id}`, {
    params: type ? { type } : undefined,
  });
  return response.data;
};

export const updateAnalyticsLead = async (id, type, body) => {
  const response = await authApi.post(`/analytics/leads/${id}/actions`, body, {
    params: type ? { type } : undefined,
  });
  return response.data;
};

export const startAnalyticsExport = async (params) => {
  const response = await authApi.get('/analytics/export', {
    params,
    ...textConfig,
  });
  return response;
};

export const fetchAnalyticsExport = async (jobId) => {
  const response = await authApi.get(`/analytics/exports/${jobId}`, textConfig);
  return response;
};
