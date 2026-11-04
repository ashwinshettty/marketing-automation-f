import { NavLink } from 'react-router-dom';
import { GaIcon } from '../icons/GoogleAdsIcons';
import { PRIMARY_SECTIONS } from './googleAdsNavConfig';

export default function PrimaryRail({ activeSectionId }) {
  return (
    <nav
      aria-label="Google Ads primary"
      className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-[var(--ga-border)] bg-white py-3"
    >
      {PRIMARY_SECTIONS.map((section) => {
        const active = section.id === activeSectionId;
        return (
          <NavLink
            key={section.id}
            to={section.defaultPath}
            className={`group flex w-[64px] flex-col items-center gap-1 rounded-2xl px-1 py-2 text-center transition-colors ${
              active
                ? 'bg-[var(--ga-blue-soft)] text-[var(--ga-blue)]'
                : 'text-[var(--ga-muted)] hover:bg-[var(--ga-hover)] hover:text-[var(--ga-ink)]'
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                active ? 'bg-[var(--ga-blue)] text-white' : 'bg-transparent'
              }`}
            >
              <GaIcon name={section.icon} className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[10px] font-medium leading-tight">{section.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
