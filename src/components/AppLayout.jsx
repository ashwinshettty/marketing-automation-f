import { Outlet } from 'react-router-dom';
import Header from '../pages/Header';
import Sidebar from '../pages/Sidebar';

const AppLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-brand-cream">
      <Header />

      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
