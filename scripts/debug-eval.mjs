import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createCanonicalScript } from '../../marketing-automation-b/video/script/canonicalScript.js';
import { evaluateAdCreativeQuality } from '../../marketing-automation-b/video/ads/adsQualityBenchmark.js';

const dataset = JSON.parse(readFileSync('../marketing-automation-b/evals/creative-quality/dataset.ads-benchmark-v1.json', 'utf8'));
const caseDef = dataset.cases[0];

const plan = {
  ad: {
    hook: 'Is your child losing confidence in math before finals?',
    dialogue: 'Stop stressing over math exams. Inkstall expert live tutors give your child instant clarity. Book your free demo today.',
    visualAction: 'Close-up of a parent looking at a confusing math test, then cutting to an encouraging Indian tutor at a clean blank digital whiteboard.',
    cta: 'Book Your Free Live Demo on Inkstall',
  },
  sceneSequence: [
    {
      beat: 'hook',
      visualAction: 'Close-up of a student erasing pencil marks repeatedly in frustration, with parent watching with concern.',
      dialogue: 'Stop stressing over math exams.',
    },
    {
      beat: 'product_reveal',
      visualAction: 'Tutor in smart teal top gestures at a clean blank interactive digital whiteboard, sketching a simple geometric curve.',
      dialogue: 'Inkstall expert live tutors give your child instant clarity.',
    },
    {
      beat: 'cta',
      visualAction: 'Student looks up smiling with clear understanding as the scene transitions to high-contrast CTA card.',
      dialogue: 'Book your free demo today.',
    },
  ],
};

const canonicalScript = createCanonicalScript({
  workflowType: 'ads',
  campaignId: randomUUID(),
  adId: randomUUID(),
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

console.log('Evaluation dimensions:', JSON.stringify(evaluation.dimensions, null, 2));
console.log('Aggregate:', evaluation.aggregateScore, 'Diagnostics:', evaluation.diagnostics);
