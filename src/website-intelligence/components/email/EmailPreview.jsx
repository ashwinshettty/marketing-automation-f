import { useMemo } from 'react';
import ButtonCopy from '@/components/smoothui/button-copy';
import talecraftorLogo from '../../assets/talecraftor-logo.png';
import { api } from '../../api/client';
import { buildOutreachPreviewHtml } from '../../utils/buildOutreachPreviewHtml';

export default function EmailPreview({
  subject,
  body,
  to,
  showBranding = true,
  imageAssets = [],
  auditId,
  emailId,
  callToAction = 'open_conversation',
}) {
  const copyPayload = [subject ? `Subject: ${subject}` : '', body || ''].filter(Boolean).join('\n\n');

  const srcDoc = useMemo(() => {
    if (!showBranding) {
      return buildOutreachPreviewHtml({
        body,
        subject,
        imageAssets,
        callToAction,
        logoUrl: null,
        resolveImageSrc: (asset) =>
          asset.previewUrl ||
          asset.url ||
          (auditId && emailId && asset.id
            ? api.getOutreachImageUrl(auditId, emailId, asset.id)
            : null),
      });
    }

    return buildOutreachPreviewHtml({
      body,
      subject,
      imageAssets,
      callToAction,
      brandName: 'Talecraftor',
      website: 'https://talecraftor.com',
      logoUrl: talecraftorLogo,
      resolveImageSrc: (asset) =>
        asset.previewUrl ||
        asset.url ||
        (auditId && emailId && asset.id
          ? api.getOutreachImageUrl(auditId, emailId, asset.id)
          : null),
    });
  }, [body, subject, imageAssets, callToAction, showBranding, auditId, emailId]);

  return (
    <article className="overflow-hidden rounded-lg border border-border">
      <header className="flex items-start justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">To:</span>{' '}
            <span className="font-mono">{to || '—'}</span>
          </p>
          <p className="text-sm font-medium">{subject || 'No subject'}</p>
        </div>
        {copyPayload && (
          <ButtonCopy
            className="size-8 min-h-8 min-w-8 shrink-0 rounded-lg p-0"
            loadingDuration={200}
            duration={1400}
            onCopy={async () => {
              await navigator.clipboard.writeText(copyPayload);
            }}
          />
        )}
      </header>
      <div className="bg-[#F4F4F6]">
        <iframe
          title="Email preview"
          srcDoc={srcDoc}
          className="block h-[640px] w-full border-0"
          sandbox=""
        />
      </div>
    </article>
  );
}
