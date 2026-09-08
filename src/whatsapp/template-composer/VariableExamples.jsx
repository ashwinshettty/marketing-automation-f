const VariableExamples = ({ headerVars, bodyVars, mediaSample, samples, onChange, error }) => {
  const showHeader = mediaSample === 'None' && headerVars.length > 0;
  const showBody = bodyVars.length > 0;

  if (!showHeader && !showBody) return null;

  const renderRows = (positions, section) =>
    positions.map((position) => (
      <div key={`${section}_${position}`} className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={`{{${position}}}`}
          disabled
          className="rounded-lg border border-brand-yellow/40 bg-brand-cream/50 px-3 py-2 text-sm text-brand-muted"
        />
        <input
          type="text"
          value={samples[`${section}_${position}`] || ''}
          onChange={(event) => onChange(`${section}_${position}`, event.target.value)}
          placeholder={`Example for {{${position}}}`}
          className="rounded-lg border border-brand-yellow/40 bg-white px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-navy"
        />
      </div>
    ));

  return (
    <div className="rounded-2xl border border-brand-yellow/40 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-brand-navy">
          *
        </span>
        <div>
          <h4 className="text-sm font-semibold text-brand-navy">Variable examples</h4>
          <p className="mt-0.5 text-xs text-brand-muted">
            Meta needs a sample for each {'{{n}}'}. These also fill the live preview. Avoid real customer data.
          </p>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {showHeader && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Header
          </p>
          {renderRows(headerVars, 'header')}
        </div>
      )}
      {showBody && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Body
          </p>
          {renderRows(bodyVars, 'body')}
        </div>
      )}
    </div>
  );
};

export default VariableExamples;
