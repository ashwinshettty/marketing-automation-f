import { Link } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageHeader from '../components/PageHeader';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';

const CREATE_OPTIONS = [
  {
    title: 'Search campaign',
    description: 'Reach people searching on Google with RSA ads and keywords.',
    to: `${GOOGLE_ADS_BASE}/create/objective`,
  },
  {
    title: 'Experiment',
    description: 'Test changes with campaign experiments or ad variations.',
    to: `${GOOGLE_ADS_BASE}/campaigns/experiments`,
  },
  {
    title: 'Asset',
    description: 'Upload or manage assets used across campaigns.',
    to: `${GOOGLE_ADS_BASE}/campaigns/assets`,
  },
];

export default function CreatePage() {
  return (
    <div className="px-6 py-5">
      <PageHeader title="Create" />
      <div className="grid gap-4 md:grid-cols-3">
        {CREATE_OPTIONS.map((option) => (
          <Link key={option.title} to={option.to} className="block">
            <ContentCard className="h-full transition-shadow hover:shadow-md">
              <h2 className="text-base font-medium text-[var(--ga-ink)]">{option.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ga-muted)]">{option.description}</p>
            </ContentCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
