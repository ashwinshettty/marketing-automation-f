import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDomain } from '../../utils/formatters';

export default function DeleteWebsiteDialog({ open, onClose, onConfirm, deleting, website, companyName }) {
  const label = companyName || (website ? formatDomain(website) : 'this website');

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !deleting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
            Delete this analysis?
          </DialogTitle>
          <DialogDescription>
            This permanently removes the analysis for <span className="font-medium text-foreground">{label}</span>,
            including opportunities, evidence, outreach drafts, and all page screenshots stored on AWS.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/20 bg-destructive-subtle px-3 py-2.5 text-sm text-destructive">
          This action cannot be undone.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete analysis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
