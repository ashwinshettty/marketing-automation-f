import fs from 'node:fs';
import path from 'node:path';

const datasetFile = path.resolve('../marketing-automation-b/evals/creative-quality/dataset.ads-benchmark-v1.json');
const benchmarkFile = path.resolve('../marketing-automation-b/video/ads/adsQualityBenchmark.js');

const benchmarkDataset = {
  version: '1.0.0',
  benchmarkName: 'Inkstall Ads Professional Quality Benchmark',
  targetFormat: '8-second vertical commercial (9:16)',
  wordBudget: '15-20 spoken words',
  cases: [
    {
      id: 'ADS-BENCH-01-PARENTS-ACADEMIC-ANXIETY',
      topic: 'Parents concerned about falling math marks',
      targetAudience: 'parents of school students',
      prompt: 'Create a high-impact 8-second Instagram ad for Inkstall targeting parents worried about their child falling behind in school math before finals.',
      creativeBrief: {
        tone: ['persuasive'],
        platform: 'instagram',
        aspectRatio: '9:16',
        durationSeconds: 8,
        targetAudience: 'parents of school students',
        campaignObjective: 'Drive bookings for free 1-on-1 live math diagnostic session',
      },
      expect: {
        workflow: 'ads',
        audienceCategory: 'prospective_customers',
        mustContainPainPoint: ['math', 'marks', 'behind', 'struggling', 'exam'],
        mustContainValueProp: ['1-on-1', 'live', 'tutor', 'concept', 'clear', 'inkstall'],
        mustContainCta: ['book', 'free', 'demo'],
        maxWordCount: 20,
        minWordCount: 14,
      },
    },
    {
      id: 'ADS-BENCH-02-STUDENTS-DIFFICULT-SUBJECTS',
      topic: 'Students struggling with difficult chemistry concepts',
      targetAudience: '10th grade students',
      prompt: 'Create an 8-second ad for Inkstall targeting 10th-grade students confused by complex chemical equations and reactions.',
      creativeBrief: {
        tone: ['educational', 'persuasive'],
        platform: 'instagram',
        aspectRatio: '9:16',
        durationSeconds: 8,
        targetAudience: '10th grade students',
        campaignObjective: 'Demonstrate how Inkstall makes chemical reactions visual and simple',
      },
      expect: {
        workflow: 'ads',
        audienceCategory: 'learners',
        mustContainPainPoint: ['chemistry', 'reactions', 'equations', 'confused', 'difficult'],
        mustContainValueProp: ['visual', 'step-by-step', 'tutor', 'understand', 'inkstall'],
        mustContainCta: ['try', 'book', 'demo', 'free'],
        maxWordCount: 20,
        minWordCount: 14,
      },
    },
    {
      id: 'ADS-BENCH-03-EXAM-PREPARATION-STRESS',
      topic: 'High-stakes board exam preparation anxiety',
      targetAudience: 'exam candidates and parents',
      prompt: 'Create an 8-second cinematic commercial for Inkstall showing the pressure of upcoming board exams and how instant doubt-solving restores calm.',
      creativeBrief: {
        tone: ['cinematic', 'persuasive'],
        platform: 'instagram',
        aspectRatio: '9:16',
        durationSeconds: 8,
        targetAudience: 'exam candidates and parents',
        campaignObjective: 'Showcase instant doubt resolution and personalized exam guidance',
      },
      expect: {
        workflow: 'ads',
        audienceCategory: 'prospective_customers',
        mustContainPainPoint: ['exam', 'board', 'pressure', 'stress', 'doubt'],
        mustContainValueProp: ['doubt', 'guidance', 'personal', 'tutor', 'confidence'],
        mustContainCta: ['book', 'get', 'demo', 'start'],
        maxWordCount: 20,
        minWordCount: 14,
      },
    },
    {
      id: 'ADS-BENCH-04-CONCEPTUAL-UNDERSTANDING-GAP',
      topic: 'Overcoming rote memorization through visual whiteboard learning',
      targetAudience: 'school students and parents',
      prompt: 'Create a fast, punchy 8-second ad for Inkstall highlighting that memorizing formulas fails without conceptual understanding.',
      creativeBrief: {
        tone: ['fast', 'persuasive'],
        platform: 'instagram',
        aspectRatio: '9:16',
        durationSeconds: 8,
        targetAudience: 'school students and parents',
        campaignObjective: 'Promote deep conceptual understanding over rote memorization',
      },
      expect: {
        workflow: 'ads',
        audienceCategory: 'prospective_customers',
        mustContainPainPoint: ['memoriz', 'formula', 'forget', 'stuck', 'confus'],
        mustContainValueProp: ['concept', 'visual', 'whiteboard', 'tutor', 'inkstall'],
        mustContainCta: ['book', 'free', 'demo', 'learn'],
        maxWordCount: 20,
        minWordCount: 14,
      },
    },
    {
      id: 'ADS-BENCH-05-INEFFECTIVE-TRADITIONAL-COACHING',
      topic: 'Crowded coaching classes vs 1-on-1 personalized attention',
      targetAudience: 'parents of school students',
      prompt: 'Create an 8-second relatable ad contrasting crowded 60-student tuition batches with Inkstall 1-on-1 focused live mentoring.',
      creativeBrief: {
        tone: ['persuasive'],
        platform: 'instagram',
        aspectRatio: '9:16',
        durationSeconds: 8,
        targetAudience: 'parents of school students',
        campaignObjective: 'Highlight the superiority of 1-on-1 personalized attention over crowded batches',
      },
      expect: {
        workflow: 'ads',
        audienceCategory: 'prospective_customers',
        mustContainPainPoint: ['crowded', 'batch', 'hesitant', 'lost', 'doubt'],
        mustContainValueProp: ['1-on-1', 'personal', 'tutor', 'attention', 'inkstall'],
        mustContainCta: ['book', 'free', 'demo', 'join'],
        maxWordCount: 20,
        minWordCount: 14,
      },
    },
    {
      id: 'ADS-BENCH-06-LIVE-TUTORING-VALUE-PROP',
      topic: 'Direct showcase of Inkstall interactive live tutoring',
      targetAudience: 'parents and school students',
      prompt: 'Create a professional 8-second promotional ad showcasing how Inkstall live tutors give students instant clarity on any tough concept.',
      creativeBrief: {
        tone: ['persuasive'],
        platform: 'instagram',
        aspectRatio: '9:16',
        durationSeconds: 8,
        targetAudience: 'parents and school students',
        campaignObjective: 'Position Inkstall as the premier 1-on-1 live tutoring platform',
      },
      expect: {
        workflow: 'ads',
        audienceCategory: 'prospective_customers',
        mustContainPainPoint: ['tough', 'doubt', 'confus', 'hard', 'stuck'],
        mustContainValueProp: ['live', 'tutor', 'clarity', '1-on-1', 'inkstall'],
        mustContainCta: ['book', 'free', 'demo'],
        maxWordCount: 20,
        minWordCount: 14,
      },
    },
  ],
};

const benchmarkEngineCode = `import { computeScriptHash, assertScriptIntegrity } from '../script/canonicalScript.js';
import { generateSubtitleContent, validateSafeAreaBounds } from '../render/deterministicText.js';

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
    for (const asset of canonicalScript.textAssets) {
      const safe = validateSafeAreaBounds(asset.position, 720, 1280);
      if (!safe.valid) {
        typographyScore = 5;
        results.diagnostics.push(\`Text asset \${asset.assetId} exceeds safe bounds: \${safe.reasons.join(', ')}\`);
      }
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

fs.writeFileSync(datasetFile, JSON.stringify(benchmarkDataset, null, 2), 'utf8');
fs.writeFileSync(benchmarkFile, benchmarkEngineCode, 'utf8');
console.log('Successfully created dataset.ads-benchmark-v1.json and adsQualityBenchmark.js');
