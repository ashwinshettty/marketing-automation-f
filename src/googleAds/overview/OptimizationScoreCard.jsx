import { Link } from 'react-router-dom';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';

const percent = (score) => `${(Number(score) * 100).toFixed(1)}%`;

export default function OptimizationScoreCard({ score = null, campaigns = [] }) {
  const known = score != null && Number.isFinite(Number(score));
  const width = known ? `${Math.round(Number(score) * 100)}%` : '0%';

  return (
    <section className="flex h-full flex-col rounded-2xl border border-[var(--ga-border)] bg-white shadow-[0_1px_2px_rgba(60,64,67,0.08)]">
      <header className="flex items-center justify-between border-b border-[var(--ga-border)] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--ga-ink)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--ga-muted)]" aria-hidden="true">
            <path fill="currentColor" d="M9 21h6v-1.5H9V21zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zm2.2 11H9.8a5 5 0 1 1 4.4 0z" />
          </svg>
          Optimization score
        </h2>
      </header>
      <div className="flex gap-4 px-4 py-4">
        <div className="w-28 shrink-0">
          <p className="text-3xl font-normal tracking-tight text-[var(--ga-blue)]">{known ? percent(score) : '—'}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8f0fe]">
            <div className="h-full rounded-full bg-[var(--ga-blue)]" style={{ width }} />
          </div>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--ga-ink)]">
            Your optimization score
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--ga-muted)] text-[10px] font-medium text-[var(--ga-muted)]" title="Score based on available recommendations">?</span>
          </p>
          <p className="mt-1 text-sm text-[var(--ga-muted)]">
            Increase your score by applying the recommendations in these campaigns
          </p>
        </div>
      </div>
      <ul className="flex-1">
        {campaigns.map((campaign) => (
          <li key={campaign.id || campaign.name} className="flex items-center gap-3 border-t border-[var(--ga-border)] px-4 py-3">
            <span className="w-14 shrink-0 text-sm font-medium text-[var(--ga-blue)]">{percent(campaign.score)}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--ga-ink)]">{campaign.name}</span>
            <span className="text-[var(--ga-blue)]" aria-hidden="true">→</span>
          </li>
        ))}
      </ul>
      <footer className="flex items-center justify-between border-t border-[var(--ga-border)] px-4 py-3">
        <Link to={`${GOOGLE_ADS_BASE}/campaigns/recommendations`} className="text-sm font-medium text-[var(--ga-blue)]">
          All recommendations
        </Link>
        <span className="inline-flex items-center gap-2 text-sm text-[var(--ga-muted)]">
          <span aria-hidden="true">‹</span>
          1 / 1
          <span aria-hidden="true">›</span>
        </span>
      </footer>
    </section>
  );
}
