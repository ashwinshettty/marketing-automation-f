import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `  // 5. Product Demonstration / Conceptual Clarity
  if (/\\b(demo|interactive|live tutor|easier|makes?|demonstrat|visual|whiteboard|understand)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.product_demonstration,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
    };
  }`;

const replacement = `  // 5. Product Demonstration / Conceptual Clarity
  if (/\\b(demo|interactive|live tutor|demonstrat|whiteboard|makes?\\s+.*easier|easier\\s+to\\s+understand|showing\\s+how)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.product_demonstration,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
    };
  }`;

if (!code.includes(target)) {
  console.error('Target not found in creativeIntelligence.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated selectCreativeAngle regex in creativeIntelligence.js');
