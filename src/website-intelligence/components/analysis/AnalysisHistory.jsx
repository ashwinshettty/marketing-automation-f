import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import RecentCrawls from '../dashboard/RecentCrawls';
import { RowSkeleton } from '../common/LoadingState';
import { useAudit } from '../../context/AuditContext';

export default function AnalysisHistory({ limit = 5 }) {
  const { audit, auditHistory, loading, refreshHistory, loadAudit } = useAudit();

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  if (loading && auditHistory.length === 0) {
    return <RowSkeleton count={3} />;
  }

  if (auditHistory.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center">
        <History className="mx-auto size-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
        <p className="mt-3 text-sm font-medium">No previous analyses</p>
        <p className="body-text mt-1">Websites you analyze will appear here so you can reopen them anytime.</p>
      </div>
    );
  }

  return (
    <>
      <RecentCrawls
        crawls={auditHistory}
        activeAuditId={audit?.auditId}
        onOpen={loadAudit}
        limit={limit}
      />
      {auditHistory.length > limit && (
        <Link
          to="/website-intelligence/websites"
          className="mt-3 inline-block rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          View all {auditHistory.length} websites
        </Link>
      )}
    </>
  );
}
