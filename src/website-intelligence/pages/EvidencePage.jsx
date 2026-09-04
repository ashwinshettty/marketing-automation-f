import { motion } from 'motion/react';
import { FileSearch } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import { rowItem, staggerContainer } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import {
  formatEvidenceValue,
  formatPageLabel,
  getEvidenceSummary,
  groupEvidenceByKind,
} from '../utils/evidenceDisplay';

export default function EvidencePage() {
  const { audit } = useAudit();
  const evidence = audit?.evidence || [];
  const summary = getEvidenceSummary(evidence);
  const groups = groupEvidenceByKind(evidence);

  return (
    <PageContainer wide>
      <PageHeader
        title="Evidence"
        description="Every observation the crawl recorded, linked back to the page it came from."
      />

      {!audit ? (
        <EmptyState
          icon={FileSearch}
          title="No evidence collected yet"
          description="Evidence is what makes an opportunity defensible — each finding is tied to the page where it was observed."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      ) : evidence.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No evidence was collected"
          description="The crawl finished without recording any observations. This usually means very few pages could be reached."
          actionLabel="Run a new analysis"
          actionTo="/website-intelligence/analyze"
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            <span>
              <strong className="tabular-nums">{summary.total}</strong>{' '}
              <span className="text-muted-foreground">findings</span>
            </span>
            <span>
              <strong className="tabular-nums">{summary.pages}</strong>{' '}
              <span className="text-muted-foreground">pages</span>
            </span>
          </div>

          <div className="space-y-8">
            {groups.map(({ key, items, meta }) => (
              <section key={key}>
                <h2 className="section-title">
                  {meta.label}
                  <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
                    ({items.length})
                  </span>
                </h2>
                <p className="body-text mt-0.5">{meta.hint}</p>

                <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Finding</th>
                        <th scope="col" className="text-right">
                          Source page
                        </th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerContainer} initial="initial" animate="animate">
                      {items.map((item) => (
                        <motion.tr key={item.id} variants={rowItem}>
                          <td>{formatEvidenceValue(item)}</td>
                          <td className="text-right">
                            {item.pageUrl ? (
                              <a
                                href={item.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded font-mono text-xs text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                              >
                                {formatPageLabel(item.pageUrl)}
                              </a>
                            ) : (
                              <span className="meta-text">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
