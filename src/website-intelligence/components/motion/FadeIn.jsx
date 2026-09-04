import { motion, useReducedMotion } from 'motion/react';
import { fadeInProps } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * SmoothUI-style entrance wrapper — opacity + short travel only.
 * Use for section / card reveals, never for continuous decoration.
 */
export default function FadeIn({
  children,
  className,
  y = 10,
  scale,
  delay = 0,
  as: Component = motion.div,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = fadeInProps(shouldReduceMotion, { y, scale });

  return (
    <Component
      className={cn(className)}
      {...motionProps}
      transition={{
        ...motionProps.transition,
        delay: shouldReduceMotion ? 0 : delay,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
