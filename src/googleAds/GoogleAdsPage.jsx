import { useLocation } from 'react-router-dom';
import SelectObjective from './CampaignCreation/SelectObjective';
import CampaignWizardShell from './CampaignCreation/CampaignWizardShell';
import CreateComingSoon from './CampaignCreation/CreateComingSoon';
import AdGroupsListPage from './pages/campaigns/AdGroupsListPage';
import AudienceScopePage from './pages/campaigns/AudienceScopePage';
import AudiencesPage from './pages/campaigns/AudiencesPage';
import CampaignAssetsPage from './pages/campaigns/CampaignAssetsPage';
import CampaignLocationsPage from './pages/campaigns/CampaignLocationsPage';
import CampaignsListPage from './pages/campaigns/CampaignsListPage';
import ContentPage from './pages/campaigns/ContentPage';
import KeywordsPage from './pages/campaigns/KeywordsPage';
import OverviewPage from './overview/OverviewPage';
import LocationsTablePage from './overview/LocationsTablePage';
import AssetReportPage from './overview/AssetReportPage';
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

  const assetView = normalized.match(/^\/google-ads\/campaigns\/overview\/([^/]+)\/asset_report$/);
  if (assetView || normalized === '/google-ads/campaigns/asset-groups') {
    return (
      <AssetReportPage
        campaignId={assetView ? decodeURIComponent(assetView[1]) : ''}
      />
    );
  }

  const locationView = normalized.match(
    /^\/google-ads\/campaigns\/overview\/([^/]+)\/(targeted_location|excluded_location)$/,
  );
  if (locationView) {
    return (
      <LocationsTablePage
        campaignId={decodeURIComponent(locationView[1])}
        mode={locationView[2] === 'excluded_location' ? 'excluded' : 'targeted'}
      />
    );
  }

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

  if (normalized === '/google-ads/campaigns/ad-groups') {
    return <AdGroupsListPage />;
  }

  if (normalized === '/google-ads/campaigns/assets') {
    return <CampaignAssetsPage />;
  }

  if (normalized === '/google-ads/campaigns/audiences') {
    return <AudiencesPage />;
  }
  if (normalized === '/google-ads/campaigns/audiences/keywords') {
    return <KeywordsPage />;
  }
  if (normalized === '/google-ads/campaigns/audiences/locations') {
    return <CampaignLocationsPage />;
  }
  if (normalized === '/google-ads/campaigns/audiences/content') {
    return <ContentPage />;
  }
  if (normalized === '/google-ads/campaigns/audiences/ad-schedule') {
    return (
      <AudienceScopePage
        title="Ad schedule"
        description="Days and hours when ads can run for this campaign."
      />
    );
  }
  if (normalized === '/google-ads/campaigns/audiences/bid-adjustments') {
    return (
      <AudienceScopePage
        title="Advanced bid adjustments"
        description="Device, location, and audience bid adjustments."
      />
    );
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
