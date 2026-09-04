import { Mail } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import OutreachEmailWorkflow from '../components/email/OutreachEmailWorkflow';
import { useAudit } from '../context/AuditContext';
import { formatDomain } from '../utils/formatters';

function SummaryItem({ label, value }) {
  return (
    <div className="px-4 py-3">
      <dt className="meta-text">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function ReportsPage() {
  const { audit } = useAudit();

  return (
    <PageContainer wide>
      <PageHeader
        title="Outreach"
        description="Turn verified findings into a personalized email that stays traceable to its evidence."
      />

      {!audit ? (
        <EmptyState
          icon={Mail}
          title="No website loaded"
          description="Outreach is generated from a website's opportunities, so analyze a site first. Every claim in the draft is tied back to what the crawl observed."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      ) : (
        <>
          <dl className="mb-6 grid divide-y divide-border overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <SummaryItem label="Website" value={formatDomain(audit.website)} />
            <SummaryItem label="Company" value={audit.company?.name || '—'} />
            <SummaryItem label="Opportunities" value={audit.opportunities?.length ?? 0} />
            <SummaryItem label="Pages analyzed" value={audit.crawl?.pagesAnalyzed ?? 0} />
          </dl>

          <OutreachEmailWorkflow audit={audit} />
        </>
      )}
    </PageContainer>
  );
}
