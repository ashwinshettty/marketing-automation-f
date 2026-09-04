import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import LiveScanLog from '../ui/LiveScanLog';
import StatusIcon from '../common/StatusIcon';
import { LabeledProgressIndicator } from '@/components/ui/labeled-progress-indicator';
import { collapseVariants, duration, easeOut, rowItem, staggerContainer } from '@/lib/motion';
import { formatDomain, formatPath } from '../../utils/formatters';
import { cn } from '@/lib/utils';

/**
 * Backend stage keys mapped to language the user understands. Anything the
 * backend has not reported yet stays "pending" — we never guess ahead.
 */
const STAGES = [
  { key: 'validating', label: 'Connecting' },
  { key: 'crawling', label: 'Crawling pages' },
  { key: 'extracting', label: 'Extracting information' },
  { key: 'analyzing', label: 'Detecting services' },
  { key: 'matching', label: 'Identifying opportunities' },
  { key: 'generating', label: 'Preparing results' },
];

function stageIndex(stage) {
  const normalized = String(stage || '').replace(/_with_warnings$/, '');
  if (normalized === 'completed' || normalized === 'failed') return STAGES.length;
  const idx = STAGES.findIndex((item) => item.key === normalized);
  return idx >= 0 ? idx : 0;
}

/** Briefly tints a counter when it changes so movement is noticeable. */
function MetricValue({ value }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return undefined;
    prevRef.current = value;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <strong
      className={cn(
        'tabular-nums transition-colors duration-300',
        flash ? 'text-brand' : 'text-foreground'
      )}
    >
      {value}
    </strong>
  );
}

export default function AnalysisProgress({ progress, website }) {
  const [logOpen, setLogOpen] = useState(true);

  const stage = progress?.stage || 'validating';
  const currentStageIdx = stageIndex(stage);
  const isActive = stage !== 'completed' && stage !== 'failed';

  // Only render a percentage when the backend actually supplied one.
  const rawPct = progress?.percentage;
  const hasPercentage = typeof rawPct === 'number' && Number.isFinite(rawPct) && rawPct > 0;
  const pct = hasPercentage ? Math.min(100, Math.max(0, rawPct)) : 0;

  const message = progress?.message || STAGES[Math.min(currentStageIdx, STAGES.length - 1)]?.label;
  const currentLabel = STAGES[Math.min(currentStageIdx, STAGES.length - 1)]?.label || 'Working';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.panel, ease: easeOut }}
      className="relative overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="analysis-progress-heading"
    >
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative p-5">
        <h2 id="analysis-progress-heading" className="sr-only">
          {currentLabel}
        </h2>

        {website && (
          <p className="mb-4 truncate text-center font-mono text-xs text-muted-foreground">
            {formatDomain(website)}
          </p>
        )}

        <div
          role="progressbar"
          aria-valuenow={hasPercentage ? Math.round(pct) : undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Analysis progress"
          aria-busy={isActive}
        >
          <LabeledProgressIndicator
            labels={STAGES.map((s) => s.label)}
            activeLabel={currentLabel}
            progress={hasPercentage ? `${pct}%` : '0%'}
            indeterminate={!hasPercentage && isActive}
          />
        </div>

        <p aria-live="polite" className="body-text mt-4 text-center">
          {message}
        </p>

        {progress?.currentUrl && (
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={progress.currentUrl}>
            {formatPath(progress.currentUrl)}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span>
            Discovered <MetricValue value={progress?.pagesDiscovered ?? 0} />
          </span>
          <span>
            Analyzed <MetricValue value={progress?.pagesAnalyzed ?? 0} />
          </span>
          {progress?.queueRemaining != null && (
            <span>
              Queued <MetricValue value={progress.queueRemaining} />
            </span>
          )}
        </div>

        <motion.ol
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {STAGES.map((item, index) => {
            const done = index < currentStageIdx;
            const active = index === currentStageIdx && isActive;
            const iconKind = done ? 'stage_done' : active ? 'stage_active' : 'stage_pending';

            return (
              <motion.li
                key={item.key}
                variants={rowItem}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors',
                  done && 'border-success/25 bg-success-subtle text-success',
                  active && 'border-brand/30 bg-brand-subtle text-brand',
                  !done && !active && 'border-border text-muted-foreground'
                )}
              >
                <StatusIcon kind={iconKind} className="size-3.5!" />
                <span className="truncate font-medium">{item.label}</span>
              </motion.li>
            );
          })}
        </motion.ol>

        <div className="mt-5 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setLogOpen((value) => !value)}
            aria-expanded={logOpen}
            aria-controls="analysis-live-log"
            className="flex w-full items-center justify-between rounded text-left text-xs font-medium tracking-wide text-muted-foreground uppercase outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Live activity
            <motion.span
              animate={{ rotate: logOpen ? 180 : 0 }}
              transition={{ duration: duration.normal, ease: easeOut }}
              className="inline-flex"
            >
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {logOpen && (
              <motion.div
                id="analysis-live-log"
                variants={collapseVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="overflow-hidden"
              >
                <div className="pt-2.5">
                  <LiveScanLog lines={progress?.logs || []} streaming={isActive} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
