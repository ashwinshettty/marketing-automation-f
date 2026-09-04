import {
  BarChart3,
  BookOpen,
  FileSearch,
  FileText,
  Globe,
  LayoutDashboard,
  Mail,
  Radar,
  Shield,
  Target,
} from 'lucide-react';

/**
 * Single source of truth for primary navigation, shared by the desktop sidebar,
 * the mobile drawer and the command palette.
 */
export const NAV_SECTIONS = [
  {
    id: 'intelligence',
    label: 'Intelligence',
    items: [
      { to: '/website-intelligence', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/website-intelligence/analyze', label: 'Analyze', icon: Radar },
      { to: '/website-intelligence/websites', label: 'Websites', icon: Globe },
      { to: '/website-intelligence/pages', label: 'Crawled pages', icon: FileText },
    ],
  },
  {
    id: 'findings',
    label: 'Findings',
    items: [
      { to: '/website-intelligence/opportunities', label: 'Opportunities', icon: Target },
      { to: '/website-intelligence/capabilities', label: 'Capabilities', icon: Shield },
      { to: '/website-intelligence/evidence', label: 'Evidence', icon: FileSearch },
    ],
  },
  {
    id: 'outreach',
    label: 'Outreach',
    items: [
      { to: '/website-intelligence/reports', label: 'Outreach', icon: BarChart3 },
      { to: '/website-intelligence/emails', label: 'Email history', icon: Mail },
    ],
  },
];

export const CATALOG_ICON = BookOpen;

export function flattenNavItems(catalogs = []) {
  const items = NAV_SECTIONS.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.label }))
  );

  const catalogItems = (catalogs.length ? catalogs : [{ id: 'talecraftor', name: 'Service catalog' }]).map(
    (catalog) => ({
      to: `/website-intelligence/catalog/${catalog.id}`,
      label: catalog.name,
      icon: CATALOG_ICON,
      section: 'Services',
    })
  );

  return [...items, ...catalogItems];
}
