import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import IncomingCallBanner from './components/whatsapp/IncomingCallBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { LeadProvider } from './context/LeadContext';
import { PAGE_CONFIG } from './constants/pageConfig';
import CampaignsPage from './campaigns/CampaignsPage';
import EventsPage from './events/EventsPage';
import VacanciesPage from './vacancies/VacanciesPage';
import Login from './login/Login';
import LeadDetails from './leads/lead-details/LeadDetails';
import LeadWhatsAppChat from './leads/lead-details/LeadWhatsAppChat';
import LeadsPage from './leads/LeadsPage';
import Home from './pages/Home';
import SectionPage from './pages/SectionPage';
import UsersPage from './users/UsersPage';
import WhatsAppPage from './whatsapp/WhatsAppPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <LeadProvider>
                <AppLayout />
                <IncomingCallBanner />
              </LeadProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="event" element={<EventsPage />} />
          <Route path="vacancies" element={<VacanciesPage />} />
          <Route path="campaign" element={<CampaignsPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="leads/:leadId" element={<LeadDetails />} />
          <Route path="leads/:leadId/whatsapp" element={<LeadWhatsAppChat />} />
          {Object.entries(PAGE_CONFIG)
            .filter(
              ([path]) =>
                !['/leads', '/event', '/vacancies', '/campaign', '/whatsapp', '/users'].includes(path),
            )
            .map(([path, { title }]) => (
              <Route
                key={path}
                path={path.replace(/^\//, '')}
                element={<SectionPage title={title} />}
              />
            ))}
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
