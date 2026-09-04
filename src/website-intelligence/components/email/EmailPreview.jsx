import ButtonCopy from '@/components/smoothui/button-copy';
import talecraftorLogo from '../../assets/talecraftor-logo.png';

function renderBody(body) {
  return String(body || '')
    .split('\n')
    .map((line, index) => (
      <p key={`${index}-${line.slice(0, 12)}`} className={line.trim() ? 'mb-3' : 'mb-1'}>
        {line || '\u00A0'}
      </p>
    ));
}

export default function EmailPreview({ subject, body, to, showBranding = false }) {
  const copyPayload = [subject ? `Subject: ${subject}` : '', body || ''].filter(Boolean).join('\n\n');

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
      <div className="px-4 py-4 text-sm leading-relaxed">
        {showBranding ? (
          <div className="mb-6 border-b border-border pb-4">
            <img
              src={talecraftorLogo}
              alt="Talecraftor"
              className="h-10 w-auto max-w-[200px]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              AI systems, automation and digital products for growing businesses
            </p>
          </div>
        ) : null}
        {renderBody(body)}
      </div>
    </article>
  );
}
