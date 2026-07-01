import authApi from './authAxios';

const unwrap = (response) => response.data;

const appendTemplateFields = (formData, templateData) => {
  Object.keys(templateData).forEach((key) => {
    if (templateData[key] !== undefined && templateData[key] !== null) {
      if (typeof templateData[key] === 'object' && !(templateData[key] instanceof File)) {
        formData.append(key, JSON.stringify(templateData[key]));
      } else {
        formData.append(key, templateData[key]);
      }
    }
  });
};

export const createTemplate = async (templateData, uploadedFile = null) => {
  if (uploadedFile) {
    const formData = new FormData();
    appendTemplateFields(formData, templateData);
    formData.append('media', uploadedFile);
    const response = await authApi.post('/whatsapp/templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(response);
  }

  const response = await authApi.post('/whatsapp/templates', templateData);
  return unwrap(response);
};

export const getTemplates = async (params = {}) => {
  const response = await authApi.get('/whatsapp/templates', { params });
  return unwrap(response);
};

export const getTemplateById = async (id) => {
  const response = await authApi.get(`/whatsapp/templates/${id}`);
  return unwrap(response);
};

export const updateTemplate = async (id, templateData, uploadedFile = null) => {
  if (uploadedFile) {
    const formData = new FormData();
    appendTemplateFields(formData, templateData);
    formData.append('media', uploadedFile);
    const response = await authApi.put(`/whatsapp/templates/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(response);
  }

  const response = await authApi.put(`/whatsapp/templates/${id}`, templateData);
  return unwrap(response);
};

export const deleteTemplate = async (id) => {
  const response = await authApi.delete(`/whatsapp/templates/${id}`);
  return unwrap(response);
};

export const submitTemplate = async (id) => {
  const response = await authApi.post(`/whatsapp/templates/${id}/submit`);
  return unwrap(response);
};

export const syncTemplates = async () => {
  const response = await authApi.post('/whatsapp/templates/sync/meta');
  return unwrap(response);
};

export const getTemplateAnalytics = async (id) => {
  const response = await authApi.get(`/whatsapp/templates/analytics/${id}`);
  return unwrap(response);
};
