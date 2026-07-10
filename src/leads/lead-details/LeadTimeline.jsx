import { useEffect, useMemo, useState } from 'react';
import MessageStatusIcon from '../../components/whatsapp/MessageStatusIcon';
import TemplateSendModal from '../../components/whatsapp/TemplateSendModal';
import { fetchEvents } from '../../api/eventApi';
import { useWhatsAppChat } from '../../hooks/useWhatsAppChat';
import {
  buildLeadTimelineItems,
  formatTimelineDate,
  TIMELINE_STYLES,
} from '../../utils/buildLeadTimeline';

const LeadTimeline = ({ lead, eventsRefreshKey = 0 }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [events, setEvents] = useState([]);

  const {
    draft,
    setDraft,
    messages,
    isLoading,
    isSending,
    error,
    conversationId,
    handleSend,
    handleSendTemplate,
  } = useWhatsAppChat({ lead });

  useEffect(() => {
    let isMounted = true;

    const loadLeadEvents = async () => {
      if (!lead?.id) {
        if (isMounted) setEvents([]);
        return;
      }

      try {
        const data = await fetchEvents({
          studentId: lead.id,
          page: 1,
          limit: 50,
        });

        if (!isMounted) return;
        setEvents(Array.isArray(data?.events) ? data.events : []);
      } catch {
        if (isMounted) setEvents([]);
      }
    };

    loadLeadEvents();
    return () => {
      isMounted = false;
    };
  }, [lead?.id, eventsRefreshKey]);

  const timelineItems = useMemo(
    () => buildLeadTimelineItems(lead, messages, events),
    [lead, messages, events],
  );

  if (isLoading) {
    return (
      <p className="py-8 text-center text-sm text-brand-muted">Loading timeline...</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="max-h-[560px] space-y-4 overflow-y-auto bg-[#f7f9f4] px-4 py-5">
        {timelineItems.length === 0 && (
          <p className="text-center text-sm text-brand-muted">
            No activity yet. Add notes or send a WhatsApp message to build the timeline.
          </p>
        )}

        {timelineItems.map((item, index) => {
          const style = TIMELINE_STYLES[item.type] || TIMELINE_STYLES.lead_created;
          const showWaStatus =
            item.type === 'whatsapp_outbound' || item.type === 'whatsapp_bot';

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
                    <span className="flex items-center rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium capitalize text-brand-navy">
                      {item.meta.status}
                      {showWaStatus && (
                        <MessageStatusIcon
                          status={item.meta.status}
                          direction="outbound"
                        />
                      )}
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
          className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3"
        >
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            disabled={isSending}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-brand-navy hover:bg-slate-50 disabled:opacity-60"
          >
            Template
          </button>
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

      <TemplateSendModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        isSending={isSending}
        lead={lead}
        onSend={async (payload) => {
          await handleSendTemplate(payload);
          setShowTemplateModal(false);
        }}
      />
    </div>
  );
};

export default LeadTimeline;
