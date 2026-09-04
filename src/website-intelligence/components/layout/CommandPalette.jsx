import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { dialogVariants, overlayVariants } from '@/lib/motion';
import { flattenNavItems } from './navigation';
import { formatPath } from '../../utils/formatters';
import { cn } from '@/lib/utils';

const MAX_RESULTS = 40;

export default function CommandPalette({ open, onClose, audit, catalogs = [] }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const items = useMemo(() => {
    const results = flattenNavItems(catalogs).map((item) => ({
      id: `nav-${item.to}`,
      type: 'Go to',
      label: item.label,
      sub: item.section,
      to: item.to,
    }));

    for (const opp of audit?.opportunities || []) {
      results.push({
        id: `opp-${opp.serviceId}`,
        type: 'Opportunity',
        label: opp.serviceName,
        sub: `${opp.score} score`,
        to: `/website-intelligence/opportunities/${opp.serviceId}`,
      });
    }

    for (const cap of audit?.capabilities || []) {
      results.push({
        id: `cap-${cap.id || cap.capability}`,
        type: 'Capability',
        label: cap.name || cap.capability,
        sub: String(cap.status || '').replace(/_/g, ' '),
        to: '/website-intelligence/capabilities',
      });
    }

    for (const page of audit?.crawl?.pages || []) {
      results.push({
        id: `page-${page.id || page.url}`,
        type: 'Page',
        label: page.title,
        sub: formatPath(page.url),
        to: '/website-intelligence/pages',
      });
    }

    for (const ev of (audit?.evidence || []).slice(0, 40)) {
      results.push({
        id: `ev-${ev.id}`,
        type: 'Evidence',
        label: ev.normalizedValue || ev.type,
        sub: formatPath(ev.pageUrl),
        to: '/website-intelligence/evidence',
      });
    }

    const q = query.trim().toLowerCase();
    const filtered = q
      ? results.filter(
          (r) =>
            r.label?.toLowerCase().includes(q) ||
            r.sub?.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q)
        )
      : results;

    return filtered.slice(0, MAX_RESULTS);
  }, [audit, catalogs, query]);

  const onQueryChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(0);
  };

  const go = (to) => {
    navigate(to);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault();
      go(items[activeIndex].to);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="command-overlay"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            variants={dialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="command-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="flex items-center gap-2.5 border-b border-border px-3.5">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                autoFocus
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-results"
                aria-activedescendant={items[activeIndex]?.id}
                placeholder="Search pages, opportunities, capabilities, evidence…"
                value={query}
                onChange={onQueryChange}
                onKeyDown={onKeyDown}
                className="h-12 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                Esc
              </kbd>
            </div>

            <div id="command-results" ref={listRef} role="listbox" className="max-h-80 overflow-y-auto py-1.5">
              {items.length === 0 ? (
                <p className="meta-text px-4 py-8 text-center">No results for “{query}”</p>
              ) : (
                items.map((item, index) => (
                  <button
                    key={item.id}
                    id={item.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    data-active={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(item.to)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3.5 py-2 text-left outline-none',
                      index === activeIndex && 'bg-muted'
                    )}
                  >
                    <span className="label-text w-20 shrink-0">{item.type}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                    <span className="meta-text max-w-[40%] truncate">{item.sub}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
