import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, FileText, Mail, Phone, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { capabilityGroups, formatDomain } from '../../utils/formatters';

function ResultTile({ icon: Icon, value, label, accent = 'text-muted-foreground' }) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-xl border border-border bg-card px-4 py-3.5"
    >
      <div className="flex items-center gap-2">
        <Icon className={`size-4 shrink-0 ${accent}`} strokeWidth={1.75} aria-hidden="true" />
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{value}</div>
    </motion.div>
  );
}

/**
 * Completion summary shown in place of the progress panel once the crawl
 * finishes, so the user sees the outcome before navigating away.
 */
export default function AnalysisComplete({ audit, onAnalyzeAnother }) {
  if (!audit) return null;

  const groups = capabilityGroups(audit.capabilities || []);
  const detectedCount = groups.detected.length + groups.likely.length;
  const opportunityCount = audit.opportunities?.length ?? 0;

  const emails = audit.company?.contact?.emails || audit.contact?.emails || [];
  const phones = audit.company?.contact?.phones || audit.contact?.phones || [];
  const contactCount = emails.length + phones.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
      className="rounded-xl border border-border bg-card p-5"
      aria-labelledby="analysis-complete-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-subtle text-success">
          <CheckCircle2 className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="analysis-complete-heading" className="text-sm font-semibold">
            Analysis complete
          </h2>
          <p className="body-text mt-0.5 truncate">
            {formatDomain(audit.website)} has been crawled and scored against your service catalog.
          </p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <ResultTile icon={FileText} value={audit.crawl?.pagesAnalyzed ?? 0} label="Pages analyzed" />
        <ResultTile
          icon={Shield}
          value={detectedCount}
          label="Services detected"
          accent="text-success"
        />
        <ResultTile
          icon={Target}
          value={opportunityCount}
          label="Opportunities found"
          accent="text-brand"
        />
        <ResultTile icon={Mail} value={contactCount} label="Public contacts" />
      </motion.div>

      {contactCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          {emails.slice(0, 2).map((email) => (
            <span key={email} className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-mono">{email}</span>
            </span>
          ))}
          {phones.slice(0, 2).map((phone) => (
            <span key={phone} className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-mono">{phone}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button render={<Link to="/website-intelligence/opportunities" />}>
          <Target />
          View opportunities
        </Button>
        <Button variant="outline" render={<Link to="/website-intelligence" />}>
          Open dashboard
        </Button>
        <Button variant="ghost" onClick={onAnalyzeAnother}>
          Analyze another website
        </Button>
      </div>
    </motion.section>
  );
}
