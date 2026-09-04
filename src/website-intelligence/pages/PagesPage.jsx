import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpDown, FileText } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import ScreenshotImage from '../components/common/ScreenshotImage';
import { rowItem, staggerContainer } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { formatPagePath, getPagePriority } from '../utils/pagePriority';
import { getPageScreenshotUrl } from '../utils/screenshots';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { id: 'title', label: 'Page' },
  { id: 'priority', label: 'Priority' },
  { id: 'status', label: 'Status' },
];

function SortButton({ id, label, sortBy, onSort }) {
  const active = sortBy === id;
  return (
    <button
      type="button"
      onClick={() => onSort(id)}
      aria-sort={active ? 'descending' : 'none'}
      className={cn(
        'inline-flex items-center gap-1 rounded outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40',
        active ? 'text-foreground' : 'hover:text-foreground'
      )}
    >
      {label}
      <ArrowUpDown className={cn('size-3', active ? 'opacity-100' : 'opacity-40')} aria-hidden="true" />
    </button>
  );
}

export default function PagesPage() {
  const { audit } = useAudit();
  const pages = audit?.crawl?.pages;
  const [sortBy, setSortBy] = useState('priority');

  const sortedPages = useMemo(() => {
    const withMeta = (pages || []).map((page) => ({ ...page, priority: getPagePriority(page.url) }));
    return withMeta.sort((a, b) => {
      if (sortBy === 'status') return String(a.status).localeCompare(String(b.status));
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return b.priority.score - a.priority.score;
    });
  }, [pages, sortBy]);

  return (
    <PageContainer wide>
      <PageHeader
        title="Crawled pages"
        description="Every URL the crawler visited, with its priority tier and the screenshot captured."
      />

      {!audit ? (
        <EmptyState
          icon={FileText}
          title="No pages crawled yet"
          description="The crawler records every page it visits along with a screenshot, so you can verify what the analysis was based on."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      ) : !pages?.length ? (
        <EmptyState
          icon={FileText}
          title="Page details are unavailable"
          description="This analysis was saved without per-page detail. Run a new analysis to capture page titles, URLs and screenshots."
          actionLabel="Run a new analysis"
          actionTo="/website-intelligence/analyze"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span>
              Discovered <strong className="text-foreground tabular-nums">{audit.crawl?.pagesDiscovered ?? 0}</strong>
            </span>
            <span>
              Analyzed <strong className="text-foreground tabular-nums">{audit.crawl?.pagesAnalyzed ?? 0}</strong>
            </span>
            <span>
              Failed <strong className="text-foreground tabular-nums">{audit.crawl?.pagesFailed ?? 0}</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col" className="w-28">
                    Screenshot
                  </th>
                  <th scope="col">
                    <SortButton {...COLUMNS[0]} sortBy={sortBy} onSort={setSortBy} />
                  </th>
                  <th scope="col">URL</th>
                  <th scope="col">
                    <SortButton {...COLUMNS[1]} sortBy={sortBy} onSort={setSortBy} />
                  </th>
                  <th scope="col">
                    <SortButton {...COLUMNS[2]} sortBy={sortBy} onSort={setSortBy} />
                  </th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                {sortedPages.map((page) => {
                  const screenshotSrc = getPageScreenshotUrl(audit.auditId, page);

                  return (
                    <motion.tr key={page.id || page.url} variants={rowItem}>
                      <td>
                        {screenshotSrc ? (
                          <ScreenshotImage
                            src={screenshotSrc}
                            alt={`Screenshot of ${page.title}`}
                            caption={page.title}
                            className="h-14 w-24 rounded-lg border border-border object-cover object-top transition-opacity hover:opacity-90"
                            buttonClassName="cursor-zoom-in rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                          />
                        ) : (
                          <span className="meta-text">—</span>
                        )}
                      </td>
                      <td className="max-w-[240px] truncate font-medium">{page.title}</td>
                      <td className="max-w-[280px] truncate">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded font-mono text-xs text-muted-foreground outline-none hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/40"
                        >
                          {formatPagePath(page.url)}
                        </a>
                      </td>
                      <td className="meta-text capitalize">{page.priority.label}</td>
                      <td>
                        <StatusBadge status={page.status === 'analyzed' ? 'analyzed' : 'failed'} />
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </>
      )}
    </PageContainer>
  );
}
