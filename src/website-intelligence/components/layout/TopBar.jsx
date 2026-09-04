import { Globe, Loader2, Menu, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAudit } from '../../context/AuditContext';
import { formatDomain } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { duration, easeOut } from '@/lib/motion';

export default function TopBar({ onOpenSearch, onOpenNav }) {
  const { audit, analyzing } = useAudit();
  const domain = audit?.website ? formatDomain(audit.website) : null;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenNav}
        className="lg:hidden"
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {domain ? (
          <>
            <Globe className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="truncate text-sm font-medium">{domain}</span>
            <AnimatePresence>
              {analyzing && (
                <motion.span
                  role="status"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: duration.normal, ease: easeOut }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand"
                >
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  Analyzing
                </motion.span>
              )}
            </AnimatePresence>
          </>
        ) : (
          <span className="truncate text-sm text-muted-foreground">No website loaded</span>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={onOpenSearch} className="text-muted-foreground">
        <Search />
        <span className="sr-only sm:not-sr-only">Search</span>
        <kbd className="ml-1 hidden rounded border border-border px-1 font-sans text-[10px] leading-4 sm:inline">
          ⌘K
        </kbd>
      </Button>
    </header>
  );
}
