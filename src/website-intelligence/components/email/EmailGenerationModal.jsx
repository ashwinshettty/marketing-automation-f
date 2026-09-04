import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import OpportunitySelector from './OpportunitySelector';
import EmailRecipientSelector from './EmailRecipientSelector';
import EmailGenerationSettings from './EmailGenerationSettings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function EmailGenerationModal({
  open,
  onClose,
  context,
  selectedOpportunityIds,
  onOpportunityChange,
  selectedRecipient,
  onRecipientSelect,
  manualEmail,
  onManualEmailChange,
  settings,
  onSettingsChange,
  onGenerate,
  generating,
}) {
  const selectedCount = selectedOpportunityIds.length;
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !generating) {
          setSettingsOpen(false);
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={!generating}
        className="flex max-h-[min(90vh,840px)] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border px-5 py-4 pr-12">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>Generate outreach email</DialogTitle>
              <DialogDescription>
                Choose who to contact and which findings the message should mention.
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground"
              aria-expanded={settingsOpen}
              aria-controls="email-advanced-settings"
              onClick={() => setSettingsOpen((value) => !value)}
              disabled={generating}
            >
              <SlidersHorizontal />
              {settingsOpen ? 'Hide settings' : 'Advanced'}
            </Button>
          </div>
        </DialogHeader>

        {settingsOpen && (
          <div
            id="email-advanced-settings"
            className="shrink-0 border-b border-border bg-muted/30 px-5 py-3"
          >
            <EmailGenerationSettings settings={settings} onChange={onSettingsChange} />
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
          <EmailRecipientSelector
            recipients={context?.recipients || []}
            selectedEmail={selectedRecipient?.email}
            onSelect={onRecipientSelect}
            manualEmail={manualEmail}
            onManualEmailChange={onManualEmailChange}
          />

          <OpportunitySelector
            opportunities={context?.opportunities || []}
            selectedIds={selectedOpportunityIds}
            onChange={onOpportunityChange}
          />
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t border-border bg-muted/50 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={onGenerate} disabled={generating || selectedCount === 0}>
            {generating
              ? 'Generating…'
              : `Generate email${selectedCount ? ` from ${selectedCount} finding${selectedCount === 1 ? '' : 's'}` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
