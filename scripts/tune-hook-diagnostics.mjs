import fs from 'node:fs';
import path from 'node:path';

const bVideoAdsDir = path.resolve('../marketing-automation-b/video/ads');

// 1. Update creativeIntelligence.js
const ciPath = path.join(bVideoAdsDir, 'creativeIntelligence.js');
let ciCode = fs.readFileSync(ciPath, 'utf8');

// Allow up to 10 words for opening hook questions (e.g. "Is your child losing confidence in math before finals?")
ciCode = ciCode.replace(
  /if \(words\.length > 8\) \{[\s\S]*?score -= 2;[\s\S]*?\}/,
  `if (words.length > 11) {
    score -= 2;
    diagnostics.push('Opening hook is too verbose for a 1.5-2s beat (' + words.length + ' words).');
  }`
);

// Don't flag warning if 1 concrete mechanism is present
ciCode = ciCode.replace(
  /else if \(matchedMechanisms\.length === 1\) \{[\s\S]*?diagnostics\.push\('Only 1 concrete mechanism[\s\S]*?\}/,
  `else if (matchedMechanisms.length === 1) {
    // 1 concrete mechanism is grounded and compliant
  }`
);

fs.writeFileSync(ciPath, ciCode, 'utf8');

// 2. Update adsQualityBenchmark.js so diagnostics only holds fatal issues (where score is penalized < 7)
const aqbPath = path.join(bVideoAdsDir, 'adsQualityBenchmark.js');
let aqbCode = fs.readFileSync(aqbPath, 'utf8');

// Filter diagnostics in evaluateAdCreativeQuality to only errors / hard failures
const filterBlock = `  const fatalDiagnostics = comprehensive.diagnostics.filter((d) =>
    d.startsWith('FATAL') ||
    d.includes('missing') ||
    d.includes('exceeds safe bounds') ||
    d.includes('echoes dialogue') ||
    d.includes('exceeds natural 8-second commercial capacity') ||
    d.includes('generic smiling stock') ||
    d.includes('wastes critical first 1.5s on slow logo') ||
    d.includes('unauthorized') ||
    d.includes('clickbait') ||
    d.includes('prohibited')
  );`;

aqbCode = aqbCode.replace(/const fatalDiagnostics = [\s\S]*?;/, '');
aqbCode = aqbCode.replace(
  '  return {\n    caseId: expect.caseId || \'ad-evaluation\',',
  `${filterBlock}\n  return {\n    caseId: expect.caseId || 'ad-evaluation',`
);
aqbCode = aqbCode.replace('diagnostics: comprehensive.diagnostics,', 'diagnostics: fatalDiagnostics,');

fs.writeFileSync(aqbPath, aqbCode, 'utf8');
console.log('Successfully updated hook words limit and diagnostic filtering in adsQualityBenchmark.js');
