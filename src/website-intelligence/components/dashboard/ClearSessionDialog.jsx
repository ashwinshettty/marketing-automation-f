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

export default function ClearSessionDialog({ open, onClose, onConfirm, website }) {
  const label = website ? formatDomain(website) : 'this website';

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear this session?</DialogTitle>
          <DialogDescription>
            This unloads the analysis for <span className="font-medium text-foreground">{label}</span>{' '}
            from the dashboard. Nothing is deleted — you can reopen it anytime from Websites.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Clear session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
