import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AuditProvider } from './context/AuditContext';
import RouteFallback from './components/layout/RouteFallback';
import './styles/wi.css';

/**
 * Providers shell for /website-intelligence/*.
 * Layout + pages are nested route elements (see App.jsx) so Outlet works.
 */
export default function WebsiteIntelligenceShell() {
  return (
    <MotionConfig reducedMotion="user">
      <AuditProvider>
        <div className="wi-app flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </AuditProvider>
    </MotionConfig>
  );
}
