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
    description: 'Current Inkstall openings and JDs the agent uses to brief candidates (Beacot for teaching, resume for non-teaching).',
  },
  '/analytics': {
    title: 'Analytics',
    description: 'View performance metrics and insights.',
  },
  '/campaign': {
    title: 'Campaigns',
    description: 'Create Meta-style campaigns with targeting, placements, budgets, and ad creatives.',
  },
  '/messages': {
    title: 'Messages',
    description: 'Browse all WhatsApp chats in one place.',
  },
  '/whatsapp': {
    title: 'Template',
    description: 'Manage WhatsApp message templates and outreach.',
  },
  '/sms-templates': {
    title: 'SMS Templates',
    description: 'Manage approved DLT promotional SMS templates and IDs.',
  },
  '/sms-history': {
    title: 'SMS History',
    description: 'See which promotional SMS templates were sent to leads.',
  },
  '/website-intelligence': {
    title: 'Website Intelligence',
    description: 'Crawl public sites, detect capabilities, and turn gaps into outreach.',
  },
  '/users': {
    title: 'Users',
    description: 'Add admins and sales users and assign their portal roles.',
  },
};

export const getPageConfig = (pathname) => {
  if (pathname.startsWith('/website-intelligence')) {
    return PAGE_CONFIG['/website-intelligence'];
  }

  return (
    PAGE_CONFIG[pathname] ?? {
      title: 'Dashboard',
      description: 'Welcome to your sales dashboard.',
    }
  );
};
