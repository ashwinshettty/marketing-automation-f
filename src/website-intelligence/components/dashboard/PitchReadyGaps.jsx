import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Target } from 'lucide-react';
import StatusIcon from '../common/StatusIcon';
import { rowItem, staggerContainer } from '@/lib/motion';

export default function PitchReadyGaps({ gaps = [] }) {
  if (!gaps.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success-subtle px-5 py-4">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="text-sm font-medium">Nothing confirmed as missing</p>
          <p className="body-text mt-1">
            Either the site already exposes the capabilities you offer, or the crawl could not cover enough pages
            to rule them out.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand/20 bg-brand-subtle px-5 py-4">
      <div className="flex items-start gap-3">
        <Target className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">
            {gaps.length} capabilit{gaps.length === 1 ? 'y' : 'ies'} not publicly detected
          </h3>
          <p className="body-text mt-1">
            Each was checked on the pages where it would normally appear and was not found, so it is safe to
            reference in outreach.
          </p>

          <motion.ul
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2"
          >
            {gaps.slice(0, 6).map((cap) => (
              <motion.li
                key={cap.id || cap.capability}
                variants={rowItem}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <StatusIcon kind="confirmed_missing" className="size-3.5!" />
                <span className="truncate">{cap.name || cap.capability}</span>
              </motion.li>
            ))}
          </motion.ul>

          {gaps.length > 6 && (
            <p className="meta-text mt-2">+{gaps.length - 6} more on the Capabilities page</p>
          )}

          <Link
            to="/website-intelligence/capabilities"
            className="mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Review all capabilities
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
