/**
 * Shared Motion presets — aligned with SmoothUI animation tokens.
 *
 * Hierarchy:
 *   micro  100–180ms · normal 180–300ms · panel 250–450ms · layout 350–600ms
 *
 * Prefer opacity + small transforms. Respect prefers-reduced-motion at call sites
 * via `useReducedMotion` / the helpers below.
 */

import { DURATION, EASE_OUT, SPRING_DEFAULT, SPRING_SNAPPY } from '@/components/smoothui/lib/animation';

export { DURATION, EASE_OUT, SPRING_DEFAULT, SPRING_SNAPPY };

export const easeOut = EASE_OUT;

export const duration = {
  micro: DURATION.fast,
  normal: DURATION.default,
  panel: DURATION.slow,
  layout: DURATION.complex,
};

export const springSubtle = {
  type: 'spring',
  stiffness: 420,
  damping: 38,
  mass: 0.8,
};

/** Instant when reduced motion is preferred. */
export function motionTransition(shouldReduceMotion, transition) {
  if (shouldReduceMotion) return { duration: 0 };
  return transition;
}

/** Safe initial/animate props for entrance fades. */
export function fadeInProps(shouldReduceMotion, { y = 10, scale } = {}) {
  if (shouldReduceMotion) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y, ...(scale != null ? { scale } : {}) },
    animate: { opacity: 1, y: 0, ...(scale != null ? { scale: 1 } : {}) },
    transition: { ...SPRING_DEFAULT, bounce: 0.08 },
  };
}

/** Page-level entrance. */
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.panel, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: duration.normal, ease: easeOut },
  },
};

/** Parent for staggered lists/grids. */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.045, delayChildren: 0.04 },
  },
};

/** Child of `staggerContainer`. */
export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.panel, ease: easeOut },
  },
};

/** Rows in tables and dense lists — smaller travel than cards. */
export const rowItem = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easeOut },
  },
};

/** Fade/scale used by dialogs and popovers. */
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.normal, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: duration.micro, ease: easeOut } },
};

export const dialogVariants = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.panel, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.99,
    transition: { duration: duration.normal, ease: easeOut },
  },
};

/** Swapping between mutually exclusive states (idle → generating → generated). */
export const stateSwapVariants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.panel, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: duration.normal, ease: easeOut },
  },
};

/** Expand/collapse for accordion-style panels. */
export const collapseVariants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: { duration: duration.panel, ease: easeOut },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: duration.normal, ease: easeOut },
  },
};
