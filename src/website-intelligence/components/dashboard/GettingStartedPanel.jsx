import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Radar } from 'lucide-react';
import { OnboardingChecklist } from '@/components/ui/onboarding-checklist';
import { Button } from '@/components/ui/button';
import { duration, easeOut } from '@/lib/motion';

/**
 * Premium empty-dashboard composition built on Watermelon UI's onboarding
 * checklist. Completion is derived from real session state — never mocked.
 */
export default function GettingStartedPanel({
  hasHistory = false,
  hasAudit = false,
  hasOpportunities = false,
  hasOutreach = false,
}) {
  const navigate = useNavigate();

  const steps = useMemo(
    () => [
      {
        id: 1,
        title: 'Analyze a website',
        isCompleted: hasHistory || hasAudit,
        href: '/website-intelligence/analyze',
      },
      {
        id: 2,
        title: 'Review opportunities',
        isCompleted: hasOpportunities,
        href: '/website-intelligence/opportunities',
      },
      {
        id: 3,
        title: 'Generate outreach email',
        isCompleted: hasOutreach,
        href: '/website-intelligence/reports',
      },
      {
        id: 4,
        title: 'Open a saved draft',
        isCompleted: hasOutreach,
        href: '/website-intelligence/emails',
      },
    ],
    [hasHistory, hasAudit, hasOpportunities, hasOutreach]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.panel, ease: easeOut }}
      className="mt-6 grid gap-6 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
    >
      <div className="relative flex flex-col justify-center px-6 py-10 sm:px-8">
        <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
            <Radar className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">Evidence-driven website intelligence</h3>
          <p className="body-text mt-2 max-w-md">
            Crawl a public site, map the services it already offers, and turn verified gaps into
            professional outreach — without guessing.
          </p>
          <p className="meta-text mt-3">A typical crawl takes two to four minutes.</p>
          <div className="mt-6">
            <Button render={<Link to="/website-intelligence/analyze" />}>Analyze a website</Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center border-t border-border bg-muted/30 px-5 py-8 lg:border-t-0 lg:border-l">
        <OnboardingChecklist
          title="Getting started"
          defaultExpanded
          steps={steps}
          onStepClick={(step) => step.href && navigate(step.href)}
        />
      </div>
    </motion.div>
  );
}
