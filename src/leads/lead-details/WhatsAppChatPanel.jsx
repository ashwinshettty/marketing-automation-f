import { useState } from 'react';
import MessageStatusIcon from '../../components/whatsapp/MessageStatusIcon';
import TemplateSendModal from '../../components/whatsapp/TemplateSendModal';
import { useWhatsAppChat } from '../../hooks/useWhatsAppChat';

const WhatsAppChatPanel = ({ lead }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

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
                {message.messageType && message.messageType !== 'text' && (
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                    {message.messageType}
                  </p>
                )}
                <p>{message.text}</p>
                <p className="mt-1 flex items-center justify-end text-[11px] text-slate-500">
                  {message.time}
                  <MessageStatusIcon
                    status={message.status}
                    direction={message.direction}
                  />
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
      </div>

      <TemplateSendModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        isSending={isSending}
        onSend={async (payload) => {
          await handleSendTemplate(payload);
          setShowTemplateModal(false);
        }}
      />
    </div>
  );
};

export default WhatsAppChatPanel;
