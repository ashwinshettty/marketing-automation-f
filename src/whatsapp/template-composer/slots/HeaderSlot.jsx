import { useEffect, useState } from 'react';
import { inputClass, labelClass } from '../../templates/templateUi';

const HeaderSlot = ({
  headerText,
  onChange,
  mediaSample,
  onMediaChange,
  uploadedFile,
  existingMediaUrl,
  onFileSelect,
  onAddVariable,
  error,
  onClearFile,
  hideLabel = false,
}) => {
  const isImage = mediaSample === 'Image';
  const [filePreview, setFilePreview] = useState('');

  useEffect(() => {
    if (!uploadedFile) {
      setFilePreview('');
      return undefined;
    }
    const url = URL.createObjectURL(uploadedFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);

  const previewUrl = filePreview || existingMediaUrl || '';

  return (
    <div>
      <div className={`mb-2 flex flex-wrap items-center gap-2 ${hideLabel ? 'justify-end' : 'justify-between'}`}>
        {!hideLabel && (
          <label className={`${labelClass} mb-0`}>
            Header <span className="font-normal text-brand-muted">optional</span>
          </label>
        )}
        <div className="flex items-center gap-1 rounded-lg border border-brand-yellow/40 bg-white p-0.5">
          <button
            type="button"
            onClick={() => onMediaChange('None')}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              !isImage
                ? 'bg-brand-navy text-white'
                : 'text-brand-muted hover:bg-brand-cream'
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => onMediaChange('Image')}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              isImage
                ? 'bg-brand-navy text-white'
                : 'text-brand-muted hover:bg-brand-cream'
            }`}
          >
            Image
          </button>
        </div>
      </div>

      {isImage ? (
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
          {previewUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-brand-yellow/40">
              <img src={previewUrl} alt="" className="max-h-48 w-full object-cover" />
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onClearFile?.();
                }}
                className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-brand-navy"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-brand-yellow/50 bg-white text-sm text-brand-muted">
              Click to add a header image
            </div>
          )}
        </label>
      ) : (
        <>
          <input
            type="text"
            value={headerText}
            maxLength={60}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Short line at the top of the message"
            className={`${inputClass} ${error ? 'border-red-400' : ''}`}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onAddVariable}
              className="text-sm font-medium text-brand-navy hover:underline"
            >
              + Add variable
            </button>
            <span className="text-xs text-brand-muted">{headerText.length}/60</span>
          </div>
        </>
      )}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

export default HeaderSlot;
