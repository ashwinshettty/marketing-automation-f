import fs from 'node:fs';

const targetCI = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b/video/ads/creativeIntelligence.js';
let content = fs.readFileSync(targetCI, 'utf8');

const targetStr = "{ pattern: /\\d+%\\s*(?:success|pass|marks?|score|students?|results?)/i, label: 'Fabricated success statistic' }";
const replacementStr = "{ pattern: /\\d+%\\s*(?:of\\s+)?(?:all\\s+|our\\s+)?(?:students?|success|pass|marks?|score|results?|improvement)/i, label: 'Fabricated success statistic' }";

if (!content.includes(targetStr)) {
  console.error('Target string not found in creativeIntelligence.js!');
  process.exit(1);
}

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(targetCI, content, 'utf8');
console.log('Successfully updated Fabricated success statistic regex in creativeIntelligence.js');

const deployScript = './scripts/deploy-ads-quality-hardening-v2.mjs';
let dContent = fs.readFileSync(deployScript, 'utf8');
dContent = dContent.replace(targetStr, replacementStr);
fs.writeFileSync(deployScript, dContent, 'utf8');
console.log('Successfully updated deploy script.');
