import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchWhatsAppMessages, sendWhatsAppMessage } from '../../api/whatsappApi';
import { getSocket } from '../../api/socket';
import { normalizePhoneNumber } from '../../utils/normalizePhone';

const formatMessageTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const mapSocketMessage = (message) => ({
  id: message.id,
  direction: message.direction,
  text: message.text,
  time: formatMessageTime(message.time),
});

const WhatsAppChatPanel = ({ lead }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageIdsRef = useRef(new Set());

  const conversationId = useMemo(
    () => normalizePhoneNumber(lead?.contactNo),
    [lead?.contactNo],
  );

  useEffect(() => {
    if (!lead || !conversationId) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadMessages = async ({ showLoading = true } = {}) => {
      try {
        if (showLoading) setIsLoading(true);
        setError('');

        const history = await fetchWhatsAppMessages({
          leadId: lead.id,
          phoneNumber: lead.contactNo,
        });

        if (isMounted) {
          const nextIds = new Set();
          history.forEach((message) => nextIds.add(message.id));
          messageIdsRef.current = nextIds;
          setMessages(history);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load chat history');
        }
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
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
    };

    const handleConnect = () => {
      joinRoom();
    };

    const handleNewMessage = (data) => {
      if (data.conversationId !== conversationId || !data.message) return;

      const incoming = mapSocketMessage(data.message);
      if (messageIdsRef.current.has(incoming.id)) return;

      messageIdsRef.current.add(incoming.id);
      setMessages((current) => [...current, incoming]);
    };

    socket.on('connect', handleConnect);
    socket.on('new_whatsapp_message', handleNewMessage);

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.emit('leave_whatsapp', conversationId);
      socket.off('connect', handleConnect);
      socket.off('new_whatsapp_message', handleNewMessage);
    };
  }, [conversationId]);

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
        const saved = mapSocketMessage(result.data);

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

  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-brand-muted">Loading WhatsApp chat...</p>
    );
  }

  if (!conversationId) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-brand-cream/30 px-4 py-8 text-center text-sm text-brand-muted">
        No valid phone number available for WhatsApp.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex h-[420px] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f9f4] px-4 py-5">
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
                  {message.time || formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex items-center gap-3 border-t border-slate-200 bg-white px-4 py-3"
        >
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Message ${lead.name} on WhatsApp`}
            disabled={isSending}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#25D366] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isSending || !draft.trim()}
            className="rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1fb85a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppChatPanel;
