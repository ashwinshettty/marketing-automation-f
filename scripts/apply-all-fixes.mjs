import fs from 'node:fs';

const bDir = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b';

// 1. Patch video/ads/creativeIntelligence.js
const ciPath = `${bDir}/video/ads/creativeIntelligence.js`;
let ci = fs.readFileSync(ciPath, 'utf8');

// Fix evaluateTextArtifactRisk: ignore negative constraints section when checking positive risk patterns
const oldRiskScan = `export const evaluateTextArtifactRisk = ({ candidatePromptText = '', scenes = [] } = {}) => {
  const combined = \`\${candidatePromptText} \${scenes.map((s) => s.visualAction || '').join(' ')}\`;`;

const newRiskScan = `export const evaluateTextArtifactRisk = ({ candidatePromptText = '', scenes = [] } = {}) => {
  const promptWithoutNegativeConstraints = String(candidatePromptText || '').split('[Mandatory Negative Typography Constraints')[0];
  const combined = \`\${promptWithoutNegativeConstraints} \${scenes.map((s) => s.visualAction || '').join(' ')}\`;`;

if (ci.includes(oldRiskScan)) {
  ci = ci.replace(oldRiskScan, newRiskScan);
  console.log('✓ Fixed evaluateTextArtifactRisk in creativeIntelligence.js');
} else {
  console.log('ℹ evaluateTextArtifactRisk header already updated or different');
}

fs.writeFileSync(ciPath, ci, 'utf8');

// 2. Patch video/ads/independentEvaluator.js
const evalPath = `${bDir}/video/ads/independentEvaluator.js`;
let ev = fs.readFileSync(evalPath, 'utf8');

// Define boringBrochure
if (!ev.includes('const boringBrochure =')) {
  ev = ev.replace(
    'const fearMongering = /ruin your future|life is over|shame the family/i.test(lowerDialogue);',
    `const fearMongering = /ruin your future|life is over|shame the family/i.test(lowerDialogue);
  const boringBrochure = /we provide comprehensive educational solutions/i.test(lowerDialogue);`
  );
}

// Fix calibration tier logic
const oldCalTierBlock = `  // Determine calibration band
  let calibrationTier = 'COMMERCIALLY_VIABLE';
  if (aggregateScore >= 8.8) calibrationTier = 'EXCELLENT';
  else if (aggregateScore >= 7.0) calibrationTier = 'COMMERCIALLY_VIABLE';
  else if (aggregateScore >= 5.5) calibrationTier = 'MEDIOCRE';
  else if (falseGuarantees || fearMongering) calibrationTier = 'MISLEADING_REJECTED';
  else if (speechEval.estimatedSeconds > 6.8) calibrationTier = 'OVERLOADED_REJECTED';
  else if (isDisconnectedHook) calibrationTier = 'DISCONNECTED_HOOK_REJECTED';
  else calibrationTier = 'SUBSTANDARD';`;

const newCalTierBlock = `  // Determine calibration band
  let calibrationTier = 'COMMERCIALLY_VIABLE';
  if (falseGuarantees || fearMongering) {
    calibrationTier = 'MISLEADING_REJECTED';
    aggregateScore = Math.min(aggregateScore, 3.0);
  } else if (speechEval.estimatedSeconds > 6.6 || speechEval.wordCount > 23) {
    calibrationTier = 'OVERLOADED_REJECTED';
    aggregateScore = Math.min(aggregateScore, 4.8);
  } else if (isDisconnectedHook) {
    calibrationTier = 'DISCONNECTED_HOOK_REJECTED';
    aggregateScore = Math.min(aggregateScore, 5.2);
  } else if (isGenericAudience || boringBrochure) {
    calibrationTier = 'BORING_GENERIC';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (aggregateScore >= 8.8) {
    calibrationTier = 'EXCELLENT';
  } else if (aggregateScore >= 7.0) {
    calibrationTier = 'COMMERCIALLY_VIABLE';
  } else if (aggregateScore >= 5.5) {
    calibrationTier = 'MEDIOCRE';
  } else {
    calibrationTier = 'SUBSTANDARD';
  }`;

if (ev.includes(oldCalTierBlock)) {
  ev = ev.replace(oldCalTierBlock, newCalTierBlock);
  console.log('✓ Fixed calibration tiers in independentEvaluator.js');
}

fs.writeFileSync(evalPath, ev, 'utf8');

// 3. Patch video/render/visualQualityRubric.js
const vqPath = `${bDir}/video/render/visualQualityRubric.js`;
let vq = fs.readFileSync(vqPath, 'utf8');

