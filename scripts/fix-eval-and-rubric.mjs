import fs from 'node:fs';

const bDir = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b';

// 1. Fix let aggregateScore in independentEvaluator.js
const evalPath = `${bDir}/video/ads/independentEvaluator.js`;
let ev = fs.readFileSync(evalPath, 'utf8');

ev = ev.replace('const aggregateScore = Number((weightedSum / totalWeight).toFixed(1));', 'let aggregateScore = Number((weightedSum / totalWeight).toFixed(1));');
fs.writeFileSync(evalPath, ev, 'utf8');
console.log('✓ Fixed let aggregateScore in independentEvaluator.js');

// 2. Fix cta_visibility in visualQualityRubric.js
const vqPath = `${bDir}/video/render/visualQualityRubric.js`;
let vq = fs.readFileSync(vqPath, 'utf8');

// When textAssets has cta_card or visualAction explicitly specifies cta card:
const oldCtaVis = `  const hasCtaTypographyAsset = textAssets.some((a) => a.purpose === 'cta_card' || a.purpose === 'cta_button') || /cta card|high-contrast cta|booking card/i.test(allVisuals);
  const ctaAsset = textAssets.find((a) => a.purpose === 'cta_card');
  const ctaHold = ctaAsset ? (ctaAsset.timing?.endTimeSec - ctaAsset.timing?.startTimeSec) : (lastBeat.durationSeconds || 0);
  scores.cta_visibility = (hasCtaTypographyAsset && ctaHold >= 2.0) ? 9
    : hasCtaTypographyAsset ? 8 : ctaHold >= 2.0 ? 7 : 4;
  if (!hasCtaTypographyAsset) issues.push('No deterministic CTA typography asset defined — CTA must be rendered by the compositing engine, not by Seedance.');`;

const newCtaVis = `  const hasCtaTypographyAsset = textAssets.length > 0
    ? textAssets.some((a) => a.purpose === 'cta_card' || a.purpose === 'cta_button')
    : /cta card|high-contrast cta|booking card/i.test(allVisuals);
  const ctaAsset = textAssets.find((a) => a.purpose === 'cta_card');
  const ctaHold = ctaAsset ? (ctaAsset.timing?.endTimeSec - ctaAsset.timing?.startTimeSec) : (lastBeat.durationSeconds || 0);
  scores.cta_visibility = (hasCtaTypographyAsset && ctaHold >= 2.0) ? 9
    : hasCtaTypographyAsset ? 7 : ctaHold >= 2.0 ? 6 : 4;
  if (!hasCtaTypographyAsset) issues.push('No deterministic CTA typography asset defined — CTA must be rendered by the compositing engine, not by Seedance.');`;

if (vq.includes(oldCtaVis)) {
  vq = vq.replace(oldCtaVis, newCtaVis);
  console.log('✓ Fixed cta_visibility in visualQualityRubric.js');
}

fs.writeFileSync(vqPath, vq, 'utf8');
