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

export default function RegenerateConfirmDialog({ open, onClose, onConfirm, regenerating }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Discard your edits and regenerate?</DialogTitle>
          <DialogDescription>
            You have changed this draft since it was generated.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-lg border border-warning/25 bg-warning-subtle p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Regenerating replaces the subject and body with a new version. Your current wording will be kept in the
            draft version history.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={regenerating}>
            Keep my edits
          </Button>
          <Button onClick={onConfirm} disabled={regenerating}>
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
