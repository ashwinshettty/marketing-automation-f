import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { duration, easeOut } from '@/lib/motion';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  const isError = toast?.type === 'error';
  const Icon = isError ? AlertTriangle : CheckCircle2;

  const Toast = (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: duration.normal, ease: easeOut }}
          role="status"
          aria-live="polite"
          className={cn(
            'fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-[0_8px_24px_rgba(17,17,17,0.10)]',
            isError ? 'border-destructive/25 bg-destructive-subtle' : 'border-border bg-popover'
          )}
        >
          <Icon
            className={cn('mt-0.5 size-4 shrink-0', isError ? 'text-destructive' : 'text-success')}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="text-sm">{toast.message}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="-mt-0.5 -mr-1.5 ml-1 shrink-0"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <X />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { showToast, Toast };
}
