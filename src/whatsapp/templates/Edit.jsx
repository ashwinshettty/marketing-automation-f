import React, { useState, useEffect } from 'react';
import { 
  FaCheck, 
  FaInfoCircle, 
  FaTimes, 
  FaImage, 
  FaVideo, 
  FaFileAlt, 
  FaMapMarkerAlt, 
  FaArrowUp, 
  FaExternalLinkAlt, 
  FaPhone, 
  FaClipboard, 
  FaCheckCircle 
} from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from '../../utils/toast';
import { useTemplate } from '../../context/TemplateContext';
import { 
  validateBodyTextComplete,
  validateTemplateNameField,
  validateHeaderTextField,
  validateFooterTextField,
  validateButtonTextField,
  validateButtonUrlField,
  validateButtonPhoneField
} from '../../utils/whatsappTemplateValidation';

const Edit = () => {
  const { 
    templateData, 
    updateTemplateData, 
    goToPreviousStep, 
    createTemplate,
    updateTemplate,
    loading, 
    error, 
    setError 
  } = useTemplate();
  const [showButtonDropdown, setShowButtonDropdown] = useState(false);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const [showIconDropdown, setShowIconDropdown] = useState({});
  const [variableSamples, setVariableSamples] = useState({});
  const [buttons, setButtons] = useState([]);
  const [mediaSample, setMediaSample] = useState('None');
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Load existing template data when editing
  useEffect(() => {
    if (templateData._id && templateData.buttons) {
      // Convert backend buttons to frontend format
      const frontendButtons = templateData.buttons.map((button, index) => {
        const baseButton = {
          id: Date.now() + index,
          text: button.text
        };

        if (button.type === 'URL') {
          return {
            ...baseButton,
            type: 'VisitWebsite',
            urlType: 'Static',
            websiteUrl: button.value || ''
          };
        } else if (button.type === 'PHONE') {
          if (button.subType === 'WHATSAPP') {
            return {
              ...baseButton,
              type: 'CallWhatsApp',
              activeFor: button.activeFor || '7 days'
            };
          } else {
            return {
              ...baseButton,
              type: 'CallPhone',
              phoneNumber: button.value || '',
              country: button.country || 'US +1'
            };
          }
        } else if (button.type === 'CUSTOM') {
          return {
            ...baseButton,
            type: 'Custom'
          };
        } else if (button.type === 'OFFER') {
          return {
            ...baseButton,
            type: 'CopyOfferCode',
            offerCode: button.value || ''
          };
        } else if (button.type === 'FLOW') {
          return {
            ...baseButton,
            type: 'CompleteFlow'
          };
        }
        return null;
      }).filter(Boolean);

      setButtons(frontendButtons);
    }

    // Load variable samples
    if (templateData.variables && templateData.variables.length > 0) {
      const samples = {};
      templateData.variables.forEach(variable => {
        // Determine section based on position in header or body
        const isInHeader = templateData.headerText?.includes(`{{${variable.position}}}`);
        const section = isInHeader ? 'header' : 'body';
        samples[`${section}_${variable.position}`] = variable.example || '';
      });
      setVariableSamples(samples);
    }
  }, [templateData._id]);

  const templateName = templateData.name;
  const setTemplateName = (value) => updateTemplateData({ name: value });
  
  const language = templateData.language;
  const setLanguage = (value) => updateTemplateData({ language: value });
  
  const templateType = templateData.templateType;
  const setTemplateType = (value) => updateTemplateData({ templateType: value });
  
  const category = templateData.category;
  const setCategory = (value) => updateTemplateData({ category: value });
  
  const variableType = templateData.variableType || 'Name';
  const setVariableType = (value) => updateTemplateData({ variableType: value });
  
  const header = templateData.headerText || '';
  const setHeader = (value) => updateTemplateData({ headerText: value });
  
  const body = templateData.bodyText || '';
  const setBody = (value) => updateTemplateData({ bodyText: value });
  
  const footer = templateData.footerText || '';
  const setFooter = (value) => updateTemplateData({ footerText: value });

  // Real-time validation functions
  const validateHeader = (value) => {
    const error = validateHeaderTextField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, headerText: error }));
    } else {
      setValidationErrors(prev => {
        const { headerText, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateBody = (value) => {
    // Use comprehensive validation from utility
    const errors = validateBodyTextComplete(value, templateData.variables);
    
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, bodyText: errors }));
    } else {
      setValidationErrors(prev => {
        const { bodyText, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateFooter = (value) => {
    const error = validateFooterTextField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, footerText: error }));
    } else {
      setValidationErrors(prev => {
        const { footerText, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateTemplateName = (value) => {
    const error = validateTemplateNameField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, name: error }));
    } else {
      setValidationErrors(prev => {
        const { name, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateButtonText = (buttonId, value) => {
    const errorKey = `button_${buttonId}_text`;
    const error = validateButtonTextField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateButtonUrl = (buttonId, value) => {
    const errorKey = `button_${buttonId}_url`;
    const error = validateButtonUrlField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateButtonPhone = (buttonId, value) => {
    const errorKey = `button_${buttonId}_phone`;
    const error = validateButtonPhoneField(value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [errorKey]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Update setters with validation
  const setHeaderWithValidation = (value) => {
    // Prevent input beyond 60 characters
    if (value.length > 60) {
      const error = validateHeaderTextField(value);
      setValidationErrors(prev => ({ ...prev, headerText: error }));
      return; // Don't update the value
    }
    setHeader(value);
    validateHeader(value);
  };

  const setBodyWithValidation = (value) => {
    // Prevent input beyond 1024 characters
    if (value.length > 1024) {
      setValidationErrors(prev => ({ ...prev, bodyText: ['Body text must be 1024 characters or less'] }));
      return; // Don't update the value
    }
    setBody(value);
    validateBody(value);
  };

  const setFooterWithValidation = (value) => {
    // Prevent input beyond 60 characters
    if (value.length > 60) {
      const error = validateFooterTextField(value);
      setValidationErrors(prev => ({ ...prev, footerText: error }));
      return; // Don't update the value
    }
    setFooter(value);
    validateFooter(value);
  };

  // Handle template submission
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!templateData.name?.trim()) {
        setError('Template name is required');
        return;
      }
      
      if (!body?.trim()) {
        setError('Message body is required');
        return;
      }
      
      if (!templateData.category) {
        setError('Category is required');
        return;
      }
      
      if (!templateData.templateType) {
        setError('Template type is required');
        return;
      }

      // Prepare variables array from variableSamples
      const variables = [];
      const allVariables = [
        ...headerVariables.map(v => ({ position: v, section: 'header' })), 
        ...bodyVariables.map(v => ({ position: v, section: 'body' }))
      ];
      
      // Check if there are variables but no sample values provided
      if (allVariables.length > 0) {
        const missingExamples = [];
        
        allVariables.forEach(({ position, section }) => {
          const key = `${section}_${position}`;
          const sampleValue = variableSamples[key];
          
          if (!sampleValue || sampleValue.trim() === '') {
            missingExamples.push(`{{${position}}}`);
          }
          
          variables.push({
            position: position,
            key: `var${position}`,
            source: `custom.var${position}`,
            dataType: variableType === 'Number' ? 'NUMBER' : 
                     variableType === 'Date' ? 'DATE' : 
                     variableType === 'Time' ? 'TIME' : 'TEXT',
            example: sampleValue || `Sample ${position}`
          });
        });
        
        // Warn user if examples are missing
        if (missingExamples.length > 0) {
          const proceed = window.confirm(
            `You haven't provided example values for variables: ${missingExamples.join(', ')}.\n\n` +
            `Default examples will be used. Meta requires example values for template approval.\n\n` +
            `Do you want to continue?`
          );
          
          if (!proceed) {
            return;
          }
        }
      }
      
      const backendButtons = buttons.map(button => {
        if (button.type === 'Custom' || button.type === 'Pre-configured') {
          const mapped = {
            type: 'CUSTOM',
            text: button.text
          };
          return mapped;
        } else if (button.type === 'VisitWebsite') {
          const mapped = {
            type: 'URL',
            text: button.text,
            value: button.websiteUrl
          };
          return mapped;
        } else if (button.type === 'CallWhatsApp') {
          const mapped = {
            type: 'PHONE',
            subType: 'WHATSAPP',
            text: button.text,
            activeFor: button.activeFor
          };
          return mapped;
        } else if (button.type === 'CallPhone') {
          // Extract country code from country field (e.g., "IN +91" -> "+91")
          const countryCode = button.country?.match(/\+\d+/)?.[0] || '+1';
          
          // Format phone number with country code if not already present
          let formattedPhone = button.phoneNumber || '';
          if (formattedPhone && !formattedPhone.startsWith('+')) {
            formattedPhone = countryCode + formattedPhone;
          }
          
          const mapped = {
            type: 'PHONE',
            subType: 'VOICE',
            text: button.text,
            value: formattedPhone,
            country: button.country
          };
          return mapped;
        } else if (button.type === 'CompleteFlow') {
          const mapped = {
            type: 'FLOW',
            text: button.text
          };
          return mapped;
        } else if (button.type === 'CopyOfferCode') {
          const mapped = {
            type: 'OFFER',
            text: button.text,
            value: button.offerCode
          };
          return mapped;
        }
        return null;
      }).filter(Boolean);

      // Prepare template data with variables and buttons
      const templateDataToSubmit = {
        name: templateData.name,
        category: templateData.category,
        templateType: templateData.templateType,
        language: templateData.language || 'en',
        bodyText: body,
        headerText: mediaSample === 'None' ? header : undefined,
        footerText: footer,
        variables: variables,
        buttons: backendButtons,
        uploadedFile: uploadedFile // Add the uploaded file to the data
      };

      // Clear previous validation errors
      setValidationErrors({});
      
      // Check if we're editing an existing template or creating a new one
      const isEditMode = !!templateData._id;
      
      let result;
      if (isEditMode) {
        result = await updateTemplate(templateData._id, templateDataToSubmit, uploadedFile);
        toast.success('Template updated successfully!');
      } else {
        result = await createTemplate(templateDataToSubmit);
        toast.success('Template created successfully!');
      }
    } catch (err) {
      // Show error toast
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || `Failed to ${templateData._id ? 'update' : 'create'} template`;
      toast.error(errorMessage);
      
      // Check if error contains validation errors from backend
      // templateService throws error.response.data, so check both locations
      const validationErrors = err.response?.data?.validationErrors || err.validationErrors;
      
      if (validationErrors) {
        const errors = {};
        validationErrors.forEach(error => {
          // Map backend field names to frontend field names
          const fieldMap = {
            'name': 'name',
            'templateName': 'name',
            'language': 'language',
            'headerText': 'headerText',
            'header': 'headerText',
            'bodyText': 'bodyText',
            'body': 'bodyText',
            'footerText': 'footerText',
            'footer': 'footerText',
            'category': 'category',
            'templateType': 'templateType',
            'buttons': 'buttons',
            'variables': 'variables'
          };
          
          // Handle button-specific errors like buttons[0].value
          if (error.field.startsWith('buttons[')) {
            const match = error.field.match(/buttons\[(\d+)\]\.(\w+)/);
            if (match) {
              const buttonIndex = parseInt(match[1]);
              const fieldName = match[2]; // 'value', 'text', etc.
              
              // Map to button ID if we can find it
              if (buttons[buttonIndex]) {
                const buttonId = buttons[buttonIndex].id;
                const buttonType = buttons[buttonIndex].type;
                
                // Map 'value' to appropriate field based on button type
                if (fieldName === 'value') {
                  if (buttonType === 'VisitWebsite') {
                    const errorKey = `button_${buttonId}_url`;
                    errors[errorKey] = error.message;
                  } else if (buttonType === 'CallPhone' || buttonType === 'CallWhatsApp') {
                    const errorKey = `button_${buttonId}_phone`;
                    errors[errorKey] = error.message;
                  }
                } else if (fieldName === 'text') {
                  const errorKey = `button_${buttonId}_text`;
                  errors[errorKey] = error.message;
                }
              }
            }
          } else {
            const frontendField = fieldMap[error.field] || error.field;
            
            // If the field already has an error, convert to array or append
            if (errors[frontendField]) {
              if (Array.isArray(errors[frontendField])) {
                errors[frontendField].push(error.message);
              } else {
                errors[frontendField] = [errors[frontendField], error.message];
              }
            } else {
              // Check if there are multiple errors for the same field
              const sameFieldErrors = validationErrors.filter(e => 
                (fieldMap[e.field] || e.field) === frontendField
              );
              
              if (sameFieldErrors.length > 1) {
                errors[frontendField] = sameFieldErrors.map(e => e.message);
              } else {
                errors[frontendField] = error.message;
              }
            }
          }
        });
        setValidationErrors(errors);
        setError('Please fix the validation errors');
      } else if (err.response?.data?.error) {
        // Handle single error message from backend
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        const isEditMode = !!templateData._id;
        setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} template`);
      }
    }
  };

  // Clear uploaded file when media sample changes
  useEffect(() => {
    setUploadedFile(null);
  }, [mediaSample]);

  // Replace variables in text with sample values
  const replaceVariables = (text, section) => {
    let newText = text || '';
    
    if (section === 'header') {
      // Only replace header variables
      headerVariables.forEach(varId => {
        const regex = new RegExp(`\\{\\{${varId}\\}\\}`, 'g');
        newText = newText.replace(regex, variableSamples[`header_${varId}`] || `{{${varId}}}`);
      });
    } else if (section === 'body') {
      // Only replace body variables
      bodyVariables.forEach(varId => {
        const regex = new RegExp(`\\{\\{${varId}\\}\\}`, 'g');
        newText = newText.replace(regex, variableSamples[`body_${varId}`] || `{{${varId}}}`);
      });
    }
    
    return newText;
  };

  // Extract variables from text using regex
  const extractVariables = (text) => {
    const regex = /\{\{(\d+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(parseInt(match[1]));
    }
    return [...new Set(matches)].sort((a, b) => a - b);
  };

  // Get variables from header and body
  const headerVariables = extractVariables(header || '');
  const bodyVariables = extractVariables(body || '');

  const addHeaderVariable = () => {
    const existingVars = extractVariables(header || '');
    const newIndex = existingVars.length > 0 ? Math.max(...existingVars) + 1 : 1;
    const placeholder = `{{${newIndex}}}`;
    setHeader(header ? `${header} ${placeholder}` : placeholder);
  };

  const addBodyVariable = () => {
    const existingVars = extractVariables(body || '');
    const newIndex = existingVars.length > 0 ? Math.max(...existingVars) + 1 : 1;
    const placeholder = `{{${newIndex}}}`;
    setBody(body ? `${body} ${placeholder}` : placeholder);
  };

  const updateVariableSample = (id, value) => {
    setVariableSamples(prev => ({ ...prev, [id]: value }));
  };

  const addButton = (type) => {
    // Check if already at maximum button limit
    if (buttons.length >= 10) {
      setValidationErrors(prev => ({
        ...prev,
        buttons: 'Maximum 10 buttons allowed per template'
      }));
      setShowButtonDropdown(false);
      return;
    }
    
    // Clear any existing buttons error
    if (validationErrors.buttons) {
      setValidationErrors(prev => {
        const { buttons, ...rest } = prev;
        return rest;
      });
    }
    
    const newButton = {
      id: Date.now(),
      type: type,
      text: type === 'VisitWebsite' ? 'Visit website' : 
            type === 'CallWhatsApp' ? 'Call on WhatsApp' :
            type === 'CallPhone' ? 'Call phone number' :
            type === 'Custom' ? 'Quick Reply' : 
            type === 'Pre-configured' ? 'Preconfigured Response' : '',
      urlType: type === 'VisitWebsite' ? 'Static' : '',
      websiteUrl: '',
      country: 'US +1',
      phoneNumber: '',
      offerCode: '',
      activeFor: '7 days',
    };
    setButtons(prev => {
      const updated = [...prev, newButton];
      return updated;
    });
    setShowButtonDropdown(false);
  };

  const updateButtonText = (id, text) => {
    setButtons(prev => prev.map(btn => btn.id === id ? { ...btn, text } : btn));
  };

  const removeButton = (id) => {
    setButtons(prev => {
      const updated = prev.filter(btn => btn.id !== id);
      // Clear buttons error if we're now below the limit
      if (updated.length < 10 && validationErrors.buttons) {
        setValidationErrors(prevErrors => {
          const { buttons, ...rest } = prevErrors;
          return rest;
        });
      }
      return updated;
    });
  };

  const mediaOptions = [
    { id: 'None', label: 'None', icon: null },
    { id: 'Image', label: 'Image', icon: FaImage },
    { id: 'Document', label: 'Document', icon: FaFileAlt },
  ];

  const getSelectedMediaIcon = () => {
    const selected = mediaOptions.find(opt => opt.id === mediaSample);
    return selected?.icon;
  };

  const shouldShowUpload = ['Image', 'Document'].includes(mediaSample);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const buttonTypes = [
    { id: 'Custom', label: 'Custom', icon: FaArrowUp, hasSubTypes: true },
    { id: 'VisitWebsite', label: 'Visit website', icon: FaExternalLinkAlt },
    { id: 'CallWhatsApp', label: 'Call on WhatsApp', icon: FaWhatsapp },
    { id: 'CallPhone', label: 'Call Phone Number', icon: FaPhone },
  ];

  const customButtonTypes = [
    { id: 'Custom', label: 'Quick reply' },
    { id: 'Pre-configured', label: 'Pre-configured response' }
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
              <FaCheck className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-600">Set up template</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-navy">
              <div className="h-2.5 w-2.5 rounded-full bg-brand-yellow" />
            </div>
            <span className="text-sm font-medium text-brand-navy">Edit template</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Name and Language */}
            <div className="rounded-2xl border border-brand-yellow/40 bg-brand-cream/40 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">Template name and language</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">
                    Name your template
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTemplateName(value);
                        validateTemplateName(value);
                      }}
                      placeholder="Enter a template name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        validationErrors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                      }`}
                    />
                    <span className="absolute right-3 top-3 text-sm text-brand-muted/70">0/512</span>
                  </div>
                  {validationErrors.name && (
                    <div className="mt-2 text-sm text-red-600 flex items-start gap-1">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{validationErrors.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-2">
                    Select language
                  </label>
                  <div className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 text-brand-muted">
                    English
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="rounded-2xl border border-brand-yellow/40 bg-brand-cream/40 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-2">Content</h3>
              <p className="text-sm text-brand-muted mb-4">
                Add a header, body and footer for your template. Cloud API hosted by Meta will review the template variables and content to protect the security and integrity of our services.
              </p>

              {/* Type of Variable */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-navy mb-2 flex items-center gap-1">
                  Type of variable
                  <FaInfoCircle className="w-4 h-4 text-brand-muted/70" />
                </label>
                <select
                  value={variableType}
                  onChange={(e) => setVariableType(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                >
                  <option>Name</option>
                  <option>Number</option>
                </select>
              </div>

              {/* Media Sample */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Media sample <span className="text-brand-muted font-normal">• Optional</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowMediaDropdown(!showMediaDropdown)}
                    className="w-full max-w-xs px-3 py-2 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy bg-brand-cream/40 text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {getSelectedMediaIcon() && React.createElement(getSelectedMediaIcon(), { className: "w-4 h-4 text-brand-muted" })}
                      <span className="text-sm text-brand-navy">{mediaSample}</span>
                    </div>
                    <svg className="w-4 h-4 text-brand-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showMediaDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-full max-w-xs bg-white border border-brand-yellow/30 rounded-lg shadow-lg z-10">
                      {mediaOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => {
                              setMediaSample(option.id);
                              setShowMediaDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-brand-cream/40 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                              mediaSample === option.id ? 'bg-brand-yellow-soft/50' : ''
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              mediaSample === option.id ? 'border-brand-navy' : 'border-brand-yellow/40'
                            }`}>
                              {mediaSample === option.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-brand-navy"></div>
                              )}
                            </div>
                            {Icon && <Icon className="w-4 h-4 text-brand-muted" />}
                            <span className="text-sm text-brand-navy">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upload Area */}
                {shouldShowUpload && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept={mediaSample === 'Image' ? 'image/*' : '*'}
                      className="hidden"
                    />
                    {uploadedFile ? (
                      <div className="mt-4 bg-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded overflow-hidden flex-shrink-0">
                            {mediaSample === 'Image' && uploadedFile.type?.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(uploadedFile)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <FaFileAlt className="w-5 h-5 text-brand-muted" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-brand-navy">{uploadedFile.name}</span>
                        </div>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="text-brand-muted hover:text-brand-muted"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="mt-4 border-2 border-dashed border-brand-yellow/40 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                        onClick={handleChooseFile}
                      >
                        <p className="text-sm text-brand-muted mb-1">Drag and drop to upload</p>
                        <p className="text-sm">
                          Or <span className="text-brand-navy hover:underline">choose files on your device</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Header */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Header <span className="text-brand-muted font-normal">• Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => setHeaderWithValidation(e.target.value)}
                    placeholder="Add a short line of text to the header of your message in English"
                    disabled={mediaSample !== 'None'}
                    className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.headerText ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                    } ${
                      mediaSample !== 'None' ? 'bg-brand-cream cursor-not-allowed text-brand-muted' : ''
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-sm text-brand-muted/70">{header.length}/60</span>
                </div>
                {validationErrors.headerText && (
                  <div className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.headerText}</span>
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={addHeaderVariable}
                    className="text-sm text-brand-muted hover:text-gray-800 font-medium"
                  >
                    + Add variable
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Body
                </label>
                <div className="relative">
                  <textarea
                    value={body}
                    onChange={(e) => setBodyWithValidation(e.target.value)}
                    rows={6}
                    className={`w-full px-3 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.bodyText ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-sm text-brand-muted/70">{body.length}/1024</span>
                </div>
                {validationErrors.bodyText && (
                  <div className="mt-2 space-y-1">
                    {Array.isArray(validationErrors.bodyText) ? (
                      validationErrors.bodyText.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 flex items-start gap-1">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{typeof error === 'string' ? error : error.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-red-600 flex items-start gap-1">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{validationErrors.bodyText}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={addBodyVariable}
                    className="text-sm text-brand-muted hover:text-gray-800 font-medium"
                  >
                    + Add variable
                  </button>
                </div>
              </div>

              {/* Variable Samples Section */}
              {(headerVariables.length > 0 || bodyVariables.length > 0) && (
                <div className="mb-4 bg-white rounded-lg border border-brand-yellow/30 p-4">
                  <h4 className="text-base font-semibold text-brand-navy mb-2">Variable samples</h4>
                  <p className="text-sm text-brand-muted mb-4">
                    Include samples of all variables in your message to help Meta review your template. Remember not to include any customer information to protect your customer's privacy.
                  </p>
                  
                  {validationErrors.variables && (
                    <div className="mb-4 text-sm text-red-600 flex items-start gap-1">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{validationErrors.variables}</span>
                    </div>
                  )}
                  
                  {/* Header Variables */}
                  {headerVariables.length > 0 && mediaSample === 'None' && (
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-brand-navy mb-2">
                        Header
                      </label>
                      <div className="space-y-2">
                        {headerVariables.map((varId) => (
                          <div key={varId} className="grid grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                value={`{{${varId}}}`}
                                disabled
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg text-brand-muted text-sm"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={variableSamples[`header_${varId}`] || ''}
                                onChange={(e) => updateVariableSample(`header_${varId}`, e.target.value)}
                                placeholder={`Enter content for {{${varId}}}`}
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 focus:outline-none focus:ring-2 focus:border-brand-navy text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Body Variables */}
                  {bodyVariables.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-brand-navy mb-2">
                        Body
                      </label>
                      <div className="space-y-2">
                        {bodyVariables.map((varId) => (
                          <div key={varId} className="grid grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                value={`{{${varId}}}`}
                                disabled
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg text-brand-muted text-sm"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={variableSamples[`body_${varId}`] || ''}
                                onChange={(e) => updateVariableSample(`body_${varId}`, e.target.value)}
                                placeholder={`Enter content for {{${varId}}}`}
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 focus:outline-none focus:ring-2 focus:border-brand-navy text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-navy mb-2">
                  Footer <span className="text-brand-muted font-normal">• Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={footer}
                    onChange={(e) => setFooterWithValidation(e.target.value)}
                    placeholder="Add a short line of text to the bottom of your message in English"
                    className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 ${
                      validationErrors.footerText ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-sm text-brand-muted/70">{footer.length}/60</span>
                </div>
                {validationErrors.footerText && (
                  <div className="mt-2 text-sm text-red-600 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.footerText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons Section */}
            <div className="rounded-2xl border border-brand-yellow/40 bg-brand-cream/40 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-navy mb-2">
                Buttons <span className="text-brand-muted font-normal text-sm">• Optional</span>
              </h3>
              <p className="text-sm text-brand-muted mb-4">
                Create buttons that let customers respond to your message or take action. You can add up to ten buttons. If you add more than three buttons, they will appear in a list.
              </p>
              {validationErrors.buttons && (
                <div className="mb-4 text-sm text-red-600 flex items-start gap-1">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{validationErrors.buttons}</span>
                </div>
              )}
              
              <div className="relative mb-4">
                <button
                  onClick={() => setShowButtonDropdown(!showButtonDropdown)}
                  className="px-4 py-2 border border-brand-yellow/40 rounded-lg hover:bg-brand-cream/40 flex items-center gap-2"
                >
                  + Add button
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showButtonDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-brand-yellow/30 rounded-lg shadow-lg z-10">
                    {buttonTypes.map((button) => {
                      const Icon = button.icon;
                      return (
                        <button
                          key={button.id}
                          onClick={() => {
                            addButton(button.id);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-brand-cream/40 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                        >
                          <Icon className="w-4 h-4 text-brand-muted" />
                          <span className="text-sm text-brand-navy">{button.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Added Buttons List */}
              {buttons.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-brand-navy">
                    {buttons[0].type === 'Custom' || buttons[0].type === 'Pre-configured' ? 'Quick reply' : 'Call to action'} 
                    <span className="text-brand-muted font-normal"> • Optional</span>
                  </h4>
                  {buttons.map((button, index) => (
                    <div key={button.id} className="bg-white rounded-lg border border-brand-yellow/30 p-4">
                      {/* Quick Reply / Pre-configured Response */}
                      {(button.type === 'Custom' || button.type === 'Pre-configured') && (
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-brand-navy mb-2">Type</label>
                            <select
                              value={button.type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                setButtons(prev => prev.map(btn => 
                                  btn.id === button.id 
                                    ? { ...btn, type: newType, text: newType === 'Custom' ? 'Quick Reply' : 'Preconfigured Response' }
                                    : btn
                                ));
                              }}
                              className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                            >
                              <option value="Custom">Custom</option>
                              <option value="Pre-configured">Pre-configured response</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-brand-navy mb-2">Button text</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={button.text}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updateButtonText(button.id, value);
                                  validateButtonText(button.id, value);
                                }}
                                maxLength={25}
                                className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 ${
                                  validationErrors[`button_${button.id}_text`] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                                }`}
                              />
                              <span className="absolute right-3 top-3 text-sm text-brand-muted/70">
                                {button.text.length}/25
                              </span>
                            </div>
                            {validationErrors[`button_${button.id}_text`] && (
                              <div className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{validationErrors[`button_${button.id}_text`]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Visit Website */}
                      {button.type === 'VisitWebsite' && (
                        <div className="space-y-4 mb-3">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Type of action</label>
                              <div className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 text-brand-muted">
                                Visit website
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Button text</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={button.text}
                                  onChange={(e) => updateButtonText(button.id, e.target.value)}
                                  maxLength={25}
                                  className="w-full px-3 py-2 pr-16 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                                />
                                <span className="absolute right-3 top-3 text-sm text-brand-muted/70">
                                  {button.text.length}/25
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">URL type</label>
                              <div className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 text-brand-muted">
                                Static
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Website URL</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={button.websiteUrl}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setButtons(prev => prev.map(btn => btn.id === button.id ? { ...btn, websiteUrl: value } : btn));
                                    validateButtonUrl(button.id, value);
                                  }}
                                  maxLength={2000}
                                  className={`w-full px-3 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 ${
                                    validationErrors[`button_${button.id}_url`] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                                  }`}
                                />
                                <span className="absolute right-3 top-3 text-sm text-brand-muted/70">
                                  {button.websiteUrl.length}/2000
                                </span>
                              </div>
                              {validationErrors[`button_${button.id}_url`] && (
                                <div className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <span>{validationErrors[`button_${button.id}_url`]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Call on WhatsApp */}
                      {button.type === 'CallWhatsApp' && (
                        <div className="space-y-4 mb-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Type of action</label>
                              <div className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 text-brand-muted">
                                Call on WhatsApp
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Button text</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={button.text}
                                  onChange={(e) => updateButtonText(button.id, e.target.value)}
                                  maxLength={25}
                                  className="w-full px-3 py-2 pr-16 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                                />
                                <span className="absolute right-3 top-3 text-sm text-brand-muted/70">
                                  {button.text.length}/25
                                </span>
                              </div>
                            </div>
                            {/* <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Phone Number</label>
                              <input
                                type="text"
                                value={button.phoneNumber}
                                onChange={(e) => setButtons(prev => prev.map(btn => btn.id === button.id ? { ...btn, phoneNumber: e.target.value } : btn))}
                                placeholder="+1234567890"
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                              />
                            </div> */}
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Active for</label>
                              <select
                                value={button.activeFor}
                                onChange={(e) => setButtons(prev => prev.map(btn => btn.id === button.id ? { ...btn, activeFor: e.target.value } : btn))}
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                              >
                                <option value="7 days">7 days</option>
                                <option value="14 days">14 days</option>
                                <option value="30 days">30 days</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Call Phone Number */}
                      {button.type === 'CallPhone' && (
                        <div className="space-y-4 mb-3">
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Type of action</label>
                              <div className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg bg-brand-cream/40 text-brand-muted">
                                Call Phone Number
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Button text</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={button.text}
                                  onChange={(e) => updateButtonText(button.id, e.target.value)}
                                  maxLength={25}
                                  className="w-full px-3 py-2 pr-16 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                                />
                                <span className="absolute right-3 top-3 text-sm text-brand-muted/70">
                                  {button.text.length}/25
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Country</label>
                              <select
                                value={button.country}
                                onChange={(e) => setButtons(prev => prev.map(btn => btn.id === button.id ? { ...btn, country: e.target.value } : btn))}
                                className="w-full px-3 py-2 border border-brand-yellow/40 rounded-lg focus:outline-none focus:ring-2 focus:border-brand-navy"
                              >
                                <option value="US +1">US +1</option>
                                <option value="IN +91">IN +91</option>
                                <option value="UK +44">UK +44</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-brand-navy mb-2">Phone number</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={button.phoneNumber}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setButtons(prev => prev.map(btn => btn.id === button.id ? { ...btn, phoneNumber: value } : btn));
                                    validateButtonPhone(button.id, value);
                                  }}
                                  placeholder="Enter phone number"
                                  maxLength={20}
                                  className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 ${
                                    validationErrors[`button_${button.id}_phone`] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-brand-yellow/40 focus:border-brand-navy'
                                  }`}
                                />
                                <span className="absolute right-3 top-3 text-sm text-brand-muted/70">
                                  {button.phoneNumber.length}/20
                                </span>
                              </div>
                              {validationErrors[`button_${button.id}_phone`] && (
                                <div className="mt-2 text-sm text-red-600 flex items-start gap-1">
                                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  <span>{validationErrors[`button_${button.id}_phone`]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={() => removeButton(button.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Preview */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-brand-yellow/40 bg-brand-cream/40 p-5 shadow-sm sticky top-0 max-h-[calc(100vh-3rem)] overflow-auto">
              <h3 className="text-lg font-semibold text-brand-navy mb-4">Template preview</h3>
              
              {/* Phone Mockup - Fixed height container */}
              <div className="p-2 flex items-start justify-center">
                <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-[#e5ddd5] shadow-lg">
                  <div className="bg-brand-navy px-4 py-2.5 text-center text-xs font-medium text-white">
                    WhatsApp Preview
                  </div>
                  <div className="p-3">
                <div className="overflow-hidden rounded-xl bg-white shadow-sm w-full">
                  <div className="p-4">
                    <div className="bg-white rounded-lg border border-brand-yellow/30 p-3 mb-2">
                      {/* Media Preview */}
                      {mediaSample && mediaSample !== 'None' && (
                        <div className="mb-2">
                          {mediaSample === 'Image' && (
                            <div className={`rounded-lg flex items-center justify-center ${!uploadedFile ? 'bg-brand-cream p-4' : ''}`}>
                              {uploadedFile && uploadedFile.type?.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(uploadedFile)}
                                  alt="Image preview"
                                  className="max-w-full max-h-48 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="text-center">
                                  <FaImage className="w-20 h-20 text-brand-muted/70 mx-auto" />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {mediaSample === 'Document' && (
                            <div className="bg-brand-cream rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-yellow-soft">
                                  <FaFileAlt className="w-6 h-6 text-brand-navy" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-brand-navy">
                                    {uploadedFile ? uploadedFile.name : 'Document'}
                                  </p>
                                  <p className="text-xs text-brand-muted">
                                    {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Document preview'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Header */}
                      {header && mediaSample === 'None' && (
                        <p className="text-md font-semibold text-brand-navy mb-2 break-words">{replaceVariables(header, 'header')}</p>
                      )}
                      
                      {/* Body */}
                      {body && (
                        <p className="text-sm text-brand-navy whitespace-pre-wrap break-words">{replaceVariables(body, 'body')}</p>
                      )}
                      
                      {/* Footer */}
                      {footer && (
                        <p className="text-sm text-brand-muted mt-2">{footer}</p>
                      )}
                      
                      <div className="text-xs text-brand-muted/70 text-right">05:46</div>

                      {/* Buttons Preview */}
                      {buttons.length > 0 && (
                        <div className="mt-2 -mx-3 -mb-3 border-t border-brand-yellow/30">
                          {buttons.map((button, index) => (
                            <div
                              key={button.id}
                              className={`py-2 px-3 flex items-center justify-center gap-2 text-sm font-medium text-brand-navy cursor-pointer hover:bg-brand-cream/40 ${
                                index < buttons.length - 1 ? 'border-b border-brand-yellow/30' : ''
                              }`}
                            >
                              {/* Call on WhatsApp Icon */}
                              {button.type === 'CallWhatsApp' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              )}
                              
                              {/* Call Phone Number Icon */}
                              {button.type === 'CallPhone' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              )}
                              
                              {/* Visit Website Icon */}
                              {button.type === 'VisitWebsite' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                              
                              {/* Quick Reply Icon (Custom/Pre-configured) */}
                              {(button.type === 'Custom' || button.type === 'Pre-configured') && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              )}
                              
                              <span>{button.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-brand-yellow/30 pt-6">
          {/* Error Display */}
          {error && (
            <div className="flex-1 mr-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={goToPreviousStep}
              disabled={loading}
              className="rounded-xl border border-brand-yellow/40 bg-white px-6 py-2.5 text-sm font-medium text-brand-navy transition hover:bg-brand-yellow/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading || !templateName || templateName.trim() === ''}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                loading || !templateName || templateName.trim() === ''
                  ? 'cursor-not-allowed bg-brand-yellow/30 text-brand-muted'
                  : 'bg-brand-yellow text-brand-navy hover:bg-brand-yellow-hover'
              }`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading 
                ? (templateData._id ? 'Updating...' : 'Creating...') 
                : (templateData._id ? 'Update Template' : 'Submit')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;
