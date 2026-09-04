import { Input } from '@/components/ui/input';

function Field({ id, label, children }) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <label htmlFor={id} className="label-text">
        {label}
      </label>
      {children}
    </div>
  );
}

const FIELD_INPUT = 'h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0';

/**
 * Header of the composer. Styled as stacked address rows like a real mail
 * client rather than a stack of generic form inputs.
 */
export default function EmailHeader({
  to,
  cc,
  bcc,
  subject,
  fromAddress,
  fromName,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  recipientMeta,
  readOnly = false,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {fromAddress && (
        <Field id="email-from" label="From">
          <span className="truncate text-sm text-muted-foreground">
            {fromName ? `${fromName} <${fromAddress}>` : fromAddress}
          </span>
        </Field>
      )}

      <Field id="email-to" label="To">
        {readOnly ? (
          <span className="truncate text-sm">{to || '—'}</span>
        ) : (
          <Input
            id="email-to"
            type="email"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="recipient@company.com"
            className={FIELD_INPUT}
          />
        )}
      </Field>

      {!readOnly && (
        <>
          <Field id="email-cc" label="CC">
            <Input
              id="email-cc"
              type="email"
              value={cc}
              onChange={(e) => onCcChange(e.target.value)}
              placeholder="Optional"
              className={FIELD_INPUT}
            />
          </Field>

          <Field id="email-bcc" label="BCC">
            <Input
              id="email-bcc"
              type="email"
              value={bcc}
              onChange={(e) => onBccChange(e.target.value)}
              placeholder="Optional"
              className={FIELD_INPUT}
            />
          </Field>
        </>
      )}

      <Field id="email-subject" label="Subject">
        {readOnly ? (
          <span className="truncate text-sm font-medium">{subject || '—'}</span>
        ) : (
          <Input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Subject line"
            className={`${FIELD_INPUT} font-medium`}
          />
        )}
      </Field>

      {recipientMeta?.email && (
        <p className="border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Recipient found on the website ·{' '}
          {recipientMeta.sourceLabel || recipientMeta.source || 'Website'} ·{' '}
          {recipientMeta.confidence || 'unknown'} confidence
        </p>
      )}
    </div>
  );
}
