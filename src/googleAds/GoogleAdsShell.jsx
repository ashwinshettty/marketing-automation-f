import { Outlet, useLocation, Link } from 'react-router-dom';
import { GaIcon } from './icons/GoogleAdsIcons';
import PrimaryRail from './nav/PrimaryRail';
import SecondaryPanel from './nav/SecondaryPanel';
import { resolvePrimaryFromPath } from './nav/googleAdsNavConfig';
import './googleAds.css';

export default function GoogleAdsShell() {
  const { pathname } = useLocation();
  const primary = resolvePrimaryFromPath(pathname);

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
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--ga-border)] px-2.5 py-1">
              <GaIcon name="home" className="h-3.5 w-3.5 text-[var(--ga-muted)]" />
              All campaigns
            </span>
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
