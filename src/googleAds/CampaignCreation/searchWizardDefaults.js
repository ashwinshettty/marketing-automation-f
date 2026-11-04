/** Initial local state for the Search create wizard (UI-only phase). */

export const SEARCH_WIZARD_STEPS = [
  {
    id: 'settings',
    label: 'Campaign settings',
    sections: ['Name', 'Locations', 'Languages', 'EU political ads'],
  },
  {
    id: 'ads',
    label: 'Keywords and ads',
    sections: ['Keywords', 'Ads'],
  },
  {
    id: 'bidding',
    label: 'Budget',
    sections: ['Budget', 'Promotion mode'],
  },
  {
    id: 'review',
    label: 'Review',
    sections: [],
  },
];

export const LEAD_CONTACT_FIELDS = [
  { id: 'name', label: 'Name', prefilled: true },
  { id: 'email', label: 'Email', prefilled: true },
  { id: 'phone', label: 'Phone number', prefilled: true },
  { id: 'country', label: 'Country', prefilled: true },
  { id: 'city', label: 'City', prefilled: true },
  { id: 'zip', label: 'Zip/Postal code', prefilled: true },
  { id: 'state', label: 'State/Province', prefilled: true },
  { id: 'street', label: 'Street address', prefilled: true },
];

export const LEAD_WORK_FIELDS = [
  { id: 'company', label: 'Company name' },
  { id: 'workEmail', label: 'Work email' },
  { id: 'workPhone', label: 'Work phone number' },
  { id: 'jobTitle', label: 'Job title' },
];

export function createInitialSearchWizardState(navState = {}) {
  const unguided = navState.unguided || null;
  const nameFromNav =
    unguided?.name
    || navState.local?.name
    || navState.app?.name
    || '';
  const namePlaceholderFromNav =
    unguided?.namePlaceholder
    || navState.local?.namePlaceholder
    || navState.app?.namePlaceholder
    || '';

  const objectiveLabel = navState.objective || 'SALES';
  const seedUrl = unguided?.finalUrl || navState.local?.finalUrl || '';
  const campaignNamePlaceholder =
    namePlaceholderFromNav
    || `Search-${objectiveLabel}-${new Date().toISOString().slice(0, 10)}`;

  return {
    objective: objectiveLabel,
    goals: navState.goals || [],
    startGoals: navState.startGoals || [],
    conversionGoalConfig: navState.conversionGoalConfig || {
      mode: 'ACCOUNT_DEFAULT',
      standardGoalIds: [],
      customGoalId: null,
    },
    campaignName: nameFromNav || '',
    campaignNamePlaceholder,
    locationMode: 'ALL_COUNTRIES',
    locationOther: '',
    languages: ['en'],
    euPoliticalAds: null,
    adGroupName: 'Ad group 1',

    // Keywords
    keywords: '',
    keywordSeedUrl: seedUrl,
    keywordServices: [],
    keywordServiceDraft: '',
    suggestedKeywords: [],

    // Ad
    finalUrl: seedUrl,
    headlines: ['', '', ''],
    descriptions: ['', ''],
    path1: '',
    path2: '',
    phoneNumbers: [],
    phoneDraft: '',

    // Lead form
    leadFormEnabled: false,
    leadForm: {
      headline: '',
      businessName: '',
      description: '',
      nameFormat: 'FIRST_LAST',
      contactFields: ['name', 'email'],
      workFields: [],
      additionalAge: false,
      customQuestions: [],
      privacyPolicyUrl: '',
      thankYouHeadline: 'Thank you',
      thankYouDescription: "We'll contact you soon",
      thankYouCta: 'Visit site',
      thankYouCtaUrl: '',
      adCta: 'Learn more',
      adCtaDescription: '',
    },

    biddingFocus: 'MAXIMIZE_CONVERSIONS',
    targetCpa: '',
    targetRoas: '',
    budgetType: 'DAILY',
    budgetMode: 'CUSTOM', // PRESET_HIGH | PRESET_REC | PRESET_LOW | CUSTOM
    dailyBudget: '1548.71',
    totalBudget: '',
    budgetStartDate: '',
    budgetEndDate: '',
    promotionMode: false,
  };
}

export const BUDGET_PRESETS = [
  { id: 'PRESET_HIGH', amount: '1857.47' },
  { id: 'PRESET_REC', amount: '1547.89', recommended: true },
  { id: 'PRESET_LOW', amount: '1238.31' },
];

export function parseDisplayHost(finalUrl) {
  try {
    const withProtocol = /^https?:\/\//i.test(finalUrl) ? finalUrl : `https://${finalUrl}`;
    const host = new URL(withProtocol).hostname.replace(/^www\./, '');
    return host ? `www.${host}` : 'www.example.com';
  } catch {
    return 'www.example.com';
  }
}
