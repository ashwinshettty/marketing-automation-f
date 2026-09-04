import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Globe, Loader2, Menu, Search } from 'lucide-react';
import TopNavLinks from './TopNavLinks';
import { PRIMARY_NAV, SECONDARY_NAV, CATALOG_ICON } from './navigation';
import { useAudit } from '../../context/AuditContext';
import { formatDomain } from '../../utils/formatters';
import { Button } from '@/components/ui/button';
import { duration, easeOut } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function AppHeader({ catalogs = [], onOpenSearch, onOpenNav }) {
  const { audit, analyzing } = useAudit();
  const domain = audit?.website ? formatDomain(audit.website) : null;

  const catalogItems = (catalogs.length ? catalogs : [{ id: 'talecraftor', name: 'Catalog' }]).map(
    (catalog) => ({
      to: `/website-intelligence/catalog/${catalog.id}`,
      label: catalogs.length > 1 ? catalog.name : 'Catalog',
      icon: CATALOG_ICON,
    })
  );

  const secondaryItems = [...SECONDARY_NAV, ...catalogItems];

  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="flex h-14 items-stretch gap-3 px-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onOpenNav}
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu />
          </Button>

          <Link
            to="/website-intelligence"
            className="flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand-dark text-[11px] font-bold tracking-tight text-brand-foreground shadow-[0_2px_8px_rgba(51,102,204,0.35)]">
              WI
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-brand-dark sm:inline">
              Website Intelligence
            </span>
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <TopNavLinks
            items={PRIMARY_NAV}
            layoutGroup="primary-nav"
            underlineClassName="bg-highlight"
            compact
            className="h-full max-w-full"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              'hidden min-w-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 sm:flex',
              'max-w-[140px] md:max-w-[180px]'
            )}
            title={domain || 'No website loaded'}
          >
            <Globe className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <span className="truncate text-xs font-medium">{domain || 'No website'}</span>
            <AnimatePresence>
              {analyzing && (
                <motion.span
                  role="status"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: duration.normal, ease: easeOut }}
                  className="inline-flex shrink-0 text-brand"
                >
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSearch}
            className="shrink-0 text-muted-foreground"
          >
            <Search />
            <span className="sr-only sm:not-sr-only">Search</span>
            <kbd className="ml-1 hidden rounded border border-border px-1 font-sans text-[10px] leading-4 md:inline">
              ⌘K
            </kbd>
          </Button>
        </div>
      </div>

      <div className="hidden border-t border-border/80 bg-muted/25 lg:block">
        <div className="flex h-10 items-stretch px-5">
          <TopNavLinks
            items={secondaryItems}
            layoutGroup="secondary-nav"
            underlineClassName="bg-brand-dark"
            compact
            className="h-full"
          />
        </div>
      </div>
    </header>
  );
}
