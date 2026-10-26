import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_WIDTH_CLASS } from '../constants/pageConfig';
import Logout from '../login/Logout';
import { getAuthSession } from '../utils/authStorage';

const NAV_ITEMS = [
  {
    to: '/leads',
    label: 'Leads',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/event',
    label: 'Event',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/vacancies',
    label: 'Vacancies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-6 4 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/campaign',
    label: 'Campaign',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M22 12h-6l-2 3H10l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/whatsapp',
    label: 'Template',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/sms-templates',
    label: 'SMS Templates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8h8M8 12h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/sms-history',
    label: 'SMS History',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/website-intelligence',
    label: 'Website Intelligence',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/video-generator',
    label: 'Video Generator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <rect x="2" y="6" width="14" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m16 10 5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/users',
    label: 'Users',
    superadminOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const PRIMARY_PATHS = ['/leads', '/messages', '/analytics', '/campaign'];

const linkClassName = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-brand-yellow text-brand-navy shadow-sm'
      : 'text-white/85 hover:bg-white/10 hover:text-brand-yellow',
  ].join(' ');

const Sidebar = ({ onClose }) => {
  const { role } = getAuthSession();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const navItems = NAV_ITEMS.filter(
    (item) => !item.superadminOnly || role === 'superadmin',
  );
  const primaryItems = PRIMARY_PATHS.map((path) => navItems.find((item) => item.to === path)).filter(
    Boolean,
  );
  const moreItems = navItems.filter((item) => !PRIMARY_PATHS.includes(item.to));
  const moreActive = moreItems.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop / drawer sidebar */}
      <aside
        className={`flex h-full min-h-0 ${SIDEBAR_WIDTH_CLASS} shrink-0 flex-col overflow-hidden bg-brand-navy text-white`}
      >
        {/* Close button — mobile drawer only (desktop uses the hamburger). */}
        <div className="flex items-center justify-between px-4 pt-4 lg:hidden">
          <span className="text-sm font-semibold text-brand-yellow">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            title="Close menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10 hover:text-brand-yellow"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-scroll no-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClassName}
              onClick={() => {
                // On mobile the drawer overlays content — close it after picking a page.
                if (window.innerWidth < 1024) onClose?.();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Logout />
        </div>
      </aside>

      {/* Mobile bottom primary nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-navy pb-[env(safe-area-inset-bottom)] text-white lg:hidden"
        aria-label="Primary"
      >
        <div className="grid h-16 grid-cols-5">
          {primaryItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold ${
                  isActive ? 'text-brand-yellow' : 'text-white/80'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold ${
              moreActive ? 'text-brand-yellow' : 'text-white/80'
            }`}
            aria-expanded={moreOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
            More
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-brand-navy/40"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-brand-navy px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-white">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/30" />
            <div className="space-y-1">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClassName}
                  onClick={() => setMoreOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
            <div className="mt-2 border-t border-white/10 pt-2">
              <Logout onLogout={() => setMoreOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Sidebar;
