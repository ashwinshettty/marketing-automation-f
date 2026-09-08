import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getTemplates } from '../api/templateApi';
import { fetchWhatsAppConversations } from '../api/whatsappApi';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import GlobalFilter from './GlobalFilter';

const EMPTY_FILTERS = {
  messageType: 'all',
  templateName: '',
};

const PAGE_SIZE = 20;

const isCanceledRequest = (err) =>
  axios.isCancel?.(err) ||
  err?.code === 'ERR_CANCELED' ||
  err?.name === 'CanceledError' ||
  String(err?.message || '').toLowerCase() === 'canceled';

const mapConversationToChat = (conversation) => ({
  id: conversation.leadId || conversation.conversationId,
  leadId: conversation.leadId || conversation.id || null,
  conversationId: conversation.conversationId,
  name: conversation.name || conversation.phoneNumber || conversation.conversationId,
  contactNo: conversation.contactNo || conversation.phoneNumber || conversation.conversationId,
  phoneNumber: conversation.phoneNumber || conversation.conversationId,
  type: conversation.type || null,
  grade: conversation.grade || '',
  board: conversation.board || '',
  subject: conversation.subject || '',
  previewText: conversation.previewText || '',
  lastMessageAt: conversation.lastMessageAt || null,
  lastMessageType: conversation.lastMessageType || 'text',
  messageCount: conversation.messageCount || 0,
});

const mapContactToChat = (contact) => ({
  id: contact.leadId || contact.conversationId,
  leadId: contact.leadId || null,
  conversationId: contact.conversationId || contact.phoneNumber,
  name: contact.name || contact.phoneNumber || 'WhatsApp User',
  contactNo: contact.phoneNumber || contact.conversationId,
  phoneNumber: contact.phoneNumber || contact.conversationId,
  type: contact.type || 'enquiry',
  grade: '',
  board: '',
  subject: contact.subject || '',
  previewText: contact.subject || 'New contact',
  lastMessageAt: new Date().toISOString(),
  lastMessageType: 'text',
  messageCount: 0,
  fromSearch: true,
});

const MessagesPage = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    setAppliedFilters(filters);
    setPage(1);
  }, [filters]);

  const loadChats = useCallback(
    async ({ signal } = {}) => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchWhatsAppConversations({
          page,
          limit: PAGE_SIZE,
          messageType: appliedFilters.messageType,
          templateName: appliedFilters.templateName,
          signal,
        });

        const mapped = (data?.conversations || []).map(mapConversationToChat);
        setChats(mapped);
        setPagination(
          data?.pagination || {
            page,
            limit: PAGE_SIZE,
            total: mapped.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        );
      } catch (err) {
        if (isCanceledRequest(err)) return;
        setError(err.message || 'Failed to load chats');
        setChats([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [page, appliedFilters],
  );

  useEffect(() => {
    const abortController = new AbortController();
    loadChats({ signal: abortController.signal });
    return () => abortController.abort();
  }, [loadChats]);

  useEffect(() => {
    let isMounted = true;

    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const data = await getTemplates({ status: 'APPROVED', limit: 100 });
        const list = Array.isArray(data?.data) ? data.data : [];
        if (isMounted) {
          setTemplates(list.filter((item) => item.status === 'APPROVED'));
        }
      } catch {
        if (isMounted) setTemplates([]);
      } finally {
        if (isMounted) setTemplatesLoading(false);
      }
    };

    loadTemplates();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    const stillVisible = chats.some(
      (chat) =>
        chat.conversationId === selectedChat.conversationId ||
        chat.id === selectedChat.id,
    );
    if (!stillVisible && !selectedChat.fromSearch) {
      setSelectedChat(null);
    }
  }, [chats, selectedChat]);

  const messageFilter = useMemo(
    () => ({
      messageType: appliedFilters.messageType || 'all',
      templateName: appliedFilters.templateName || '',
    }),
    [appliedFilters.messageType, appliedFilters.templateName],
  );

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleSearchSelect = (chat) => {
    setSelectedChat({ ...chat, fromSearch: true });
  };

  const handleContactCreated = (contact) => {
    const chat = mapContactToChat(contact);
    setSelectedChat(chat);
    setChats((current) => {
      const withoutDup = current.filter(
        (item) =>
          item.conversationId !== chat.conversationId &&
          item.leadId !== chat.leadId,
      );
      return [chat, ...withoutDup];
    });
  };

  const handleLeadUpdate = (contact) => {
    const updated = mapContactToChat(contact);
    setSelectedChat((current) => {
      if (!current) return updated;
      return {
        ...current,
        ...updated,
        previewText: current.previewText,
        lastMessageAt: current.lastMessageAt,
        lastMessageType: current.lastMessageType,
        messageCount: current.messageCount,
        fromSearch: current.fromSearch,
      };
    });
    setChats((current) =>
      current.map((chat) => {
        const sameLead =
          (updated.leadId && chat.leadId === updated.leadId) ||
          chat.id === updated.id;
        if (!sameLead) return chat;
        return {
          ...chat,
          ...updated,
          previewText: chat.previewText,
          lastMessageAt: chat.lastMessageAt,
          lastMessageType: chat.lastMessageType,
          messageCount: chat.messageCount,
        };
      }),
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 px-6 py-4">
      <GlobalFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        templates={templates}
        templatesLoading={templatesLoading}
      />

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-brand-yellow/40 bg-white shadow-sm lg:grid-cols-[300px_1fr]">
        <div className="flex min-h-0 flex-col border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatList
              chats={chats}
              selectedChatId={selectedChat?.conversationId || selectedChat?.id}
              onSelect={setSelectedChat}
              onSearchSelect={handleSearchSelect}
              onContactCreated={handleContactCreated}
              conversationCount={pagination.total}
              loading={loading}
              error={error}
            />
          </div>
          {(pagination.hasPrevPage || pagination.hasNextPage) && (
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-navy transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-brand-muted">
                Page {pagination.page}
                {pagination.totalPages ? ` of ${pagination.totalPages}` : ''}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-brand-navy transition hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="min-h-0 p-3 lg:h-full">
          <ChatWindow
            chat={selectedChat}
            messageFilter={messageFilter}
            onLeadUpdate={handleLeadUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
