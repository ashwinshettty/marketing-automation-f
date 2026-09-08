import { useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { getTemplateHeaderImageUrl } from '../../api/whatsappApi';
import { useTemplate } from '../../context/TemplateContext';
import { toast } from '../../utils/toast';
import {
  validateBodyTextComplete,
  validateButtonPhoneField,
  validateButtonTextField,
  validateButtonUrlField,
  validateFooterTextField,
  validateHeaderTextField,
  validateTemplateNameField,
} from '../../utils/whatsappTemplateValidation';
import { accentBtnClass, secondaryBtnClass } from '../templates/templateUi';
import LivePreview from './LivePreview';
import VariableExamples from './VariableExamples';
import WhatsAppSkeleton from './WhatsAppSkeleton';
import {
  CATEGORIES,
  defaultSubtypeForCategory,
  getSubtypesForCategory,
  isSubtypeAllowed,
  NAME_MAX,
} from './composerTypes';
import {
  appendVariable,
  buildSubmitPayload,
  buildVariables,
  createDefaultButton,
  inferMessageSubtype,
  mapButtonsFromBackend,
  samplesFromVariables,
} from './templatePayload';

const TemplateComposer = ({ setActiveTab }) => {
  const {
    templateData,
    updateTemplateData,
    createTemplate,
    updateTemplate,
    resetTemplate,
    loading,
    error,
    setError,
    isEditMode,
  } = useTemplate();

  const [category, setCategory] = useState(templateData.category || 'UTILITY');
  const [subtype, setSubtype] = useState(
    inferMessageSubtype(templateData) || defaultSubtypeForCategory(templateData.category),
  );
  const [subtypeOpen, setSubtypeOpen] = useState(false);
  const [buttons, setButtons] = useState([]);
  const [mediaSample, setMediaSample] = useState('None');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [keepExistingMedia, setKeepExistingMedia] = useState(true);
  const [variableSamples, setVariableSamples] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const hydratedId = useRef(null);
  const subtypeMenuRef = useRef(null);

  const name = templateData.name || '';
  const headerText = templateData.headerText || '';
  const bodyText = templateData.bodyText || '';
  const footerText = templateData.footerText || '';

  const nameError = validateTemplateNameField(name);
  const identityReady = Boolean(category && subtype && !nameError);
  const showSkeleton = identityReady || isEditMode;

  const selectedSubtype = getSubtypesForCategory(category).find((item) => item.id === subtype);

  useEffect(() => {
    const handleClick = (event) => {
      if (subtypeMenuRef.current && !subtypeMenuRef.current.contains(event.target)) {
        setSubtypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!templateData._id || hydratedId.current === templateData._id) return;
    hydratedId.current = templateData._id;

    const nextSubtype = inferMessageSubtype(templateData);
    setCategory(templateData.category || 'UTILITY');
    setSubtype(nextSubtype);
    setButtons(mapButtonsFromBackend(templateData.buttons));
    setVariableSamples(samplesFromVariables(templateData));
    setMediaSample(templateData.media ? 'Image' : 'None');
    setKeepExistingMedia(Boolean(templateData.media));
    setUploadedFile(null);
    setValidationErrors({});
  }, [templateData]);

  useEffect(() => {
    if (subtype === 'FLOW' && buttons.length === 0) {
      setButtons([createDefaultButton('CompleteFlow')]);
    }
  }, [subtype, buttons.length]);

  const applySubtypeShape = (nextSubtype) => {
    if (nextSubtype === 'TEXT') {
      updateTemplateData({
        headerText: '',
        footerText: '',
        buttons: [],
        templateType: 'TEXT',
      });
      setButtons([]);
      setMediaSample('None');
      setKeepExistingMedia(false);
      setUploadedFile(null);
      return;
    }

    if (nextSubtype === 'FLOW') {
      const flowButton = createDefaultButton('CompleteFlow');
      setButtons([flowButton]);
      updateTemplateData({ templateType: 'INTERACTIVE' });
      return;
    }

    setButtons((current) => current.filter((button) => button.type !== 'CompleteFlow'));
    updateTemplateData({ templateType: 'INTERACTIVE' });
  };

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    if (!isSubtypeAllowed(nextCategory, subtype)) {
      const nextSubtype = defaultSubtypeForCategory(nextCategory);
      setSubtype(nextSubtype);
      applySubtypeShape(nextSubtype);
    }
    updateTemplateData({ category: nextCategory });
    setError(null);
  };

  const handleSubtypeChange = (nextSubtype) => {
    setSubtype(nextSubtype);
    setSubtypeOpen(false);
    applySubtypeShape(nextSubtype);
    setError(null);
  };

  const existingMediaUrl = useMemo(() => {
    if (uploadedFile || !keepExistingMedia) return '';
    if (templateData.media?.url) return templateData.media.url;
    if (templateData.media && templateData._id) {
      return getTemplateHeaderImageUrl(templateData._id);
    }
    return '';
  }, [uploadedFile, keepExistingMedia, templateData.media, templateData._id]);

  const { headerVars, bodyVars } = buildVariables({
    headerText,
    bodyText,
    variableSamples,
    mediaSample,
  });

  const collectFieldErrors = () => {
    const errors = {};
    const nameIssue = validateTemplateNameField(name);
    if (nameIssue) errors.name = nameIssue;

    const headerIssue = mediaSample === 'None' ? validateHeaderTextField(headerText) : null;
    if (headerIssue) errors.headerText = headerIssue;

    const bodyIssues = validateBodyTextComplete(bodyText, templateData.variables);
    if (!bodyText.trim()) {
      errors.bodyText = 'Message body is required';
    } else if (bodyIssues.length > 0) {
      errors.bodyText = bodyIssues;
    }

    const footerIssue = validateFooterTextField(footerText);
    if (footerIssue) errors.footerText = footerIssue;

    if (mediaSample === 'Image' && !uploadedFile && !(keepExistingMedia && templateData.media)) {
      errors.headerText = 'Add a header image';
    }

    buttons.forEach((button) => {
      const textIssue = validateButtonTextField(button.text);
      if (textIssue) errors[`button_${button.id}_text`] = textIssue;
      if (button.type === 'VisitWebsite') {
        const urlIssue = validateButtonUrlField(button.websiteUrl);
        if (urlIssue) errors[`button_${button.id}_url`] = urlIssue;
      }
      if (button.type === 'CallPhone') {
        const phoneIssue = validateButtonPhoneField(button.phoneNumber);
        if (phoneIssue) errors[`button_${button.id}_phone`] = phoneIssue;
      }
    });

    const { payload, missingExamples, backendButtons, resolvedTemplateType } =
      buildSubmitPayload({
        name,
        category,
        subtype,
        language: templateData.language || 'en',
        bodyText,
        headerText,
        footerText,
        buttons,
        mediaSample,
        variableSamples,
      });

    if (resolvedTemplateType === 'INTERACTIVE' && backendButtons.length === 0) {
      errors.buttons = 'Add at least one button';
    }

    if (missingExamples.length > 0) {
      errors.variables = `Add example values for ${missingExamples.join(', ')}`;
    }

    return { errors, payload };
  };

  const handleSubmit = async () => {
    const { errors, payload } = collectFieldErrors();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the highlighted fields');
      return;
    }

    setValidationErrors({});
    setError(null);

    try {
      const submitData = {
        ...payload,
        uploadedFile: mediaSample === 'Image' ? uploadedFile : null,
      };

      if (isEditMode && templateData._id) {
        await updateTemplate(templateData._id, submitData, submitData.uploadedFile);
        toast.success('Template updated successfully!');
      } else {
        await createTemplate(submitData);
        toast.success('Template created successfully!');
        resetComposer();
        setActiveTab?.('view');
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save template';
      toast.error(message);
      setError(message);
    }
  };

  const resetComposer = () => {
    hydratedId.current = null;
    resetTemplate();
    setCategory('UTILITY');
    setSubtype('TEXT');
    setButtons([]);
    setMediaSample('None');
    setKeepExistingMedia(false);
    setUploadedFile(null);
    setVariableSamples({});
    setValidationErrors({});
  };

  const editorProps = {
    subtype,
    headerText,
    onHeaderChange: (value) => updateTemplateData({ headerText: value }),
    mediaSample,
    onMediaChange: (value) => {
      setMediaSample(value);
      if (value !== 'Image') {
        setUploadedFile(null);
        setKeepExistingMedia(false);
      }
    },
    uploadedFile,
    existingMediaUrl,
    onFileSelect: (file) => {
      setUploadedFile(file);
      setKeepExistingMedia(false);
    },
    onClearFile: () => {
      setUploadedFile(null);
      setKeepExistingMedia(false);
    },
    onAddHeaderVariable: () =>
      updateTemplateData({ headerText: appendVariable(headerText) }),
    bodyText,
    onBodyChange: (value) => updateTemplateData({ bodyText: value }),
    onAddBodyVariable: () =>
      updateTemplateData({ bodyText: appendVariable(bodyText) }),
    footerText,
    onFooterChange: (value) => updateTemplateData({ footerText: value }),
    buttons,
    onAddButton: (type) => setButtons((current) => [...current, createDefaultButton(type)]),
    onUpdateButton: (id, patch) =>
      setButtons((current) =>
        current.map((button) => (button.id === id ? { ...button, ...patch } : button)),
      ),
    onRemoveButton: (id) =>
      setButtons((current) => current.filter((button) => button.id !== id)),
    errors: validationErrors,
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand-yellow/40 bg-gradient-to-br from-brand-cream/80 to-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Step 1
            </p>
            <h2 className="mt-1 text-lg font-semibold text-brand-navy">
              {isEditMode ? 'Edit template' : 'Set up your template'}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Pick category and type, name it, then write the message while watching the live preview.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Category
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCategoryChange(item.id)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    category === item.id
                      ? 'border-brand-navy bg-brand-navy text-white'
                      : 'border-brand-yellow/40 bg-white text-brand-navy hover:bg-brand-cream'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </label>

          <div className="block" ref={subtypeMenuRef}>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Message type
            </span>
            <button
              type="button"
              onClick={() => setSubtypeOpen((open) => !open)}
              className="flex h-[42px] w-full items-center justify-between rounded-xl border border-brand-yellow/40 bg-white px-4 text-left text-sm text-brand-navy outline-none focus:border-brand-navy"
            >
              <span className="truncate font-medium">
                {selectedSubtype?.label || 'Select type'}
              </span>
              <FaChevronDown className="h-3 w-3 shrink-0 text-brand-muted" />
            </button>
            {subtypeOpen && (
              <div className="relative z-20">
                <div className="absolute left-0 right-0 mt-1 overflow-hidden rounded-xl border border-brand-yellow/40 bg-white shadow-lg">
                  {getSubtypesForCategory(category).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSubtypeChange(item.id)}
                      className={`block w-full px-4 py-3 text-left hover:bg-brand-cream/60 ${
                        item.id === subtype ? 'bg-brand-yellow/20' : ''
                      }`}
                    >
                      <span className="block text-sm font-medium text-brand-navy">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-brand-muted">
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
              Template name
            </span>
            <div className="relative">
              <input
                type="text"
                value={name}
                maxLength={NAME_MAX}
                onChange={(event) => {
                  updateTemplateData({ name: event.target.value });
                  setError(null);
                }}
                placeholder="e.g. order_shipped"
                className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-16 text-sm text-brand-navy outline-none focus:border-brand-navy ${
                  validationErrors.name || (name && nameError)
                    ? 'border-red-400'
                    : 'border-brand-yellow/40'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-muted">
                {name.length}/{NAME_MAX}
              </span>
            </div>
            {(validationErrors.name || (name && nameError)) && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.name || nameError}</p>
            )}
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showSkeleton ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
            Step 2 — Write the message
          </p>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
              <WhatsAppSkeleton {...editorProps} />
              <VariableExamples
                headerVars={headerVars}
                bodyVars={bodyVars}
                mediaSample={mediaSample}
                samples={variableSamples}
                onChange={(key, value) =>
                  setVariableSamples((current) => ({ ...current, [key]: value }))
                }
                error={validationErrors.variables}
              />
            </div>
            <div className="xl:sticky xl:top-4 xl:self-start">
              <LivePreview
                subtype={subtype}
                headerText={headerText}
                bodyText={bodyText}
                footerText={footerText}
                buttons={buttons}
                mediaSample={mediaSample}
                uploadedFile={uploadedFile}
                existingMediaUrl={existingMediaUrl}
                variableSamples={variableSamples}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-yellow/50 bg-brand-cream/30 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-brand-navy">Almost there</p>
          <p className="mt-1 text-sm text-brand-muted">
            Enter a valid template name (lowercase letters, numbers, underscores) to open the editor and live preview.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-yellow/30 pt-5">
        <button type="button" onClick={resetComposer} disabled={loading} className={secondaryBtnClass}>
          Discard
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !showSkeleton}
          className={accentBtnClass}
        >
          {loading ? 'Saving…' : isEditMode ? 'Update template' : 'Submit template'}
        </button>
      </div>
    </div>
  );
};

export default TemplateComposer;
