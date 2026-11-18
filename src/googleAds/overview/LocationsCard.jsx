import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';
import MetricSelectMenu from './MetricSelectMenu';
import { chartMetricById } from './chartMetrics';
import { groupLocationsForMap, LOCATION_METRICS } from './locationModel';
import { withCoordinates } from './locationGeocode';
import LocationsMap from './LocationsMap';

const openAnchor = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 232));
  const spaceBelow = window.innerHeight - rect.bottom - 12;
  return { top: rect.bottom + 4, left, maxHeight: Math.max(180, Math.min(360, spaceBelow)) };
};

export default function LocationsCard({
  locations,
  currencyCode = 'INR',
  campaignId = 'all',
  campaignName = 'all',
  range = 'LAST_7_DAYS',
  startDate = '',
  endDate = '',
  loading = false,
}) {
  const [metricId, setMetricId] = useState('cost');
  const [menu, setMenu] = useState(null);
  const [areas, setAreas] = useState([]);
  const targeted = locations?.targeted;
  const targeting = locations?.targeting || [];
  const metric = chartMetricById(metricId);

  useEffect(() => {
    let cancelled = false;
    const groups = groupLocationsForMap(targeted || []);
    setAreas(groups.filter((group) => group.latitude != null));
    withCoordinates(groups).then((points) => {
      if (!cancelled) setAreas(points);
    });
    return () => {
      cancelled = true;
    };
  }, [targeted]);

  const query = new URLSearchParams();
  query.set('range', range || 'LAST_7_DAYS');
  query.set('campaign', campaignName || 'all');
  if (startDate) query.set('startDate', startDate);
  if (endDate) query.set('endDate', endDate);
  const href = (kind) => `${GOOGLE_ADS_BASE}/campaigns/overview/${encodeURIComponent(campaignId || 'all')}/${kind}?${query}`;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <header className="flex items-center justify-between border-b border-[var(--ga-border)] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--ga-ink)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--ga-muted)]" aria-hidden="true">
            <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
          </svg>
          Locations
        </h2>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={Boolean(menu)}
          onClick={(event) => setMenu(menu ? null : openAnchor(event))}
          className="inline-flex items-center gap-1 text-sm text-[var(--ga-ink)]"
        >
          {metric?.label || 'Cost'}
          <span aria-hidden="true" className="text-[10px]">▼</span>
        </button>
      </header>
      {menu ? (
        <MetricSelectMenu
          metricId={metricId}
          metrics={LOCATION_METRICS}
          anchor={menu}
          onClose={() => setMenu(null)}
          onChoose={(id) => {
            setMetricId(id);
            setMenu(null);
          }}
        />
      ) : null}
      <div className="px-4 py-4">
        <h3 className="text-lg font-normal text-[var(--ga-ink)]">
          Geographic location of people who interacted with your ads
        </h3>
        <div className="mt-4 grid grid-cols-[7rem_minmax(0,1fr)] gap-3 text-sm">
          <p className="text-[var(--ga-muted)]">Targeting</p>
          <p className="truncate text-[var(--ga-ink)]" title={targeting.join(', ')}>
            {loading ? 'Loading locations' : (targeting.join(', ') || '—')}
          </p>
        </div>
      </div>
      <LocationsMap areas={areas} metricId={metricId} currencyCode={currencyCode} />
      <footer className="flex items-center gap-6 px-4 py-3">
        <Link to={href('targeted_location')} className="text-sm font-medium text-[var(--ga-blue)]">
          Targeted locations
        </Link>
        <Link to={href('excluded_location')} className="text-sm font-medium text-[var(--ga-blue)]">
          Excluded locations
        </Link>
      </footer>
    </section>
  );
}
