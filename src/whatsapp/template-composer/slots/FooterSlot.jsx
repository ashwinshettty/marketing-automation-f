import { inputClass, labelClass } from '../../templates/templateUi';

const FooterSlot = ({ value, onChange, error, hideLabel = false }) => {
  return (
    <div>
      {!hideLabel && (
        <label className={labelClass}>
          Footer <span className="font-normal text-brand-muted">optional</span>
        </label>
      )}
      <input
        type="text"
        value={value}
        maxLength={60}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Short line at the bottom of the message"
        className={`${inputClass} ${error ? 'border-red-400' : ''}`}
      />
      <div className="mt-2 flex justify-end">
        <span className="text-xs text-brand-muted">{value.length}/60</span>
      </div>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

export default FooterSlot;
