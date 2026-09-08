import { inputClass, labelClass } from '../../templates/templateUi';

const BodySlot = ({ value, onChange, onAddVariable, error, hideLabel = false }) => {
  return (
    <div>
      {!hideLabel && (
        <label className={labelClass}>
          Body <span className="font-normal text-red-500">*</span>
        </label>
      )}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        maxLength={1024}
        placeholder="Write the message customers will receive"
        className={`${inputClass} resize-y ${error ? 'border-red-400' : ''}`}
      />
      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onAddVariable}
          className="text-sm font-medium text-brand-navy hover:underline"
        >
          + Add variable
        </button>
        <span className="text-xs text-brand-muted">{value.length}/1024</span>
      </div>
      {error ? (
        <div className="mt-2 space-y-0.5">
          {(Array.isArray(error) ? error : [error]).map((item) => (
            <p key={typeof item === 'string' ? item : item.message} className="text-sm text-red-600">
              {typeof item === 'string' ? item : item.message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default BodySlot;
