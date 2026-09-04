import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, FileSearch, FileText, Mail, ScanSearch } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { collapseVariants, duration, easeOut, staggerItem } from '@/lib/motion';
import { formatCapabilityName, priorityLabel } from '../../utils/formatters';
import AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';

function ConfidenceMeter({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <span className="inline-flex items-center gap-1.5" title={`Analysis confidence ${pct}%`}>
      <span aria-hidden="true" className="flex items-end gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'w-1 rounded-[1px]',
              i === 0 && 'h-1.5',
              i === 1 && 'h-2',
              i === 2 && 'h-2.5',
              i === 3 && 'h-3',
              pct >= (i + 1) * 25 ? 'bg-brand' : 'bg-border'
            )}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">{pct}% confidence</span>
    </span>
  );
}

/**
 * Detection language stays analytical: the crawl can only prove what it saw, so
 * an absent capability is reported as "not publicly detected", never as absent.
 */
export default function OpportunityCard({ opportunity, evidenceCount = 0, defaultExpanded = false }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const {
    serviceId,
    serviceName,
    category,
    score = 0,
    fit,
    confidence,
    missingPublicCapabilities = [],
    recommendation,
    reasons = [],
    relatedPages = [],
  } = opportunity;

  const pct = Math.min(100, Math.max(0, score));
  const gaps = missingPublicCapabilities;
  const detailsId = `opportunity-reasoning-${serviceId}`;

  return (
    <motion.article
      variants={staggerItem}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: duration.micro, ease: easeOut }}
      className="group flex flex-col rounded-xl border border-border bg-card transition-colors hover:border-foreground/15"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">
              <Link
                to={`/website-intelligence/opportunities/${serviceId}`}
                className="rounded outline-none transition-colors hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                {serviceName}
              </Link>
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {fit && <StatusBadge status={fit} label={priorityLabel(fit)} />}
              {category && <span className="meta-text truncate">{category}</span>}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-2xl leading-none font-semibold tracking-tight tabular-nums">{score}</div>
            <div className="meta-text mt-1">score</div>
          </div>
        </div>

        <div className="mt-4" role="img" aria-label={`Opportunity score ${score} out of 100`}>
          <AnimatedProgressBar value={pct} color="var(--brand)" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <ScanSearch className="size-3.5 text-brand" strokeWidth={1.75} aria-hidden="true" />
            {gaps.length > 0 ? 'Not publicly detected' : 'Fit based on site signals'}
          </span>
          {confidence != null && <ConfidenceMeter value={confidence} />}
        </div>

        {gaps.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {gaps.slice(0, 4).map((cap) => (
              <li
                key={cap}
                className="rounded-md border border-brand/20 bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand"
              >
                {formatCapabilityName(cap)}
              </li>
            ))}
            {gaps.length > 4 && (
              <li className="meta-text self-center">+{gaps.length - 4} more</li>
            )}
          </ul>
        )}

        {recommendation && (
          <div className="mt-4">
            <p className="label-text">Why this matters</p>
            <p className="body-text mt-1 line-clamp-2">{recommendation}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <FileSearch className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            {evidenceCount} evidence item{evidenceCount === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            {relatedPages.length} relevant page{relatedPages.length === 1 ? '' : 's'}
          </span>
        </div>

        {reasons.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls={detailsId}
              className="mt-3 inline-flex items-center gap-1 rounded text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              {expanded ? 'Hide reasoning' : `Show reasoning (${reasons.length})`}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: duration.normal, ease: easeOut }}
                className="inline-flex"
              >
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={detailsId}
                  variants={collapseVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <ul className="mt-3 space-y-1.5 border-l-2 border-border pl-3">
                    {reasons.map((reason) => (
                      <li key={reason} className="text-sm text-muted-foreground">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border bg-muted/40 px-5 py-3">
        <Button
          size="sm"
          onClick={() => navigate('/website-intelligence/reports', { state: { opportunityIds: [serviceId] } })}
        >
          <Mail />
          Generate outreach email
        </Button>
        <Button size="sm" variant="outline" render={<Link to={`/website-intelligence/opportunities/${serviceId}`} />}>
          View details
        </Button>
      </div>
    </motion.article>
  );
}
