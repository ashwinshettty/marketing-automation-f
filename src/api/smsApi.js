import authApi from './authAxios';

export const getSmsTemplates = async ({ active = true } = {}) => {
  const response = await authApi.get('/sms/templates', {
    params: { active: active ? 'true' : 'false' },
  });
  return response.data;
};

export const updateSmsTemplate = async (id, payload) => {
  const response = await authApi.patch(`/sms/templates/${id}`, payload);
  return response.data;
};

export const sendSmsToLead = async ({ leadId, leadType, templateId }) => {
  const response = await authApi.post(
    '/sms/send',
    { leadId, leadType, templateId },
    { timeout: 90000 },
  );
  return response.data;
};

export const sendBulkSms = async (payload) => {
  const response = await authApi.post('/sms/send-bulk', payload, { timeout: 300000 });
  return response.data;
};

export const getSmsHistory = async (params = {}) => {
  const response = await authApi.get('/sms/history', { params });
  return response.data;
};

export const getSmsLeadStatuses = async (leadIds = []) => {
  const response = await authApi.get('/sms/lead-statuses', {
    params: { leadIds: leadIds.join(',') },
  });
  return response.data;
};

export const refreshSmsDelivery = async (messageId) => {
  const response = await authApi.post(`/sms/history/${messageId}/refresh-delivery`);
  return response.data;
};

export const refreshSmsDeliveryBatch = async (payload) => {
  const response = await authApi.post('/sms/refresh-delivery', payload);
  return response.data;
};
