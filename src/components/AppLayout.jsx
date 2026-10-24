import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ToastContainer from './ToastContainer';
import Header from '../pages/Header';
import Sidebar from '../pages/Sidebar';

const AppLayout = () => {
  const { pathname } = useLocation();
  // Desktop starts with the menu open; mobile starts closed (overlay drawer).
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 1024,
  );
  const isWebsiteIntelligence = pathname.startsWith('/website-intelligence');
  const isMessages = pathname === '/messages' || pathname.startsWith('/messages/');

  // Website Intelligence takes over the full viewport with its own chrome.
  if (isWebsiteIntelligence) {
    return (
      <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background">
        <ToastContainer />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-brand-cream">
      <ToastContainer />
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />

      <div className="relative flex min-h-0 flex-1">
        {/* Mobile backdrop — tap to close the drawer. */}
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 cursor-pointer bg-black/40 lg:hidden"
          />
        ) : null}

        {/*
          Drawer:
          - Mobile: fixed overlay that slides over full-width content
          - Desktop (lg+): pushes content, animating between w-64 and w-0
        */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-hidden shadow-2xl transition-all duration-300 ease-in-out lg:static lg:z-auto lg:shadow-none ${
            sidebarOpen
              ? 'translate-x-0 lg:w-64'
              : '-translate-x-full lg:w-0 lg:translate-x-0'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <main
          className={`min-h-0 min-w-0 flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0 ${
            isMessages ? 'overflow-hidden' : 'overflow-x-hidden overflow-y-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
