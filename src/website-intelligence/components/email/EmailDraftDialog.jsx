import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EmailHeader from './EmailHeader';
import EmailPreview from './EmailPreview';
import EmailStatusBadge from './EmailStatusBadge';
import { formatDate } from '../../utils/formatters';

/**
 * Modal view of a saved outreach email. Opened from Email history when the
 * user clicks a row in the list.
 */
export default function EmailDraftDialog({
  open,
  onClose,
  email,
  fromAddress,
  fromName,
  onDelete,
  deleting = false,
}) {
  if (!email) return null;

  const isDraft = email.status === 'draft' || email.status === 'failed';
  const updatedAt = email.sentAt || email.updatedAt || email.createdAt;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,900px)] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="truncate text-base font-semibold">
                  {email.subject || 'Untitled draft'}
                </DialogTitle>
                <EmailStatusBadge status={email.status} />
              </div>
              <DialogDescription className="mt-1">
                {email.recipient?.email || 'No recipient'}
                {updatedAt ? ` · ${formatDate(updatedAt)}` : ''}
              </DialogDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              {isDraft && (
                <Button
                  size="sm"
                  render={<Link to="/website-intelligence/reports" state={{ emailId: email.id }} onClick={onClose} />}
                >
                  <Pencil />
                  Edit draft
                </Button>
              )}
              {isDraft && onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => onDelete(email)}
                  disabled={deleting}
                >
                  <Trash2 />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <EmailHeader
            to={email.recipient?.email}
            cc={email.cc}
            bcc={email.bcc}
            subject={email.subject}
            fromAddress={fromAddress}
            fromName={fromName}
            recipientMeta={email.recipient}
            readOnly
          />

          <EmailPreview
            to={email.recipient?.email}
            subject={email.subject}
            body={email.body}
            imageAssets={email.imageAssets || []}
            auditId={email.analysisId}
            emailId={email.id}
            callToAction={email.settings?.callToAction || 'open_conversation'}
            showBranding
          />

          {email.opportunities?.length > 0 && (
            <section className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="label-text">Opportunities included</p>
              <ul className="mt-2 space-y-1">
                {email.opportunities.map((opp) => (
                  <li key={opp.serviceId || opp.id} className="text-sm">
                    {opp.serviceName}
                    {opp.score != null && (
                      <span className="meta-text ml-1 tabular-nums">· {opp.score}/100</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
