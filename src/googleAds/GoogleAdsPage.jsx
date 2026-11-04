import { useLocation } from 'react-router-dom';
import SelectObjective from './CampaignCreation/SelectObjective';
import CampaignWizardShell from './CampaignCreation/CampaignWizardShell';
import CreateComingSoon from './CampaignCreation/CreateComingSoon';
import CampaignsListPage from './pages/campaigns/CampaignsListPage';
import OverviewPage from './pages/campaigns/OverviewPage';
import GoalsSummaryPage from './pages/goals/GoalsSummaryPage';
import AllConversionsPage from './pages/goals/AllConversionsPage';
import ConversionSettingsPage from './pages/goals/ConversionSettingsPage';
import { PAGE_REGISTRY } from './pages/pageRegistry';
import SectionPlaceholder from './components/SectionPlaceholder';

/**
 * Resolves the active main view from the URL.
 * Keeps routing thin: shell owns chrome; this owns page selection.
 */
export default function GoogleAdsPage() {
  const { pathname } = useLocation();
  const normalized = pathname.replace(/\/$/, '') || '/google-ads';

  if (
    normalized === '/google-ads'
    || normalized === '/google-ads/campaigns'
    || normalized === '/google-ads/campaigns/overview'
  ) {
    return <OverviewPage />;
  }

  if (normalized === '/google-ads/campaigns/list') {
    return <CampaignsListPage />;
  }

  if (
    normalized === '/google-ads/create'
    || normalized === '/google-ads/create/objective'
  ) {
    return <SelectObjective />;
  }

  if (
    normalized === '/google-ads/create/search'
    || normalized.startsWith('/google-ads/create/search/')
  ) {
    return <CampaignWizardShell />;
  }

  if (normalized === '/google-ads/create/coming-soon') {
    return <CreateComingSoon />;
  }

  if (
    normalized === '/google-ads/goals'
    || normalized === '/google-ads/goals/conversions'
  ) {
    return <GoalsSummaryPage />;
  }

  if (normalized === '/google-ads/goals/all-conversions') {
    return <AllConversionsPage />;
  }

  if (normalized === '/google-ads/goals/settings') {
    return <ConversionSettingsPage />;
  }

  const Page = PAGE_REGISTRY[normalized];
  if (Page) return <Page />;

  return (
    <SectionPlaceholder
      title="Page not found"
      description="This Google Ads section is not mapped yet. Pick another item from the left panels."
    />
  );
}
