import api from './axios';

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
    const response = await api.post('/whatsapp/templates', formData);
    return unwrap(response);
  }

  const response = await api.post('/whatsapp/templates', templateData);
  return unwrap(response);
};

export const getTemplates = async (params = {}) => {
  const response = await api.get('/whatsapp/templates', { params });
  return unwrap(response);
};

export const getTemplateById = async (id) => {
  const response = await api.get(`/whatsapp/templates/${id}`);
  return unwrap(response);
};

export const updateTemplate = async (id, templateData, uploadedFile = null) => {
  if (uploadedFile) {
    const formData = new FormData();
    appendTemplateFields(formData, templateData);
    formData.append('media', uploadedFile);
    const response = await api.put(`/whatsapp/templates/${id}`, formData);
    return unwrap(response);
  }

  const response = await api.put(`/whatsapp/templates/${id}`, templateData);
  return unwrap(response);
};

export const deleteTemplate = async (id) => {
  const response = await api.delete(`/whatsapp/templates/${id}`);
  return unwrap(response);
};

export const submitTemplate = async (id) => {
  const response = await api.post(`/whatsapp/templates/${id}/submit`);
  return unwrap(response);
};

export const syncTemplates = async () => {
  const response = await api.post('/whatsapp/templates/sync/meta');
  return unwrap(response);
};

export const getTemplateAnalytics = async (id) => {
  const response = await api.get(`/whatsapp/templates/analytics/${id}`);
  return unwrap(response);
};
