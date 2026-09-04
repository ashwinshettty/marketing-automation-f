import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function SendEmailDialog({ open, onClose, onConfirm, sending, email }) {
  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send outreach email?</DialogTitle>
          <DialogDescription>
            This will be sent from the email account configured on the server.
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-2.5 rounded-lg border border-border p-3">
          <div>
            <dt className="label-text">To</dt>
            <dd className="mt-0.5 truncate font-mono text-sm">{email.recipient?.email || '—'}</dd>
          </div>
          <div>
            <dt className="label-text">Subject</dt>
            <dd className="mt-0.5 text-sm font-medium">{email.subject || '—'}</dd>
          </div>
        </dl>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={sending}>
            {sending ? 'Sending…' : 'Send email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
