const wrapperClass = 'space-y-2';
const inputClass =
  'w-full rounded-xl border border-brand-yellow/40 bg-white px-4 py-2.5 text-sm text-brand-navy outline-none transition placeholder:text-brand-muted/70 focus:border-brand-navy';

export const CampaignInput = ({
  label,
  hint,
  className = '',
  ...props
}) => (
  <label className={`${wrapperClass} ${className}`}>
    <span className="block text-sm font-medium text-brand-navy">{label}</span>
    <input className={inputClass} {...props} />
    {hint ? <span className="block text-xs text-brand-muted">{hint}</span> : null}
  </label>
);

export const CampaignSelect = ({
  label,
  options,
  hint,
  className = '',
  ...props
}) => (
  <label className={`${wrapperClass} ${className}`}>
    <span className="block text-sm font-medium text-brand-navy">{label}</span>
    <select className={inputClass} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {hint ? <span className="block text-xs text-brand-muted">{hint}</span> : null}
  </label>
);

export const CampaignTextarea = ({
  label,
  hint,
  className = '',
  ...props
}) => (
  <label className={`${wrapperClass} ${className}`}>
    <span className="block text-sm font-medium text-brand-navy">{label}</span>
    <textarea
      className={`${inputClass} min-h-28 resize-y`}
      {...props}
    />
    {hint ? <span className="block text-xs text-brand-muted">{hint}</span> : null}
  </label>
);

export const CampaignCheckboxGroup = ({
  label,
  options,
  values,
  onToggle,
  hint,
}) => (
  <div className={wrapperClass}>
    <span className="block text-sm font-medium text-brand-navy">{label}</span>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-start gap-3 rounded-xl border border-brand-yellow/40 bg-white px-4 py-3 text-sm text-brand-navy"
        >
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={() => onToggle(option.value)}
            className="mt-0.5 h-4 w-4 accent-brand-navy"
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
    {hint ? <span className="block text-xs text-brand-muted">{hint}</span> : null}
  </div>
);

export const CampaignRadioCards = ({
  label,
  options,
  value,
  onChange,
}) => (
  <div className={wrapperClass}>
    <span className="block text-sm font-medium text-brand-navy">{label}</span>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <label
            key={option.value}
            className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
              active
                ? 'border-brand-yellow bg-brand-cream shadow-sm'
                : 'border-slate-200 bg-white hover:border-brand-yellow/60'
            }`}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={active}
              onChange={(event) => onChange(event.target.value)}
              className="sr-only"
            />
            <p className="text-sm font-semibold text-brand-navy">{option.label}</p>
            {option.description ? (
              <p className="mt-1 text-xs text-brand-muted">{option.description}</p>
            ) : null}
          </label>
        );
      })}
    </div>
  </div>
);

export const CampaignSwitch = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl border border-brand-yellow/30 bg-brand-cream px-4 py-4">
    <div>
      <p className="text-sm font-semibold text-brand-navy">{label}</p>
      {description ? <p className="mt-1 text-sm text-brand-muted">{description}</p> : null}
    </div>
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative mt-1 h-6 w-11 shrink-0 rounded-full ${checked ? 'bg-brand-navy' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full ${checked ? 'left-5 bg-brand-yellow' : 'left-0.5 bg-white'}`} />
    </button>
  </div>
);
