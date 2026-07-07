import React, { useState } from 'react';
import { FaBullhorn, FaBell } from 'react-icons/fa';
import { useTemplate } from '../../context/TemplateContext';
import { validateTemplateNameField } from '../../utils/whatsappTemplateValidation';
import {
  accentBtnClass,
  categoryBtnClass,
  inputClass,
  labelClass,
  previewCardClass,
  radioCardClass,
  secondaryBtnClass,
  sectionCardClass,
  stepDotActive,
  stepDotInner,
  stepDotPending,
  stepLabelActive,
  stepLabelPending,
} from './templateUi';

const SetUp = () => {
  const { templateData, updateTemplateData, goToNextStep, loading, error, setError } = useTemplate();
  const [selectedCategory, setSelectedCategory] = useState(templateData.category);
  const [selectedType, setSelectedType] = useState(templateData.templateType);
  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    { id: 'UTILITY', label: 'Utility', icon: FaBell },
    { id: 'MARKETING', label: 'Marketing', icon: FaBullhorn },
  ];

  const marketingMessageTypes = [
    {
      id: 'INTERACTIVE',
      label: 'Interactive',
      description: 'Send messages with media and customised buttons to engage your customers.'
    },
    {
      id: 'FLOW',
      label: 'Flow',
      description: 'Send a form to capture customer interests, appointment requests or run surveys.'
    }
  ];

  const utilityMessageTypes = [
    {
      id: 'INTERACTIVE',
      label: 'Interactive',
      description: 'Send messages about an existing order or account.'
    },
    {
      id: 'TEXT',
      label: 'Text',
      description: 'Send simple text messages for notifications and updates.'
    },
    {
      id: 'FLOW',
      label: 'Flow',
      description: 'Send a form to collect feedback, send reminders or manage orders.'
    }
  ];

  const messageTypes = selectedCategory === 'MARKETING' ? marketingMessageTypes : utilityMessageTypes;

  // Real-time validation function for template name
  const validateTemplateName = (value) => {
    const error = validateTemplateNameField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, name: error }));
      return false;
    }
    
    // Clear error if validation passes
    setValidationErrors(prev => {
      const { name, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const newType = categoryId === 'MARKETING' ? 'INTERACTIVE' : 'TEXT';
    setSelectedType(newType);
    updateTemplateData({ 
      category: categoryId, 
      templateType: newType 
    });
    setError(null);
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    updateTemplateData({ templateType: typeId });
    setError(null);
    if (validationErrors.type) {
      setValidationErrors(prev => ({ ...prev, type: undefined }));
    }
  };

  const handleNext = () => {
    const errors = {};
    
    // Validate template name
    if (!templateData.name) {
      errors.name = 'Template name is required';
    } else {
      const nameRegex = /^[a-z0-9_]+$/;
      if (!nameRegex.test(templateData.name)) {
        errors.name = 'Template names must be unique and can only contain lowercase letters, numbers, and underscores.';
      }
    }
    
    if (!selectedCategory) {
      errors.category = 'Please select a category';
    }
    
    if (!selectedType) {
      errors.type = 'Please select a message type';
    }

    // If there are errors, set them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fix the validation errors');
      return;
    }

    // Clear any existing errors and proceed
    setValidationErrors({});
    setError(null);
    const resolvedType = selectedType === 'FLOW' ? 'INTERACTIVE' : selectedType;
    updateTemplateData({
      category: selectedCategory,
      templateType: resolvedType,
    });
    goToNextStep();
  };

  const PreviewShell = ({ children }) => (
    <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-[#e5ddd5] shadow-lg">
      <div className="bg-brand-navy px-4 py-2.5 text-center text-xs font-medium text-white">
        WhatsApp Preview
      </div>
      <div className="p-3">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">{children}</div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (selectedType) {
      case 'TEXT':
        return (
          <PreviewShell>
            <div className="p-4">
              <p className="mb-3 text-sm text-slate-800">
                Good news! Your order 23KFEJJ2312 has shipped!
              </p>
              <p className="mb-3 text-sm text-slate-600">
                Here&apos;s your tracking information, please check link below.
              </p>
              <div className="mb-1 text-right text-xs text-slate-400">11:59</div>
            </div>
          </PreviewShell>
        );

      case 'INTERACTIVE':
        return (
          <PreviewShell>
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop"
              alt="Fresh groceries"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="mb-2 text-sm text-slate-800">
                Hey there! Check out our fresh groceries now!
              </p>
              <p className="mb-1 text-sm text-slate-600">
                Use code <span className="font-semibold">HEALTH</span> to get
              </p>
              <p className="mb-3 text-sm text-slate-600">
                additional 10% off on your entire purchase.
              </p>
              <div className="mb-3 text-right text-xs text-slate-400">11:59</div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-t border-slate-100 py-2.5 text-sm font-medium text-[#00a5f4]"
              >
                Shop now
              </button>
            </div>
          </PreviewShell>
        );

      case 'FLOW':
        return (
          <PreviewShell>
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=200&fit=crop"
              alt="Cooking"
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <p className="mb-3 text-sm text-slate-800">
                Make dinner with Jasper Market! Our free online courses will be available soon!
              </p>
              <div className="mb-3 text-right text-xs text-slate-400">11:59</div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border-t border-slate-100 py-2.5 text-sm font-medium text-[#00a5f4]"
              >
                Sign up
              </button>
            </div>
          </PreviewShell>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={stepDotActive}>
            <div className={stepDotInner} />
          </div>
          <span className={stepLabelActive}>Set up template</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={stepDotPending} />
          <span className={stepLabelPending}>Edit template</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className={sectionCardClass}>
            <h2 className="mb-1 text-lg font-semibold text-brand-navy">Set up your template</h2>
            <p className="mb-5 text-sm text-brand-muted">
              Choose the category that best describes your message template, then select the type of message you want to send.
            </p>

            <div className="mb-5">
              <label className={labelClass}>Template Name *</label>
              <input
                type="text"
                value={templateData.name || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  updateTemplateData({ name: value });
                  validateTemplateName(value);
                }}
                placeholder="Enter template name"
                disabled={loading}
                className={`${inputClass} ${validationErrors.name ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div className="mb-5">
              <label className={labelClass}>Category *</label>
              <div className="flex gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      disabled={loading}
                      className={`${categoryBtnClass(selectedCategory === category.id, validationErrors.category)} ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
              {validationErrors.category && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.category}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Message Type *</label>
              <div className="space-y-3">
                {messageTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`${radioCardClass(selectedType === type.id, validationErrors.type)} ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="messageType"
                      value={type.id}
                      checked={selectedType === type.id}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      disabled={loading}
                      className="mt-1 h-4 w-4 accent-brand-navy"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-brand-navy">{type.label}</div>
                      <div className="text-sm text-brand-muted">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {validationErrors.type && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.type}</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className={`${previewCardClass} sticky top-6`}>
            <h3 className="mb-4 text-lg font-semibold text-brand-navy">Template preview</h3>
            <div className="flex min-h-[420px] items-start justify-center py-2">
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-brand-yellow/30 pt-6">
        <button
          type="button"
          onClick={() => {
            setError(null);
            updateTemplateData({ name: '' });
          }}
          disabled={loading}
          className={secondaryBtnClass}
        >
          Discard
        </button>
        <button type="button" onClick={handleNext} disabled={loading} className={accentBtnClass}>
          {loading && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          Next
        </button>
      </div>
    </div>
  );
};

export default SetUp;
