import { useEffect, useRef, useState } from 'react';
import { FaChevronDown, FaPaperclip, FaWhatsapp } from 'react-icons/fa';
import MessageStatusIcon from '../../components/whatsapp/MessageStatusIcon';
import WhatsAppCallButton from '../../components/whatsapp/WhatsAppCallButton';
import TemplateMessageContent from '../../components/whatsapp/TemplateMessageContent';
import TemplateSendModal from '../../components/whatsapp/TemplateSendModal';
import { useWhatsAppChat } from '../../hooks/useWhatsAppChat';
import { formatMessageTime } from '../../utils/formatMessageTime';

const renderMessageContent = (message) => {
  if (message.messageType === 'image' && message.mediaUrl) {
    const isPlaceholderText =
      !message.text ||
      message.text === '[Image received]' ||
      message.text.toLowerCase().startsWith('[image]');

    return (
      <div className="space-y-2">
        <img
          src={message.mediaUrl}
          alt={message.text || 'WhatsApp image'}
          className="max-h-64 w-full rounded-xl object-cover"
        />
        {!isPlaceholderText && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
      </div>
    );
  }

  if (message.messageType === 'template') {
    return (
      <TemplateMessageContent
        templateContent={message.templateContent}
        fallbackText={message.text}
      />
    );
  }

  return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
};

const mediaOptions = {
  image: {
    label: 'Image',
    accept: 'image/*',
  },
  video: {
    label: 'Video',
    accept: 'video/*',
  },
  document: {
    label: 'Document',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
  },
};

const WhatsAppChatPanel = ({ lead }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [mediaAccept, setMediaAccept] = useState(mediaOptions.image.accept);
  const fileInputRef = useRef(null);
  const mediaMenuRef = useRef(null);

  const {
    draft,
    setDraft,
    selectedMedia,
    setSelectedMedia,
    messages,
    isLoading,
    isSending,
    error,
    conversationId,
    handleSend,
    handleSendTemplate,
  } = useWhatsAppChat({ lead });

  const handleMediaSelect = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedMedia(file);
    setShowMediaMenu(false);
  };

  const handleOpenMediaPicker = (type) => {
    setMediaAccept(mediaOptions[type].accept);
    setShowMediaMenu(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const clearSelectedMedia = () => {
    setSelectedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!selectedMedia && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedMedia]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mediaMenuRef.current && !mediaMenuRef.current.contains(event.target)) {
        setShowMediaMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="flex items-center justify-between gap-3 border-b border-[#075e54]/20 bg-[#075e54] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <FaWhatsapp className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{lead.name}</p>
              <p className="truncate text-xs text-white/80">{lead.contactNo}</p>
            </div>
          </div>
          <WhatsAppCallButton
            phoneNumber={lead.contactNo}
            leadId={lead.id}
            className="shrink-0"
          />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#efeae2] px-4 py-5">
          {messages.length === 0 && (
            <p className="text-center text-sm text-brand-muted">
              Send a WhatsApp message to {lead.name}
            </p>
          )}

          {messages.map((message) => {
            const isTemplate = message.messageType === 'template';
            const isOutbound = message.direction === 'outbound';

            return (
            <div
              key={message.id}
              className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[min(75%,320px)] text-sm shadow-sm ${
                  isTemplate
                    ? `overflow-hidden rounded-lg ${isOutbound ? 'bg-[#d9fdd3]' : 'bg-white'}`
                    : `rounded-2xl px-4 py-3 ${
                        isOutbound
                          ? 'rounded-br-md bg-[#d9fdd3] text-slate-800'
                          : 'rounded-bl-md bg-white text-slate-800'
                      }`
                }`}
              >
                {message.messageType &&
                  message.messageType !== 'text' &&
                  message.messageType !== 'template' && (
                  <p className="mb-1 px-4 pt-3 text-[10px] uppercase tracking-wide text-slate-500">
                    {message.messageType}
                  </p>
                )}
                {renderMessageContent(message)}
                <p
                  className={`flex items-center justify-end gap-1 text-[11px] text-[#667781] ${
                    isTemplate ? 'px-2 pb-1 pt-0' : 'mt-1'
                  }`}
                >
                  {formatMessageTime(message.timestamp || message.time)}
                  <MessageStatusIcon
                    status={message.status}
                    direction={message.direction}
                  />
                </p>
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

        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white px-4 py-3"
        >
          {selectedMedia && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="truncate pr-3">
                Selected media: {selectedMedia.name}
              </span>
              <button
                type="button"
                onClick={clearSelectedMedia}
                disabled={isSending}
                className="font-medium text-red-500 hover:text-red-600 disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              disabled={isSending}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-brand-navy hover:bg-slate-50 disabled:opacity-60"
            >
              Template
            </button>
            <div className="relative" ref={mediaMenuRef}>
              <button
                type="button"
                onClick={() => setShowMediaMenu((current) => !current)}
                disabled={isSending}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-brand-navy hover:bg-slate-50 disabled:opacity-60"
              >
                <FaPaperclip className="text-[11px]" />
                <FaChevronDown className="text-[10px]" />
              </button>

              {showMediaMenu && (
                <div className="absolute bottom-full left-0 z-10 mb-2 w-32 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  {Object.entries(mediaOptions).map(([type, option]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleOpenMediaPicker(type)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleMediaSelect}
              disabled={isSending}
              accept={mediaAccept}
              className="hidden"
            />
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                selectedMedia
                  ? 'Add a caption (optional)'
                  : `Message ${lead.name} on WhatsApp`
              }
              disabled={isSending}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-[#25D366] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || (!draft.trim() && !selectedMedia)}
              className="rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1fb85a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

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

export default WhatsAppChatPanel;
