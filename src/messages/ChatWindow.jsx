import { FaWhatsapp } from 'react-icons/fa';
import { TemplatePreviewProvider } from '../leads/lead-details/TemplatePreviewContext';
import WhatsAppChatPanel from '../leads/lead-details/WhatsAppChatPanel';

const ChatWindow = ({ chat, messageFilter, onLeadUpdate }) => {
  if (!chat) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-brand-cream/20 px-6 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
          <FaWhatsapp className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold text-brand-navy">Select a chat</p>
        <p className="mt-1 max-w-sm text-sm text-brand-muted">
          Choose a contact from the list to view the full conversation.
        </p>
      </div>
    );
  }

  return (
    <TemplatePreviewProvider>
      <div className="h-full min-h-0">
        <WhatsAppChatPanel
          lead={chat}
          messageFilter={messageFilter}
          onLeadUpdate={onLeadUpdate}
          heightClassName="h-full"
        />
      </div>
    </TemplatePreviewProvider>
  );
};

export default ChatWindow;
