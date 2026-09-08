import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { searchWhatsAppMessages } from '../api/whatsappApi';
import { formatMessageTime } from '../utils/formatMessageTime';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 1;

const isCanceledRequest = (err) =>
  axios.isCancel?.(err) ||
  err?.code === 'ERR_CANCELED' ||
  err?.name === 'CanceledError' ||
  String(err?.message || '').toLowerCase() === 'canceled';

const MessageSearchBox = ({ onSelectResult, compact = false }) => {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAppliedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (appliedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError('');
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    const runSearch = async () => {
      setLoading(true);
      setError('');
      setIsOpen(true);

      try {
        const data = await searchWhatsAppMessages({
          q: appliedQuery,
          page: 1,
          limit: 20,
          signal: abortController.signal,
        });
        setResults(Array.isArray(data?.messages) ? data.messages : []);
      } catch (err) {
        if (isCanceledRequest(err)) return;
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    runSearch();
    return () => abortController.abort();
  }, [appliedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setAppliedQuery('');
    setResults([]);
    setError('');
    setIsOpen(false);
  };

  const handleSelect = (message) => {
    onSelectResult?.({
      id: message.leadId || message.conversationId,
      leadId: message.leadId || null,
      conversationId: message.conversationId,
      name: message.name || message.phoneNumber || message.conversationId,
      contactNo: message.contactNo || message.phoneNumber || message.conversationId,
      phoneNumber: message.phoneNumber || message.conversationId,
      previewText: message.text || message.matchPreview || '',
      lastMessageAt: message.time || null,
    });
    setIsOpen(false);
  };

  const showPanel =
    isOpen &&
    (appliedQuery.length >= MIN_QUERY_LENGTH || loading || error || results.length > 0);

  return (
    <div ref={containerRef} className={`relative w-full ${compact ? '' : 'max-w-xl'}`}>
      {!compact && (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
          Search messages
        </label>
      )}
      <div className="relative">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (appliedQuery.length >= MIN_QUERY_LENGTH) setIsOpen(true);
          }}
          placeholder="Search name, phone, or message..."
          className={`${
            compact ? 'h-10' : 'h-11'
          } w-full rounded-xl border border-brand-yellow/40 bg-brand-cream/20 pl-9 pr-10 text-sm text-brand-navy outline-none transition focus:border-brand-navy focus:bg-white`}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-brand-muted hover:bg-brand-cream hover:text-brand-navy"
            aria-label="Clear search"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-hidden rounded-xl border border-brand-yellow/40 bg-white shadow-lg">
          {loading && (
            <p className="px-4 py-3 text-sm text-brand-muted">Searching...</p>
          )}

          {!loading && error && (
            <p className="px-4 py-3 text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-brand-muted">
              No messages found for “{appliedQuery}”.
            </p>
          )}

          {!loading && !error && results.length > 0 && (
            <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {results.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(message)}
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-brand-cream/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-brand-navy">
                        {message.name || message.phoneNumber}
                      </p>
                      <span className="shrink-0 text-[11px] text-brand-muted">
                        {formatMessageTime(message.time)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-brand-muted">
                      {message.phoneNumber}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-700">
                      {message.text || message.matchPreview}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearchBox;
