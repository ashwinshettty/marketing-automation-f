// His screen is CampaignsPage in this same file.
// It shows on /campaign unless VITE_SHOW_CURRENT_CAMPAIGN_UI is the string "true".
// Set that to true in .env.local to show CurrentCampaignPage instead.
export const SHOW_CURRENT_CAMPAIGN_UI = import.meta.env.VITE_SHOW_CURRENT_CAMPAIGN_UI === 'false';
