import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import EmailGeneratingState from './EmailGeneratingState';

/**
 * Centered progress while generation runs — stays in front of the page.
 * Controlled by the parent; not user-dismissible while open.
 */
export default function EmailGeneratingDialog({ open, opportunityCount }) {
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        /* Keep open until the parent finishes generation. */
      }}
    >
      <DialogContent showCloseButton={false} className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Generating outreach email</DialogTitle>
          <DialogDescription>
            Please wait while we compose your personalized outreach message.
          </DialogDescription>
        </DialogHeader>
        <EmailGeneratingState
          opportunityCount={opportunityCount}
          className="rounded-none border-0"
        />
      </DialogContent>
    </Dialog>
  );
}
