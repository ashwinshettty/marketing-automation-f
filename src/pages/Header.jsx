import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLead } from '../context/LeadContext';
import { getPageConfig } from '../constants/pageConfig';

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const Header = () => {
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
      <div
        className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-white/10 bg-brand-navy px-2 py-3 lg:w-64 lg:px-5 lg:py-5"
      >
        <img
          src="/app-icon.png"
          alt="AI Bot"
          className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-yellow lg:h-14 lg:w-14 lg:ring-4"
        />
        <p className="mt-2 hidden text-sm font-semibold text-brand-yellow lg:block">AI Bot</p>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 bg-brand-cream px-3 py-3 lg:gap-4 lg:px-8 lg:py-5">
        <div className="min-w-0">
          <h1 className={`truncate text-lg tracking-tight text-brand-navy lg:text-2xl ${isAnalytics ? 'font-bold' : 'font-semibold'}`}>{pageConfig.title}</h1>
          <p className="mt-1 hidden text-sm text-brand-muted md:line-clamp-2 md:block">{pageConfig.description}</p>
        </div>
        {isAnalytics && (
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
                onClick={() => window.dispatchEvent(new CustomEvent('analytics-open-view', { detail: 'leads' }))}
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
        )}
      </div>
    </header>
  );
};

export default Header;
