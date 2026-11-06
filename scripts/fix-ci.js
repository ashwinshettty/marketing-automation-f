import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let code = fs.readFileSync(file, 'utf8');

const targetStr = `if (/ (memorizw*|rote|cramw*|forgetw*|fadew*) /i.test(text)) {
    return CREATIVE_ANGLES.misconception_correction;
  }`;

const replacementStr = `if (/\\b(memoriz|rote|cram|forget|fade)/i.test(text)) {
    return CREATIVE_ANGLES.misconception_correction;
  }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated regex in creativeIntelligence.js');
