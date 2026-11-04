import { Link } from 'react-router-dom';
import DiagnosticsCard from '../../components/DiagnosticsCard';
import FilterChip from '../../components/FilterChip';
import MetricCards from '../../components/MetricCards';
import OverviewChart from '../../components/OverviewChart';
import PageHeader from '../../components/PageHeader';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

export default function OverviewPage() {
  return (
    <div className="px-6 py-5">
      <PageHeader
        title="Overview"
        filters={
          <>
            <FilterChip>Filters</FilterChip>
            <FilterChip active>Campaign status: All</FilterChip>
            <FilterChip active>Ad group status: All</FilterChip>
            <FilterChip>+ Add filter</FilterChip>
          </>
        }
        actions={
          <Link
            to={`${GOOGLE_ADS_BASE}/create/objective`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
          >
            <span aria-hidden="true">+</span>
            New campaign
          </Link>
        }
      />

      <div className="mb-3 flex items-center gap-2 border-b border-[var(--ga-border)] pb-2">
        <button
          type="button"
          className="rounded-t-lg border-b-2 border-[var(--ga-blue)] px-3 py-2 text-sm font-medium text-[var(--ga-blue)]"
        >
          Home
        </button>
        <button
          type="button"
          className="rounded-t-lg px-3 py-2 text-sm text-[var(--ga-muted)] hover:text-[var(--ga-ink)]"
        >
          + Add custom view
        </button>
      </div>

      <div className="space-y-4">
        <MetricCards />
        <OverviewChart />
        <DiagnosticsCard />
      </div>
    </div>
  );
}
