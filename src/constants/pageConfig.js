export const SIDEBAR_WIDTH_CLASS = 'w-64';

export const PAGE_CONFIG = {
  '/leads': {
    title: 'Leads',
    description: 'Manage and track your sales leads.',
  },
  '/analytics': {
    title: 'Analytics',
    description: 'View performance metrics and insights.',
  },
  '/campaign': {
    title: 'Campaigns',
    description: 'Create Meta-style campaigns with targeting, placements, budgets, and ad creatives.',
  },
  '/whatsapp': {
    title: 'WhatsApp',
    description: 'Manage WhatsApp conversations and outreach.',
  },
};

export const getPageConfig = (pathname) =>
  PAGE_CONFIG[pathname] ?? {
    title: 'Dashboard',
    description: 'Welcome to your sales dashboard.',
  };
