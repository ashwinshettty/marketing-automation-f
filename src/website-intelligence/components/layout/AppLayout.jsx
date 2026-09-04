import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import RouteFallback from './RouteFallback';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import { useAudit } from '../../context/AuditContext';
import { pageVariants } from '@/lib/motion';

const COLLAPSE_KEY = 'wi_sidebar_collapsed';

export default function AppLayout() {
  const { catalogs, audit } = useAudit();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === 'true'
  );
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((value) => {
      localStorage.setItem(COLLAPSE_KEY, String(!value));
      return !value;
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) main.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-border focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-sm"
      >
        Skip to main content
      </a>
      <Sidebar catalogs={catalogs} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <MobileNav open={navOpen} onOpenChange={setNavOpen} catalogs={catalogs} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar onOpenSearch={openSearch} onOpenNav={() => setNavOpen(true)} />

        <main id="main-content" className="min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="min-h-0 min-w-0"
            >
              <Suspense fallback={<RouteFallback />}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette open={searchOpen} onClose={closeSearch} audit={audit} catalogs={catalogs} />
    </div>
  );
}
