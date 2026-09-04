import { NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { NavHighlight, NavHighlightItem } from './NavHighlight';
import { isNavActive } from './navigation';
import { SPRING_SNAPPY } from '@/components/smoothui/lib/animation';
import { cn } from '@/lib/utils';

/**
 * Horizontal nav with Watermelon hover highlight + SmoothUI layoutId underline.
 */
export default function TopNavLinks({
  items,
  layoutGroup,
  underlineClassName = 'bg-highlight',
  className,
  compact = false,
  onNavigate,
}) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const activeTo =
    items.find((item) => isNavActive(location.pathname, item))?.to ?? null;

  return (
    <NavHighlight
      className={cn('flex min-w-0', className)}
      highlightClassName="rounded-md bg-muted/80"
    >
      <nav
        className={cn(
          'flex h-full min-w-0 items-stretch gap-0.5',
          'overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        )}
        aria-label={layoutGroup}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(location.pathname, item);

          return (
            <NavHighlightItem key={item.to} value={item.to} className="flex shrink-0">
              <NavLink
                to={item.to}
                end={item.end}
                title={item.label}
                onClick={onNavigate}
                className={cn(
                  'relative inline-flex h-full items-center gap-1.5 px-2.5 text-sm font-medium outline-none transition-colors',
                  'focus-visible:ring-3 focus-visible:ring-ring/40',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  compact && 'px-2 text-[13px]'
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      'size-3.5 shrink-0',
                      active ? 'text-brand-dark' : 'text-current',
                      compact && 'hidden xl:inline'
                    )}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                )}
                <span className="whitespace-nowrap">{item.label}</span>
                {active && activeTo === item.to && (
                  <motion.span
                    layoutId={`${layoutGroup}-underline`}
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING_SNAPPY}
                    className={cn(
                      'absolute inset-x-1.5 bottom-0 h-[3px] rounded-t-full',
                      underlineClassName
                    )}
                    aria-hidden="true"
                  />
                )}
              </NavLink>
            </NavHighlightItem>
          );
        })}
      </nav>
    </NavHighlight>
  );
}
