import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLead } from '../context/LeadContext';
import { getPageConfig } from '../constants/pageConfig';

const Icon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-[18px] w-[18px]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const Header = ({ sidebarOpen = true, onToggleSidebar }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { selectedLead } = useLead();

  const isLeadDetailPage = /^\/leads\/[^/]+$/.test(pathname);
  const pageConfig =
    isLeadDetailPage && selectedLead
      ? {
          title: selectedLead.name,
          description: `${selectedLead.grade} · ${selectedLead.board} · ${selectedLead.source}`,
        }
      : getPageConfig(pathname);

  const isAnalytics = pathname === '/analytics' || pathname.startsWith('/analytics/');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!isAnalytics) {
      setFiltersOpen(false);
      return undefined;
    }
    const onState = (event) => setFiltersOpen(Boolean(event.detail));
    window.addEventListener('analytics-filters-state', onState);
    return () => window.removeEventListener('analytics-filters-state', onState);
  }, [isAnalytics]);

  return (
    <header className={`flex shrink-0 ${isAnalytics ? '' : 'border-b border-brand-yellow/30'}`}>
      {/* Hamburger — always first, before the logo */}
      <div
        className={`flex w-14 shrink-0 items-center justify-center transition-colors duration-300 ${
          sidebarOpen ? 'bg-brand-cream lg:bg-brand-navy' : 'bg-brand-cream'
        }`}
      >
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          title={sidebarOpen ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-brand-yellow/50 bg-white text-brand-navy shadow-sm transition hover:bg-brand-yellow/20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Logo — after hamburger. w-14 + w-[200px] = 256px (matches sidebar w-64). */}
      <div
        className={`flex w-20 shrink-0 flex-col items-center justify-center bg-brand-cream px-3 py-4 transition-[width,background-color] duration-300 ease-in-out ${
          sidebarOpen
            ? 'lg:w-[200px] lg:border-r lg:border-white/10 lg:bg-brand-navy'
            : 'lg:w-20'
        }`}
      >
        <img
          src="/app-icon.png"
          alt="AI Bot"
          className={`h-12 w-12 rounded-full object-cover shadow-sm ring-1 ${
            sidebarOpen ? 'ring-black/10 lg:ring-white/25' : 'ring-black/10'
          }`}
        />
        {sidebarOpen ? (
          <p className="mt-1.5 hidden text-sm font-semibold tracking-tight text-brand-yellow lg:block">AI Bot</p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 bg-brand-cream px-3 py-3 lg:gap-4 lg:px-6 lg:py-5">
        <div className="flex min-w-0 flex-col justify-center">
          <h1
            className={`truncate text-lg tracking-tight text-brand-navy lg:text-2xl ${
              isAnalytics ? 'font-bold' : 'font-semibold'
            }`}
          >
            {pageConfig.title}
          </h1>
          <p className="mt-1 hidden text-sm text-brand-muted md:line-clamp-2 md:block lg:truncate">
            {pageConfig.description}
          </p>
        </div>

        {isAnalytics ? (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Filter view"
              aria-expanded={filtersOpen}
              onClick={() => window.dispatchEvent(new CustomEvent('analytics-toggle-filters'))}
              className={`flex h-11 items-center gap-2 rounded-lg border px-2.5 text-sm font-medium text-brand-navy lg:px-3 ${
                filtersOpen
                  ? 'border-brand-yellow bg-brand-yellow-soft'
                  : 'border-brand-yellow/40 bg-white hover:border-brand-yellow hover:bg-brand-cream'
              }`}
            >
              <Icon>
                <path d="M4 6h16M7 12h10M10 18h4" />
              </Icon>
              <span className="hidden lg:inline">Filter View</span>
            </button>
            <button
              type="button"
              aria-label="Create campaign"
              onClick={() => navigate('/campaign', { state: { create: true } })}
              className="flex h-11 items-center gap-2 rounded-lg bg-brand-navy px-2.5 text-sm font-medium text-white hover:bg-brand-navy-hover lg:px-4"
            >
              <Icon>
                <path d="M12 5v14M5 12h14" />
              </Icon>
              <span className="hidden lg:inline">Create Campaign</span>
            </button>
            <div className="ml-1 hidden items-center gap-1 border-l border-brand-yellow/40 pl-3 sm:flex">
              <button
                type="button"
                title="Follow-ups"
                aria-label="Follow-ups"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent('analytics-open-view', { detail: 'leads' }))
                }
                className="grid h-11 w-11 place-items-center rounded-lg text-brand-muted hover:bg-white hover:text-brand-navy"
              >
                <Icon>
                  <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </Icon>
              </button>
              <button
                type="button"
                title="How these numbers are calculated"
                aria-label="Help"
                onClick={() => {
                  const node = document.getElementById('analytics-definitions');
                  if (!node) return;
                  node.open = true;
                  node.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="grid h-11 w-11 place-items-center rounded-lg text-brand-muted hover:bg-white hover:text-brand-navy"
              >
                <Icon>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.8-1.2 1.6V14" />
                  <path d="M12 17h.01" />
                </Icon>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
