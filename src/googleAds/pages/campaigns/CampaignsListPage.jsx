import { Link } from 'react-router-dom';
import ContentCard from '../../components/ContentCard';
import FilterChip from '../../components/FilterChip';
import PageHeader from '../../components/PageHeader';
import { GOOGLE_ADS_BASE } from '../../nav/googleAdsNavConfig';

const ROWS = [
  {
    name: 'Leads-Performance Max-25march',
    budget: '₹200.00/day',
    status: 'Eligible',
    type: 'Performance Max',
    bid: 'Maximize conversions',
  },
  {
    name: 'Leads-Search-25 march2026',
    budget: '₹500.00/day',
    status: 'Eligible',
    type: 'Search',
    bid: 'Maximize conversions',
  },
  {
    name: 'Inkstall Franchise 15th May',
    budget: '₹300.00/day',
    status: 'Paused',
    type: 'Search',
    bid: 'Maximize conversions',
  },
];

export default function CampaignsListPage() {
  return (
    <div className="px-6 py-5">
      <PageHeader
        title="Campaigns"
        filters={
          <>
            <FilterChip active>All campaigns</FilterChip>
            <FilterChip>+ Add filter</FilterChip>
          </>
        }
        actions={
          <Link
            to={`${GOOGLE_ADS_BASE}/create/objective`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ga-blue)] px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            + New campaign
          </Link>
        }
      />

      <ContentCard>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--ga-border)] text-[var(--ga-muted)]">
              <tr>
                <th className="px-2 py-3 font-medium">Campaign</th>
                <th className="px-2 py-3 font-medium">Budget</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Campaign type</th>
                <th className="px-2 py-3 font-medium">Bid strategy</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.name} className="border-b border-[var(--ga-border)] last:border-0">
                  <td className="px-2 py-3 font-medium text-[var(--ga-blue)]">{row.name}</td>
                  <td className="px-2 py-3 text-[var(--ga-ink)]">{row.budget}</td>
                  <td className="px-2 py-3 text-[var(--ga-ink)]">{row.status}</td>
                  <td className="px-2 py-3 text-[var(--ga-ink)]">{row.type}</td>
                  <td className="px-2 py-3 text-[var(--ga-ink)]">{row.bid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </div>
  );
}
