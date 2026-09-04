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

/**
 * Shared destructive confirmation for delete actions.
 */
export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  deleting = false,
  title = 'Delete permanently?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  deletingLabel = 'Deleting…',
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !deleting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-destructive/20 bg-destructive-subtle px-3 py-2.5 text-sm text-destructive">
          This action cannot be undone.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? deletingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
