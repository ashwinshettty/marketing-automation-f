import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { Button } from '@/components/ui/button';
import { rowItem, staggerContainer } from '@/lib/motion';
import { formatDate, formatDomain } from '../../utils/formatters';
import { cn } from '@/lib/utils';

export default function RecentCrawls({ crawls = [], activeAuditId, onOpen, limit = 5 }) {
  const navigate = useNavigate();
  const items = crawls.slice(0, limit);

  const open = async (auditId) => {
    await onOpen?.(auditId);
    navigate('/website-intelligence');
  };

  if (items.length === 0) {
    return (
      <p className="body-text rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
        No crawls yet. Analyze a website to populate this list.
      </p>
    );
  }

  return (
    <motion.ul
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
    >
      {items.map((item) => {
        const isActive = item.auditId === activeAuditId;

        return (
          <motion.li
            key={item.auditId}
            variants={rowItem}
            className={cn(
              'flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-muted/50',
              isActive && 'bg-brand-subtle/50'
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Globe className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.companyName || formatDomain(item.website)}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">{item.website}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium tabular-nums">{item.opportunityCount ?? 0}</div>
                <div className="meta-text">opportunities</div>
              </div>
              <StatusBadge status={item.status} />
              <span className="meta-text hidden whitespace-nowrap md:inline">
                {formatDate(item.completedAt || item.createdAt)}
              </span>
              <Button size="sm" variant="outline" onClick={() => open(item.auditId)}>
                {isActive ? 'Current' : 'Open'}
              </Button>
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
