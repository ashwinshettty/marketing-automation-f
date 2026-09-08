import { extractTemplateVariablePositions } from '../../utils/whatsappTemplateValidation';

export const extractVariables = (text) =>
  extractTemplateVariablePositions(text || '');

export const resolveBackendTemplateType = (subtype) =>
  subtype === 'FLOW' ? 'INTERACTIVE' : subtype;

export const inferMessageSubtype = (template = {}) => {
  const hasFlowButton = (template.buttons || []).some(
    (button) => button.type === 'FLOW' || button.type === 'CompleteFlow',
  );
  if (hasFlowButton) return 'FLOW';
  if (template.templateType === 'TEXT') return 'TEXT';
  if (template.messageSubtype === 'FLOW' || template.messageSubtype === 'TEXT') {
    return template.messageSubtype;
  }
  return template.templateType === 'INTERACTIVE' ? 'INTERACTIVE' : 'INTERACTIVE';
};

export const createDefaultButton = (type) => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  type,
  text:
    type === 'VisitWebsite'
      ? 'Visit website'
      : type === 'CallWhatsApp'
        ? 'Call on WhatsApp'
        : type === 'CallPhone'
          ? 'Call phone number'
          : type === 'CompleteFlow'
            ? 'Complete flow'
            : 'Quick reply',
  urlType: type === 'VisitWebsite' ? 'Static' : '',
  websiteUrl: '',
  country: 'US +1',
  phoneNumber: '',
  offerCode: '',
  activeFor: '7 days',
});

export const mapButtonsFromBackend = (buttons = []) =>
  buttons
    .map((button, index) => {
      const baseButton = {
        id: Date.now() + index,
        text: button.text || '',
      };

      if (button.type === 'URL') {
        return {
          ...baseButton,
          type: 'VisitWebsite',
          urlType: 'Static',
          websiteUrl: button.value || '',
        };
      }

      if (button.type === 'PHONE') {
        if (button.subType === 'WHATSAPP') {
          return {
            ...baseButton,
            type: 'CallWhatsApp',
            activeFor: button.activeFor || '7 days',
          };
        }
        return {
          ...baseButton,
          type: 'CallPhone',
          phoneNumber: button.value || '',
          country: button.country || 'US +1',
        };
      }

      if (button.type === 'CUSTOM') {
        return {
          ...baseButton,
          type: 'Custom',
        };
      }

      if (button.type === 'OFFER') {
        return {
          ...baseButton,
          type: 'CopyOfferCode',
          offerCode: button.value || '',
        };
      }

      if (button.type === 'FLOW') {
        return {
          ...baseButton,
          type: 'CompleteFlow',
        };
      }

      return null;
    })
    .filter(Boolean);

export const mapButtonsToBackend = (buttons = []) =>
  buttons
    .map((button) => {
      if (button.type === 'Custom' || button.type === 'Pre-configured') {
        return { type: 'CUSTOM', text: button.text };
      }
      if (button.type === 'VisitWebsite') {
        return { type: 'URL', text: button.text, value: button.websiteUrl };
      }
      if (button.type === 'CallWhatsApp') {
        return {
          type: 'PHONE',
          subType: 'WHATSAPP',
          text: button.text,
          activeFor: button.activeFor,
        };
      }
      if (button.type === 'CallPhone') {
        const countryCode = button.country?.match(/\+\d+/)?.[0] || '+1';
        let formattedPhone = button.phoneNumber || '';
        if (formattedPhone && !formattedPhone.startsWith('+')) {
          formattedPhone = countryCode + formattedPhone;
        }
        return {
          type: 'PHONE',
          subType: 'VOICE',
          text: button.text,
          value: formattedPhone,
          country: button.country,
        };
      }
      if (button.type === 'CompleteFlow') {
        return { type: 'FLOW', text: button.text };
      }
      if (button.type === 'CopyOfferCode') {
        return { type: 'OFFER', text: button.text, value: button.offerCode };
      }
      return null;
    })
    .filter(Boolean);

export const samplesFromVariables = (template = {}) => {
  const samples = {};
  (template.variables || []).forEach((variable) => {
    const isInHeader = template.headerText?.includes(`{{${variable.position}}}`);
    const section = isInHeader ? 'header' : 'body';
    samples[`${section}_${variable.position}`] = variable.example || '';
  });
  return samples;
};

export const buildVariables = ({
  headerText = '',
  bodyText = '',
  variableSamples = {},
  mediaSample = 'None',
} = {}) => {
  const headerVars = mediaSample === 'None' ? extractVariables(headerText) : [];
  const bodyVars = extractVariables(bodyText);
  const missingExamples = [];
  const variables = [];

  const collect = (positions, section) => {
    positions.forEach((position) => {
      const key = `${section}_${position}`;
      const sampleValue = variableSamples[key];
      if (!sampleValue || !String(sampleValue).trim()) {
        missingExamples.push(`{{${position}}}`);
      }
      variables.push({
        position,
        key: `var${position}`,
        source: `custom.var${position}`,
        dataType: 'TEXT',
        example: (sampleValue || '').trim(),
      });
    });
  };

  collect(headerVars, 'header');
  collect(bodyVars, 'body');

  return { variables, missingExamples, headerVars, bodyVars };
};

export const nextVariableIndex = (...texts) => {
  const existing = texts.flatMap((text) => extractVariables(text));
  return existing.length > 0 ? Math.max(...existing) + 1 : 1;
};

export const appendVariable = (text = '') => {
  const index = nextVariableIndex(text);
  const placeholder = `{{${index}}}`;
  return text ? `${text} ${placeholder}` : placeholder;
};

export const buildSubmitPayload = ({
  name,
  category,
  subtype,
  language = 'en',
  bodyText,
  headerText,
  footerText,
  buttons,
  mediaSample = 'None',
  variableSamples = {},
} = {}) => {
  const resolvedTemplateType = resolveBackendTemplateType(subtype);
  const { variables, missingExamples } = buildVariables({
    headerText,
    bodyText,
    variableSamples,
    mediaSample,
  });

  const backendButtons =
    resolvedTemplateType === 'INTERACTIVE' ? mapButtonsToBackend(buttons) : [];

  return {
    payload: {
      name,
      category,
      templateType: resolvedTemplateType,
      language,
      bodyText,
      headerText: mediaSample === 'None' ? headerText || undefined : undefined,
      footerText:
        resolvedTemplateType === 'INTERACTIVE' ? footerText || undefined : undefined,
      variables,
      buttons: backendButtons,
      uploadedFile: undefined,
    },
    missingExamples,
    backendButtons,
    resolvedTemplateType,
  };
};
