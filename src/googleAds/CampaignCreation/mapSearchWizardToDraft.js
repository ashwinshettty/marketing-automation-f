/** India geo target constant id (Google Ads). */
const INDIA_GEO_ID = '2356';

function ensureAbsoluteUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function mapEuPoliticalAds(value) {
  if (value === 'CONTAINS' || value === true) return true;
  if (value === 'DOES_NOT_CONTAIN' || value === false) return false;
  return null;
}

function mapLocations(form) {
  const mode = form.locationMode || 'ALL_COUNTRIES';
  if (mode === 'COUNTRY_IN') {
    return {
      mode: 'COUNTRY_IN',
      option: 'PRESENCE_OR_INTEREST',
      items: [
        {
          id: INDIA_GEO_ID,
          name: 'India',
          type: 'Country',
          action: 'include',
        },
      ],
    };
  }
  if (mode === 'ENTER_ANOTHER') {
    const name = String(form.locationOther || '').trim();
    return {
      mode: 'ENTER_ANOTHER',
      option: 'PRESENCE_OR_INTEREST',
      items: name
        ? [{ id: '', name, type: 'Unknown', action: 'include' }]
        : [],
    };
  }
  return {
    mode: 'ALL_COUNTRIES',
    option: 'PRESENCE_OR_INTEREST',
    items: [],
  };
}

function mapStartGoals(goals = []) {
  return (goals || []).map((goal) => ({
    id: goal.id,
    category: goal.category || null,
    label: goal.name || goal.label || null,
    accountDefault: Boolean(goal.accountDefault),
    standardGoalIds: goal.standardGoalIds || [],
    customGoalId: goal.customGoalId || null,
    sources: (goal.sources || []).map((source) => ({
      origin: source.origin || null,
      source: source.source || source.label || null,
      standardGoalId: source.standardGoalId || null,
      actionCount: source.actionCount ?? 0,
      valueDisplay: source.valueDisplay || '—',
      warning: Boolean(source.warning),
    })),
  }));
}

function mapConversionGoalConfig(config = {}) {
  return {
    mode: config.mode || 'ACCOUNT_DEFAULT',
    standardGoalIds: config.standardGoalIds || [],
    customGoalId: config.customGoalId || null,
  };
}

/**
 * Map Search wizard UI state → GoogleAdsCampaign draft body for POST /google-ads/campaigns.
 * Never send status / account / submission — backend owns those (GOOGLE_AD_STATUS on submit).
 */
export function mapSearchWizardToDraft(form) {
  const name = String(form.campaignName || '').trim()
    || String(form.campaignNamePlaceholder || '').trim()
    || 'Search campaign';

  const headlines = (form.headlines || [])
    .map((text) => String(text || '').trim())
    .filter(Boolean)
    .map((text) => ({ text }));

  const descriptions = (form.descriptions || [])
    .map((text) => String(text || '').trim())
    .filter(Boolean)
    .map((text) => ({ text }));

  const budgetType = form.budgetType === 'TOTAL' ? 'TOTAL' : 'DAILY';
  const amount = budgetType === 'TOTAL'
    ? Number(form.totalBudget)
    : Number(form.dailyBudget);

  return {
    campaignType: 'SEARCH',
    start: {
      objective: form.objective || 'SALES',
      name,
      goals: mapStartGoals(form.startGoals?.length ? form.startGoals : form.goals),
      results: {
        websiteVisits: false,
        phoneCalls: Boolean(form.phoneNumbers?.length),
      },
    },
    conversionGoalConfig: mapConversionGoalConfig(form.conversionGoalConfig),
    businessName: String(form.leadForm?.businessName || '').trim().slice(0, 25),
    bidding: {
      focus: form.biddingFocus || 'MAXIMIZE_CONVERSIONS',
      targetCpa: form.targetCpa ? Number(form.targetCpa) : null,
      targetRoas: form.targetRoas ? Number(form.targetRoas) : null,
    },
    settings: {
      network: {
        searchPartners: true,
        displayNetwork: true,
      },
      locations: mapLocations(form),
      languages: form.languages?.length ? form.languages : ['en'],
      euPoliticalAds: mapEuPoliticalAds(form.euPoliticalAds),
    },
    aiMax: {
      enabled: true,
      searchTermMatching: true,
      textCustomization: true,
      finalUrlExpansion: true,
    },
    keywordsAndAds: {
      finalUrl: ensureAbsoluteUrl(form.finalUrl),
      adGroupName: String(form.adGroupName || '').trim() || 'Ad group 1',
      keywords: String(form.keywords || ''),
      negativeKeywords: '',
      ad: {
        displayPath1: String(form.path1 || '').trim(),
        displayPath2: String(form.path2 || '').trim(),
        headlines,
        descriptions,
        sitelinks: [],
      },
    },
    budget: {
      type: budgetType,
      amount: Number.isFinite(amount) ? amount : null,
      startDate: budgetType === 'TOTAL' ? (form.budgetStartDate || null) : null,
      endDate: budgetType === 'TOTAL' ? (form.budgetEndDate || null) : null,
      promotionMode: Boolean(form.promotionMode),
    },
  };
}
