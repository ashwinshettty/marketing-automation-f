import { getSocket } from './socket';
import { normalizePhoneNumber } from '../utils/normalizePhone';

/** Track overlapping subscribers (chat + call button) so one cleanup doesn't leave rooms. */
const conversationRefCounts = new Map();
const globalRefCount = { value: 0 };

/** Re-run subscribe on every connect/reconnect (not only the first time). */
const subscribeOnConnect = (socket, subscribe) => {
  if (socket.connected) {
    subscribe();
  }

  socket.on('connect', subscribe);
  return () => socket.off('connect', subscribe);
};

const phoneMatchesConversation = (phoneNumber, conversationId) => {
  if (!conversationId) return true;

  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return false;
  if (conversationId === normalized) return true;

  if (normalized.startsWith('91') && normalized.length === 12) {
    if (conversationId === normalized.slice(2)) return true;
  }
  if (conversationId.startsWith('91') && conversationId.length === 12) {
    if (normalized === conversationId.slice(2)) return true;
  }

  return false;
};

export const openWhatsAppConversationStream = (phoneNumber, onEvent) => {
  const socket = getSocket();

  if (!socket || !phoneNumber) {
    return () => {};
  }

  const conversationKey = normalizePhoneNumber(phoneNumber) || phoneNumber;

  const handleEvent = (event) => {
    if (phoneMatchesConversation(phoneNumber, event.conversationId)) {
      onEvent(event);
    }
  };

  const subscribe = () => {
    socket.emit('whatsapp:subscribe', { phoneNumber });
  };

  conversationRefCounts.set(
    conversationKey,
    (conversationRefCounts.get(conversationKey) || 0) + 1,
  );

  const removeConnectListener = subscribeOnConnect(socket, subscribe);
  socket.on('whatsapp:event', handleEvent);

  return () => {
    socket.off('whatsapp:event', handleEvent);
    removeConnectListener();

    const next = (conversationRefCounts.get(conversationKey) || 1) - 1;
    if (next <= 0) {
      conversationRefCounts.delete(conversationKey);
      socket.emit('whatsapp:unsubscribe', { phoneNumber });
    } else {
      conversationRefCounts.set(conversationKey, next);
    }
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

  globalRefCount.value += 1;

  const removeConnectListener = subscribeOnConnect(socket, subscribe);
  socket.on('whatsapp:global', onEvent);

  return () => {
    socket.off('whatsapp:global', onEvent);
    removeConnectListener();

    globalRefCount.value = Math.max(0, globalRefCount.value - 1);
    if (globalRefCount.value === 0) {
      socket.emit('whatsapp:unsubscribe_global');
    }
  };
};
