import fs from 'node:fs';
import path from 'node:path';

const p = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let content = fs.readFileSync(p, 'utf8');

// Replace with clean regex literal
content = content.replace(
  /\/\\\\b\(memoriz\\\\w\*\|rote\|cram\\\\w\*\|forget\\\\w\*\|fade\\\\w\*\)\\\\b\/i/,
  '/\b(memoriz\w*|rote|cram\w*|forget\w*|fade\w*)\b/i'
);

fs.writeFileSync(p, content, 'utf8');
console.log('Successfully written clean regex');
