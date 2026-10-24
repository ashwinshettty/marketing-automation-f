import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { cn } from '../../lib/utils';

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = 'rgba(255, 211, 0, 0.45)',
  gradientOpacity = 0.7,
  gradientFrom = '#000080',
  gradientTo = '#ffd300',
}) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const gradientSizeRef = useRef(gradientSize);

  useEffect(() => {
    gradientSizeRef.current = gradientSize;
  }, [gradientSize]);

  const reset = useCallback(() => {
    const off = -gradientSizeRef.current;
    mouseX.set(off);
    mouseY.set(off);
  }, [mouseX, mouseY]);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <motion.div
      className={cn('group relative isolate overflow-hidden rounded-2xl border border-transparent', className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }}
      onPointerLeave={reset}
      style={{
        background: useMotionTemplate`
          linear-gradient(#ffffff 0 0) padding-box,
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom},
            ${gradientTo},
            rgba(255, 211, 0, 0.35) 100%
          ) border-box
        `,
      }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit] bg-white" />
      <motion.div
        className="pointer-events-none absolute inset-px z-30 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
              ${gradientColor},
              transparent 100%
            )
          `,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative z-40">{children}</div>
    </motion.div>
  );
}
