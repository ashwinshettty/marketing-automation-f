import SectionPlaceholder from '../components/SectionPlaceholder';

const page = (title, description, bullets = []) => () => (
  <SectionPlaceholder title={title} description={description} bullets={bullets} />
);

/** Lazy-ish registry of secondary destinations → page component factories. */
export const PAGE_REGISTRY = {
  [`/google-ads/campaigns/recommendations`]: page(
    'Recommendations',
    'Optimization suggestions for budget, bidding, creatives, and keywords.',
    ['Review actionable recommendations', 'Apply or dismiss suggestions'],
  ),
  [`/google-ads/campaigns/insights`]: page(
    'Insights and reports',
    'Auction insights, search terms, landing pages, and where ads showed.',
    ['Search terms', 'Auction insights', 'Devices and locations', 'Report editor'],
  ),
  [`/google-ads/campaigns/ad-groups`]: page(
    'Ad groups',
    'Organize keywords and ads into tightly themed ad groups.',
  ),
  [`/google-ads/campaigns/ads`]: page(
    'Ads',
    'Manage responsive search ads and other ad formats.',
  ),
  [`/google-ads/campaigns/asset-groups`]: page(
    'Asset groups',
    'Asset groups used by Performance Max campaigns.',
  ),
  [`/google-ads/campaigns/experiments`]: page(
    'Experiments',
    'Create and monitor campaign experiments and ad variations.',
  ),
  [`/google-ads/campaigns/campaign-groups`]: page(
    'Campaign groups',
    'Group related campaigns for shared reporting and budgets.',
  ),
  [`/google-ads/campaigns/assets`]: page(
    'Assets',
    'Sitelinks, callouts, images, and other assets linked to campaigns.',
  ),
  [`/google-ads/campaigns/audiences`]: page(
    'Audiences, keywords, and content',
    'Search keywords, audiences, locations, ad schedule, and content exclusions.',
  ),
  [`/google-ads/campaigns/change-history`]: page(
    'Change history',
    'Audit who changed campaigns, budgets, and ads — and when.',
  ),
  [`/google-ads/goals/value-rules`]: page(
    'Value rules',
    'Adjust conversion values by audience, location, or device.',
  ),
  [`/google-ads/goals/custom-variables`]: page(
    'Custom variables',
    'Pass additional conversion context for bidding and reporting.',
  ),
  [`/google-ads/goals/uploads`]: page(
    'Uploads',
    'Upload offline conversion data to match with ad clicks.',
  ),
  [`/google-ads/goals/attribution`]: page(
    'Attribution',
    'Understand how credit is assigned across ads and conversions.',
  ),
  [`/google-ads/tools/asset-studio`]: page(
    'Asset studio',
    'Create and manage creative assets in one workspace.',
  ),
  [`/google-ads/tools/planning`]: page(
    'Planning',
    'Plan keywords, forecasts, and reach with Google Ads planners.',
  ),
  [`/google-ads/tools/planning/keyword-planner`]: page(
    'Keyword Planner',
    'Discover keywords, volumes, and bid estimates for Search campaigns.',
  ),
  [`/google-ads/tools/planning/performance-planner`]: page(
    'Performance Planner',
    'Forecast how budget changes may affect conversions and cost.',
  ),
  [`/google-ads/tools/planning/reach-planner`]: page(
    'Reach Planner',
    'Plan video reach and frequency on YouTube.',
  ),
  [`/google-ads/tools/app-advertising-hub`]: page(
    'App advertising hub',
    'Tools and insights for app install and engagement campaigns.',
  ),
  [`/google-ads/tools/shared-library`]: page(
    'Shared library',
    'Reusable audiences, assets, locations, and exclusion lists.',
  ),
  [`/google-ads/tools/shared-library/audience-manager`]: page(
    'Audience manager',
    'Build and analyze remarketing and custom audiences.',
  ),
  [`/google-ads/tools/shared-library/exclusion-lists`]: page(
    'Exclusion lists',
    'Shared negative keyword and placement exclusions.',
  ),
  [`/google-ads/tools/shared-library/asset-library`]: page(
    'Asset library',
    'Central library for images, videos, and text assets.',
  ),
  [`/google-ads/tools/youtube-creator-partnerships`]: page(
    'YouTube creator partnerships',
    'Discover and manage creator partnership opportunities.',
  ),
  [`/google-ads/tools/content-suitability`]: page(
    'Content suitability',
    'Brand safety controls for where ads can appear.',
  ),
  [`/google-ads/tools/data-manager`]: page(
    'Data manager',
    'Connect first-party data sources used for audiences and measurement.',
  ),
  [`/google-ads/tools/troubleshooting`]: page(
    'Troubleshooting',
    'Policy status, ad diagnosis, and delivery checks.',
  ),
  [`/google-ads/tools/troubleshooting/policy-manager`]: page(
    'Policy manager',
    'Review policy issues affecting ads and assets.',
  ),
  [`/google-ads/tools/troubleshooting/ad-preview`]: page(
    'Ad preview and diagnosis',
    'Preview ads by location and diagnose serving issues.',
  ),
  [`/google-ads/tools/bulk-actions`]: page(
    'Bulk actions',
    'Rules, scripts, and spreadsheet uploads for large changes.',
  ),
  [`/google-ads/tools/budgets-and-bidding`]: page(
    'Budgets and bidding',
    'Shared budgets, portfolio bid strategies, and seasonality adjustments.',
  ),
  [`/google-ads/tools/budgets-and-bidding/shared-budgets`]: page(
    'Shared budgets',
    'Budgets shared across multiple campaigns.',
  ),
  [`/google-ads/tools/budgets-and-bidding/bid-strategies`]: page(
    'Bid strategies',
    'Portfolio strategies such as target CPA or maximize conversions.',
  ),
  [`/google-ads/tools/budgets-and-bidding/adjustments`]: page(
    'Adjustments',
    'Seasonality adjustments and data exclusions for Smart Bidding.',
  ),
  [`/google-ads/tools/business-data`]: page(
    'Business data',
    'Feed business data used by campaigns and assets.',
  ),
  [`/google-ads/billing/summary`]: page(
    'Billing summary',
    'Monitor spend, invoices, and payment activity.',
  ),
  [`/google-ads/billing/documents`]: page(
    'Documents',
    'Download invoices and billing statements.',
  ),
  [`/google-ads/billing/payment-methods`]: page(
    'Payment methods',
    'Manage cards and other payment instruments.',
  ),
  [`/google-ads/billing/promotions`]: page(
    'Promotions',
    'Apply promotional credits to the account.',
  ),
  [`/google-ads/billing/transfers`]: page(
    'Billing transfers',
    'Move billing responsibility between accounts.',
  ),
  [`/google-ads/billing/advertiser-verification`]: page(
    'Advertiser verification',
    'Complete identity verification required by Google.',
  ),
  [`/google-ads/billing/settings`]: page(
    'Billing settings',
    'Currency, invoicing preferences, and billing contacts.',
  ),
  [`/google-ads/admin/account-settings`]: page(
    'Account settings',
    'Time zone, auto-tagging, and account-level preferences.',
  ),
  [`/google-ads/admin/preferences`]: page(
    'Preferences',
    'Personal UI and notification preferences for this user.',
  ),
  [`/google-ads/admin/notifications`]: page(
    'Notifications',
    'Choose which account alerts you receive.',
  ),
  [`/google-ads/admin/access-and-security`]: page(
    'Access and security',
    'Users, managers, security tasks, and service-account access.',
    ['Invite users', 'Service accounts need Standard access to mutate campaigns'],
  ),
  [`/google-ads/admin/linked-accounts`]: page(
    'Linked accounts',
    'Link Analytics, Merchant Center, YouTube, and other products.',
  ),
};
