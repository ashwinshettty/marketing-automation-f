import BodySlot from './slots/BodySlot';
import ButtonsSlot from './slots/ButtonsSlot';
import FooterSlot from './slots/FooterSlot';
import HeaderSlot from './slots/HeaderSlot';

const Section = ({ step, title, hint, children }) => (
  <section className="relative border-b border-brand-yellow/25 pb-6 last:border-b-0 last:pb-0">
    <div className="mb-3 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
        {step}
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
        {hint ? <p className="mt-0.5 text-xs text-brand-muted">{hint}</p> : null}
      </div>
    </div>
    <div className="pl-10">{children}</div>
  </section>
);

const WhatsAppSkeleton = ({
  subtype,
  headerText,
  onHeaderChange,
  mediaSample,
  onMediaChange,
  uploadedFile,
  existingMediaUrl,
  onFileSelect,
  onClearFile,
  onAddHeaderVariable,
  bodyText,
  onBodyChange,
  onAddBodyVariable,
  footerText,
  onFooterChange,
  buttons,
  onAddButton,
  onUpdateButton,
  onRemoveButton,
  errors = {},
}) => {
  const showChrome = subtype !== 'TEXT';
  const bodyStep = showChrome ? 2 : 1;
  const footerStep = 3;
  const buttonsStep = 4;

  return (
    <div className="space-y-6 rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm">
      {showChrome && (
        <Section
          step={1}
          title="Header"
          hint="Optional title or image at the top of the message"
        >
          <HeaderSlot
            headerText={headerText}
            onChange={onHeaderChange}
            mediaSample={mediaSample}
            onMediaChange={onMediaChange}
            uploadedFile={uploadedFile}
            existingMediaUrl={existingMediaUrl}
            onFileSelect={onFileSelect}
            onClearFile={onClearFile}
            onAddVariable={onAddHeaderVariable}
            error={errors.headerText}
            hideLabel
          />
        </Section>
      )}

      <Section
        step={bodyStep}
        title="Message body"
        hint="Required. Use {{1}}, {{2}} for personalized values"
      >
        <BodySlot
          value={bodyText}
          onChange={onBodyChange}
          onAddVariable={onAddBodyVariable}
          error={errors.bodyText}
          hideLabel
        />
      </Section>

      {showChrome && (
        <Section
          step={footerStep}
          title="Footer"
          hint="Optional short line under the message"
        >
          <FooterSlot
            value={footerText}
            onChange={onFooterChange}
            error={errors.footerText}
            hideLabel
          />
        </Section>
      )}

      {showChrome && (
        <Section
          step={buttonsStep}
          title="Buttons"
          hint={
            subtype === 'FLOW'
              ? 'Flow templates need one call-to-action button'
              : 'Create buttons that let customers respond or take action. Up to 10; more than 3 appear as a list.'
          }
        >
          <ButtonsSlot
            subtype={subtype}
            buttons={buttons}
            onAdd={onAddButton}
            onUpdate={onUpdateButton}
            onRemove={onRemoveButton}
            errors={errors}
            hideLabel
          />
        </Section>
      )}
    </div>
  );
};

export default WhatsAppSkeleton;
