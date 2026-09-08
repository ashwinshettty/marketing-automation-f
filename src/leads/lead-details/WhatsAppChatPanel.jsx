import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaChevronDown,
  FaFileAlt,
  FaPaperclip,
  FaPencilAlt,
  FaWhatsapp,
} from 'react-icons/fa';
import CallLogBubble from '../../components/whatsapp/CallLogBubble';
import MessageStatusIcon from '../../components/whatsapp/MessageStatusIcon';
import WhatsAppCallButton from '../../components/whatsapp/WhatsAppCallButton';
import TemplateMessageContent from '../../components/whatsapp/TemplateMessageContent';
import TemplateSendModal from '../../components/whatsapp/TemplateSendModal';
import { getMediaDisplayName } from '../../api/whatsappApi';
import { useWhatsAppChat } from '../../hooks/useWhatsAppChat';
import EditContactModal from '../../messages/EditContactModal';
import {
  formatChatDateLabel,
  formatMessageTime,
  isSameChatDay,
} from '../../utils/formatMessageTime';

const matchesMessageFilter = (item, messageFilter) => {
  if (!messageFilter) return true;
  if (item.kind === 'call') {
    return messageFilter.messageType === 'all' && !messageFilter.templateName;
  }

  const type = messageFilter.messageType || 'all';
  if (type === 'template' && item.messageType !== 'template') return false;
  if (type === 'text' && item.messageType === 'template') return false;

  const templateName = String(messageFilter.templateName || '').trim().toLowerCase();
  if (!templateName) return true;

  if (item.messageType !== 'template') return false;

  const candidates = [
    item.templateContent?.name,
    item.templateContent?.templateName,
    item.text,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return candidates.some((value) => value.includes(templateName));
};
const isMediaPlaceholder = (text, type) => {
  const value = String(text || '').trim().toLowerCase();
  if (!value) return true;
  return (
    value === `[${type} received]` ||
    value.startsWith(`[${type}]`)
  );
};

const MediaDocumentCard = ({ message }) => {
  const fileName = getMediaDisplayName(message) || 'Shared document';

  if (!message.mediaUrl) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <FaFileAlt className="shrink-0 text-lg text-slate-400" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">{fileName}</p>
          <p className="text-[11px] text-slate-500">Media no longer available</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={message.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 transition hover:border-brand-navy/30 hover:bg-slate-50"
      title="Open document"
    >
      <FaFileAlt className="shrink-0 text-lg text-brand-navy" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{fileName}</p>
        <p className="text-[11px] font-medium text-brand-navy">Open / download</p>
      </div>
    </a>
  );
};

const renderMessageContent = (message) => {
  if (message.messageType === 'image' && message.mediaUrl) {
    const isPlaceholderText = isMediaPlaceholder(message.text, 'image');

    return (
      <div className="space-y-2">
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          title="Open image"
        >
          <img
            src={message.mediaUrl}
            alt={message.text || 'WhatsApp image'}
            className="max-h-64 w-full rounded-xl object-cover"
          />
        </a>
        {!isPlaceholderText && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
      </div>
    );
  }

  if (message.messageType === 'document') {
    return <MediaDocumentCard message={message} />;
  }

  if (message.messageType === 'video' && message.mediaUrl) {
    return (
      <div className="space-y-2">
        <video
          controls
          src={message.mediaUrl}
          className="max-h-64 w-full rounded-xl bg-black"
        />
        {!isMediaPlaceholder(message.text, 'video') && (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}
      </div>
    );
  }

  if (message.messageType === 'audio' && message.mediaUrl) {
    return (
      <div className="space-y-2">
        <audio controls src={message.mediaUrl} className="w-full max-w-[240px]" />
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

const ChatDateSeparator = ({ timestamp }) => {
  const label = formatChatDateLabel(timestamp);
  if (!label) return null;

  return (
    <div className="flex justify-center py-1">
      <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
        {label}
      </span>
    </div>
  );
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

const WhatsAppChatPanel = ({
  lead,
  messageFilter = null,
  onLeadUpdate,
  heightClassName = 'h-[420px]',
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
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
    reloadMessages,
  } = useWhatsAppChat({ lead });

  const visibleMessages = useMemo(
    () => messages.filter((item) => matchesMessageFilter(item, messageFilter)),
    [messages, messageFilter],
  );
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

  const canEditContact = Boolean(lead?.leadId || lead?.id);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 ${heightClassName}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-[#075e54]/20 bg-[#075e54] px-4 py-3 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <FaWhatsapp className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{lead.name}</p>
              <p className="truncate text-xs text-white/80">{lead.contactNo}</p>
              {lead.subject ? (
                <p className="truncate text-[11px] text-white/70" title={lead.subject}>
                  Subject: {lead.subject}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canEditContact && (
              <button
                type="button"
                onClick={() => setShowEditContact(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label={`Edit ${lead.name}`}
                title="Edit contact info"
              >
                <FaPencilAlt className="h-3.5 w-3.5" />
              </button>
            )}
            <WhatsAppCallButton
              phoneNumber={lead.contactNo}
              leadId={lead.id}
              subject={lead.subject || ''}
              className="shrink-0"
              onAgentCallStarted={() => {
                reloadMessages({ showLoading: false });
              }}
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#efeae2] px-4 py-5">
          {visibleMessages.length === 0 && (
            <p className="text-center text-sm text-brand-muted">
              {messages.length === 0
                ? `Send a WhatsApp message to ${lead.name}`
                : 'No messages match the current filters.'}
            </p>
          )}

          {visibleMessages.map((item, index) => {
            const previous = visibleMessages[index - 1];            const showDate =
              !previous ||
              !isSameChatDay(
                item.timestamp || item.time,
                previous.timestamp || previous.time,
              );

            if (item.kind === 'call') {
              return (
                <div key={item.id} className="space-y-4">
                  {showDate && (
                    <ChatDateSeparator timestamp={item.timestamp || item.time} />
                  )}
                  <CallLogBubble call={item} leadId={lead.id} />
                </div>
              );
            }

            const isTemplate = item.messageType === 'template';
            const isOutbound = item.direction === 'outbound';

            return (
              <div key={item.id} className="space-y-4">
                {showDate && (
                  <ChatDateSeparator timestamp={item.timestamp || item.time} />
                )}
                <div
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
                    {item.isBot && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#128c7e]">
                        Bot{item.senderName ? ` · ${item.senderName}` : ''}
                      </p>
                    )}
                    {item.messageType &&
                      item.messageType !== 'text' &&
                      item.messageType !== 'template' &&
                      item.messageType !== 'document' && (
                        <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                          {item.messageType}
                        </p>
                      )}
                    {renderMessageContent(item)}
                    <p
                      className={`flex items-center justify-end gap-1 text-[11px] text-[#667781] ${
                        isTemplate ? 'px-2 pb-1 pt-0' : 'mt-1'
                      }`}
                    >
                      {formatMessageTime(item.timestamp || item.time)}
                      <MessageStatusIcon
                        status={item.status}
                        direction={item.direction}
                      />
                    </p>
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

      {showEditContact && (
        <EditContactModal
          lead={lead}
          onClose={() => setShowEditContact(false)}
          onSaved={(contact) => {
            onLeadUpdate?.(contact);
          }}
        />
      )}
    </div>
  );
};

export default WhatsAppChatPanel;
