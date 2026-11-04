/** FE view helpers for Google Ads goals (mirrors backend labels; never stored). */

const CATEGORY_LABELS = {
  PURCHASE: 'Purchases',
  PAGE_VIEW: 'Page views',
  ADD_TO_CART: 'Add to cart',
  BEGIN_CHECKOUT: 'Begin checkout',
  SUBSCRIBE_PAID: 'Subscriptions',
  CONTACT: 'Contacts',
  GET_DIRECTIONS: 'Get directions',
  SUBMIT_LEAD_FORM: 'Submit lead forms',
  BOOK_APPOINTMENT: 'Book appointment',
  SIGNUP: 'Sign-ups',
  REQUEST_QUOTE: 'Request quote',
  PHONE_CALL_LEAD: 'Phone call leads',
  ENGAGEMENT: 'Engagements',
  STORE_VISIT: 'Store visits',
  STORE_SALE: 'Store sales',
  DOWNLOAD: 'Downloads',
  QUALIFIED_LEAD: 'Qualified leads',
  CONVERTED_LEAD: 'Converted leads',
  MESSAGE_LEAD: 'Message leads',
  YOUTUBE_FOLLOW_ON_VIEWS: 'YouTube follow-on views',
  DEFAULT: 'Other',
};

const ORIGIN_LABELS = {
  WEBSITE: 'Website',
  GOOGLE_HOSTED: 'Google hosted',
  APP: 'Mobile App',
  CALL_FROM_ADS: 'Call from Ads',
  STORE: 'Store',
  YOUTUBE_HOSTED: 'YouTube hosted',
};

/** Preferred Summary card order (Google Ads Summary). */
export const SUMMARY_CATEGORY_ORDER = [
  'PURCHASE',
  'STORE_VISIT',
  'SUBMIT_LEAD_FORM',
  'PHONE_CALL_LEAD',
  'CONTACT',
  'GET_DIRECTIONS',
  'DOWNLOAD',
  'ENGAGEMENT',
  'PAGE_VIEW',
  'ADD_TO_CART',
  'BEGIN_CHECKOUT',
  'MESSAGE_LEAD',
  'YOUTUBE_FOLLOW_ON_VIEWS',
];

