import authApi from './authAxios';

const apiRoot = import.meta.env.VITE_MARKETING_AUTOMATION_API_URL;

const campaignApi = (config) => {
  if (!apiRoot) {
    return Promise.reject(new Error('VITE_MARKETING_AUTOMATION_API_URL is not set'));
  }
  return authApi.request({ ...config, baseURL: apiRoot });
};

export const listCampaigns = async ({ adAccountId, range, page, limit } = {}) => {
  const response = await campaignApi({
    url: '/campaigns',
    params: {
      adAccountId,
      range: range || undefined,
      page,
      limit,
    },
  });
  return response.data;
};

export const createCampaignDraft = async (body) => {
  const response = await campaignApi({
    url: '/campaigns',
    method: 'POST',
    data: body,
  });
  return response.data;
};

export const getCampaignById = async (campaignId) => {
  const response = await campaignApi({
    url: `/campaigns/${campaignId}`,
  });
  return response.data;
};

export const updateCampaign = async (campaignId, body) => {
  const response = await campaignApi({
    url: `/campaigns/${campaignId}`,
    method: 'PATCH',
    data: body,
    timeout: 120000,
  });
  return response.data;
};

export const submitCampaign = async (campaignId) => {
  const response = await campaignApi({
    url: `/campaigns/${campaignId}/submit`,
    method: 'POST',
    timeout: 120000,
  });
  return response.data;
};

export const updateCampaignName = async (campaignId, name) => {
  const response = await campaignApi({
    url: `/campaigns/${campaignId}/name`,
    method: 'PATCH',
    data: { name },
  });
  return response.data;
};

export const deleteCampaign = async (campaignId) => {
  const response = await campaignApi({
    url: `/campaigns/${campaignId}`,
    method: 'DELETE',
    timeout: 120000,
  });
  return response.data;
};

export const setCampaignStatus = async (campaignId, status) => {
  const response = await campaignApi({
    url: `/campaigns/${campaignId}/status`,
    method: 'POST',
    data: { status },
    timeout: 60000,
  });
  return response.data;
};

export const uploadCampaignImage = async (campaignId, file) => {
  const created = await campaignApi({
    url: `/campaigns/${campaignId}/media/upload-url`,
    method: 'POST',
    data: {
      mimeType: file.type,
      originalName: file.name,
      byteLength: file.size,
    },
  });
  const { uploadUrl, storageKey, headers } = created.data;
  const uploaded = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': headers?.['Content-Type'] || file.type },
    body: file,
  });
  if (!uploaded.ok) {
    throw new Error('The image could not be uploaded. The ad will be submitted without it.');
  }
  await campaignApi({
    url: `/campaigns/${campaignId}/media/confirm`,
    method: 'POST',
    data: {
      storageKey,
      originalName: file.name,
    },
  });
};
