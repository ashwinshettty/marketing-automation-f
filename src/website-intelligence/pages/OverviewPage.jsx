import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Radar, X } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import StatusLegend from '../components/common/StatusLegend';
import InsightHero from '../components/dashboard/InsightHero';
import PitchReadyGaps from '../components/dashboard/PitchReadyGaps';
import RecentCrawls from '../components/dashboard/RecentCrawls';
import RecentOutreach from '../components/dashboard/RecentOutreach';
import ClearSessionDialog from '../components/dashboard/ClearSessionDialog';
import FadeIn from '../components/motion/FadeIn';
import GettingStartedPanel from '../components/dashboard/GettingStartedPanel';
import OpportunityCard from '../components/opportunities/OpportunityCard';
import CapabilityGrid from '../components/ui/CapabilityGrid';
import { Button } from '@/components/ui/button';
import { staggerContainer } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { api } from '../api/client';
import { capabilityGroups } from '../utils/formatters';

function Section({ title, description, action, children, className }) {
  return (
    <section className={className}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {description && <p className="body-text mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function OverviewPage() {
  const { audit, auditHistory, loadAudit, clearAudit } = useAudit();
  const [emails, setEmails] = useState([]);
  const [clearSessionOpen, setClearSessionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!audit?.auditId) {
      setEmails([]);
      return undefined;
    }
    api
      .listOutreachEmails(audit.auditId)
      .then((res) => {
        if (!cancelled) setEmails(res.emails || []);
      })
      .catch(() => {
        if (!cancelled) setEmails([]);
      });
    return () => {
      cancelled = true;
    };
  }, [audit?.auditId]);

  const groups = capabilityGroups(audit?.capabilities || []);
  const opportunities = audit?.opportunities || [];
  const topOpportunities = [...opportunities].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
  const topScore = opportunities.length ? Math.max(...opportunities.map((o) => o.score ?? 0)) : 0;
  const detectedCount = groups.detected.length + groups.likely.length;
  const pitchReadyCount = groups.confirmedMissing.length;

  const hasOutreach = emails.length > 0;

  const evidenceCountFor = (opportunity) =>
    (opportunity.evidence || []).length;

  return (
    <PageContainer wide>
      <PageHeader
        title="Dashboard"
        description="Evidence-driven view of every website analyzed and the opportunities found."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {audit && (
              <Button variant="outline" onClick={() => setClearSessionOpen(true)}>
                <X />
                Clear session
              </Button>
            )}
            <Button render={<Link to="/website-intelligence/analyze" />}>
              <Radar />
              Analyze a website
            </Button>
          </div>
        }
      />

      {!audit ? (
        <FadeIn y={8}>
          <GettingStartedPanel
            hasHistory={auditHistory.length > 0}
            hasAudit={false}
            hasOpportunities={false}
            hasOutreach={hasOutreach}
          />
        </FadeIn>
      ) : (
        <FadeIn className="mt-8 space-y-10" y={12}>
          <InsightHero
            audit={audit}
            detectedCount={detectedCount}
            pitchReadyCount={pitchReadyCount}
            topScore={topScore}
          />

          <Section
            title="High-value opportunities"
            description="Highest-scoring services matched against capabilities that were not publicly detected."
            action={
              opportunities.length > 0 && (
                <Link
                  to="/website-intelligence/opportunities"
                  className="inline-flex items-center gap-1 rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  View all {opportunities.length}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              )
            }
          >
            {topOpportunities.length === 0 ? (
              <p className="body-text rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
                No opportunities were scored for this website.
              </p>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                {topOpportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.serviceId}
                    opportunity={opp}
                    evidenceCount={evidenceCountFor(opp)}
                  />
                ))}
              </motion.div>
            )}
          </Section>

          <Section
            title="Capability map"
            description="What the crawl found on the site versus what it could not detect."
            action={<StatusLegend />}
          >
            <CapabilityGrid capabilities={audit.capabilities || []} />
            <Link
              to="/website-intelligence/capabilities"
              className="mt-3 inline-flex items-center gap-1 rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              Full capability breakdown
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Section>

          <Section
            title="Gaps you can pitch"
            description="Capabilities actively checked on the pages where they would normally appear."
          >
            <PitchReadyGaps gaps={groups.confirmedMissing} />
          </Section>

          <div className="grid gap-8 lg:grid-cols-2">
            <Section
              title="Recent crawls"
              description="Reopen any previous analysis."
              action={
                <Link
                  to="/website-intelligence/websites"
                  className="rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  All websites
                </Link>
              }
            >
              <RecentCrawls
                crawls={auditHistory}
                activeAuditId={audit.auditId}
                onOpen={loadAudit}
              />
            </Section>

            <Section
              title="Recent outreach"
              description="Emails generated from this website's opportunities."
              action={
                <Link
                  to="/website-intelligence/emails"
                  className="rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  Email history
                </Link>
              }
            >
              <RecentOutreach emails={emails} />
            </Section>
          </div>
        </FadeIn>
      )}

      <ClearSessionDialog
        open={clearSessionOpen}
        onClose={() => setClearSessionOpen(false)}
        onConfirm={clearAudit}
        website={audit?.website}
      />
    </PageContainer>
  );
}
