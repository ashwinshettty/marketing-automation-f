import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import StatusLegend from '../components/common/StatusLegend';
import StatusIcon, { capabilityStatusKind } from '../components/common/StatusIcon';
import CapabilityEvidenceScreenshots from '../components/capabilities/CapabilityEvidenceScreenshots';
import AnimatedTabs from '@/components/smoothui/animated-tabs';
import { rowItem, staggerContainer } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { capabilityGroups, capabilityVerificationNote } from '../utils/formatters';
import { capabilityStatusLabel } from '../utils/statusColors';
import {
  extractCapabilityEvidenceUrls,
  resolveCapabilityEvidencePages,
} from '../utils/capabilityEvidence';

const SECTION_IDS = {
  detected: 'capabilities-detected',
  confirmedMissing: 'capabilities-not-publicly-detected',
  notObservable: 'capabilities-not-observable',
  unverified: 'capabilities-unverified',
};

export default function CapabilitiesPage() {
  const { audit } = useAudit();
  const groups = capabilityGroups(audit?.capabilities || []);
  const coverage = audit?.crawl?.coverage;
  const detectedItems = useMemo(
    () => [...(groups.detected || []), ...(groups.likely || [])],
    [groups.detected, groups.likely]
  );

  const sectionTabs = useMemo(() => {
    const tabs = [
      {
        id: 'detected',
        label: `Detected (${detectedItems.length})`,
        sectionId: SECTION_IDS.detected,
      },
      {
        id: 'confirmedMissing',
        label: `Not publicly detected (${groups.confirmedMissing.length})`,
        sectionId: SECTION_IDS.confirmedMissing,
      },
    ];

    if (groups.notObservable.length > 0) {
      tabs.push({
        id: 'notObservable',
        label: `Not observable from a website (${groups.notObservable.length})`,
        sectionId: SECTION_IDS.notObservable,
      });
    }

    if (groups.unverified.length > 0) {
      tabs.push({
        id: 'unverified',
        label: `Could not verify (${groups.unverified.length})`,
        sectionId: SECTION_IDS.unverified,
      });
    }

    return tabs;
  }, [detectedItems.length, groups.confirmedMissing.length, groups.notObservable, groups.unverified]);

  const [activeSection, setActiveSection] = useState('detected');
  const suppressScrollSpyRef = useRef(false);
  const sectionTabsKey = sectionTabs.map((tab) => tab.id).join('|');

  useEffect(() => {
    if (!audit) return undefined;

    const scroller = document.getElementById('main-content');
    if (!scroller) return undefined;

    const updateActiveFromScroll = () => {
      if (suppressScrollSpyRef.current) return;

      const tabsBar = document.getElementById('capabilities-section-tabs-bar');
      const offset = (tabsBar?.getBoundingClientRect().height ?? 72) + 16;
      const marker = scroller.getBoundingClientRect().top + offset;

      let nextId = sectionTabs[0]?.id ?? 'detected';

      for (const tab of sectionTabs) {
        const node = document.getElementById(tab.sectionId);
        if (!node) continue;
        // Activate a section once its heading has crossed under the sticky tabs.
        if (node.getBoundingClientRect().top <= marker) {
          nextId = tab.id;
        }
      }

      // Near the bottom of the page, pin the last section.
      const nearBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 48;
      if (nearBottom && sectionTabs.length > 0) {
        nextId = sectionTabs[sectionTabs.length - 1].id;
      }

      setActiveSection((prev) => (prev === nextId ? prev : nextId));
    };

    // Defer once so section nodes are in the DOM after paint.
    const frame = window.requestAnimationFrame(updateActiveFromScroll);
    scroller.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    window.addEventListener('resize', updateActiveFromScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', updateActiveFromScroll);
      window.removeEventListener('resize', updateActiveFromScroll);
    };
  }, [audit, sectionTabs, sectionTabsKey]);

  const scrollToSection = (tabId) => {
    const tab = sectionTabs.find((item) => item.id === tabId);
    if (!tab) return;

    const node = document.getElementById(tab.sectionId);
    if (!node) return;

    setActiveSection(tabId);
    suppressScrollSpyRef.current = true;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      suppressScrollSpyRef.current = false;
    }, 900);
  };

  const renderList = (items, empty, showScreenshots = false) => {
    if (items.length === 0) {
      return (
        <p className="body-text rounded-xl border border-dashed border-border bg-card px-4 py-5 text-center">
          {empty}
        </p>
      );
    }

    return (
      <motion.ul
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-2"
      >
        {items.map((cap) => {
          const evidenceUrls = extractCapabilityEvidenceUrls(cap, audit?.website);
          const evidencePages = showScreenshots ? resolveCapabilityEvidencePages(cap, audit) : [];
          const note = capabilityVerificationNote(cap);
          const iconKind = capabilityStatusKind(cap);

          return (
            <motion.li
              key={cap.id || cap.capability}
              variants={rowItem}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-start gap-2">
                  <StatusIcon kind={iconKind} className="mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{cap.name || cap.capability}</p>
                    {cap.publicObservation && <p className="body-text mt-1">{cap.publicObservation}</p>}
                    {note && <p className="meta-text mt-1">{note}</p>}
                  </div>
                </div>
                <StatusBadge status={cap.status} label={capabilityStatusLabel(cap.status)} />
              </div>

              {evidenceUrls.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {evidenceUrls.slice(0, 3).map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-w-full truncate rounded font-mono text-xs text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                        title={url}
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {showScreenshots && (
                <CapabilityEvidenceScreenshots auditId={audit.auditId} evidencePages={evidencePages} />
              )}

              {!showScreenshots && cap.evidence?.length > 0 && evidenceUrls.length === 0 && (
                <Link
                  to="/website-intelligence/evidence"
                  className="mt-3 inline-block rounded text-xs font-medium text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  View evidence
                </Link>
              )}
            </motion.li>
          );
        })}
      </motion.ul>
    );
  };

  return (
    <PageContainer wide>
      <PageHeader
        title="Capabilities"
        description="What the crawler could observe on public pages, and how confident it is about what it could not find."
        actions={<StatusLegend className="hidden md:flex" />}
      />

      {!audit ? (
        <EmptyState
          icon={Shield}
          title="No capabilities mapped yet"
          description="A capability map shows which services a website already exposes publicly, so you never pitch something the client already has."
          actionLabel="Analyze a website"
          actionTo="/website-intelligence/analyze"
        />
      ) : (
        <div className="space-y-8">
          <StatusLegend className="md:hidden" />

          {coverage && (
            <p className="meta-text">
              Crawl coverage: {coverage.pagesAnalyzed} of {coverage.pagesDiscovered} discovered pages analyzed
              {coverage.pageTypesVisited?.length ? ` (${coverage.pageTypesVisited.join(', ')})` : ''}
              {coverage.timedOut ? ' — stopped at the time budget, so some pages were not reached' : ''}.
            </p>
          )}

          <div
            id="capabilities-section-tabs-bar"
            className="sticky top-0 z-20 -mx-1 border-b border-border/80 bg-background/95 px-1 py-3 backdrop-blur-sm"
          >            <AnimatedTabs
              tabs={sectionTabs.map(({ id, label }) => ({ id, label }))}
              activeTab={activeSection}
              onChange={scrollToSection}
              variant="pill"
              layoutId="capabilities-section-tabs"
              className="max-w-full flex-wrap"
            />
            <p className="meta-text mt-2">Jump to a capability group on this page.</p>
          </div>

          <section id={SECTION_IDS.detected} className="scroll-mt-24">
            <h2 className="section-title">Detected</h2>
            <p className="body-text mt-0.5">Already present on the site. Do not pitch these as gaps.</p>
            <div className="mt-3">
              {renderList(detectedItems, 'Nothing was detected on this site.', true)}
            </div>
          </section>

          <section id={SECTION_IDS.confirmedMissing} className="scroll-mt-24">
            <h2 className="section-title">Not publicly detected</h2>
            <p className="body-text mt-0.5">
              Actively checked on the pages where these would normally appear and not found. Safe to reference in
              outreach.
            </p>
            <div className="mt-3">
              {renderList(groups.confirmedMissing, 'Every capability we could check was observed on the site.')}
            </div>
          </section>

          {groups.notObservable.length > 0 && (
            <section id={SECTION_IDS.notObservable} className="scroll-mt-24">
              <h2 className="section-title">Not observable from a website</h2>
              <p className="body-text mt-0.5">
                Back-office systems that a public site cannot confirm either way.
              </p>
              <div className="mt-3">{renderList(groups.notObservable, '')}</div>
            </section>
          )}

          {groups.unverified.length > 0 && (
            <section id={SECTION_IDS.unverified} className="scroll-mt-24">
              <h2 className="section-title">Could not verify</h2>
              <p className="body-text mt-0.5">
                The crawl did not reach enough of the site to rule these out, so they are excluded from outreach.
              </p>
              <div className="mt-3">{renderList(groups.unverified, '')}</div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
