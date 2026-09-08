import { FaWhatsapp } from 'react-icons/fa';
import { formatMessageTime } from '../utils/formatMessageTime';
import AddContact from './AddContact';
import MessageSearchBox from './MessageSearchBox';

const getInitial = (name) => {
  const value = String(name || '').trim();
  return value ? value.charAt(0).toUpperCase() : '?';
};

const ChatList = ({
  chats,
  selectedChatId,
  onSelect,
  onSearchSelect,
  onContactCreated,
  conversationCount,
  loading,
  error,
}) => {
  let listContent;

  if (loading) {
    listContent = (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-sm text-brand-muted">
        Loading chats...
      </div>
    );
  } else if (error) {
    listContent = (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-red-600">
        {error}
      </div>
    );
  } else if (chats.length === 0) {
    listContent = (
      <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-sm text-brand-muted">
        No chats match your filters.
      </div>
    );
  } else {
    listContent = (
      <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
        {chats.map((chat) => {
          const chatKey = chat.conversationId || chat.id;
          const isSelected = selectedChatId === chatKey || selectedChatId === chat.id;

          return (
            <li key={chatKey}>
              <button
                type="button"
                onClick={() => onSelect(chat)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                  isSelected
                    ? 'bg-brand-cream'
                    : 'bg-white hover:bg-brand-cream/50'
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-brand-yellow">
                  {getInitial(chat.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-brand-navy">
                      {chat.name || 'Unknown'}
                    </p>
                    {chat.lastMessageAt && (
                      <span className="shrink-0 text-[11px] text-brand-muted">
                        {formatMessageTime(chat.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-brand-muted">
                    {chat.contactNo || 'No phone'}
                  </p>
                  {chat.previewText ? (
                    <p className="mt-1 truncate text-xs text-slate-600">{chat.previewText}</p>
                  ) : chat.subject ? (
                    <p className="mt-1 truncate text-xs text-slate-500">{chat.subject}</p>
                  ) : null}
                </div>

                <FaWhatsapp
                  className={`mt-1 h-3.5 w-3.5 shrink-0 ${
                    isSelected ? 'text-[#25D366]' : 'text-slate-300'
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  const countLabel =
    conversationCount === undefined || conversationCount === null
      ? null
      : loading
        ? 'Loading...'
        : `${conversationCount} conversation${conversationCount === 1 ? '' : 's'}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-navy">Chats</p>
            {countLabel ? (
              <p className="text-xs text-brand-muted">{countLabel}</p>
            ) : null}
          </div>
          <AddContact onCreated={onContactCreated} compact />
        </div>
        <MessageSearchBox onSelectResult={onSearchSelect || onSelect} compact />
      </div>
      {listContent}
    </div>
  );
};

export default ChatList;