const prettify = (value) => {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export function categoryLabel(category) {
  const key = String(category || '').toUpperCase();
  return CATEGORY_LABELS[key] || prettify(category) || '—';
}

export function originLabel(origin, mobileAppVendor = null) {
  const key = String(origin || '').toUpperCase();
  const vendor = String(mobileAppVendor || '').toUpperCase();
  if (key === 'APP') {
    if (vendor.includes('GOOGLE') || vendor === 'GOOGLE_APP_STORE') {
      return 'Mobile App (Google Play)';
    }
    if (vendor.includes('APPLE') || vendor === 'APPLE_APP_STORE') {
      return 'Mobile App (App Store)';
    }
    return 'Mobile App';
  }
  return ORIGIN_LABELS[key] || prettify(origin) || '—';
}

export function countingLabel(countingType) {
  const key = String(countingType || '').toUpperCase();
  if (key === 'ONE_PER_CLICK') return 'One';
  if (key === 'MANY_PER_CLICK') return 'Every';
  return prettify(countingType) || '—';
}

export function accountDefaultSummary(category, standardGoals = []) {
  const cat = String(category || '').toUpperCase();
  const matching = (standardGoals || []).filter(
    (goal) => (
      goal?.docType === 'STANDARD_GOAL'
      && !goal.deletedAt
      && String(goal.category || '').toUpperCase() === cat
      && goal.accountDefault === true
    ),
  );
  if (!matching.length) return null;
  const origins = matching.map((goal) => originLabel(goal.origin).toLowerCase());
  const unique = [...new Set(origins)];
  if (unique.length === 1) return `Account-default goal, ${unique[0]} only`;
  return `Account-default goal, ${unique.join(', ')}`;
}

export function includedInAccountGoals(action, standardGoals = []) {
  if (!action) return false;
  const category = String(action.category || '').toUpperCase();
  const origin = String(action.origin || '').toUpperCase();
  return (standardGoals || []).some(
    (goal) => (
      goal?.docType === 'STANDARD_GOAL'
      && !goal.deletedAt
      && String(goal.category || '').toUpperCase() === category
      && String(goal.origin || '').toUpperCase() === origin
      && goal.accountDefault === true
    ),
  );
}

export function primaryActionCount(actions = []) {
  return (actions || []).filter((a) => a?.action?.primaryForGoal === true).length;
}

/**
 * Value column for a set of actions (campaign create / Summary).
 * Dynamic | formatted amount | Multiple values | —
 */
export function goalValueDisplay(actions = []) {
  const list = (actions || []).filter(Boolean);
  if (!list.length) return '—';

  const settings = list.map((action) => action.action?.valueSettings || {});
  if (settings.some((vs) => vs.alwaysUseDefaultValue === false)) {
    return 'Dynamic';
  }

  const values = settings
    .map((vs) => vs.defaultValue)
    .filter((v) => v != null && Number.isFinite(Number(v)))
    .map(Number);

  if (!values.length) return '—';

  const unique = [...new Set(values.map((v) => v.toFixed(2)))];
  if (unique.length === 1) {
    const currency = settings.find((vs) => vs.defaultCurrencyCode)?.defaultCurrencyCode || '';
    const amount = Number(unique[0]);
    try {
      return new Intl.NumberFormat('en-IN', {
        style: currency ? 'currency' : 'decimal',
        currency: currency || undefined,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return currency ? `${currency} ${amount}` : String(amount);
    }
  }

  return 'Multiple values';
}

const CATEGORY_ICONS = {
  CONTACT: 'contacts',
  PAGE_VIEW: 'pageViews',
  PHONE_CALL_LEAD: 'phone',
  PURCHASE: 'purchases',
  SUBMIT_LEAD_FORM: 'forms',
  ENGAGEMENT: 'engagements',
  GET_DIRECTIONS: 'directions',
  STORE_VISIT: 'store',
  MESSAGE_LEAD: 'messages',
  DOWNLOAD: 'download',
  YOUTUBE_FOLLOW_ON_VIEWS: 'ytViews',
  ADD_TO_CART: 'purchases',
  BEGIN_CHECKOUT: 'purchases',
};

/**
 * Rows for the campaign-create Conversion Goals panel.
 * One row group per category; sources are STANDARD_GOAL origins with live actions.
 */
export function buildCampaignGoalPicker(docs = []) {
  const standards = docs.filter((d) => d.docType === 'STANDARD_GOAL' && !d.deletedAt);
  const actions = docs.filter((d) => d.docType === 'CONVERSION_ACTION' && !d.deletedAt);
  const customs = docs.filter((d) => d.docType === 'CUSTOM_GOAL' && !d.deletedAt);

  const actionsByCatOrigin = new Map();
  for (const action of actions) {
    const cat = String(action.category || '').toUpperCase();
    const origin = String(action.origin || '').toUpperCase();
    const key = `${cat}::${origin}`;
    if (!actionsByCatOrigin.has(key)) actionsByCatOrigin.set(key, []);
    actionsByCatOrigin.get(key).push(action);
  }

  const byCategory = new Map();
  for (const goal of standards) {
    const cat = String(goal.category || '').toUpperCase();
    if (!byCategory.has(cat)) {
      byCategory.set(cat, {
        category: cat,
        standards: [],
      });
    }
    byCategory.get(cat).standards.push(goal);
  }

  // Categories that only have actions (no standard goal row yet) still appear as additional.
  for (const action of actions) {
    const cat = String(action.category || '').toUpperCase();
    if (!byCategory.has(cat)) {
      byCategory.set(cat, { category: cat, standards: [] });
    }
  }

  const rows = [];
  for (const group of byCategory.values()) {
    const defaultStandards = group.standards.filter((s) => s.accountDefault === true);
    const isAccountDefault = defaultStandards.length > 0;
    const sourceStandards = isAccountDefault ? defaultStandards : group.standards;

    const sources = [];
    const standardGoalIds = [];

    const originList = sourceStandards.length
      ? sourceStandards
      : [{ origin: null, _id: null, accountDefault: false }];

    for (const std of originList) {
      const origin = String(std.origin || '').toUpperCase();
      const key = `${group.category}::${origin}`;
      const originActions = origin
        ? (actionsByCatOrigin.get(key) || [])
        : actions.filter((a) => String(a.category || '').toUpperCase() === group.category);

      if (std._id) standardGoalIds.push(String(std._id));

      if (!origin && !originActions.length) continue;

      sources.push({
        origin: origin || 'WEBSITE',
        source: originLabel(origin || 'WEBSITE'),
        standardGoalId: std._id ? String(std._id) : null,
        actions: originActions.length,
        value: goalValueDisplay(originActions),
        warning: originActions.length === 0
          || originActions.some((a) => !a.action?.includeInConversionsMetric),
      });
    }

    // If account-default but no matching actions for those origins, still show sources with 0.
    if (!sources.length && defaultStandards.length) {
      for (const std of defaultStandards) {
        standardGoalIds.push(String(std._id));
        sources.push({
          origin: String(std.origin || '').toUpperCase(),
          source: originLabel(std.origin),
          standardGoalId: String(std._id),
          actions: 0,
          value: '—',
          warning: true,
        });
      }
    }

    if (!sources.length && !standardGoalIds.length) continue;

    rows.push({
      id: group.category.toLowerCase(),
      category: group.category,
      name: categoryLabel(group.category),
      accountDefault: isAccountDefault,
      icon: CATEGORY_ICONS[group.category] || 'contacts',
      standardGoalIds: [...new Set(standardGoalIds.filter(Boolean))],
      sources,
      docType: 'STANDARD_GOAL',
    });
  }

  rows.sort((a, b) => {
    if (a.accountDefault !== b.accountDefault) return a.accountDefault ? -1 : 1;
    const ai = SUMMARY_CATEGORY_ORDER.indexOf(a.category);
    const bi = SUMMARY_CATEGORY_ORDER.indexOf(b.category);
    const ao = ai === -1 ? 999 : ai;
    const bo = bi === -1 ? 999 : bi;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });

  const accountDefaultRows = rows.filter((r) => r.accountDefault);
  const additionalRows = rows.filter((r) => !r.accountDefault);
  const accountDefaultStandardIds = accountDefaultRows.flatMap((r) => r.standardGoalIds);

  const customRows = customs.map((goal) => ({
    id: `custom:${goal._id || goal.remote?.id}`,
    category: null,
    name: goal.name || 'Custom goal',
    accountDefault: false,
    icon: 'engagements',
    standardGoalIds: [],
    customGoalId: String(goal._id),
    sources: [{
      origin: 'CUSTOM',
      source: 'Custom',
      standardGoalId: null,
      actions: (goal.actionRemoteIds || []).length,
      value: '—',
      warning: false,
    }],
    docType: 'CUSTOM_GOAL',
  }));

  return {
    accountDefaultRows,
    additionalRows: [...additionalRows, ...customRows],
    accountDefaultStandardIds,
    allRows: rows,
  };
}

/**
 * Build conversionGoalConfig for the campaign draft from selected picker rows.
 * ACCOUNT_DEFAULT when selection is exactly the account-default standard goals.
 * CAMPAIGN_CUSTOM when a custom goal is selected (alone).
 * Otherwise CAMPAIGN_STANDARD with the selected STANDARD_GOAL ids.
 */
export function buildConversionGoalConfig(selectedGoals = [], accountDefaultStandardIds = []) {
  const selected = selectedGoals || [];
  const custom = selected.find((g) => g.docType === 'CUSTOM_GOAL' || g.customGoalId);
  if (custom) {
    return {
      mode: 'CAMPAIGN_CUSTOM',
      standardGoalIds: [],
      customGoalId: custom.customGoalId || custom.id?.replace(/^custom:/, '') || null,
    };
  }

  const selectedIds = [...new Set(
    selected.flatMap((g) => g.standardGoalIds || []).map(String).filter(Boolean),
  )];
  const defaultIds = [...new Set((accountDefaultStandardIds || []).map(String))];
  const selectedSet = new Set(selectedIds);
  const isExactAccountDefault = (
    selectedIds.length > 0
    && selectedIds.length === defaultIds.length
    && defaultIds.every((id) => selectedSet.has(id))
    && selected.every((g) => g.accountDefault)
  );

  if (isExactAccountDefault) {
    return {
      mode: 'ACCOUNT_DEFAULT',
      standardGoalIds: [],
      customGoalId: null,
    };
  }

  return {
    mode: 'CAMPAIGN_STANDARD',
    standardGoalIds: selectedIds,
    customGoalId: null,
  };
}

/**
 * Summary cards: one per category that is account-default and/or has live actions.
 */
export function buildSummaryGoalCards(docs = []) {
  const standards = docs.filter((d) => d.docType === 'STANDARD_GOAL' && !d.deletedAt);
  const actions = docs.filter((d) => d.docType === 'CONVERSION_ACTION' && !d.deletedAt);
  const customs = docs.filter((d) => d.docType === 'CUSTOM_GOAL' && !d.deletedAt);

  const byCategory = new Map();
  for (const goal of standards) {
    const cat = String(goal.category || 'DEFAULT').toUpperCase();
    if (!byCategory.has(cat)) {
      byCategory.set(cat, { category: cat, standards: [], actions: [] });
    }
    byCategory.get(cat).standards.push(goal);
  }
  for (const action of actions) {
    const cat = String(action.category || 'DEFAULT').toUpperCase();
    if (!byCategory.has(cat)) {
      byCategory.set(cat, { category: cat, standards: [], actions: [] });
    }
    byCategory.get(cat).actions.push(action);
  }

  const cards = [...byCategory.values()]
    .map((group) => {
      const defaultOrigins = group.standards.filter((s) => s.accountDefault === true);
      const isAccountDefault = defaultOrigins.length > 0;
      const primaryCount = primaryActionCount(group.actions);
      const summary = accountDefaultSummary(group.category, standards);
      let status = 'Needs attention';
      let statusTone = 'warn';
      if (primaryCount === 0) {
        status = 'Misconfigured';
        statusTone = 'error';
      } else if (group.actions.some((a) => a.action?.includeInConversionsMetric === false)) {
        status = 'Needs attention';
        statusTone = 'warn';
      } else {
        status = 'Active';
        statusTone = 'ok';
      }
      return {
        category: group.category,
        label: categoryLabel(group.category),
        isAccountDefault,
        subtitle: summary || (isAccountDefault ? 'Account-default goal' : 'Goal'),
        primaryCount,
        actionCount: group.actions.length,
        actions: group.actions,
        standards: group.standards,
        status,
        statusTone,
      };
    })
    .filter((card) => card.isAccountDefault || card.actionCount > 0);

  cards.sort((a, b) => {
    const ai = SUMMARY_CATEGORY_ORDER.indexOf(a.category);
    const bi = SUMMARY_CATEGORY_ORDER.indexOf(b.category);
    const ao = ai === -1 ? 999 : ai;
    const bo = bi === -1 ? 999 : bi;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label);
  });

  return { cards, customs, standards, actions };
}

/** All conversions table groups. */
export function groupActionsByCategory(docs = []) {
  const standards = docs.filter((d) => d.docType === 'STANDARD_GOAL' && !d.deletedAt);
  const actions = docs.filter((d) => d.docType === 'CONVERSION_ACTION');
  const map = new Map();

  for (const action of actions) {
    if (action.deletedAt && String(action.remote?.status || '').toUpperCase() !== 'REMOVED') {
      continue;
    }
    const category = String(action.category || 'DEFAULT').toUpperCase();
    if (!map.has(category)) {
      map.set(category, {
        category,
        label: categoryLabel(category),
        subtitle: accountDefaultSummary(category, standards) || 'Goal',
        actions: [],
      });
    }
    map.get(category).actions.push(action);
  }

  const groups = [...map.values()];
  groups.sort((a, b) => {
    const ai = SUMMARY_CATEGORY_ORDER.indexOf(a.category);
    const bi = SUMMARY_CATEGORY_ORDER.indexOf(b.category);
    const ao = ai === -1 ? 999 : ai;
    const bo = bi === -1 ? 999 : bi;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label);
  });
  return groups;
}
