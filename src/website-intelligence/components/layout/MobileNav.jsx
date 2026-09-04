import { Link } from 'react-router-dom';
import { ArrowLeft, Radar } from 'lucide-react';
import SidebarNav from './SidebarNav';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function MobileNav({ open, onOpenChange, catalogs = [] }) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[280px] flex-col gap-0 p-0 sm:max-w-[280px]">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-dark text-brand-foreground shadow-[0_2px_8px_rgba(51,102,204,0.35)]">
              <Radar className="size-4" strokeWidth={2} />
            </span>
            Website Intelligence
          </SheetTitle>
          <SheetDescription className="sr-only">Primary navigation</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
          <SidebarNav catalogs={catalogs} layoutGroup="mobile-nav" onNavigate={close} />
        </div>

        <div className="shrink-0 border-t border-border px-2.5 py-2.5">
          <Link
            to="/leads"
            onClick={close}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} />
            Back to AI Bot
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
