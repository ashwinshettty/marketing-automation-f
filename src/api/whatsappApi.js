import authApi from './authAxios';

const unwrap = (response) => response.data;

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

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

export const sendWhatsAppTemplate = async ({
  phoneNumber,
  leadId,
  templateName,
  languageCode,
  bodyParams,
}) => {
  try {
    const response = await authApi.post('/whatsapp/send-template', {
      phoneNumber,
      leadId,
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
    timestamp: message.time,
    time: formatMessageTime(message.time),
    status: message.status,
  }));
};

export const fetchCallHistory = async ({ phoneNumber }) => {
  const response = await authApi.get('/whatsapp/calls', {
    params: { phoneNumber },
  });
  return unwrap(response);
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
