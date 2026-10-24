import { Outlet, useLocation } from 'react-router-dom';
import ToastContainer from './ToastContainer';
import Header from '../pages/Header';
import Sidebar from '../pages/Sidebar';

const AppLayout = () => {
  const { pathname } = useLocation();
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
      <Header />

      <div className="flex min-h-0 flex-1">
        <Sidebar />
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
