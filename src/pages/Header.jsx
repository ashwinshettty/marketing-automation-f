import { useLocation } from 'react-router-dom';
import { useLead } from '../context/LeadContext';
import { getPageConfig, SIDEBAR_WIDTH_CLASS } from '../constants/pageConfig';

const Header = () => {
  const { pathname } = useLocation();
  const { selectedLead } = useLead();

  const isLeadDetailPage = /^\/leads\/[^/]+$/.test(pathname);

  const pageConfig =
    isLeadDetailPage && selectedLead
      ? {
          title: selectedLead.name,
          description: `${selectedLead.grade} · ${selectedLead.board} · ${selectedLead.source}`,
        }
      : getPageConfig(pathname);

  return (
    <header className="flex shrink-0 border-b border-brand-yellow/30">
      <div
        className={`flex ${SIDEBAR_WIDTH_CLASS} shrink-0 flex-col items-center justify-center border-r border-white/10 bg-brand-navy px-5 py-5`}
      >
        <img
          src="/app-icon.png"
          alt="AI Bot"
          className="h-14 w-14 rounded-full object-cover ring-4 ring-brand-yellow"
        />
        <p className="mt-2 text-sm font-semibold text-brand-yellow">AI Bot</p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center bg-brand-cream px-8 py-5">
        <h1 className="text-2xl font-semibold text-brand-navy">{pageConfig.title}</h1>
        <p className="mt-1 text-sm text-brand-muted">{pageConfig.description}</p>
      </div>
    </header>
  );
};

export default Header;
