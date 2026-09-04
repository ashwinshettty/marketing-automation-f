import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import PageContainer, { PageHeader } from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { RowSkeleton } from '../components/common/LoadingState';
import { Input } from '@/components/ui/input';
import { rowItem, staggerContainer } from '@/lib/motion';
import { api } from '../api/client';

export default function CatalogPage() {
  const { catalogId } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    if (!catalogId) return;
    setLoading(true);
    setError(null);
    Promise.all([api.getCatalog(catalogId), api.getCatalogServices(catalogId)])
      .then(([cat, svc]) => {
        setCatalog(cat);
        setServices(svc.services || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [catalogId]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? services.filter(
          (s) =>
            s.name?.toLowerCase().includes(q) ||
            s.category?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        )
      : services;

    const byCategory = {};
    for (const s of list) {
      const cat = s.category || 'Uncategorized';
      (byCategory[cat] ||= []).push(s);
    }
    return byCategory;
  }, [services, query]);

  const matchCount = Object.values(grouped).reduce((sum, items) => sum + items.length, 0);

  return (
    <PageContainer>
      <PageHeader
        title={catalog?.name || 'Service catalog'}
        description={
          catalog?.description || 'The services opportunities are scored against during an analysis.'
        }
      />

      {loading ? (
        <RowSkeleton count={6} />
      ) : error ? (
        <ErrorState
          title="Could not load the service catalog"
          description="The catalog could not be read from the backend."
          message={error}
          causes={['The backend is not running', 'This catalog id does not exist']}
          onRetry={load}
        />
      ) : services.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="This catalog has no services"
          description="Opportunities are matched against catalog services, so add services to the catalog on the backend to start scoring."
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="meta-text">
              {matchCount} of {services.length} service{services.length === 1 ? '' : 's'}
            </p>
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search services"
                aria-label="Search services"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {matchCount === 0 ? (
            <p className="body-text rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center">
              No services match “{query}”.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, items]) => (
                <section key={category}>
                  <h2 className="label-text mb-2">{category}</h2>
                  <motion.ul
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {items.map((s) => (
                      <motion.li key={s.id} variants={rowItem}>
                        <Link
                          to={`/website-intelligence/catalog/${catalogId}/services/${s.id}`}
                          className="flex items-center gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{s.name}</p>
                            {s.description && (
                              <p className="body-text mt-0.5 line-clamp-1">{s.description}</p>
                            )}
                          </div>
                          <ChevronRight
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
