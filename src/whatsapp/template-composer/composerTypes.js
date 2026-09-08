export const CATEGORIES = [
  { id: 'UTILITY', label: 'Utility' },
  { id: 'MARKETING', label: 'Marketing' },
];

export const SUBTYPES = {
  MARKETING: [
    {
      id: 'INTERACTIVE',
      label: 'Interactive',
      description: 'Send messages with media and customised buttons to engage your customers.',
    },
    {
      id: 'FLOW',
      label: 'Flow',
      description: 'Send a form to capture customer interests, appointment requests or run surveys.',
    },
  ],
  UTILITY: [
    {
      id: 'INTERACTIVE',
      label: 'Interactive',
      description: 'Send messages about an existing order or account.',
    },
    {
      id: 'TEXT',
      label: 'Text',
      description: 'Send simple text messages for notifications and updates.',
    },
    {
      id: 'FLOW',
      label: 'Flow',
      description: 'Send a form to collect feedback, send reminders or manage orders.',
    },
  ],
};

export const getSubtypesForCategory = (category) =>
  SUBTYPES[category] || SUBTYPES.UTILITY;

export const isSubtypeAllowed = (category, subtype) =>
  getSubtypesForCategory(category).some((item) => item.id === subtype);

export const defaultSubtypeForCategory = (category) =>
  category === 'MARKETING' ? 'INTERACTIVE' : 'TEXT';

export const BUTTON_TYPES = [
  { id: 'Custom', label: 'Custom', icon: 'arrow' },
  { id: 'VisitWebsite', label: 'Visit website', icon: 'link' },
  { id: 'CallWhatsApp', label: 'Call on WhatsApp', icon: 'whatsapp' },
  { id: 'CallPhone', label: 'Call Phone Number', icon: 'phone' },
];

export const COUNTRY_OPTIONS = [
  { value: 'US +1', label: 'US +1' },
  { value: 'IN +91', label: 'IN +91' },
  { value: 'UK +44', label: 'UK +44' },
];

export const HEADER_MAX = 60;
export const BODY_MAX = 1024;
export const FOOTER_MAX = 60;
export const BUTTON_TEXT_MAX = 25;
export const NAME_MAX = 512;
