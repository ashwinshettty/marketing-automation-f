import { getAuthSession } from '../utils/authStorage';

const getMarketingApiRoot = () => {
  const apiUrl =
    import.meta.env.VITE_MARKETING_AUTOMATION_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const openWhatsAppConversationStream = (phoneNumber, onEvent) => {
  const token = getAuthSession().token;

  if (!token || !phoneNumber) {
    return () => {};
  }

  const url = `${getMarketingApiRoot()}/api/whatsapp/stream?phoneNumber=${encodeURIComponent(phoneNumber)}&token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);

  source.onmessage = (event) => {
    try {
      onEvent(JSON.parse(event.data));
    } catch {
      // Ignore malformed SSE payloads.
    }
  };

  return () => source.close();
};

export const openWhatsAppGlobalStream = (onEvent) => {
  const token = getAuthSession().token;

  if (!token) {
    return () => {};
  }

  const url = `${getMarketingApiRoot()}/api/whatsapp/stream/global?token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);

  source.onmessage = (event) => {
    try {
      onEvent(JSON.parse(event.data));
    } catch {
      // Ignore malformed SSE payloads.
    }
  };

  return () => source.close();
};
