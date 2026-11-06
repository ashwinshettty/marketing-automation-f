import fs from 'node:fs';

const evalPath = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b/video/ads/independentEvaluator.js';
let ev = fs.readFileSync(evalPath, 'utf8');

const target = `  } else if (isTechnicallyValidCreativelyWeak) {
    calibrationTier = 'TECHNICALLY_VALID_CREATIVELY_WEAK';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (isGenericAudience || boringBrochure) {
    calibrationTier = 'BORING_GENERIC';
    aggregateScore = Math.min(aggregateScore, 5.8);`;

const replacement = `  } else if (isGenericAudience || boringBrochure) {
    calibrationTier = 'BORING_GENERIC';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (isTechnicallyValidCreativelyWeak) {
    calibrationTier = 'TECHNICALLY_VALID_CREATIVELY_WEAK';
    aggregateScore = Math.min(aggregateScore, 5.8);`;

if (ev.includes(target)) {
  ev = ev.replace(target, replacement);
  fs.writeFileSync(evalPath, ev, 'utf8');
  console.log('✓ Adjusted tier evaluation order in independentEvaluator.js');
}
