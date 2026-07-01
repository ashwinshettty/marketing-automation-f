import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchWhatsAppMessages,
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
} from '../api/whatsappApi';
import { openWhatsAppConversationStream } from '../api/whatsappEventStream';
import { normalizePhoneNumber } from '../utils/normalizePhone';

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const mapApiMessage = (message) => ({
  id: message.id,
  direction: message.direction,
  text: message.text,
  messageType: message.messageType,
  status: message.status,
  timestamp: message.timestamp || message.time,
  time: message.time || formatMessageTime(message.timestamp || message.time),
});

const sortMessagesNewestFirst = (messages) =>
  [...messages].sort(
    (left, right) =>
      new Date(right.timestamp || right.time).getTime() -
      new Date(left.timestamp || left.time).getTime(),
  );

const upsertMessage = (messages, incoming) => {
  const withoutDuplicate = messages.filter((message) => message.id !== incoming.id);
  return sortMessagesNewestFirst([incoming, ...withoutDuplicate]);
};

export const useWhatsAppChat = ({ lead }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageIdsRef = useRef(new Set());

  const conversationId = lead?.contactNo
    ? normalizePhoneNumber(lead.contactNo)
    : '';

  const loadMessages = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!lead || !conversationId) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) setIsLoading(true);
        setError('');

        const history = await fetchWhatsAppMessages({
          leadId: lead.id,
          phoneNumber: lead.contactNo,
        });

        const sorted = sortMessagesNewestFirst(history);
        messageIdsRef.current = new Set(sorted.map((message) => message.id));
        setMessages(sorted);
      } catch (err) {
        setError(err.message || 'Failed to load chat');
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [lead, conversationId],
  );

  useEffect(() => {
    loadMessages();
    if (!conversationId) return undefined;

    const pollInterval = setInterval(() => {
      loadMessages({ showLoading: false });
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [loadMessages, conversationId]);

  useEffect(() => {
    if (!lead?.contactNo) return undefined;

    const closeStream = openWhatsAppConversationStream(lead.contactNo, (event) => {
      if (event.type === 'new_message' && event.message) {
        const incoming = mapApiMessage(event.message);

        if (messageIdsRef.current.has(incoming.id)) return;

        messageIdsRef.current.add(incoming.id);
        setMessages((current) => upsertMessage(current, incoming));
        return;
      }

      if (event.type === 'message_status_update') {
        setMessages((current) =>
          current.map((message) =>
            message.id === event.dbMessageId || message.id === event.messageId
              ? { ...message, status: event.status }
              : message,
          ),
        );
      }
    });

    return closeStream;
  }, [lead?.contactNo]);

  const handleSend = async (event) => {
    event?.preventDefault?.();

    const text = draft.trim();
    if (!text || !conversationId) return;

    setError('');
    setIsSending(true);

    try {
      const result = await sendWhatsAppMessage({
        phoneNumber: lead.contactNo,
        message: text,
        leadId: lead.id,
      });

      if (result.data) {
        const saved = mapApiMessage(result.data);
        messageIdsRef.current.add(saved.id);
        setMessages((current) => upsertMessage(current, saved));
      }

      setDraft('');
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = async ({ templateName, languageCode, bodyParams }) => {
    if (!conversationId) return;

    setError('');
    setIsSending(true);

    try {
      const result = await sendWhatsAppTemplate({
        phoneNumber: lead.contactNo,
        leadId: lead.id,
        templateName,
        languageCode,
        bodyParams,
      });

      if (result.data) {
        const saved = mapApiMessage(result.data);
        messageIdsRef.current.add(saved.id);
        setMessages((current) => upsertMessage(current, saved));
      }
    } catch (err) {
      setError(err.message || 'Failed to send template');
    } finally {
      setIsSending(false);
    }
  };

  return {
    draft,
    setDraft,
    messages,
    isLoading,
    isSending,
    error,
    setError,
    conversationId,
    handleSend,
    handleSendTemplate,
    reloadMessages: loadMessages,
  };
};
