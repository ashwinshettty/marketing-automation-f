import { Outlet, useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GaIcon } from './icons/GoogleAdsIcons';
import CampaignPickerDropdown from './campaigns/CampaignPickerDropdown';
import PrimaryRail from './nav/PrimaryRail';
import SecondaryPanel from './nav/SecondaryPanel';
import { GOOGLE_ADS_BASE, resolvePrimaryFromPath } from './nav/googleAdsNavConfig';
import './googleAds.css';

export default function GoogleAdsShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const primary = resolvePrimaryFromPath(pathname);
  const campaignId = searchParams.get('campaignId') || '';
  const campaignName = searchParams.get('campaign') || '';

  const chooseCampaign = (id, campaign) => {
    const next = new URLSearchParams(searchParams);
    if (!id) {
      next.delete('campaignId');
      next.delete('campaign');
    } else {
      next.set('campaignId', id);
      next.set('campaign', campaign?.name || '');
    }
    const query = next.toString();
    if (pathname.includes('/overview') || pathname === GOOGLE_ADS_BASE || pathname === `${GOOGLE_ADS_BASE}/`) {
      navigate({ pathname: `${GOOGLE_ADS_BASE}/overview`, search: query ? `?${query}` : '' });
      return;
    }
    navigate({ pathname, search: query ? `?${query}` : '' });
  };

  return (
    <div className="google-ads-shell flex h-screen min-h-0 flex-col bg-[var(--ga-surface)] text-[var(--ga-ink)]">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--ga-border)] bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-[var(--ga-muted)] hover:bg-[var(--ga-hover)] hover:text-[var(--ga-ink)]"
          >
            <GaIcon name="back" className="h-4 w-4" />
            App
          </Link>
          <div className="h-4 w-px bg-[var(--ga-border)]" />
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <CampaignPickerDropdown
              campaignId={campaignId}
              campaignName={campaignName}
              allowAll
              allLabel="All campaigns"
              onChange={chooseCampaign}
            />
            <span className="truncate text-[var(--ga-muted)]">Inkstall · 104-890-6125</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full p-2 text-[var(--ga-muted)] hover:bg-[var(--ga-hover)]"
            aria-label="Search"
          >
            <GaIcon name="search" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <PrimaryRail activeSectionId={primary.id} />
        <SecondaryPanel sectionId={primary.id} />
        <main className="ga-scroll min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
