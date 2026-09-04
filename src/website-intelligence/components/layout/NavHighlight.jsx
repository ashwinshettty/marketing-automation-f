import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Watermelon UI–style sidebar hover highlight.
 * A single spring-animated pill tracks the hovered nav row.
 */

const HighlightContext = createContext(null);

const SPRING = { type: 'spring', stiffness: 350, damping: 35 };

export function NavHighlight({
  children,
  className,
  highlightClassName,
  enabled = true,
}) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [bounds, setBounds] = useState(null);
  const id = useId();

  const updateBounds = useCallback((rect) => {
    const container = containerRef.current;
    if (!container || !rect) {
      setBounds(null);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    setBounds({
      top: rect.top - containerRect.top + container.scrollTop,
      left: rect.left - containerRect.left + container.scrollLeft,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const clearBounds = useCallback(() => setBounds(null), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const onScroll = () => clearBounds();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [clearBounds]);

  if (!enabled) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <HighlightContext.Provider value={{ updateBounds, clearBounds, id }}>
      <div ref={containerRef} className={cn('relative z-0', className)}>
        <AnimatePresence>
          {bounds && (
            <motion.div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute z-0 rounded-lg bg-sidebar-accent/80',
                highlightClassName
              )}
              initial={
                shouldReduceMotion
                  ? { opacity: 1, ...bounds }
                  : { opacity: 0, ...bounds }
              }
              animate={{ opacity: 1, ...bounds }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : SPRING}
            />
          )}
        </AnimatePresence>
        <div className="relative z-10">{children}</div>
      </div>
    </HighlightContext.Provider>
  );
}

export function NavHighlightItem({ children, className, value }) {
  const ctx = useContext(HighlightContext);
  const itemRef = useRef(null);
  const itemId = useId();
  const dataValue = value ?? itemId;

  if (!ctx) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={itemRef}
      className={cn('relative', className)}
      data-highlight="true"
      data-value={dataValue}
      onMouseEnter={() => {
        const node = itemRef.current;
        if (node) ctx.updateBounds(node.getBoundingClientRect());
      }}
      onMouseLeave={() => ctx.clearBounds()}
      onFocus={() => {
        const node = itemRef.current;
        if (node) ctx.updateBounds(node.getBoundingClientRect());
      }}
      onBlur={() => ctx.clearBounds()}
    >
      {children}
    </div>
  );
}
