import { migrateCampaign } from './campaignEntity';

const LIST_KEY = 'marketing.campaigns.v2';
const LEGACY_KEY = 'marketing.campaigns.v1';
const WIZARD_KEY = 'marketing.campaign.wizard.v2';
const MEDIA_LIMIT = 120000;

const slimAd = (ad) => {
  if (!ad?.mediaUrl?.startsWith('data:') || ad.mediaUrl.length <= MEDIA_LIMIT) return ad;
  return { ...ad, mediaUrl: '', mediaSkipped: true };
};

const slimCampaign = (campaign) => ({
  ...campaign,
  adSets: (campaign.adSets || []).map((adSet) => ({
    ...adSet,
    ads: (adSet.ads || []).map(slimAd),
  })),
});

const readJson = (storage, key, fallback) => {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const loadCampaigns = () => {
  const current = readJson(localStorage, LIST_KEY, null);
  const source = Array.isArray(current) ? current : readJson(localStorage, LEGACY_KEY, []);
  if (!Array.isArray(source)) return [];
  return source.map(migrateCampaign).filter(Boolean);
};

export const saveCampaigns = (campaigns) => {
  localStorage.setItem(LIST_KEY, JSON.stringify(campaigns.map(slimCampaign)));
};

export const loadWizardSession = () => {
  const session = readJson(sessionStorage, WIZARD_KEY, null);
  if (!session?.campaign) return null;
  return { ...session, campaign: migrateCampaign(session.campaign) };
};

export const saveWizardSession = (session) => {
  sessionStorage.setItem(WIZARD_KEY, JSON.stringify({
    ...session,
    campaign: slimCampaign(session.campaign),
  }));
};

export const clearWizardSession = () => {
  sessionStorage.removeItem(WIZARD_KEY);
};

export const createCampaignId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `campaign-${Date.now()}`;
};
