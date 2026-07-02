import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchWhatsAppMessages,
  getWhatsAppMediaUrl,
  sendWhatsAppMedia,
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
} from '../api/whatsappApi';
import { openWhatsAppConversationStream } from '../api/whatsappEventStream';
import { formatMessageTime } from '../utils/formatMessageTime';
import { normalizePhoneNumber } from '../utils/normalizePhone';

export const mapApiMessage = (message) => {
  const timestamp = message.timestamp || message.time;

  return {
    id: message.id,
    direction: message.direction,
    text: message.text,
    messageType: message.messageType,
    mediaId: message.mediaId,
    mediaUrl: getWhatsAppMediaUrl(message.mediaId),
    status: message.status,
    timestamp,
    time: formatMessageTime(timestamp),
  };
};

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
  const [selectedMedia, setSelectedMedia] = useState(null);
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
  }, [loadMessages]);

  useEffect(() => {
    if (!lead?.contactNo) return undefined;

    const closeStream = openWhatsAppConversationStream(lead.contactNo, (event) => {
      if (event.type === 'new_message' && event.message) {
        const incoming = mapApiMessage(event.message);

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
    if ((!text && !selectedMedia) || !conversationId) return;

    setError('');
    setIsSending(true);

    try {
      const result = selectedMedia
        ? await sendWhatsAppMedia({
            phoneNumber: lead.contactNo,
            caption: text,
            leadId: lead.id,
            file: selectedMedia,
          })
        : await sendWhatsAppMessage({
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
      setSelectedMedia(null);
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = async ({ templateId, templateName, languageCode, bodyParams }) => {
    if (!conversationId) return;

    setError('');
    setIsSending(true);

    try {
      const result = await sendWhatsAppTemplate({
        phoneNumber: lead.contactNo,
        leadId: lead.id,
        templateId,
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
    selectedMedia,
    setSelectedMedia,
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
