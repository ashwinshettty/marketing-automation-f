import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AILoader from '@/components/smoothui/ai-loader';
import { duration, easeOut } from '@/lib/motion';
import { cn } from '@/lib/utils';

const STEPS = [
  'Reading website information',
  'Reviewing the selected opportunities',
  'Composing a personalized message',
  'Attaching supporting evidence',
];

/**
 * Live progress while an outreach draft is being generated.
 * Step highlight advances on a timer for feedback only — completion is driven by the API.
 */
export default function EmailGeneratingState({ opportunityCount, className }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className={cn('relative overflow-hidden rounded-xl border border-border bg-card p-6', className)}
    >
      <div aria-hidden="true" className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-subtle text-brand">
            <AILoader variant="dots" className="text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Generating your outreach email</h3>
            <p className="body-text mt-0.5">
              Working from {opportunityCount} selected opportunit{opportunityCount === 1 ? 'y' : 'ies'}.
              This usually takes a few seconds.
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {STEPS.map((step, index) => {
            const done = index < activeStep;
            const active = index === activeStep;

            return (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.normal, ease: easeOut, delay: index * 0.08 }}
                className={cn(
                  'flex items-center gap-2.5 text-sm transition-colors',
                  done && 'text-success',
                  active && 'font-medium text-foreground',
                  !done && !active && 'text-muted-foreground'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                    done && 'border-success bg-success text-white',
                    active && 'border-brand bg-brand-subtle text-brand',
                    !done && !active && 'border-border text-muted-foreground'
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                </span>
                {step}
                {active && (
                  <span className="meta-text ml-auto">
                    <AILoader variant="bar" className="text-brand" />
                  </span>
                )}
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-6 space-y-2 border-t border-border pt-5" aria-hidden="true">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </section>
  );
}
