import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import EmailStatusBadge from '../email/EmailStatusBadge';
import { rowItem, staggerContainer } from '@/lib/motion';
import { formatDate } from '../../utils/formatters';

export default function RecentOutreach({ emails = [], limit = 4 }) {
  const items = emails.slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
        <p className="body-text">No outreach emails yet for this website.</p>
        <Link
          to="/website-intelligence/reports"
          className="mt-2 inline-block rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          Generate the first outreach email
        </Link>
      </div>
    );
  }

  return (
    <motion.ul
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    >
      {items.map((email) => (
        <motion.li key={email.id} variants={rowItem}>
          <Link
            to={`/website-intelligence/emails?emailId=${email.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Mail className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{email.subject || 'Untitled draft'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {email.recipient?.email || 'No recipient'}
              </p>
            </div>

            <EmailStatusBadge status={email.status} />
            <span className="meta-text hidden whitespace-nowrap sm:inline">
              {formatDate(email.sentAt || email.updatedAt || email.createdAt)}
            </span>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
