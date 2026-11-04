import { useLocation, useNavigate } from 'react-router-dom';
import { GOOGLE_ADS_BASE } from '../nav/googleAdsNavConfig';

export default function CreateComingSoon() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const objective = state?.objective || 'this objective';

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-16">
      <h1 className="text-[28px] font-normal tracking-tight text-[var(--ga-ink)]">
        Next steps coming soon
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ga-muted)]">
        The full create wizard for <span className="font-medium text-[var(--ga-ink)]">{objective}</span>{' '}
        is not wired yet. Search campaigns (Sales, Leads, Website traffic, or Create without guidance
        → Search) can continue into settings today.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`${GOOGLE_ADS_BASE}/create/objective`, { state })}
          className="rounded-full bg-[var(--ga-blue)] px-5 py-2 text-sm font-medium text-white hover:brightness-95"
        >
          Back to objective
        </button>
        <button
          type="button"
          onClick={() => navigate(`${GOOGLE_ADS_BASE}/campaigns/overview`)}
          className="text-sm font-medium text-[var(--ga-blue)] hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
