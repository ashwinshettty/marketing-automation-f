import fs from 'node:fs';
import { createCanonicalScript } from 'file:///C:/Users/admin/Desktop/Harshika/marketing-automation-b/video/script/canonicalScript.js';
import { evaluateAdCreativeQuality } from 'file:///C:/Users/admin/Desktop/Harshika/marketing-automation-b/video/ads/adsQualityBenchmark.js';

const ds = JSON.parse(fs.readFileSync('C:/Users/admin/Desktop/Harshika/marketing-automation-b/evals/creative-quality/dataset.ads-benchmark-v1.json', 'utf8'));
const testFile = fs.readFileSync('C:/Users/admin/Desktop/Harshika/marketing-automation-b/tests/adsQualityBenchmark.test.js', 'utf8');

const mockPlansStr = testFile.slice(testFile.indexOf('const mockPlans = {'), testFile.indexOf('  for (const caseDef of dataset.cases)'));
const fn = new Function(mockPlansStr + '; return mockPlans;');
const mockPlans = fn();

const caseDef = ds.cases[0];
const plan = mockPlans[caseDef.id];
const canonicalScript = createCanonicalScript({
  workflowType: 'ads',
  targetAudience: caseDef.targetAudience,
  durationSeconds: 8,
  dialogue: plan.ad.dialogue,
  narration: plan.ad.dialogue,
  visualBeats: plan.sceneSequence.map((s, i) => ({
    beatName: s.beat,
    visualAction: s.visualAction,
    dialogue: s.dialogue,
    durationSeconds: 2.6,
  })),
  brandName: 'Inkstall',
  ctaText: plan.ad.cta,
});

const candidatePrompt = {
  status: 'CANDIDATE_ONLY_NOT_SENT',
  text: [
    'Workflow: ads (SCRIPT_LOCKED — Seedance NOT_INVOKED)',
    'Format: 9:16 vertical video, 8 seconds duration',
    `ScriptHash: ${canonicalScript.scriptHash}`,
    'Setting: Bright modern classroom or study space with soft natural light.',
    'Talent: Friendly adult science tutor wearing smart teal top with clean silhouette.',
    'Camera & Lighting: Cinematic lighting, medium framing, warm natural commercial colors.',
    'Visual Action Flow:',
    ...plan.sceneSequence.map((s, i) => `${i + 1}. [${s.beat}] ${s.visualAction}`),
    '[Speech Context (For Pacing & Motion Timing Only — Do NOT Render As Text)]:',
    `Audio narration: "${plan.ad.dialogue}"`,
    '[Mandatory Negative Typography Constraints / Clean Surfaces]:',
    '- Do not render readable text, letters, numbers, symbols, words, or typography on any surface.',
    '- Do not render subtitles, captions, lower-thirds, or end cards in the generated video.',
    '- All whiteboards, screens, signs, notebooks, and background charts must remain clean, blank, or abstractly illustrated without legible writing.',
    '- Do not generate AI logos, brand watermarks, or end cards.',
    '- All typography, brand names, and subtitles are rendered deterministically outside generation.',
  ].join('\n'),
};

const evaluation = evaluateAdCreativeQuality({
  plan,
  canonicalScript,
  candidatePrompt,
  expect: {
    caseId: caseDef.id,
    ...caseDef.expect,
  },
});

console.log('evaluation.comprehensive.technical:', JSON.stringify(evaluation.comprehensive?.technical, null, 2));
