import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { api } from '../api/client';
import { formatCapabilityName } from '../utils/formatters';

function DetailBlock({ title, children }) {
  return (
    <div className="border-t border-border pt-5">
      <h2 className="card-title">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function ServiceDetailPage() {
  const { catalogId, serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getService(catalogId, serviceId)
      .then(setService)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [catalogId, serviceId]);

  useEffect(() => {
    load();
  }, [load]);

  const backLink = (
    <Button variant="ghost" size="sm" className="-ml-2 mb-4" render={<Link to={`/website-intelligence/catalog/${catalogId}`} />}>
      <ArrowLeft />
      Catalog
    </Button>
  );

  if (loading) {
    return (
      <PageContainer>
        {backLink}
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-32" />
        <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        {backLink}
        <ErrorState
          title="Could not load this service"
          description="The service details could not be read from the catalog."
          message={error}
          onRetry={load}
        />
      </PageContainer>
    );
  }

  if (!service) {
    return (
      <PageContainer>
        {backLink}
        <EmptyState
          icon={BookOpen}
          title="Service not found"
          description="This service is not part of the catalog."
          actionLabel="Back to catalog"
          actionTo={`/website-intelligence/catalog/${catalogId}`}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {backLink}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h1 className="page-title">{service.name}</h1>
          {service.category && <p className="meta-text mt-1">{service.category}</p>}
          {service.description && <p className="body-text mt-4">{service.description}</p>}

          {service.idealBuyers?.length > 0 && (
            <DetailBlock title="Ideal buyers">
              <p className="body-text">{service.idealBuyers.join(', ')}</p>
            </DetailBlock>
          )}
        </div>

        <aside className="space-y-4">
          {service.capabilitiesProvided?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="card-title">Capabilities provided</h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {service.capabilitiesProvided.map((c) => (
                  <li
                    key={c}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {formatCapabilityName(c)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.websiteSignals?.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="card-title">Matching signals</h2>
              <p className="body-text mt-2">{service.websiteSignals.join(', ')}</p>
            </div>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
