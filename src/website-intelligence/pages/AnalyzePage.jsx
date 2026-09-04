import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Globe, Radar, ScanSearch, Target } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import AnalysisProgress from '../components/analysis/AnalysisProgress';
import AnalysisHistory from '../components/analysis/AnalysisHistory';
import ErrorState from '../components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableDropdown from '@/components/smoothui/searchable-dropdown';
import { collapseVariants, duration, easeOut, stateSwapVariants } from '@/lib/motion';
import { useAudit } from '../context/AuditContext';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    icon: Globe,
    title: 'Crawl',
    description: 'Visits home, services, contact, booking and other high-signal pages.',
  },
  {
    icon: ScanSearch,
    title: 'Detect',
    description: 'Reads forms, widgets, scripts and copy to map what the site publicly offers.',
  },
  {
    icon: Target,
    title: 'Match',
    description: 'Scores your catalog against the capabilities that were not detected.',
  },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const { startAnalysis, analyzing, progress, error, catalogs, audit } = useAudit();

  const [website, setWebsite] = useState('');
  const [catalogId, setCatalogId] = useState('talecraftor');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customMaxPages, setCustomMaxPages] = useState(20);
  const [useCustomLimit, setUseCustomLimit] = useState(false);

  const catalogOptions = catalogs.length ? catalogs : [{ id: 'talecraftor', name: 'Service catalog' }];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = website.trim();
    if (!url) return;

    try {
      await startAnalysis({
        website: url,
        catalogId,
        maxPages: useCustomLimit ? customMaxPages : null,
      });
      navigate('/website-intelligence', { replace: true });
    } catch {
      // Surfaced through the context error below.
    }
  };

  return (
    <PageContainer>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="page-title">Analyze a website</h1>
          <p className="body-text mt-1 max-w-2xl">
            Discover publicly visible services, gaps and potential business opportunities.
          </p>
        </div>
        <p className="meta-text shrink-0">Typical crawl: 2–4 minutes</p>
      </div>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div
            key="running"
            variants={stateSwapVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AnalysisProgress progress={progress} website={website || audit?.website} />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            variants={stateSwapVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <form
                onSubmit={handleSubmit}
                className="relative overflow-hidden rounded-xl border border-border bg-card"
              >
                <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />

                <div className="relative p-5 sm:p-6">
                  <Label htmlFor="website-url" className="text-sm font-medium">
                    Website URL
                  </Label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="website-url"
                      type="url"
                      required
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="h-10 flex-1 font-mono text-sm"
                    />
                    <Button type="submit" size="lg" className="h-10 shrink-0 px-5">
                      <Radar />
                      Analyze website
                    </Button>
                  </div>
                  <p className="meta-text mt-2">Only public pages are visited.</p>

                  <div className="mt-5">
                    <Label className="text-sm font-medium">Service catalog</Label>
                    <SearchableDropdown
                      className="mt-2 w-full"
                      label="Select catalog"
                      placeholder="Search catalogs…"
                      emptyMessage="No catalogs found"
                      items={catalogOptions.map((c) => ({
                        id: c.id,
                        label: c.name,
                        description: 'Opportunities are scored against this catalog',
                      }))}
                      value={catalogId}
                      onChange={(item) => setCatalogId(String(item.id))}
                    />
                    <p className="meta-text mt-1.5">
                      Opportunities are scored against the services in this catalog.
                    </p>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen((value) => !value)}
                      aria-expanded={advancedOpen}
                      aria-controls="advanced-settings"
                      className="flex w-full items-center justify-between rounded text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      Advanced settings
                      <motion.span
                        animate={{ rotate: advancedOpen ? 180 : 0 }}
                        transition={{ duration: duration.normal, ease: easeOut }}
                        className="inline-flex text-muted-foreground"
                      >
                        <ChevronDown className="size-4" aria-hidden="true" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {advancedOpen && (
                        <motion.div
                          id="advanced-settings"
                          variants={collapseVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 pt-4">
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={useCustomLimit}
                                onChange={(e) => setUseCustomLimit(e.target.checked)}
                                className="size-4 accent-brand"
                              />
                              Set a custom page limit
                            </label>

                            {useCustomLimit && (
                              <div>
                                <Label htmlFor="max-pages" className="label-text">
                                  Maximum pages
                                </Label>
                                <Input
                                  id="max-pages"
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={customMaxPages}
                                  onChange={(e) => setCustomMaxPages(Number(e.target.value))}
                                  className="mt-1 max-w-[140px]"
                                />
                              </div>
                            )}

                            <p className="body-text">
                              By default the crawler visits every important page — home, services, pricing,
                              contact, about and FAQ — and skips low-priority blog and legal pages.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {error && (
                    <ErrorState
                      className="mt-5"
                      title="We could not analyze that website"
                      description="The crawl stopped before it could finish."
                      message={error}
                      causes={[
                        'The URL is unreachable or misspelled',
                        'The site blocks automated visitors',
                        'The site took too long to respond',
                      ]}
                      onRetry={() => handleSubmit({ preventDefault: () => {} })}
                    />
                  )}
                </div>
              </form>

              <aside className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-semibold tracking-tight">How analysis works</h2>
                  <p className="meta-text mt-0.5">Three steps from URL to scored opportunities.</p>
                </div>
                <ol className="divide-y divide-border">
                  {STEPS.map(({ icon: Icon, title, description }, index) => (
                    <li key={title} className="flex gap-3 px-5 py-4">
                      <span
                        className={cn(
                          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg',
                          'bg-brand-subtle text-brand'
                        )}
                      >
                        <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{title}</span>
                        </div>
                        <p className="body-text mt-1">{description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>

            <section>
              <h2 className="section-title mb-3">Recent websites</h2>
              <AnalysisHistory limit={5} />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
