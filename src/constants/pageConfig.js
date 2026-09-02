export const SIDEBAR_WIDTH_CLASS = 'w-64';

export const PAGE_CONFIG = {
  '/leads': {
    title: 'Leads',
    description: 'Manage and track your sales leads.',
  },
  '/event': {
    title: 'Event',
    description: 'View and manage scheduled action items and follow-ups.',
  },
  '/vacancies': {
    title: 'Vacancies',
    description: 'Current Inkstall openings and JDs the agent uses to brief candidates and score resumes.',
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
  '/users': {
    title: 'Users',
    description: 'Add admins and sales users and assign their portal roles.',
  },
};

export const getPageConfig = (pathname) =>
  PAGE_CONFIG[pathname] ?? {
    title: 'Dashboard',
    description: 'Welcome to your sales dashboard.',
  };
