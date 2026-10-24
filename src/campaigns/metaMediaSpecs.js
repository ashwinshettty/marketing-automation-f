/**
 * Meta Ads Manager official aspect ratios & placement guidance.
 * Source: https://www.facebook.com/business/help/682655495435254
 * Video crop groups: https://www.facebook.com/business/help/268849943715692
 */

export const META_ASPECT_RATIOS = {
  '1.91:1': {
    id: '1.91:1',
    label: '1.91:1',
    ratio: 1.91 / 1,
    recommendedPx: { w: 1200, h: 628 },
    orientation: 'landscape',
  },
  '16:9': {
    id: '16:9',
    label: '16:9',
    ratio: 16 / 9,
    recommendedPx: { w: 1920, h: 1080 },
    orientation: 'landscape',
  },
  '1:1': {
    id: '1:1',
    label: '1:1',
    ratio: 1,
    recommendedPx: { w: 1080, h: 1080 },
    orientation: 'square',
  },
  '4:5': {
    id: '4:5',
    label: '4:5',
    ratio: 4 / 5,
    recommendedPx: { w: 1080, h: 1350 },
    orientation: 'portrait',
  },
  '2:3': {
    id: '2:3',
    label: '2:3',
    ratio: 2 / 3,
    recommendedPx: { w: 1080, h: 1620 },
    orientation: 'portrait',
  },
  '9:16': {
    id: '9:16',
    label: '9:16',
    ratio: 9 / 16,
    recommendedPx: { w: 1080, h: 1920 },
    orientation: 'vertical',
  },
};

/** Crop groups shown in Meta Ads Manager after Add video / Add image */
export const META_CROP_GROUPS = [
  {
    id: 'feeds',
    label: 'Feeds',
    shortLabel: 'Feeds',
    description: 'Facebook Feed, Instagram Feed, profile feed, Marketplace',
    /** Meta recommends 4:5 for Feed images & videos */
    defaultAspect: '4:5',
    aspects: ['4:5', '1:1', '1.91:1'],
    placements: [
      { name: 'Facebook Feed', recommended: '4:5', supported: ['1.91:1', '16:9', '1:1', '4:5'] },
      { name: 'Instagram Feed', recommended: '4:5', supported: ['1.91:1', '16:9', '1:1', '4:5', '2:3', '9:16'] },
      { name: 'Facebook Marketplace', recommended: '1:1', supported: ['16:9', '1:1', '9:16'] },
    ],
  },
  {
    id: 'stories_reels',
    label: 'Stories, Status and Reels',
    shortLabel: 'Stories & Reels',
    description: 'Instagram/Facebook Stories & Reels, Messenger Stories, WhatsApp Status',
    /** Meta recommends 9:16 */
    defaultAspect: '9:16',
    aspects: ['9:16', '1:1', '4:5'],
    placements: [
      { name: 'Instagram Stories', recommended: '9:16', supported: ['1.91:1', '16:9', '1:1', '4:5', '9:16'] },
      { name: 'Facebook Stories', recommended: '9:16', supported: ['1.91:1', '16:9', '1:1', '4:5', '9:16'] },
      { name: 'Instagram Reels', recommended: '9:16', supported: ['1.91:1', '16:9', '1:1', '4:5', '2:3', '9:16'] },
      { name: 'Facebook Reels', recommended: '9:16', supported: ['1.91:1', '16:9', '1:1', '4:5', '2:3', '9:16'] },
      { name: 'WhatsApp Status', recommended: '9:16', supported: ['1.91:1', '16:9', '1:1', '4:5', '9:16'] },
    ],
  },
  {
    id: 'horizontal',
    label: 'Horizontal',
    shortLabel: 'Horizontal',
    description: 'Search results, in-stream reels, right column',
    /** Meta video crop: Horizontal (16:9) */
    defaultAspect: '16:9',
    aspects: ['16:9', '1.91:1', '1:1'],
    placements: [
      { name: 'Facebook right column', recommended: '1.91:1', supported: ['1.91:1', '1:1'] },
      { name: 'Facebook search results', recommended: '1.91:1', supported: ['1.91:1', '1:1', '9:16'] },
      { name: 'Facebook in-stream reels', recommended: '1:1', supported: ['1.91:1', '1:1', '4:5'] },
    ],
  },
];

export const PREVIEW_PLACEMENTS = [
  { id: 'feed', label: 'Feed', aspect: '4:5', groupId: 'feeds' },
  { id: 'square', label: 'Square', aspect: '1:1', groupId: 'feeds' },
  { id: 'stories', label: 'Stories', aspect: '9:16', groupId: 'stories_reels' },
  { id: 'reels', label: 'Reels', aspect: '9:16', groupId: 'stories_reels' },
  { id: 'landscape', label: 'Right column', aspect: '1.91:1', groupId: 'horizontal' },
];

export function createDefaultMediaCrops() {
  const crops = {};
  META_CROP_GROUPS.forEach((g) => {
    crops[g.id] = {
      enabled: true,
      aspect: g.defaultAspect,
      /** pan: 0–100 (% of overflow), zoom: 1–2 */
      panX: 50,
      panY: 50,
      zoom: 1,
    };
  });
  return crops;
}

export function formatAspectHint() {
  return 'Meta placements: Feed 4:5 (recommended), Square 1:1, Stories/Reels 9:16, Right column/Search 1.91:1 or 16:9.';
}
