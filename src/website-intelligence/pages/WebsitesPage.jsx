import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, Radar, Search, Trash2 } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { RowSkeleton } from '../components/common/LoadingState';
import StatusBadge from '../components/common/StatusBadge';
import DeleteWebsiteDialog from '../components/websites/DeleteWebsiteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { rowItem, staggerContainer } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { formatDate, formatDomain } from '../utils/formatters';
import { cn } from '@/lib/utils';

export default function WebsitesPage() {
  const navigate = useNavigate();
  const { audit, auditHistory, loading, refreshHistory, loadAudit, deleteAudit } = useAudit();
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auditHistory;
    return auditHistory.filter(
      (item) =>
        item.website?.toLowerCase().includes(q) || item.companyName?.toLowerCase().includes(q)
    );
  }, [auditHistory, query]);

  const open = async (auditId) => {
    await loadAudit(auditId);
    navigate('/website-intelligence');
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAudit(pendingDelete.auditId);
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Websites"
        description="Every website you have analyzed. Open one to load its intelligence into the console."
        actions={
          <Button render={<Link to="/website-intelligence/analyze" />}>
            <Radar />
            Analyze a website
          </Button>
        }
      />

      {deleteError && (
        <ErrorState
          className="mb-4"
          title="Could not delete this analysis"
          description="The server was unable to remove the website and its screenshots."
          message={deleteError}
          onRetry={confirmDelete}
          retryLabel="Try again"
        />
      )}

      {loading && auditHistory.length === 0 ? (
        <RowSkeleton />
      ) : auditHistory.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No websites analyzed yet"
          description="Each analysis crawls a site's public pages, detects the services it already offers and scores the gaps you can pitch against."
          hint="You only need a URL to start."
          actionLabel="Analyze your first website"
          actionTo="/website-intelligence/analyze"
        />
      ) : (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by domain or company"
              aria-label="Filter websites"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="body-text rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center">
              No websites match “{query}”.
            </p>
          ) : (
            <motion.ul
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
            >
              {filtered.map((item) => {
                const isActive = audit?.auditId === item.auditId;

                return (
                  <motion.li
                    key={item.auditId}
                    variants={rowItem}
                    className={cn(
                      'flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-muted/50',
                      isActive && 'bg-brand-subtle/50'
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                      <Globe className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.companyName || formatDomain(item.website)}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{item.website}</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium tabular-nums">{item.opportunityCount ?? 0}</div>
                        <div className="meta-text">opportunities</div>
                      </div>
                      {item.topScore != null && (
                        <div className="hidden text-right sm:block">
                          <div className="text-sm font-medium tabular-nums">{item.topScore}</div>
                          <div className="meta-text">top score</div>
                        </div>
                      )}
                      <StatusBadge status={item.status} />
                      <span className="meta-text hidden whitespace-nowrap lg:inline">
                        {formatDate(item.completedAt || item.createdAt)}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => open(item.auditId)}>
                        {isActive ? 'Current' : 'Open'}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-muted-foreground hover:bg-destructive-subtle hover:text-destructive"
                        aria-label={`Delete analysis for ${item.companyName || formatDomain(item.website)}`}
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(item);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </>
      )}

      <DeleteWebsiteDialog
        open={!!pendingDelete}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
        deleting={deleting}
        website={pendingDelete?.website}
        companyName={pendingDelete?.companyName}
      />
    </PageContainer>
  );
}
