import fs from 'node:fs';
import path from 'node:path';

const bVideoAdsDir = path.resolve('../marketing-automation-b/video/ads');
const ciPath = path.join(bVideoAdsDir, 'creativeIntelligence.js');
let ciCode = fs.readFileSync(ciPath, 'utf8');

ciCode = ciCode.replace(
  /\/\\b\(memoriz\|rote\|cram\|forget\|fades\?\)\\b\/i\.test\(text\)/,
  '/\\\\b(memoriz\\\\w*|rote|cram\\\\w*|forget\\\\w*|fade\\\\w*)\\\\b/i.test(text)'
);

fs.writeFileSync(ciPath, ciCode, 'utf8');
console.log('Fixed memoriz regex in creativeIntelligence.js');
