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
import MessagesPage from './messages/MessagesPage';
import Home from './pages/Home';
import SectionPage from './pages/SectionPage';
import UsersPage from './users/UsersPage';
import WhatsAppPage from './whatsapp/WhatsAppPage';
import SmsTemplatesPage from './sms/SmsTemplatesPage';
import SmsHistoryPage from './sms/SmsHistoryPage';
import WebsiteIntelligenceShell from './website-intelligence';
import WiAppLayout from './website-intelligence/components/layout/AppLayout';
import OverviewPage from './website-intelligence/pages/OverviewPage';
import AnalyzePage from './website-intelligence/pages/AnalyzePage';
import OpportunitiesPage from './website-intelligence/pages/OpportunitiesPage';
import OpportunityDetailPage from './website-intelligence/pages/OpportunityDetailPage';
import CapabilitiesPage from './website-intelligence/pages/CapabilitiesPage';
import EvidencePage from './website-intelligence/pages/EvidencePage';
import PagesPage from './website-intelligence/pages/PagesPage';
import WebsitesPage from './website-intelligence/pages/WebsitesPage';
import EmailsPage from './website-intelligence/pages/EmailsPage';
import CatalogPage from './website-intelligence/pages/CatalogPage';
import ServiceDetailPage from './website-intelligence/pages/ServiceDetailPage';
import ReportsPage from './website-intelligence/pages/ReportsPage';

const SECTION_SKIP = new Set([
  '/leads',
  '/event',
  '/vacancies',
  '/campaign',
  '/messages',
  '/whatsapp',
  '/sms-templates',
  '/sms-history',
  '/users',
  '/website-intelligence',
]);

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
          <Route path="messages" element={<MessagesPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="sms-templates" element={<SmsTemplatesPage />} />
          <Route path="sms-history" element={<SmsHistoryPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="leads/:leadId" element={<LeadDetails />} />
          <Route path="leads/:leadId/whatsapp" element={<LeadWhatsAppChat />} />

          <Route path="website-intelligence" element={<WebsiteIntelligenceShell />}>
            <Route element={<WiAppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="analyze" element={<AnalyzePage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="capabilities" element={<CapabilitiesPage />} />
              <Route path="evidence" element={<EvidencePage />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="websites" element={<WebsitesPage />} />
              <Route path="emails" element={<EmailsPage />} />
              <Route
                path="catalog"
                element={<Navigate to="/website-intelligence/catalog/talecraftor" replace />}
              />
              <Route path="catalog/:catalogId" element={<CatalogPage />} />
              <Route
                path="catalog/:catalogId/services/:serviceId"
                element={<ServiceDetailPage />}
              />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {Object.entries(PAGE_CONFIG)
            .filter(([path]) => !SECTION_SKIP.has(path))
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
