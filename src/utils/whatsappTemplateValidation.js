// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP TEMPLATE VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export const extractTemplateVariablePositions = (text) => {
  if (!text) return [];

  const regex = /\{\{(\d+)\}\}/g;
  const positions = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    positions.push(parseInt(match[1], 10));
  }

  return [...new Set(positions)].sort((a, b) => a - b);
};

export const hasTemplateVariables = (variables = []) =>
  Array.isArray(variables) && variables.length > 0;

export const getTemplateBodyPlaceholderCount = (bodyText) =>
  extractTemplateVariablePositions(bodyText).length;

export const templateHasBodyVariables = (bodyText) =>
  getTemplateBodyPlaceholderCount(bodyText) > 0;

export const getTemplateBodyVariableCount = (bodyText, variables = []) => {
  const placeholderCount = getTemplateBodyPlaceholderCount(bodyText);

  if (placeholderCount === 0) {
    return 0;
  }

  if (!hasTemplateVariables(variables)) {
    return placeholderCount;
  }

  return Math.max(placeholderCount, variables.length);
};

// Helper function to validate URLs
export const isValidURL = (url) => {
    try {
      if (url.includes('{{')) {
        const baseUrl = url.split('{{')[0];
        if (!baseUrl) return true;
        new URL(baseUrl);
        return true;
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  // Helper function to check URL shorteners
  export const isURLShortener = (url) => {
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'short.link'];
    return shorteners.some(shortener => url.includes(shortener));
  };
  
  // Helper function to validate phone numbers
  export const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone);
  };
  
  // Helper function to validate template name field (for real-time validation)
  export const validateTemplateNameField = (value) => {
    if (!value || !value.trim()) {
      return 'Template name is required';
    }
    
    const nameRegex = /^[a-z0-9_]+$/;
    if (!nameRegex.test(value)) {
      return 'Template name must use only lowercase letters, numbers, and underscores (no spaces or special characters)';
    }
    
    if (value.length > 512) {
      return 'Template name must be 512 characters or less';
    }
    
    return null; // No error
  };
  
  // Helper function to validate header text field
  export const validateHeaderTextField = (value) => {
    if (value.length > 60) {
      return 'Header text must be 60 characters or less';
    }
    return null;
  };
  
  // Helper function to validate footer text field
  export const validateFooterTextField = (value) => {
    if (value.length > 60) {
      return 'Footer text must be 60 characters or less';
    }
    return null;
  };
  
  // Helper function to validate button text field
  export const validateButtonTextField = (value) => {
    if (!value || !value.trim()) {
      return 'Button text is required';
    }
    if (value.length > 25) {
      return 'Button text must be 25 characters or less';
    }
    return null;
  };
  
  // Helper function to validate button URL field
  export const validateButtonUrlField = (value) => {
    if (!value || !value.trim()) {
      return 'Website URL is required';
    }
    if (!isValidURL(value)) {
      return 'Invalid URL format';
    }
    if (isURLShortener(value)) {
      return 'URL shorteners are not allowed';
    }
    return null;
  };
  
  // Helper function to validate button phone field
  export const validateButtonPhoneField = (value) => {
    if (!value || !value.trim()) {
      return 'Phone number is required';
    }
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must have at least 10 digits';
    }
    return null;
  };
  
  // Helper function to validate WhatsApp template body text
  export const validateWhatsAppTemplate = (bodyText) => {
    const errors = [];
  
    if (!bodyText || !bodyText.trim()) {
      return { isValid: false, errors: ['Body text is required'] };
    }
  
    // 1. Extract variables like {{1}}, {{2}}
    const variableMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
    const variableCount = variableMatches.length;
  
    // 2. Check sequential variables
    const numbers = variableMatches.map(v =>
      parseInt(v.replace(/[{}]/g, ""), 10)
    );
  
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] !== i + 1) {
        errors.push("Variables must be sequential ({{1}}, {{2}}, ...)");
        break;
      }
    }
  
    // 3. Remove variables for word analysis
    const cleanText = bodyText.replace(/\{\{\d+\}\}/g, "").trim();
  
    // 4. Split into words
    const words = cleanText
      .split(/\s+/)
      .filter(w => w.length > 1);
  
    const wordCount = words.length;
  
    // 5. Detect gibberish words (repeated letters)
    const gibberishWords = words.filter(word =>
      /(.)\1{4,}/.test(word) // 5+ repeated characters
    );
  
    if (gibberishWords.length > 0) {
      errors.push("Message contains gibberish or repeated characters");
    }
  
    // 6. Word-to-variable ratio check
    if (variableCount > 0) {
      const ratio = wordCount / variableCount;
  
      if (ratio < 4) {
        errors.push("Too many variables for message length. Add more natural text.");
      }
    }
  
    // 7. Minimum real words
    if (wordCount < 3) {
      errors.push("Message too short. Provide meaningful content.");
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // 1. Template Structure Validations
  export const validateTemplateStructure = (template) => {
    const errors = [];
  
    // Template name validation
    const nameRegex = /^[a-z0-9_]+$/;
    if (!template.name) {
      errors.push({ field: 'name', message: 'Template name is required' });
    } else if (!nameRegex.test(template.name)) {
      errors.push({ field: 'name', message: 'Template name must use only lowercase letters, numbers, and underscores (no spaces or special characters)' });
    }
  
    // Header text validation
    if (template.headerText && template.headerText.length > 60) {
      errors.push({ field: 'headerText', message: 'Header text must be 60 characters or less' });
    }
  
    // Body text validation
    if (!template.bodyText) {
      errors.push({ field: 'bodyText', message: 'Body text is required' });
    } else if (template.bodyText.length > 1024) {
      errors.push({ field: 'bodyText', message: 'Body text must be 1024 characters or less' });
    }
  
    // Footer text validation
    if (template.footerText && template.footerText.length > 60) {
      errors.push({ field: 'footerText', message: 'Footer text must be 60 characters or less' });
    }
  
    // Buttons validation
    if (template.buttons && template.buttons.length > 10) {
      errors.push({ field: 'buttons', message: 'Maximum 10 buttons allowed per template' });
    }
  
    // Validate button URLs and phone numbers
    if (template.buttons) {
      template.buttons.forEach((button, index) => {
        if (button.type === 'URL' && button.value) {
          if (!isValidURL(button.value)) {
            errors.push({ field: `buttons[${index}].value`, message: `Invalid URL format` });
          }
          if (isURLShortener(button.value)) {
            errors.push({ field: `buttons[${index}].value`, message: `URL is too short` });
          }
        }
        if (button.type === 'PHONE' && button.value) {
          const digitsOnly = button.value.replace(/\D/g, '');
          
          if (digitsOnly.length < 10) {
            errors.push({ field: `buttons[${index}].value`, message: `Phone number must be at least 10 digits` });
          } else if (digitsOnly.length > 15) {
            errors.push({ field: `buttons[${index}].value`, message: `Phone number cannot exceed 15 digits` });
          }
        }
      });
    }
  
    return errors;
  };
  
  // 2. Parameter (Variable) Validations
  export const validateVariables = (bodyText, variables) => {
    const errors = [];
    
    if (!bodyText) return errors;
    
    const variableMatches = bodyText.match(/\{\{(\d+)\}\}/g);
    if (!variableMatches) return errors;
  
    const variableNumbers = variableMatches.map(match => parseInt(match.match(/\{\{(\d+)\}\}/)[1]));
    const uniqueNumbers = [...new Set(variableNumbers)].sort((a, b) => a - b);
  
    // Check if variables start or end the message
    if (bodyText.trim().startsWith('{{')) {
      errors.push('Variables cannot start the message');
    }
    if (bodyText.trim().endsWith('}}')) {
      errors.push('Variables cannot end the message');
    }
  
    // Check for adjacent variables
    if (/\{\{\d+\}\}\s*\{\{\d+\}\}/.test(bodyText)) {
      errors.push('Adjacent variables are not allowed (e.g., {{1}}{{2}} or {{1}} {{2}})');
    }
  
    // Check for excessive variables
    if (uniqueNumbers.length > 10) {
      errors.push('Too many variables (max 10 recommended to avoid spam detection)');
    }
  
    return errors;
  };
  
  // 3. Content Policy Validations
  export const validateContentPolicy = (bodyText) => {
    const errors = [];
    
    if (!bodyText) return errors;
  
    // Check excessive capitalization
    const words = bodyText.split(/\s+/);
    const capsWords = words.filter(word => {
      if (word.includes('{{') || word.length < 3) return false;
      return word === word.toUpperCase() && /[A-Z]/.test(word);
    });
    
    if (capsWords.length > 3) {
      errors.push('Excessive capitalization detected');
    }
  
    // Check for repeated punctuation
    if (/[!?*.]{3,}/.test(bodyText)) {
      errors.push('Repeated punctuation not allowed');
    }
  
    // Check for excessive emojis
    const emojiCount = (bodyText.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiCount > 5) {
      errors.push('Too many emojis detected. Use emojis sparingly.');
    }
  
    return errors;
  };
  
  // 4. Quality & Language Validations
  export const validateQuality = (bodyText) => {
    const errors = [];
    
    if (!bodyText) return errors;
  
    // Check for all caps message
    const textWithoutVariables = bodyText.replace(/\{\{\d+\}\}/g, '');
    if (textWithoutVariables.length > 10 && textWithoutVariables === textWithoutVariables.toUpperCase()) {
      errors.push('Message should not be entirely in uppercase');
    }
  
    return errors;
  };
  
  // Main comprehensive validation function
  export const validateTemplateComplete = (template) => {
    const allErrors = [
      ...validateTemplateStructure(template),
    ];
  
    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  };
  
  // Validate body text comprehensively
  export const validateBodyTextComplete = (bodyText, variables) => {
    const errors = [];
  
    // WhatsApp template validation
    const whatsappValidation = validateWhatsAppTemplate(bodyText);
    if (!whatsappValidation.isValid) {
      errors.push(...whatsappValidation.errors);
    }
  
    // Variable validations
    const variableErrors = validateVariables(bodyText, variables);
    errors.push(...variableErrors);
  
    // Content policy validations
    const contentErrors = validateContentPolicy(bodyText);
    errors.push(...contentErrors);
  
    // Quality validations
    const qualityErrors = validateQuality(bodyText);
    errors.push(...qualityErrors);
  
    return errors;
  };
  