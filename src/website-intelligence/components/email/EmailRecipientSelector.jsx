import { AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function EmailRecipientSelector({
  recipients,
  selectedEmail,
  onSelect,
  manualEmail,
  onManualEmailChange,
}) {
  if (!recipients.length) {
    return (
      <div className="rounded-lg border border-warning/25 bg-warning-subtle p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" strokeWidth={2} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">No public email address was detected</p>
            <p className="body-text mt-0.5">
              The crawl did not find a contact address on this site. You can still generate the draft and enter a
              recipient manually.
            </p>

            <Label htmlFor="manual-recipient" className="label-text mt-3 block">
              Recipient email
            </Label>
            <Input
              id="manual-recipient"
              type="email"
              value={manualEmail || ''}
              onChange={(e) => onManualEmailChange(e.target.value)}
              placeholder="owner@company.com"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">Recipient</legend>
      {recipients.map((recipient) => {
        const checked = selectedEmail === recipient.email;

        return (
          <label
            key={recipient.email}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
              checked ? 'border-brand bg-brand-subtle' : 'border-border hover:bg-muted/50'
            )}
          >
            <input
              type="radio"
              name="recipient"
              checked={checked}
              onChange={() => onSelect(recipient)}
              className="mt-0.5 size-4 accent-brand"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm">{recipient.email}</p>
              <p className="meta-text mt-0.5">
                Found on website · {recipient.sourceLabel} · {recipient.confidence} confidence
              </p>
            </div>
          </label>
        );
      })}
    </fieldset>
  );
}
