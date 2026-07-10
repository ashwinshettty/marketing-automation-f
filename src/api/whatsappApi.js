import authApi from './authAxios';
import { getAuthSession } from '../utils/authStorage';
import { formatMessageTime } from '../utils/formatMessageTime';
import { resolveTemplateContentForDisplay } from '../utils/resolveTemplateContentForDisplay';

const unwrap = (response) => response.data;

const getMarketingApiRoot = () => {
  const apiUrl =
    import.meta.env.VITE_MARKETING_AUTOMATION_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

const parseApiError = (error) => {
  const data = error.response?.data;
  const err = new Error(
    data?.message || data?.error || error.message || 'Request failed',
  );
  if (data?.code) err.code = data.code;
  if (data?.window) err.window = data.window;
  return err;
};

export const sendWhatsAppMessage = async ({ phoneNumber, message, leadId }) => {
  try {
    const response = await authApi.post('/whatsapp/send', {
      phoneNumber,
      message,
      leadId,
    });
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const sendWhatsAppMedia = async ({ phoneNumber, caption, leadId, file }) => {
  try {
    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    formData.append('leadId', leadId);
    formData.append('caption', caption || '');
    formData.append('media', file);

    const response = await authApi.post('/whatsapp/send-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const sendWhatsAppTemplate = async ({
  phoneNumber,
  leadId,
  templateId,
  templateName,
  languageCode,
  bodyParams,
}) => {
  try {
    const response = await authApi.post('/whatsapp/send-template', {
      phoneNumber,
      leadId,
      templateId,
      templateName,
      languageCode,
      bodyParams,
    });
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const fetchWhatsAppMessages = async ({ leadId, phoneNumber }) => {
  const response = await authApi.get(`/whatsapp/messages/${leadId}`, {
    params: { phoneNumber },
  });
  const data = unwrap(response);

  return (data.messages || []).map((message) => ({
    id: message.id,
    direction: message.direction,
    text: message.text,
    messageType: message.messageType,
    mediaId: message.mediaId,
    mediaUrl: getWhatsAppMediaUrl(message.mediaId),
    timestamp: message.time,
    time: formatMessageTime(message.time),
    status: message.status,
    templateId: message.templateId,
    templateContent: resolveTemplateContentForDisplay(
      message.templateContent,
      message.templateId,
    ),
  }));
};

export const getWhatsAppMediaUrl = (mediaId) => {
  const token = getAuthSession().token;

  if (!mediaId || !token) {
    return '';
  }

  return `${getMarketingApiRoot()}/api/whatsapp/media/${encodeURIComponent(mediaId)}?token=${encodeURIComponent(token)}`;
};

export const getTemplateHeaderImageUrl = (templateId) => {
  const token = getAuthSession().token;

  if (!templateId || !token) {
    return '';
  }

  return `${getMarketingApiRoot()}/api/whatsapp/templates/${encodeURIComponent(templateId)}/header-image?token=${encodeURIComponent(token)}`;
};

export const fetchCallHistory = async ({ phoneNumber }) => {
  const response = await authApi.get('/whatsapp/calls', {
    params: { phoneNumber },
  });
  return unwrap(response);
};

export const initiateWhatsAppCall = async ({ phoneNumber, leadId, sdp }) => {
  try {
    const response = await authApi.post('/whatsapp/calls/initiate', {
      phoneNumber,
      leadId,
      sdp,
    });
    return unwrap(response);
  } catch (error) {
    throw parseApiError(error);
  }
};

export const acceptCall = async ({ callId, sdp }) => {
  const response = await authApi.post('/whatsapp/calls/accept', { callId, sdp });
  return unwrap(response);
};

export const rejectCall = async ({ callId }) => {
  const response = await authApi.post('/whatsapp/calls/reject', { callId });
  return unwrap(response);
};

export const terminateCall = async ({ callId }) => {
  const response = await authApi.post('/whatsapp/calls/terminate', { callId });
  return unwrap(response);
};