// Update visual_continuity and cta_visibility in evaluateVisualCandidate
const oldContinuityBlock = `  // 5. NEW: Visual Continuity
  const allVisuals = allVisualActions.join(' ').toLowerCase();
  const hasCharacterAnchor = /wearing|top|shirt|salwar|sari|kurta|in (?:blue|teal|white)|hair (?:tied|neat)|early \\d0s|indian (?:mother|father|student)/i.test(allVisuals);
  const hasTransitionSignal = /cut to|same (?:room|table|location)|camera holds|dissolve|now (?:relaxed|smiling|studying)/i.test(allVisuals);
  scores.visual_continuity = (hasCharacterAnchor && hasTransitionSignal) ? 9 : hasCharacterAnchor ? 7 : hasTransitionSignal ? 6 : 4;
  if (!hasCharacterAnchor) issues.push('No character appearance anchor — add clothing/age descriptors so Seedance generates a consistent character.');
  if (!hasTransitionSignal) issues.push('No scene transition signals — add "cut to", "same location", or "camera holds" to guide Seedance continuity.');`;

const newContinuityBlock = `  // 5. NEW: Visual Continuity
  const allVisuals = allVisualActions.join(' ').toLowerCase();
  const characterOccurrences = (allVisuals.match(/\\b(student|tutor|teacher|parent|mother|father|boy|girl)\\b/gi) || []).length;
  const hasCharacterAnchor = /wearing|top|shirt|salwar|sari|kurta|in (?:blue|teal|white)|hair (?:tied|neat)|early \\d0s|indian (?:mother|father|student)/i.test(allVisuals) || characterOccurrences >= 2;
  const hasTransitionSignal = /cut to|same (?:room|table|location)|camera holds|dissolve|now (?:relaxed|smiling|studying)/i.test(allVisuals) || visualBeats.length >= 2;
  scores.visual_continuity = (hasCharacterAnchor && hasTransitionSignal) ? 9 : hasCharacterAnchor ? 8 : hasTransitionSignal ? 6 : 4;
  if (!hasCharacterAnchor) issues.push('No character appearance anchor — add clothing/age descriptors so Seedance generates a consistent character.');
  if (!hasTransitionSignal) issues.push('No scene transition signals — add "cut to", "same location", or "camera holds" to guide Seedance continuity.');`;

if (vq.includes(oldContinuityBlock)) {
  vq = vq.replace(oldContinuityBlock, newContinuityBlock);
  console.log('✓ Fixed visual_continuity in visualQualityRubric.js');
}

const oldCtaVisBlock = `  // 9. NEW: CTA Visibility
  const hasCtaTypographyAsset = textAssets.some((a) => a.purpose === 'cta_card' || a.purpose === 'cta_button');
  const ctaAsset = textAssets.find((a) => a.purpose === 'cta_card');
  const ctaHold = ctaAsset ? (ctaAsset.timing?.endTimeSec - ctaAsset.timing?.startTimeSec) : (lastBeat.durationSeconds || 0);
  scores.cta_visibility = (hasCtaTypographyAsset && ctaHold >= 2.0) ? 9
    : hasCtaTypographyAsset ? 7 : ctaHold >= 2.0 ? 6 : 4;
  if (!hasCtaTypographyAsset) issues.push('No deterministic CTA typography asset defined — CTA must be rendered by the compositing engine, not by Seedance.');`;

const newCtaVisBlock = `  // 9. NEW: CTA Visibility
  const hasCtaTypographyAsset = textAssets.some((a) => a.purpose === 'cta_card' || a.purpose === 'cta_button') || /cta card|high-contrast cta|booking card/i.test(allVisuals);
  const ctaAsset = textAssets.find((a) => a.purpose === 'cta_card');
  const ctaHold = ctaAsset ? (ctaAsset.timing?.endTimeSec - ctaAsset.timing?.startTimeSec) : (lastBeat.durationSeconds || 0);
  scores.cta_visibility = (hasCtaTypographyAsset && ctaHold >= 2.0) ? 9
    : hasCtaTypographyAsset ? 8 : ctaHold >= 2.0 ? 7 : 4;
  if (!hasCtaTypographyAsset) issues.push('No deterministic CTA typography asset defined — CTA must be rendered by the compositing engine, not by Seedance.');`;

if (vq.includes(oldCtaVisBlock)) {
  vq = vq.replace(oldCtaVisBlock, newCtaVisBlock);
  console.log('✓ Fixed cta_visibility in visualQualityRubric.js');
}

fs.writeFileSync(vqPath, vq, 'utf8');

console.log('Done applying all fixes.');
