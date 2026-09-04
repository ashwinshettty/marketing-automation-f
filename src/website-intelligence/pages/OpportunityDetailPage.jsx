import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  FileSearch,
  FileText,
  Lightbulb,
  Mail,
  ScanSearch,
  Target,
  TrendingUp,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import ScreenshotImage from '../components/common/ScreenshotImage';
import { Button } from '@/components/ui/button';
import { Gauge } from '@/components/charts/gauge';
import AnimatedTabs from '@/components/smoothui/animated-tabs';
import AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';
import { rowItem, staggerContainer, stateSwapVariants } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { formatCapabilityName, formatPath, priorityLabel } from '../utils/formatters';
import { cn } from '@/lib/utils';
import { getPageScreenshotUrl } from '../utils/screenshots';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'detection', label: 'Detection' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'pages', label: 'Relevant pages' },
];

function SectionCard({ icon: Icon, title, description, children, className }) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <div className="flex items-start gap-2.5">
        {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="body-text mt-0.5">{description}</p>}
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ConfidencePanel({ confidence, pagesAnalyzed, evidenceCount }) {
  const pct = Math.round((confidence ?? 0) * 100);

  return (
    <div className="space-y-3">
      <Gauge
        value={pct}
        centerValue={pct}
        suffix="%"
        defaultLabel="Confidence"
        spacing={18}
        width={168}
        height={128}
        className="mx-auto"
      />
      <p className="body-text text-center sm:text-left">
        Based on {evidenceCount} evidence item{evidenceCount === 1 ? '' : 's'} collected across{' '}
        {pagesAnalyzed} crawled page{pagesAnalyzed === 1 ? '' : 's'}.
      </p>
    </div>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { audit } = useAudit();
  const [tab, setTab] = useState('overview');

  const opportunity = audit?.opportunities?.find((o) => o.serviceId === id);

  const relatedEvidence = (audit?.evidence || []).filter((e) => opportunity?.evidence?.includes(e.id));

  if (!audit) {
    return (
      <PageContainer>
        <EmptyState
          icon={Target}
          title="No website loaded"
          description="Load an analysis to inspect the opportunities it found."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      </PageContainer>
    );
  }

  if (!opportunity) {
    return (
      <PageContainer>
        <EmptyState
          icon={Target}
          title="Opportunity not found"
          description="This opportunity is not part of the analysis currently loaded in the console."
          actionLabel="Back to opportunities"
          actionTo="/website-intelligence/opportunities"
        />
      </PageContainer>
    );
  }

  const gaps = opportunity.missingPublicCapabilities || [];
  const unverified = opportunity.unverifiedCapabilities || [];
  const relatedPages = opportunity.relatedPages || [];
  const score = opportunity.score ?? 0;

  const generateEmail = () =>
    navigate('/website-intelligence/reports', { state: { opportunityIds: [opportunity.serviceId] } });

  return (
    <PageContainer wide className="min-w-0 overflow-x-clip">
      <Button variant="ghost" size="sm" className="-ml-2 mb-4" render={<Link to="/website-intelligence/opportunities" />}>
        <ArrowLeft />
        Opportunities
      </Button>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              {opportunity.fit && (
                <StatusBadge status={opportunity.fit} label={priorityLabel(opportunity.fit)} />
              )}
              {opportunity.category && <span className="meta-text">{opportunity.category}</span>}
            </div>
            <h1 className="page-title mt-2 break-words">{opportunity.serviceName}</h1>
            {gaps.length > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                <ScanSearch className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {gaps.length} capabilit{gaps.length === 1 ? 'y' : 'ies'} not detected in crawled pages
              </p>
            )}
          </header>

          <AnimatedTabs
            tabs={TABS}
            activeTab={tab}
            onChange={setTab}
            variant="underline"
            layoutId="opportunity-detail-tabs"
            className="mt-6 w-full max-w-full"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`opportunity-detail-tabs-tab-${tab}`}
              variants={stateSwapVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="mt-5 min-w-0 space-y-4"
            >
              {tab === 'overview' && (
                <>
                  <SectionCard
                    icon={Lightbulb}
                    title="Why this matters"
                    description="What the crawl observed and what it implies for this service."
                  >
                    <p className="body-text">
                      {opportunity.recommendation || 'No recommendation was generated for this service.'}
                    </p>
                  </SectionCard>

                  {opportunity.reasons?.length > 0 && (
                    <SectionCard
                      icon={TrendingUp}
                      title="Reasoning"
                      description="Each factor that contributed to the score."
                    >
                      <motion.ol
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="space-y-2.5"
                      >
                        {opportunity.reasons.map((reason, i) => (
                          <motion.li key={reason} variants={rowItem} className="flex gap-3">
                            <span className="mt-px shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <p className="body-text">{reason}</p>
                          </motion.li>
                        ))}
                      </motion.ol>
                    </SectionCard>
                  )}

                  <SectionCard
                    icon={Mail}
                    title="Recommended outreach"
                    description="Lead with the capabilities the crawl could not find, and cite the pages that were checked."
                  >
                    <Button size="sm" onClick={generateEmail}>
                      <Mail />
                      Generate outreach email
                    </Button>
                  </SectionCard>
                </>
              )}

              {tab === 'detection' && (
                <>
                  <SectionCard
                    icon={Target}
                    title="Not publicly detected"
                    description="Checked on the pages where these capabilities would normally appear and not found. Safe to reference in outreach."
                  >
                    {gaps.length === 0 ? (
                      <p className="body-text">
                        No capability gaps were confirmed for this service. The fit is based on other site signals.
                      </p>
                    ) : (
                      <ul className="flex flex-wrap gap-1.5">
                        {gaps.map((cap) => (
                          <li
                            key={cap}
                            className="rounded-md border border-brand/20 bg-brand-subtle px-2 py-0.5 text-xs font-medium text-brand"
                          >
                            {formatCapabilityName(cap)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </SectionCard>

                  {unverified.length > 0 && (
                    <SectionCard
                      icon={AlertCircle}
                      title="Could not verify — do not pitch as missing"
                      description="The crawl did not cover enough of the site to rule these out, so the client may already have them."
                    >
                      <ul className="space-y-2">
                        {unverified.map((item) => (
                          <li key={item.capability} className="text-sm">
                            <span className="font-medium">{formatCapabilityName(item.capability)}</span>
                            {item.reason && (
                              <span className="text-muted-foreground"> — {item.reason}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  )}
                </>
              )}

              {tab === 'evidence' && (
                <SectionCard
                  icon={FileSearch}
                  title="Supporting evidence"
                  description="Raw observations collected during the crawl that back this opportunity."
                >
                  {relatedEvidence.length === 0 ? (
                    <p className="body-text">No evidence items are linked to this opportunity.</p>
                  ) : (
                    <motion.ul
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="divide-y divide-border overflow-hidden rounded-lg border border-border"
                    >
                      {relatedEvidence.map((ev) => {
                        const page = audit.crawl?.pages?.find((p) => p.url === ev.pageUrl);
                        const screenshotSrc = page ? getPageScreenshotUrl(audit.auditId, page) : null;

                        return (
                          <motion.li key={ev.id} variants={rowItem} className="p-4">
                            <p className="font-mono text-xs text-muted-foreground">{formatPath(ev.pageUrl)}</p>
                            <p className="mt-1 text-sm">{ev.observedValue}</p>

                            {screenshotSrc && (
                              <div className="mt-3">
                                <ScreenshotImage
                                  src={screenshotSrc}
                                  alt={`Screenshot of ${formatPath(ev.pageUrl)}`}
                                  caption={formatPath(ev.pageUrl)}
                                  className="max-h-44 rounded-lg border border-border object-cover object-top transition-opacity hover:opacity-90"
                                  buttonClassName="cursor-zoom-in rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                                />
                              </div>
                            )}

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>Signal: {ev.normalizedValue || ev.type}</span>
                              <span>Confidence: {Math.round((ev.confidence ?? 0.5) * 100)}%</span>
                            </div>
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </SectionCard>
              )}

              {tab === 'pages' && (
                <SectionCard
                  icon={FileText}
                  title="Relevant pages"
                  description="Pages the crawler inspected while evaluating this service."
                >
                  {relatedPages.length === 0 ? (
                    <p className="body-text">No specific pages were linked to this opportunity.</p>
                  ) : (
                    <motion.ul
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      {relatedPages.map((page) => {
                        const screenshotSrc = getPageScreenshotUrl(audit.auditId, page);

                        return (
                          <motion.li
                            key={page.id}
                            variants={rowItem}
                            className="overflow-hidden rounded-xl border border-border bg-card"
                          >
                            {screenshotSrc ? (
                              <ScreenshotImage
                                src={screenshotSrc}
                                alt={`Screenshot of ${page.title}`}
                                caption={page.title}
                                className="h-32 w-full object-cover object-top transition-opacity hover:opacity-90"
                                buttonClassName="block w-full cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                              />
                            ) : (
                              <div className="flex h-32 items-center justify-center bg-muted text-xs text-muted-foreground">
                                No screenshot
                              </div>
                            )}
                            <div className="p-3">
                              <p className="truncate text-sm font-medium">{page.title}</p>
                              <a
                                href={page.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block truncate rounded font-mono text-xs text-muted-foreground outline-none hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/40"
                              >
                                {formatPath(page.url)}
                              </a>
                            </div>
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </SectionCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
            <div className="label-text">Opportunity score</div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-4xl leading-none font-semibold tracking-tight tabular-nums">{score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <AnimatedProgressBar
              value={Math.min(100, Math.max(0, score))}
              color="var(--brand)"
              className="mt-3"
            />
            {opportunity.fit && (
              <p className="meta-text mt-3">Potential value: {priorityLabel(opportunity.fit)}</p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
            <ConfidencePanel
              confidence={opportunity.confidence}
              pagesAnalyzed={audit.crawl?.pagesAnalyzed ?? 0}
              evidenceCount={relatedEvidence.length}
            />
          </div>

          <Button className="w-full" onClick={generateEmail}>
            <Mail />
            Generate outreach email
          </Button>
        </aside>
      </div>
    </PageContainer>
  );
}
