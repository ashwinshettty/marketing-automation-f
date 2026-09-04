import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, FileText, Globe, Shield, Target } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { duration, easeOut } from '@/lib/motion';
import { formatDate, formatDomain } from '../../utils/formatters';

function Stat({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className={`size-4 shrink-0 ${accent}`} strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-lg leading-tight font-semibold tabular-nums">{value}</div>
        <div className="meta-text truncate">{label}</div>
      </div>
    </div>
  );
}

/**
 * Summary of the website currently loaded into the console.
 */
export default function InsightHero({ audit, detectedCount, pitchReadyCount, topScore }) {
  const { company, metadata } = audit;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.panel, ease: easeOut }}
      className="relative overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="current-website-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-brand-dark to-highlight"
      />
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative border-b border-border px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="truncate font-mono">{formatDomain(audit.website)}</span>
            </div>

            <h2 id="current-website-heading" className="mt-1.5 text-lg font-semibold tracking-tight">
              {company?.name || formatDomain(audit.website)}
            </h2>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {company?.industry && <StatusBadge status="info" label={company.industry} tone="brand" />}
              {company?.businessType && (
                <StatusBadge status="likely" label={company.businessType} tone="neutral" />
              )}
            </div>

            {company?.description && (
              <p className="body-text mt-3 line-clamp-2 max-w-xl">{company.description}</p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <div className="label-text">Top opportunity score</div>
            <div className="mt-1 text-3xl leading-none font-semibold tracking-tight tabular-nums text-brand-dark">
              {topScore}
            </div>
            <p className="meta-text mt-1.5">Analyzed {formatDate(metadata?.completedAt)}</p>
            <Link
              to="/website-intelligence/opportunities"
              className="mt-2 inline-flex items-center gap-1 rounded text-xs font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              View opportunities
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat
          icon={Shield}
          value={detectedCount}
          label="Capabilities detected"
          accent="text-success"
        />
        <Stat
          icon={Target}
          value={pitchReadyCount}
          label="Gaps not publicly detected"
          accent="text-brand"
        />
        <Stat
          icon={FileText}
          value={audit.crawl?.pagesAnalyzed ?? 0}
          label="Pages analyzed"
          accent="text-muted-foreground"
        />
      </div>
    </motion.section>
  );
}
