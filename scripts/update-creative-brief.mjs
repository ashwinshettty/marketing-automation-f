import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('../marketing-automation-b/video/ads/creativeBrief.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `    confidence: routing?.confidence ?? null,
    inheritedFromPriorAd: Boolean(!tones.length && priorBrief?.tone?.length),
  };`;

const replacement = `    confidence: routing?.confidence ?? null,
    inheritedFromPriorAd: Boolean(!tones.length && priorBrief?.tone?.length),
    concept: concept || null,
    narrativeStructure: narrativeStructure || concept?.narrativeStructure || 'EMOTIONAL_PROGRESSION',
    singleFocusMessage: singleFocusMessage || concept?.singleFocusMessage || null,
    adaptiveConstraints: adaptiveConstraints || concept?.adaptiveConstraints || null,
    permittedDemonstrationVisuals: permittedDemonstrationVisuals || concept?.permittedDemonstrationVisuals || null,
  };`;

if (!code.includes(target)) {
  console.error('Target not found in creativeBrief.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated creativeBrief.js to include concept and adaptive constraints in the return object.');
