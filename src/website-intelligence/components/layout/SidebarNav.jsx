import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { CATALOG_ICON, NAV_SECTIONS } from './navigation';
import { NavHighlight, NavHighlightItem } from './NavHighlight';
import { SPRING_SNAPPY } from '@/components/smoothui/lib/animation';
import { cn } from '@/lib/utils';

/**
 * Nav rows shared by the desktop sidebar and the mobile drawer.
 *
 * Active route uses a shared layoutId pill (Watermelon/SmoothUI style).
 * Hover uses NavHighlight — a single spring pill that follows the pointer,
 * matching Watermelon UI's animateOnHover sidebar effect.
 */
function NavRow({ to, label, icon: Icon, end, collapsed, layoutGroup, onNavigate }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <NavHighlightItem value={to}>
      <NavLink
        to={to}
        end={end}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium outline-none transition-colors',
            'focus-visible:ring-3 focus-visible:ring-ring/40',
            isActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center px-2'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId={`${layoutGroup}-active`}
                transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
                className="absolute inset-0 rounded-lg border-l-[4px] border-highlight bg-highlight-tint"
                aria-hidden="true"
              />
            )}
            <Icon
              className={cn(
                'relative z-10 size-4 shrink-0 transition-transform duration-150',
                isActive ? 'text-brand-dark' : 'text-current',
                !isActive && 'group-hover:scale-[1.04]'
              )}
              strokeWidth={1.75}
            />
            {!collapsed && (
              <motion.span
                layout="position"
                className="relative z-10 truncate"
              >
                {label}
              </motion.span>
            )}
          </>
        )}
      </NavLink>
    </NavHighlightItem>
  );
}

export default function SidebarNav({
  catalogs = [],
  collapsed = false,
  layoutGroup = 'sidebar',
  onNavigate,
}) {
  const catalogItems = catalogs.length ? catalogs : [{ id: 'talecraftor', name: 'Service catalog' }];

  return (
    <NavHighlight
      className="min-h-0"
      highlightClassName="bg-sidebar-accent/70 ring-1 ring-sidebar-border/60"
    >
      <nav className={cn('flex flex-col', collapsed ? 'gap-2' : 'gap-5')} aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            {!collapsed && (
              <motion.div
                layout
                className="label-text px-2.5 pb-1.5"
              >
                {section.label}
              </motion.div>
            )}
            <div className={cn('flex flex-col', collapsed ? 'gap-0' : 'gap-0.5')}>
              {section.items.map((item) => (
                <NavRow
                  key={item.to}
                  {...item}
                  collapsed={collapsed}
                  layoutGroup={layoutGroup}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}

        <div>
          {!collapsed && (
            <motion.div layout className="label-text px-2.5 pb-1.5">
              Services
            </motion.div>
          )}
          <div className="flex flex-col gap-0.5">
            {catalogItems.map((catalog) => (
              <NavRow
                key={catalog.id}
                to={`/website-intelligence/catalog/${catalog.id}`}
                label={catalog.name}
                icon={CATALOG_ICON}
                collapsed={collapsed}
                layoutGroup={layoutGroup}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </nav>
    </NavHighlight>
  );
}

export { NavRow };
