/**
 * Google Ads–style navigation map.
 * Primary rail → secondary panel sections → main content routes.
 * Structure mirrors Google Ads Help “Navigate your Google Ads serving account”.
 */

export const GOOGLE_ADS_BASE = '/google-ads';

/** @typedef {{ id: string, label: string, path?: string, badge?: string, children?: NavLeaf[] }} NavLeaf */
/** @typedef {{ id: string, label?: string, collapsible?: boolean, defaultOpen?: boolean, items: NavLeaf[] }} NavGroup */

/** @type {{ id: string, label: string, icon: string, defaultPath: string, groups: NavGroup[] }[]} */
export const PRIMARY_SECTIONS = [
  {
    id: 'create',
    label: 'Create',
    icon: 'plus',
    defaultPath: `${GOOGLE_ADS_BASE}/create/objective`,
    groups: [],
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: 'campaigns',
    defaultPath: `${GOOGLE_ADS_BASE}/campaigns/overview`,
    groups: [
      {
        id: 'campaigns-top',
        items: [
          { id: 'overview', label: 'Overview', path: `${GOOGLE_ADS_BASE}/campaigns/overview` },
          {
            id: 'recommendations',
            label: 'Recommendations',
            path: `${GOOGLE_ADS_BASE}/campaigns/recommendations`,
            badge: 'dot',
          },
          {
            id: 'insights',
            label: 'Insights and reports',
            path: `${GOOGLE_ADS_BASE}/campaigns/insights`,
          },
        ],
      },
      {
        id: 'campaigns-manage',
        label: 'Campaigns',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'campaigns-list', label: 'Campaigns', path: `${GOOGLE_ADS_BASE}/campaigns/list` },
          { id: 'ad-groups', label: 'Ad groups', path: `${GOOGLE_ADS_BASE}/campaigns/ad-groups` },
          { id: 'ads', label: 'Ads', path: `${GOOGLE_ADS_BASE}/campaigns/ads` },
          {
            id: 'asset-groups',
            label: 'Asset groups',
            path: `${GOOGLE_ADS_BASE}/campaigns/asset-groups`,
          },
          {
            id: 'experiments',
            label: 'Experiments',
            path: `${GOOGLE_ADS_BASE}/campaigns/experiments`,
          },
          {
            id: 'campaign-groups',
            label: 'Campaign groups',
            path: `${GOOGLE_ADS_BASE}/campaigns/campaign-groups`,
          },
        ],
      },
      {
        id: 'campaigns-more',
        collapsible: true,
        defaultOpen: false,
        label: 'More',
        items: [
          { id: 'assets', label: 'Assets', path: `${GOOGLE_ADS_BASE}/campaigns/assets` },
          {
            id: 'audiences',
            label: 'Audiences, keywords, and content',
            path: `${GOOGLE_ADS_BASE}/campaigns/audiences`,
          },
          {
            id: 'change-history',
            label: 'Change history',
            path: `${GOOGLE_ADS_BASE}/campaigns/change-history`,
          },
        ],
      },
    ],
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: 'goals',
    defaultPath: `${GOOGLE_ADS_BASE}/goals/conversions`,
    groups: [
      {
        id: 'goals-conversions',
        label: 'Conversions',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'conversions-summary',
            label: 'Summary',
            path: `${GOOGLE_ADS_BASE}/goals/conversions`,
          },
          {
            id: 'all-conversions',
            label: 'All conversions',
            path: `${GOOGLE_ADS_BASE}/goals/all-conversions`,
          },
          {
            id: 'conversions-settings',
            label: 'Conversion settings',
            path: `${GOOGLE_ADS_BASE}/goals/settings`,
          },
          {
            id: 'value-rules',
            label: 'Value rules',
            path: `${GOOGLE_ADS_BASE}/goals/value-rules`,
          },
          {
            id: 'custom-variables',
            label: 'Custom variables',
            path: `${GOOGLE_ADS_BASE}/goals/custom-variables`,
          },
          { id: 'uploads', label: 'Uploads', path: `${GOOGLE_ADS_BASE}/goals/uploads` },
        ],
      },
      {
        id: 'goals-measurement',
        label: 'Measurement',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'attribution',
            label: 'Attribution',
            path: `${GOOGLE_ADS_BASE}/goals/attribution`,
          },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'tools',
    defaultPath: `${GOOGLE_ADS_BASE}/tools/asset-studio`,
    groups: [
      {
        id: 'tools-main',
        items: [
          {
            id: 'asset-studio',
            label: 'Asset studio',
            path: `${GOOGLE_ADS_BASE}/tools/asset-studio`,
          },
          {
            id: 'planning',
            label: 'Planning',
            path: `${GOOGLE_ADS_BASE}/tools/planning`,
            children: [
              {
                id: 'keyword-planner',
                label: 'Keyword Planner',
                path: `${GOOGLE_ADS_BASE}/tools/planning/keyword-planner`,
              },
              {
                id: 'performance-planner',
                label: 'Performance Planner',
                path: `${GOOGLE_ADS_BASE}/tools/planning/performance-planner`,
              },
              {
                id: 'reach-planner',
                label: 'Reach Planner',
                path: `${GOOGLE_ADS_BASE}/tools/planning/reach-planner`,
              },
            ],
          },
          {
            id: 'app-hub',
            label: 'App advertising hub',
            path: `${GOOGLE_ADS_BASE}/tools/app-advertising-hub`,
          },
          {
            id: 'shared-library',
            label: 'Shared library',
            path: `${GOOGLE_ADS_BASE}/tools/shared-library`,
            children: [
              {
                id: 'audience-manager',
                label: 'Audience manager',
                path: `${GOOGLE_ADS_BASE}/tools/shared-library/audience-manager`,
              },
              {
                id: 'exclusion-lists',
                label: 'Exclusion lists',
                path: `${GOOGLE_ADS_BASE}/tools/shared-library/exclusion-lists`,
              },
              {
                id: 'asset-library',
                label: 'Asset library',
                path: `${GOOGLE_ADS_BASE}/tools/shared-library/asset-library`,
              },
            ],
          },
          {
            id: 'youtube-partnerships',
            label: 'YouTube creator partnerships',
            path: `${GOOGLE_ADS_BASE}/tools/youtube-creator-partnerships`,
            badge: 'BETA',
          },
          {
            id: 'content-suitability',
            label: 'Content suitability',
            path: `${GOOGLE_ADS_BASE}/tools/content-suitability`,
          },
          {
            id: 'data-manager',
            label: 'Data manager',
            path: `${GOOGLE_ADS_BASE}/tools/data-manager`,
          },
          {
            id: 'troubleshooting',
            label: 'Troubleshooting',
            path: `${GOOGLE_ADS_BASE}/tools/troubleshooting`,
            children: [
              {
                id: 'policy-manager',
                label: 'Policy manager',
                path: `${GOOGLE_ADS_BASE}/tools/troubleshooting/policy-manager`,
              },
              {
                id: 'ad-preview',
                label: 'Ad preview and diagnosis',
                path: `${GOOGLE_ADS_BASE}/tools/troubleshooting/ad-preview`,
              },
            ],
          },
          {
            id: 'bulk-actions',
            label: 'Bulk actions',
            path: `${GOOGLE_ADS_BASE}/tools/bulk-actions`,
          },
          {
            id: 'budgets-bidding',
            label: 'Budgets and bidding',
            path: `${GOOGLE_ADS_BASE}/tools/budgets-and-bidding`,
            children: [
              {
                id: 'shared-budgets',
                label: 'Shared budgets',
                path: `${GOOGLE_ADS_BASE}/tools/budgets-and-bidding/shared-budgets`,
              },
              {
                id: 'bid-strategies',
                label: 'Bid strategies',
                path: `${GOOGLE_ADS_BASE}/tools/budgets-and-bidding/bid-strategies`,
              },
              {
                id: 'adjustments',
                label: 'Adjustments',
                path: `${GOOGLE_ADS_BASE}/tools/budgets-and-bidding/adjustments`,
              },
            ],
          },
          {
            id: 'business-data',
            label: 'Business data',
            path: `${GOOGLE_ADS_BASE}/tools/business-data`,
          },
        ],
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: 'billing',
    defaultPath: `${GOOGLE_ADS_BASE}/billing/summary`,
    groups: [
      {
        id: 'billing-main',
        items: [
          { id: 'summary', label: 'Summary', path: `${GOOGLE_ADS_BASE}/billing/summary` },
          { id: 'documents', label: 'Documents', path: `${GOOGLE_ADS_BASE}/billing/documents` },
          {
            id: 'payment-methods',
            label: 'Payment methods',
            path: `${GOOGLE_ADS_BASE}/billing/payment-methods`,
          },
          { id: 'promotions', label: 'Promotions', path: `${GOOGLE_ADS_BASE}/billing/promotions` },
          {
            id: 'billing-transfers',
            label: 'Billing transfers',
            path: `${GOOGLE_ADS_BASE}/billing/transfers`,
          },
          {
            id: 'advertiser-verification',
            label: 'Advertiser verification',
            path: `${GOOGLE_ADS_BASE}/billing/advertiser-verification`,
          },
          { id: 'billing-settings', label: 'Settings', path: `${GOOGLE_ADS_BASE}/billing/settings` },
        ],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'admin',
    defaultPath: `${GOOGLE_ADS_BASE}/admin/account-settings`,
    groups: [
      {
        id: 'admin-main',
        items: [
          {
            id: 'account-settings',
            label: 'Account settings',
            path: `${GOOGLE_ADS_BASE}/admin/account-settings`,
          },
          { id: 'preferences', label: 'Preferences', path: `${GOOGLE_ADS_BASE}/admin/preferences` },
          {
            id: 'notifications',
            label: 'Notifications',
            path: `${GOOGLE_ADS_BASE}/admin/notifications`,
          },
          {
            id: 'access-security',
            label: 'Access and security',
            path: `${GOOGLE_ADS_BASE}/admin/access-and-security`,
          },
          {
            id: 'linked-accounts',
            label: 'Linked accounts',
            path: `${GOOGLE_ADS_BASE}/admin/linked-accounts`,
          },
        ],
      },
    ],
  },
];

export const getPrimarySection = (sectionId) =>
  PRIMARY_SECTIONS.find((section) => section.id === sectionId) || PRIMARY_SECTIONS[1];

export const resolvePrimaryFromPath = (pathname = '') => {
  const rest = pathname.replace(GOOGLE_ADS_BASE, '').replace(/^\//, '');
  const top = rest.split('/')[0] || 'campaigns';
  if (top === 'create') return getPrimarySection('create');
  return getPrimarySection(top) || getPrimarySection('campaigns');
};

export const pageMeta = (title, description) => ({ title, description });
