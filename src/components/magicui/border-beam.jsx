import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function BorderBeam({
  className,
  size = 80,
  delay = 0,
  duration = 8,
  colorFrom = '#ffd300',
  colorTo = '#000080',
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent [mask-clip:padding-box,border-box] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect]"
      style={{ '--border-beam-width': `${borderWidth}px` }}
    >
      <motion.div
        className={cn(
          'absolute aspect-square bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent',
          className,
        )}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
}
