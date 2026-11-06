import fs from 'node:fs';
import path from 'node:path';

const benchmarkFile = path.resolve('../marketing-automation-b/video/ads/adsQualityBenchmark.js');

const benchmarkEngineCode = `import { computeScriptHash, assertScriptIntegrity } from '../script/canonicalScript.js';
import { validateTextAssetSafeAreas } from '../render/deterministicText.js';

export const evaluateAdCreativeQuality = ({ plan, canonicalScript, candidatePrompt, expect = {} }) => {
  const dialogue = plan?.ad?.dialogue || canonicalScript?.dialogue || '';
  const hook = plan?.ad?.hook || '';
  const cta = plan?.ad?.cta || '';
  const visualAction = plan?.ad?.visualAction || '';
  const scenes = plan?.sceneSequence || [];
  const words = dialogue.trim().split(/\\s+/).filter(Boolean);
  const wordCount = words.length;

  const results = {
    caseId: expect.caseId || 'ad-evaluation',
    dimensions: {},
    passed: true,
    aggregateScore: 10,
    diagnostics: [],
  };

  // 1. Script Integrity & Canonical Immutability (0-10)
  let scriptIntegrityScore = 10;
  if (!canonicalScript) {
    scriptIntegrityScore = 0;
    results.diagnostics.push('Canonical script missing.');
  } else {
    try {
      assertScriptIntegrity(canonicalScript);
      const computedHash = computeScriptHash({
        workflowType: canonicalScript.workflowType,
        targetAudience: canonicalScript.targetAudience,
        durationSeconds: canonicalScript.durationSeconds,
        dialogue: canonicalScript.dialogue,
        visualBeats: canonicalScript.visualBeats,
      });
      if (computedHash !== canonicalScript.scriptHash) {
        scriptIntegrityScore = 0;
        results.diagnostics.push('Canonical script hash mismatch.');
      }
    } catch (err) {
      scriptIntegrityScore = 0;
      results.diagnostics.push(\`Script integrity failed: \${err.message}\`);
    }
  }
  results.dimensions.scriptIntegrity = {
    score: scriptIntegrityScore,
    weight: 1.0,
    notes: scriptIntegrityScore === 10 ? 'Script verified immutable with valid SHA-256.' : 'Integrity error.',
  };

  // 2. Word Budget & Speech Feasibility (15-20 words for 8s; max 22)
  let speechRateScore = 10;
  const targetMin = expect.minWordCount || 14;
  const targetMax = expect.maxWordCount || 20;
  if (wordCount < 10) {
    speechRateScore = 4;
    results.diagnostics.push(\`Dialogue too short: \${wordCount} words.\`);
  } else if (wordCount > 23) {
    speechRateScore = 4;
    results.diagnostics.push(\`Dialogue exceeds duration limit: \${wordCount} words (max ~20 for 8s).\`);
  } else if (wordCount < targetMin || wordCount > targetMax) {
    speechRateScore = 8;
  }
  results.dimensions.speechRateFeasibility = {
    score: speechRateScore,
    wordCount,
    speechRateWordsPerSec: Number((wordCount / 8).toFixed(2)),
    notes: \`\${wordCount} spoken words (~ \${(wordCount / 8).toFixed(1)} words/sec).\`,
  };

  // 3. First-Second Hook & Tension (0-10)
  let hookScore = 10;
  const lowerHook = hook.toLowerCase();
  const lowerVisual = visualAction.toLowerCase();
  const genericSmiles = /smiling directly|happy student smiling|welcoming wave|smiling warmly/i.test(lowerVisual);
  const slowLogos = /logo animation|intro logo|fade from black to logo/i.test(lowerVisual);
  if (genericSmiles || slowLogos) {
    hookScore = Math.min(hookScore, 5);
    results.diagnostics.push('Opening hook contains generic stock smiling or logo intro.');
  }
  if (expect.mustContainPainPoint?.length) {
    const matchedPain = expect.mustContainPainPoint.some((p) =>
      dialogue.toLowerCase().includes(p) || lowerHook.includes(p) || lowerVisual.includes(p)
    );
    if (!matchedPain) {
      hookScore = Math.min(hookScore, 6);
      results.diagnostics.push(\`Opening lacks specific pain point from [\${expect.mustContainPainPoint.join(', ')}].\`);
    }
  }
  results.dimensions.hookStrength = {
    score: hookScore,
    notes: hookScore >= 9 ? 'Strong, immediate friction/tension in opening beat.' : 'Hook needs sharper friction.',
  };

  // 4. Value Proposition & Solution Clarity (0-10)
  let valuePropScore = 10;
  if (expect.mustContainValueProp?.length) {
    const matched = expect.mustContainValueProp.some((vp) =>
      dialogue.toLowerCase().includes(vp) || lowerVisual.includes(vp)
    );
    if (!matched) {
      valuePropScore = 5;
      results.diagnostics.push('Value proposition not clearly communicated.');
    }
  }
  results.dimensions.valuePropositionClarity = {
    score: valuePropScore,
    notes: valuePropScore === 10 ? 'Inkstall 1-on-1 live mentoring mechanism clearly stated.' : 'Vague value prop.',
  };

  // 5. Decisive Call To Action (0-10)
  let ctaScore = 10;
  const lowerCta = cta.toLowerCase();
  const hasActionVerb = /\\b(book|try|get|claim|start|join|schedule)\\b/i.test(lowerCta);
  const mentionsDemoOrFree = /\\b(free|demo|session|trial)\\b/i.test(lowerCta);
  if (!hasActionVerb) {
    ctaScore = 4;
    results.diagnostics.push('CTA lacks a clear action verb.');
  } else if (!mentionsDemoOrFree) {
    ctaScore = 7;
  }
  results.dimensions.ctaClarity = {
    score: ctaScore,
    ctaText: cta,
    notes: ctaScore === 10 ? 'Decisive, high-contrast CTA holding at end.' : 'CTA could be more direct.',
  };

  // 6. Seedance Clean Blank Surfaces & Negative Typography (0-10)
  let cleanSurfacesScore = 10;
  const promptText = String(candidatePrompt?.text || '');
  const hasNegativeConstraints = promptText.includes('Mandatory Negative Typography Constraints')
    && promptText.includes('Do not render readable text')
    && promptText.includes('clean, blank');
  if (!hasNegativeConstraints) {
    cleanSurfacesScore = 0;
    results.diagnostics.push('Seedance prompt compiler missing mandatory negative typography constraints.');
  }
  const echoesDialogue = scenes.some((s) => s.visualAction && s.visualAction.includes(s.dialogue));
  if (echoesDialogue) {
    cleanSurfacesScore = Math.min(cleanSurfacesScore, 4);
    results.diagnostics.push('Visual action echoes dialogue rather than staging clean camera movement.');
  }
  results.dimensions.cleanSurfaces = {
    score: cleanSurfacesScore,
    notes: cleanSurfacesScore === 10 ? 'Seedance strictly constrained to clean blank surfaces.' : 'Typography risk in video model.',
  };

  // 7. Deterministic Typography & Safe Area (0-10)
  let typographyScore = 10;
  if (canonicalScript?.textAssets?.length) {
    const safeCheck = validateTextAssetSafeAreas(canonicalScript.textAssets, 720, 1280);
    if (!safeCheck.valid) {
      typographyScore = 5;
      results.diagnostics.push(\`Text assets exceed safe bounds: \${safeCheck.violations.join(', ')}\`);
    }
  }
  results.dimensions.deterministicTypography = {
    score: typographyScore,
    subtitlesGenerated: Boolean(canonicalScript?.subtitleSegments?.length),
    notes: typographyScore === 10 ? 'All text overlays validated within 9:16 safe-area margins.' : 'Typography bounds issue.',
  };

  const dimValues = Object.values(results.dimensions).map((d) => d.score);
  results.aggregateScore = Number((dimValues.reduce((a, b) => a + b, 0) / dimValues.length).toFixed(1));
  results.passed = results.aggregateScore >= 8.5 && results.diagnostics.length === 0;

  return results;
};
`;

fs.writeFileSync(benchmarkFile, benchmarkEngineCode, 'utf8');
console.log('Successfully updated adsQualityBenchmark.js with validateTextAssetSafeAreas');
