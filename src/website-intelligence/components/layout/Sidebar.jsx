import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, PanelLeft, PanelLeftClose, Radar } from 'lucide-react';
import SidebarNav from './SidebarNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WIDTH_SPRING = { type: 'spring', stiffness: 320, damping: 36 };

export default function Sidebar({ catalogs = [], collapsed, onToggleCollapse }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 236 }}
      transition={shouldReduceMotion ? { duration: 0.15 } : WIDTH_SPRING}
      className={cn(
        'hidden h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar lg:flex'
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3',
          collapsed && 'justify-center px-2'
        )}
      >
        {collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            className="text-muted-foreground"
            aria-label="Expand sidebar"
          >
            <PanelLeft />
          </Button>
        ) : (
          <>
            <NavLink
              to="/website-intelligence"
              className="flex min-w-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-dark text-brand-foreground shadow-[0_2px_8px_rgba(51,102,204,0.35)]">
                <Radar className="size-4" strokeWidth={2} />
              </span>
              <motion.span
                initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="min-w-0 truncate text-sm font-semibold tracking-tight"
              >
                Website Intelligence
              </motion.span>
            </NavLink>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              className="ml-auto text-muted-foreground"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose />
            </Button>
          </>
        )}
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-x-hidden px-2.5 py-4',
          collapsed
            ? 'overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
            : 'overflow-y-auto'
        )}
      >
        {collapsed && (
          <NavLink
            to="/website-intelligence"
            title="Website Intelligence"
            className="mb-3 flex items-center justify-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-dark text-brand-foreground shadow-[0_2px_8px_rgba(51,102,204,0.35)]">
              <Radar className="size-4" strokeWidth={2} />
            </span>
          </NavLink>
        )}
        <SidebarNav catalogs={catalogs} collapsed={collapsed} layoutGroup="sidebar" />
      </div>

      <div className="shrink-0 border-t border-sidebar-border px-2.5 py-2.5">
        <NavLink
          to="/leads"
          title="Back to AI Bot"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors',
            'hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40',
            collapsed && 'justify-center px-2'
          )}
        >
          <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span className="truncate">Back to AI Bot</span>}
        </NavLink>
      </div>
    </motion.aside>
  );
}
