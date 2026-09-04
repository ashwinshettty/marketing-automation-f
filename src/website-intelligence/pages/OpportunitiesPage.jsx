import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SlidersHorizontal, Target } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import OpportunityCard from '../components/opportunities/OpportunityCard';
import EmptyState from '../components/common/EmptyState';
import StatusLegend from '../components/common/StatusLegend';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import SearchableDropdown from '@/components/smoothui/searchable-dropdown';
import Pagination from '@/components/smoothui/pagination';
import { staggerContainer } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { formatCapabilityName } from '../utils/formatters';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { id: 'score-desc', label: 'Highest score' },
  { id: 'score-asc', label: 'Lowest score' },
  { id: 'gaps-desc', label: 'Most undetected capabilities' },
  { id: 'name-asc', label: 'Name A–Z' },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High priority' },
  { id: 'medium', label: 'Medium' },
  { id: 'gaps', label: 'Has undetected capabilities' },
];

function FilterControls({ filter, onFilterChange, sort, onSortChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Filter opportunities" className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => onFilterChange(f.id)}
            className={cn(
              'rounded-lg border px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40',
              filter === f.id
                ? 'border-foreground/15 bg-foreground text-background'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <span className="meta-text shrink-0">Sort by</span>
        <SearchableDropdown
          className="w-[min(100%,220px)]"
          label="Sort by"
          placeholder="Search sort options…"
          emptyMessage="No sort options"
          items={SORT_OPTIONS}
          value={sort}
          onChange={(item) => onSortChange(String(item.id))}
        />
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { audit } = useAudit();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('score-desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const opportunities = useMemo(() => {
    let list = [...(audit?.opportunities || [])];

    if (filter === 'high') {
      list = list.filter((o) => o.fit === 'very_high' || o.fit === 'high');
    } else if (filter === 'medium') {
      list = list.filter((o) => o.fit === 'medium');
    } else if (filter === 'gaps') {
      list = list.filter((o) => (o.missingPublicCapabilities?.length ?? 0) > 0);
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'score-asc':
          return (a.score ?? 0) - (b.score ?? 0);
        case 'gaps-desc':
          return (b.missingPublicCapabilities?.length ?? 0) - (a.missingPublicCapabilities?.length ?? 0);
        case 'name-asc':
          return (a.serviceName || '').localeCompare(b.serviceName || '');
        default:
          return (b.score ?? 0) - (a.score ?? 0);
      }
    });

    return list;
  }, [audit, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(opportunities.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [filter, sort, audit?.auditId]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return opportunities.slice(start, start + PAGE_SIZE);
  }, [opportunities, page]);

  const rangeStart = opportunities.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, opportunities.length);

  const withGapsCount = useMemo(
    () => (audit?.opportunities || []).filter((o) => (o.missingPublicCapabilities?.length ?? 0) > 0).length,
    [audit]
  );

  const allGaps = useMemo(() => {
    const set = new Set();
    (audit?.opportunities || []).forEach((o) => {
      (o.missingPublicCapabilities || []).forEach((g) => set.add(g));
    });
    return [...set];
  }, [audit]);

  const handleFilterChange = (next) => {
    setFilter(next);
    setPage(1);
  };

  const handleSortChange = (next) => {
    setSort(next);
    setPage(1);
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Opportunities"
        description="Catalog services ranked by fit, supporting evidence and capabilities that were not publicly detected."
        actions={<StatusLegend className="hidden md:flex" />}
      />

      {!audit ? (
        <EmptyState
          icon={Target}
          title="No opportunities yet"
          description="Opportunities appear once a website has been crawled and its public capabilities scored against your service catalog."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      ) : (
        <>
          {allGaps.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md border border-brand/20 bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand">
                {withGapsCount} with undetected capabilities
              </span>
              {allGaps.slice(0, 5).map((gap) => (
                <span
                  key={gap}
                  className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {formatCapabilityName(gap)}
                </span>
              ))}
              {allGaps.length > 5 && <span className="meta-text">+{allGaps.length - 5} more</span>}
            </div>
          )}

          <div className="mb-5 hidden sm:block">
            <FilterControls
              filter={filter}
              onFilterChange={handleFilterChange}
              sort={sort}
              onSortChange={handleSortChange}
            />
          </div>

          <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal />
              Filter &amp; sort
            </Button>
            <span className="meta-text tabular-nums">
              {opportunities.length === 0
                ? `0 of ${audit.opportunities?.length ?? 0}`
                : `${rangeStart}–${rangeEnd} of ${opportunities.length}`}
            </span>
          </div>

          <div className="mb-4 hidden items-center justify-between gap-3 sm:flex">
            <p className="meta-text tabular-nums">
              {opportunities.length === 0
                ? 'No matching opportunities'
                : `Showing ${rangeStart}–${rangeEnd} of ${opportunities.length}`}
            </p>
          </div>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader className="px-0 pt-0">
                <SheetTitle>Filter &amp; sort</SheetTitle>
                <SheetDescription>Narrow the opportunity list.</SheetDescription>
              </SheetHeader>
              <FilterControls
                filter={filter}
                onFilterChange={handleFilterChange}
                sort={sort}
                onSortChange={handleSortChange}
              />
              <Button className="mt-2 w-full" onClick={() => setFiltersOpen(false)}>
                Show {opportunities.length} result{opportunities.length === 1 ? '' : 's'}
              </Button>
            </SheetContent>
          </Sheet>

          <AnimatePresence mode="wait">
            {opportunities.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="body-text rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center"
              >
                No opportunities match this filter. Try “All” to see every scored service.
              </motion.p>
            ) : (
              <motion.div
                key={`${filter}-${sort}-${page}`}
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid items-stretch gap-4 xl:grid-cols-2"
              >
                {pageItems.map((opp) => (
                  <OpportunityCard
                    key={opp.serviceId}
                    opportunity={opp}
                    evidenceCount={(opp.evidence || []).length}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {opportunities.length > PAGE_SIZE && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} siblings={1} />
              <p className="meta-text tabular-nums">
                Page {page} of {totalPages}
              </p>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
