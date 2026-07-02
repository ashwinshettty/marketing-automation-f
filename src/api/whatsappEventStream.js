import { getSocket } from './socket';
import { normalizePhoneNumber } from '../utils/normalizePhone';

const subscribeOnConnect = (socket, subscribe) => {
  if (socket.connected) {
    subscribe();
    return () => {};
  }

  socket.once('connect', subscribe);
  return () => socket.off('connect', subscribe);
};

export const openWhatsAppConversationStream = (phoneNumber, onEvent) => {
  const socket = getSocket();

  if (!socket || !phoneNumber) {
    return () => {};
  }

  const conversationId = normalizePhoneNumber(phoneNumber);

  const handleEvent = (event) => {
    if (event.conversationId === conversationId) {
      onEvent(event);
    }
  };

  const subscribe = () => {
    socket.emit('whatsapp:subscribe', { phoneNumber });
  };

  const removeConnectListener = subscribeOnConnect(socket, subscribe);

  socket.on('whatsapp:event', handleEvent);

  return () => {
    socket.emit('whatsapp:unsubscribe', { phoneNumber });
    socket.off('whatsapp:event', handleEvent);
    removeConnectListener();
  };
};

export const openWhatsAppGlobalStream = (onEvent) => {
  const socket = getSocket();

  if (!socket) {
    return () => {};
  }

  const subscribe = () => {
    socket.emit('whatsapp:subscribe_global');
  };

  const removeConnectListener = subscribeOnConnect(socket, subscribe);

  socket.on('whatsapp:global', onEvent);

  return () => {
    socket.emit('whatsapp:unsubscribe_global');
    socket.off('whatsapp:global', onEvent);
    removeConnectListener();
  };
};
