import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { fetchWhatsAppMessages, sendWhatsAppMessage } from '../../api/whatsappApi';
import { getSocket } from '../../api/socket';
import { useLead } from '../../context/LeadContext';
import { normalizePhoneNumber } from '../../utils/normalizePhone';

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const LeadWhatsAppChat = () => {
  const { leadId } = useParams();
  const { leads, selectedLead, loading } = useLead();
  const lead =
    leads.find((item) => item.id === leadId) ||
    (selectedLead?.id === leadId ? selectedLead : null);

  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageIdsRef = useRef(new Set());

  const conversationId = useMemo(
    () => normalizePhoneNumber(lead?.contactNo),
    [lead?.contactNo],
  );

  useEffect(() => {
    if (!lead || !conversationId) {
      setIsLoadingMessages(false);
      return undefined;
    }

    let isMounted = true;

    const loadMessages = async ({ showLoading = true } = {}) => {
      try {
        if (showLoading) setIsLoadingMessages(true);
        setError('');

        const history = await fetchWhatsAppMessages({
          leadId: lead.id,
          phoneNumber: lead.contactNo,
        });

        if (isMounted) {
          const nextIds = new Set();
          const mapped = history.map((message) => {
            nextIds.add(message.id);
            return message;
          });
          messageIdsRef.current = nextIds;
          setMessages(mapped);

          console.log('[ai-bot][chat] Loaded messages', {
            conversationId,
            leadContact: lead.contactNo,
            total: mapped.length,
            inbound: mapped.filter((m) => m.direction === 'inbound').length,
            outbound: mapped.filter((m) => m.direction === 'outbound').length,
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('[ai-bot][chat] Load failed:', err.message);
          setError(err.message || 'Failed to load chat history');
        }
      } finally {
        if (isMounted && showLoading) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadMessages();

    const pollInterval = setInterval(() => {
      loadMessages({ showLoading: false });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [lead, conversationId]);

  useEffect(() => {
    if (!conversationId) return undefined;

    const socket = getSocket();

    const joinRoom = () => {
      socket.emit('join_whatsapp', conversationId);
      console.log('[ai-bot][chat] join_whatsapp emitted', {
        conversationId,
        connected: socket.connected,
        socketId: socket.id,
      });
    };

    const handleConnect = () => {
      console.log('[ai-bot][chat] Socket connected', { conversationId });
      joinRoom();
    };

    const handleDisconnect = (reason) => {
      console.warn('[ai-bot][chat] Socket disconnected', { reason });
    };

    const handleNewMessage = (data) => {
      console.log('[ai-bot][chat] Socket event new_whatsapp_message', {
        expectedConversationId: conversationId,
        receivedConversationId: data.conversationId,
        message: data.message,
      });

      if (data.conversationId !== conversationId) {
        console.warn('[ai-bot][chat] Ignored — conversationId mismatch');
        return;
      }

      if (!data.message) return;

      const incoming = {
        id: data.message.id,
        direction: data.message.direction,
        text: data.message.text,
        time: formatMessageTime(data.message.time),
      };

      if (messageIdsRef.current.has(incoming.id)) {
        console.log('[ai-bot][chat] Ignored duplicate message', incoming.id);
        return;
      }

      messageIdsRef.current.add(incoming.id);
      setMessages((current) => [...current, incoming]);
      console.log('[ai-bot][chat] Inbound message added to UI', incoming);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_whatsapp_message', handleNewMessage);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.emit('leave_whatsapp', conversationId);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_whatsapp_message', handleNewMessage);
    };
  }, [conversationId]);

  if (loading || isLoadingMessages) {
    return (
      <div className="px-8 py-8 text-sm text-brand-muted">Loading chat...</div>
    );
  }

  if (!lead) {
    return <Navigate to="/leads" replace />;
  }

  const handleSend = async (event) => {
    event.preventDefault();

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
        const saved = {
          id: result.data.id,
          direction: result.data.direction,
          text: result.data.text,
          time: formatMessageTime(result.data.time),
        };

        if (!messageIdsRef.current.has(saved.id)) {
          messageIdsRef.current.add(saved.id);
          setMessages((current) => [...current, saved]);
        }
      }

      setDraft('');
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-yellow/30 bg-brand-cream px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.519 5.852L0 24l6.335-1.662C8.008 23.447 9.964 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.93 0-3.753-.52-5.318-1.428l-.381-.227-3.755.985 1.002-3.648-.249-.374A9.817 9.817 0 0 1 2.182 12c0-5.422 4.396-9.818 9.818-9.818 5.422 0 9.818 4.396 9.818 9.818 0 5.422-4.396 9.818-9.818 9.818z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">{lead.name}</h2>
              <p className="text-sm text-brand-muted">{lead.contactNo}</p>
            </div>
          </div>
          <span className="rounded-full bg-[#25D366]/10 px-3 py-1 text-xs font-medium text-[#128C4A]">
            WhatsApp chat
          </span>
        </div>

        <div className="flex h-[60vh] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f9f4] px-6 py-5">
            {messages.length === 0 && (
              <p className="text-center text-sm text-brand-muted">
                Send a WhatsApp message to {lead.name}
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.direction === 'outbound'
                      ? 'rounded-br-md bg-[#dcf8c6] text-slate-800'
                      : 'rounded-bl-md bg-white text-slate-800'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="mt-1 text-right text-[11px] text-slate-500">
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 border-t border-slate-200 bg-white px-6 py-4"
          >
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Message ${lead.name} on WhatsApp`}
              disabled={isSending}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#25D366] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1fb85a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadWhatsAppChat;
