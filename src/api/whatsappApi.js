import authApi from './authAxios';

const unwrap = (response) => response.data;

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const sendWhatsAppMessage = async ({ phoneNumber, message, leadId }) => {
  const response = await authApi.post('/whatsapp/send', {
    phoneNumber,
    message,
    leadId,
  });
  return unwrap(response);
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
    time: formatMessageTime(message.time),
    status: message.status,
  }));
};
