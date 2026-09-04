import { motion } from 'motion/react';
import EmailStatusBadge from './EmailStatusBadge';
import { rowItem, staggerContainer } from '@/lib/motion';
import { formatDate } from '../../utils/formatters';
import { cn } from '@/lib/utils';

export default function EmailHistory({ emails = [], onSelect, activeEmailId, title = 'Email activity' }) {
  if (!emails.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="body-text mt-1">No outreach emails yet for this analysis.</p>
      </div>
    );
  }

  const selectable = typeof onSelect === 'function';
  const draftCount = emails.filter((email) => email.status === 'draft').length;
  const sentCount = emails.filter((email) => email.status === 'sent').length;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="border-b border-border px-4 py-3">
        <h3 className="card-title">{title}</h3>
        <p className="meta-text mt-0.5">
          {emails.length} email{emails.length === 1 ? '' : 's'}
          {draftCount > 0 ? ` · ${draftCount} draft${draftCount === 1 ? '' : 's'}` : ''}
          {sentCount > 0 ? ` · ${sentCount} sent` : ''}
          {selectable ? ' · click to open' : ''}
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Recipient</th>
              <th scope="col">Subject</th>
              <th scope="col">Status</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
            {emails.map((email) => (
              <motion.tr
                key={email.id}
                variants={rowItem}
                className={cn(
                  selectable && 'cursor-pointer',
                  activeEmailId === email.id && 'bg-brand-subtle/60'
                )}
                onClick={selectable ? () => onSelect(email) : undefined}
                tabIndex={selectable ? 0 : undefined}
                role={selectable ? 'button' : undefined}
                onKeyDown={
                  selectable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(email);
                        }
                      }
                    : undefined
                }
              >
                <td className="max-w-[220px] truncate font-mono text-xs">
                  {email.recipient?.email || '—'}
                </td>
                <td className="max-w-[280px] truncate font-medium">{email.subject}</td>
                <td>
                  <EmailStatusBadge status={email.status} />
                </td>
                <td className="meta-text whitespace-nowrap">
                  {formatDate(email.sentAt || email.updatedAt || email.createdAt)}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </section>
  );
}
