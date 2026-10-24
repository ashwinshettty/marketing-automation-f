import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function BlurFade({ children, className, duration = 0.28, delay = 0, offset = 4 }) {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ y: offset, opacity: 0, filter: 'blur(4px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
