import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { dialogVariants, overlayVariants } from '@/lib/motion';

export default function ImageLightbox({ open, onClose, src, alt = 'Screenshot', caption }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && src && (
        <motion.div
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close image preview"
          />

          <motion.div
            variants={dialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col"
          >
            <div className="mb-3 flex justify-end">
              <Button variant="secondary" size="sm" autoFocus onClick={onClose}>
                Cancel
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
              <img
                src={src}
                alt={alt}
                className="max-h-[calc(90vh-7rem)] w-full bg-muted object-contain"
              />
              {caption && (
                <p className="border-t border-border px-4 py-3 text-sm">{caption}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
