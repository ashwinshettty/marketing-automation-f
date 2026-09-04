import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, ShieldCheck, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SPRING_SNAPPY } from '@/components/smoothui/lib/animation';

const PAGE_SIZE = 4;

/**
 * Compact pager for the narrow outreach evidence sidebar.
 * Full-width table pagination does not fit this panel.
 */
function CompactPager({ page, totalPages, totalItems, pageSize, onPageChange }) {
  const shouldReduceMotion = useReducedMotion();
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
      <p className="meta-text min-w-0 truncate tabular-nums">
        {rangeStart}–{rangeEnd} of {totalItems}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <motion.span
          key={page}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
          className="min-w-10 text-center text-xs font-medium tabular-nums text-muted-foreground"
        >
          {page}/{totalPages}
        </motion.span>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

/**
 * Trust surface: shows which findings the draft was built from.
 */
export default function EmailEvidencePanel({ opportunities = [], recipient, confidence }) {
  const shouldReduceMotion = useReducedMotion();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(opportunities.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [opportunities]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return opportunities.slice(start, start + PAGE_SIZE);
  }, [opportunities, page]);

  const showPagination = opportunities.length > PAGE_SIZE;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold">Why this email was created</h3>
        <p className="body-text mt-1">
          The draft references only the findings listed below. Each one is backed by an observation from the
          crawl.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h4 className="label-text flex min-w-0 items-center gap-1.5">
            <Target className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span className="truncate">Selected opportunities</span>
          </h4>
          {opportunities.length > 0 && (
            <span className="meta-text shrink-0 tabular-nums">{opportunities.length}</span>
          )}
        </div>

        {opportunities.length === 0 ? (
          <p className="body-text mt-2">No opportunities were attached to this draft.</p>
        ) : (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={page}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
                className="mt-2 space-y-2"
              >
                {pageItems.map((opp) => (
                  <li key={opp.serviceId || opp.id} className="rounded-lg border border-border p-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">{opp.serviceName}</span>
                      {opp.score != null && (
                        <span className="meta-text shrink-0 tabular-nums">{opp.score}/100</span>
                      )}
                    </div>
                    {opp.reason && (
                      <p className="body-text mt-1 line-clamp-2 text-xs">{opp.reason}</p>
                    )}
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>

            {showPagination && (
              <CompactPager
                page={page}
                totalPages={totalPages}
                totalItems={opportunities.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>

      {(recipient?.email || confidence != null) && (
        <section>
          <h4 className="label-text flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            Recipient source
          </h4>
          <div className="mt-2 rounded-lg border border-border p-2.5">
            {recipient?.email && <p className="truncate font-mono text-xs">{recipient.email}</p>}
            <p className="meta-text mt-1">
              {recipient?.sourceLabel || recipient?.source || 'Found on the website'}
              {recipient?.confidence ? ` · ${recipient.confidence} confidence` : ''}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
