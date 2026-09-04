import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';

const LINE_CLASS = {
  dim: 'scan-line-dim',
  signal: 'scan-line-signal',
  risk: 'scan-line-risk',
};

const STICK_THRESHOLD = 48;

export default function LiveScanLog({ lines = [], streaming = false }) {
  const containerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  // Id of the line that arrived most recently, so only it plays the entrance
  // animation. Tracked in state because refs must not be read during render.
  const [enteringLineId, setEnteringLineId] = useState(null);

  const scrollToBottom = useCallback((behavior = 'auto') => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD;
    stickToBottomRef.current = nearBottom;
    setShowJumpToLatest(streaming && !nearBottom && lines.length > 0);
  }, [streaming, lines.length]);

  const jumpToLatest = useCallback(() => {
    stickToBottomRef.current = true;
    setShowJumpToLatest(false);
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  useEffect(() => {
    if (!streaming || !stickToBottomRef.current) return;
    scrollToBottom('auto');
  }, [lines, streaming, scrollToBottom]);

  useEffect(() => {
    setEnteringLineId(lines.length > 0 ? lines[lines.length - 1].id : null);
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="scan-log" ref={containerRef} role="log" aria-label="Live crawl activity">
        <div className="scan-line-dim">awaiting scan events…</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {showJumpToLatest && (
          <motion.button
            type="button"
            onClick={jumpToLatest}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-brand shadow-sm outline-none transition-colors hover:bg-brand-subtle focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ArrowDown className="size-3" aria-hidden="true" />
            Jump to latest
          </motion.button>
        )}
      </AnimatePresence>

      {/* The message above the log is the polite live region; announcing every
          log line would flood assistive technology. */}
      <div
        ref={containerRef}
        className="scan-log"
        onScroll={handleScroll}
        role="log"
        aria-live="off"
        tabIndex={0}
        aria-label="Live crawl activity"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`scan-log-line ${LINE_CLASS[line.type] || LINE_CLASS.dim} ${
              line.id === enteringLineId ? 'scan-log-line-new' : ''
            }`}
          >
            {line.time}  {line.message}
          </div>
        ))}
      </div>
    </div>
  );
}
