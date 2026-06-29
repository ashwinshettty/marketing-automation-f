import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchWhatsAppMessages, sendWhatsAppMessage } from '../../api/whatsappApi';
import { getSocket } from '../../api/socket';
import {
  buildLeadTimelineItems,
  formatTimelineDate,
  TIMELINE_STYLES,
} from '../../utils/buildLeadTimeline';
import { normalizePhoneNumber } from '../../utils/normalizePhone';

const mapSocketMessage = (message) => ({
  id: message.id,
  direction: message.direction,
  text: message.text,
  timestamp: message.time,
  time: new Date(message.time).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  }),
});

const LeadTimeline = ({ lead }) => {
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

  const timelineItems = useMemo(
    () => buildLeadTimelineItems(lead, messages),
    [lead, messages],
  );

  useEffect(() => {
    if (!lead) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadMessages = async ({ showLoading = true } = {}) => {
      if (!conversationId) {
        if (isMounted) {
          setMessages([]);
          setIsLoading(false);
        }
        return;
      }

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
          setError(err.message || 'Failed to load timeline');
        }
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    const pollInterval = conversationId
      ? setInterval(() => {
          loadMessages({ showLoading: false });
        }, 15000)
      : null;

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
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
      <p className="py-8 text-center text-sm text-brand-muted">Loading timeline...</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="max-h-[420px] space-y-4 overflow-y-auto bg-[#f7f9f4] px-4 py-5">
        {timelineItems.length === 0 && (
          <p className="text-center text-sm text-brand-muted">
            No activity yet. Add notes or send a WhatsApp message to build the timeline.
          </p>
        )}

        {timelineItems.map((item, index) => {
          const style = TIMELINE_STYLES[item.type] || TIMELINE_STYLES.lead_created;

          return (
            <div key={item.id} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${style.badgeClass}`}
                >
                  {style.badge}
                </div>
                {index < timelineItems.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-slate-200" />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-brand-navy">{item.title}</span>
                  <span className="text-xs text-brand-muted">
                    {formatTimelineDate(item.timestamp)}
                  </span>
                  {item.meta?.status && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium capitalize text-brand-navy">
                      {item.meta.status}
                    </span>
                  )}
                </div>
                <div className={`mt-2 rounded-xl px-4 py-3 text-sm text-brand-navy ${style.cardClass}`}>
                  <p className="whitespace-pre-wrap">{item.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {conversationId && (
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
      )}
    </div>
  );
};

export default LeadTimeline;
