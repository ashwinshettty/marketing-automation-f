import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchCallHistory,
  fetchWhatsAppMessages,
  getWhatsAppMediaUrl,
  sendWhatsAppMedia,
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
} from '../api/whatsappApi';
import { openWhatsAppConversationStream } from '../api/whatsappEventStream';
import { formatMessageTime } from '../utils/formatMessageTime';
import { normalizePhoneNumber } from '../utils/normalizePhone';
import { resolveTemplateContentForDisplay } from '../utils/resolveTemplateContentForDisplay';

export const mapApiMessage = (message) => {
  const timestamp = message.timestamp || message.time;

  return {
    id: message.id,
    kind: 'message',
    direction: message.direction,
    text: message.text,
    messageType: message.messageType,
    mediaId: message.mediaId,
    mediaUrl: getWhatsAppMediaUrl(message.mediaId),
    status: message.status,
    senderName: message.senderName,
    isBot: Boolean(message.senderName) && message.direction === 'outbound',
    templateId: message.templateId,
    templateContent: resolveTemplateContentForDisplay(
      message.templateContent,
      message.templateId,
    ),
    timestamp,
    time: formatMessageTime(timestamp),
  };
};

export const mapApiCall = (call) => {
  const timestamp = call.startTime || call.endTime || call.createdAt;
  const isOutbound = call.direction === 'BUSINESS_INITIATED';

  return {
    id: `call-${call.id || call.dbId}`,
    kind: 'call',
    callId: call.id,
    direction: isOutbound ? 'outbound' : 'inbound',
    callDirection: call.direction,
    status: call.status,
    event: call.event,
    handledBy: call.handledBy || 'human',
    duration: call.duration,
    summary: call.summary || '',
    subject: call.subject || '',
    transcript: Array.isArray(call.transcript) ? call.transcript : [],
    agentOutcome: call.agentOutcome || '',
    agentOutcomeAt: call.agentOutcomeAt,
    summaryGeneratedAt: call.summaryGeneratedAt,
    timestamp,
    time: formatMessageTime(timestamp),
  };
};

const sortTimelineNewestFirst = (items) =>
  [...items].sort(
    (left, right) =>
      new Date(right.timestamp || right.time).getTime() -
      new Date(left.timestamp || left.time).getTime(),
  );

const upsertTimelineItem = (items, incoming) => {
  const existing = items.find((item) => item.id === incoming.id);
  const merged = existing ? { ...existing, ...incoming } : incoming;
  const withoutDuplicate = items.filter((item) => item.id !== incoming.id);
  return sortTimelineNewestFirst([merged, ...withoutDuplicate]);
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

        const [history, callResult] = await Promise.all([
          fetchWhatsAppMessages({
            leadId: lead.id,
            phoneNumber: lead.contactNo,
          }),
          fetchCallHistory({ phoneNumber: lead.contactNo }).catch(() => ({
            calls: [],
          })),
        ]);

        const callItems = (callResult?.calls || []).map(mapApiCall);
        const sorted = sortTimelineNewestFirst([...history, ...callItems]);
        messageIdsRef.current = new Set(
          sorted.filter((item) => item.kind !== 'call').map((item) => item.id),
        );
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
        setMessages((current) => upsertTimelineItem(current, incoming));
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
        return;
      }

      if (event.call?.id) {
        const callItem = mapApiCall({
          id: event.call.id,
          dbId: event.call.dbId,
          direction: event.call.direction,
          status: event.call.status,
          event: event.call.event,
          handledBy: event.call.handledBy,
          duration: event.call.duration,
          summary: event.call.summary,
          subject: event.call.subject,
          transcript: event.call.transcript,
          agentOutcome: event.call.agentOutcome,
          agentOutcomeAt: event.call.agentOutcomeAt,
          summaryGeneratedAt: event.call.summaryGeneratedAt,
          startTime: event.call.startTime,
          endTime: event.call.endTime,
          createdAt: event.call.createdAt || new Date().toISOString(),
        });

        if (
          event.type === 'call_ended' ||
          event.type === 'call_status_update' ||
          event.type === 'incoming_call' ||
          event.type === 'call_initiated' ||
          event.type === 'outbound_call_connect' ||
          event.type === 'call_summary_ready'
        ) {
          setMessages((current) => upsertTimelineItem(current, callItem));
        }
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
        setMessages((current) => upsertTimelineItem(current, saved));
      }

      setDraft('');
      setSelectedMedia(null);
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTemplate = async ({
    templateId,
    templateName,
    languageCode,
    bodyParams,
  }) => {
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
        setMessages((current) => upsertTimelineItem(current, saved));
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
