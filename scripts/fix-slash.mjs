import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let code = fs.readFileSync(file, 'utf8');

// Replace double-escaped regexes with single-escaped regexes
code = code.replaceAll('/\\\\b', '/\\b').replaceAll('\\\\b/', '\\b/');

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully replaced \\\\b with \\b');
