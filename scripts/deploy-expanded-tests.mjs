import fs from 'node:fs';
import path from 'node:path';

const bDir = path.resolve('../marketing-automation-b');
const bDatasetFile = path.join(bDir, 'evals/creative-quality/dataset.ads-benchmark-v1.json');
const bTestFile = path.join(bDir, 'tests/adsCreativeIntelligence.test.js');

// 1. Expanded Dataset with calibrated negative controls and edge cases
const existingDataset = JSON.parse(fs.readFileSync(bDatasetFile, 'utf8'));

const expandedCases = [
  ...existingDataset.cases,
  {
    id: 'ADS-BENCH-07-STUDENT-DOUBT-EMBARRASSMENT',
    topic: 'Student embarrassed to ask doubts in coaching',
    targetAudience: '11th grade science students',
    tier: 'positive_commercial',
    prompt: 'Create an 8-second ad targeting 11th-grade students who feel too shy or embarrassed to ask doubts in a 70-student coaching batch.',
    creativeBrief: {
      tone: ['persuasive', 'relatable'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: '11th grade science students',
      campaignObjective: 'Position Inkstall as judgment-free 1-on-1 doubt solving',
    },
    expect: {
      workflow: 'ads',
      mustContainPainPoint: ['doubt', 'embarrass', 'hesitant', 'shy', 'question'],
      mustContainValueProp: ['1-on-1', 'live', 'tutor', 'inkstall'],
      mustContainCta: ['book', 'free', 'demo', 'try'],
      minScore: 8.8,
      expectedTier: 'EXCELLENT',
    },
  },
  {
    id: 'ADS-BENCH-08-INDIVIDUALIZED-PACING-PHYSICS',
    topic: 'Parent seeking personalized pace for child struggling with physics',
    targetAudience: 'parents of high school students',
    tier: 'positive_commercial',
    prompt: 'Create an 8-second ad for Inkstall showing parents that every student learns physics at their own pace, unlocked by a dedicated 1-on-1 mentor.',
    creativeBrief: {
      tone: ['persuasive'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'parents of high school students',
      campaignObjective: 'Highlight individualized pacing vs one-size-fits-all curricula',
    },
    expect: {
      workflow: 'ads',
      mustContainPainPoint: ['physics', 'pace', 'struggling', 'behind'],
      mustContainValueProp: ['1-on-1', 'personal', 'tutor', 'mentor', 'inkstall'],
      mustContainCta: ['book', 'free', 'demo'],
      minScore: 8.8,
      expectedTier: 'EXCELLENT',
    },
  },
  {
    id: 'ADS-BENCH-09-INTERACTIVE-WHITEBOARD-DEMO',
    topic: 'Interactive digital whiteboard conceptual clarity demonstration',
    targetAudience: 'students and parents',
    tier: 'positive_commercial',
    prompt: 'Create an 8-second product demonstration ad showcasing Inkstall live interactive whiteboard making an abstract concept visual and intuitive.',
    creativeBrief: {
      tone: ['educational', 'persuasive'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'students and parents',
      campaignObjective: 'Showcase the digital whiteboard feature as the primary differentiator',
    },
    expect: {
      workflow: 'ads',
      mustContainPainPoint: ['abstract', 'confus', 'hard', 'tough'],
      mustContainValueProp: ['whiteboard', 'visual', 'interactive', 'tutor', 'inkstall'],
      mustContainCta: ['try', 'demo', 'free'],
      minScore: 8.8,
      expectedTier: 'EXCELLENT',
    },
  },
  {
    id: 'ADS-BENCH-10-NEGATIVE-BORING-BROCHURE',
    topic: 'Technically compliant but boring brochure advertisement',
    targetAudience: 'general public',
    tier: 'negative_control',
    prompt: 'Boring brochure ad with no tension or specific problem.',
    expect: {
      maxScore: 6.0,
      mustFail: true,
      expectedTier: 'BORING_GENERIC',
    },
  },
  {
    id: 'ADS-BENCH-11-NEGATIVE-DISCONNECTED-HOOK',
    topic: 'Shock/clickbait opening disconnected from product mechanism',
    targetAudience: 'students',
    tier: 'negative_control',
    prompt: 'Flashy sports car drifting into tutoring ad.',
    expect: {
      maxScore: 5.5,
      mustFail: true,
      expectedTier: 'DISCONNECTED_HOOK_REJECTED',
    },
  },
  {
    id: 'ADS-BENCH-12-NEGATIVE-OVERLOADED-SCRIPT',
    topic: 'Overloaded 8-second script with 32 multisyllabic words',
    targetAudience: 'students',
    tier: 'negative_control',
    prompt: 'Overloaded script that cannot be spoken in 8 seconds naturally.',
    expect: {
      maxScore: 5.0,
      mustFail: true,
      expectedTier: 'OVERLOADED_REJECTED',
    },
  },
  {
    id: 'ADS-BENCH-13-NEGATIVE-GENERIC-TARGETING',
    topic: 'Generic advertisement targeting everyone with slogans',
    targetAudience: 'everyone',
    tier: 'negative_control',
    prompt: 'Are you struggling with studies? Education is key.',
    expect: {
      maxScore: 5.8,
      mustFail: true,
      expectedTier: 'BORING_GENERIC',
    },
  },
  {
    id: 'ADS-BENCH-14-NEGATIVE-PROHIBITED-GUARANTEE',
    topic: 'Misleading advertisement claiming 100% board exam marks guaranteed',
    targetAudience: 'parents and students',
    tier: 'negative_control',
    prompt: '100% board exam marks guaranteed without studying.',
    expect: {
      maxScore: 3.5,
      mustFail: true,
      expectedTier: 'MISLEADING_REJECTED',
    },
  },
  {
    id: 'ADS-BENCH-15-NEGATIVE-WEAK-PASSIVE-CTA',
    topic: 'Advertisement with passive non-actionable closing',
    targetAudience: 'parents',
    tier: 'negative_control',
    prompt: 'Ad ending with passive non-actionable phrase.',
    expect: {
      maxScore: 6.5,
      expectedTier: 'MEDIOCRE',
    },
  },
];

const expandedDataset = {
  ...existingDataset,
  version: '2.0.0-hardened',
  benchmarkName: 'Inkstall Ads Creative Intelligence & Calibrated Commercial Benchmark',
  calibratedCases: expandedCases,
};

fs.writeFileSync(bDatasetFile, JSON.stringify(expandedDataset, null, 2), 'utf8');

// 2. Comprehensive Test Suite for Creative Intelligence
const testCode = `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  identifyAudienceSegment,
  selectCreativeAngle,
  evaluateHook,
  estimateSpokenDuration,
  evaluateValueProposition,
  generateCandidateConcepts,
  countSyllables,
  AUDIENCE_SEGMENTS,
  CREATIVE_ANGLES,
  HOOK_CATEGORIES,
} from '../video/ads/creativeIntelligence.js';
import {
  evaluateAdComprehensive,
  evaluateTechnicalCompliance,
  evaluateCreativeQuality,
} from '../video/ads/independentEvaluator.js';
import { evaluateVisualCandidate } from '../video/render/visualQualityRubric.js';
import { assessConversionReadiness, PERFORMANCE_METRIC_STATUS } from '../video/ads/performanceMarketing.js';
import { createCanonicalScript } from '../video/script/canonicalScript.js';

test('Creative Intelligence: Audience segment identification and pain-point mapping', () => {
  const parentCase = identifyAudienceSegment({
    prompt: 'Parents worried about dropping math scores before finals',
    creativeBrief: { targetAudience: 'parents of school students' },
  });
  assert.equal(parentCase.segmentId, 'parents_academic_anxiety');
  assert.ok(parentCase.primaryConcerns.length >= 3);
  assert.ok(parentCase.inkstallMechanism.includes('1-on-1'));

  const studentCase = identifyAudienceSegment({
    prompt: '10th grade student struggling with chemistry equations',
    creativeBrief: { targetAudience: '10th grade students' },
  });
  assert.equal(studentCase.segmentId, 'students_stem_confusion');

  const coachingCase = identifyAudienceSegment({
    prompt: 'Lost in a crowded tuition batch of 60 students',
    creativeBrief: { targetAudience: 'learners' },
  });
  assert.equal(coachingCase.segmentId, 'crowded_coaching_frustration');
});

test('Creative Intelligence: Distinct creative angles selection based on tone and brief', () => {
  const demoAngle = selectCreativeAngle({
    prompt: 'Show how Inkstall whiteboard explains chemical reactions visually',
    creativeBrief: { tone: ['educational'] },
  });
  assert.equal(demoAngle.id, 'unexpected_demonstration');

  const misconceptionAngle = selectCreativeAngle({
    prompt: 'Highlight that memorizing formulas fails without principles',
    creativeBrief: { tone: ['persuasive'] },
  });
  assert.equal(misconceptionAngle.id, 'misconception_correction');

  const contrastAngle = selectCreativeAngle({
    prompt: 'Contrast 60-student crowded batches with 1-on-1 personal attention',
    creativeBrief: { tone: ['persuasive'] },
  });
  assert.equal(contrastAngle.id, 'before_after_contrast');
});

test('Creative Intelligence: First 1.5s hook categorization and anti-trope penalization', () => {
  // 1. Strong visual tension hook
  const goodHook = evaluateHook({
    hook: 'Stuck on that same math problem for forty minutes?',
    visualAction: 'Close-up of student staring frozen at a geometry question with eraser shavings.',
  });
  assert.ok(goodHook.score >= 8);
  assert.equal(goodHook.hasGenericStock, false);

  // 2. Generic smiling talent trope penalized
  const smilingStockHook = evaluateHook({
    hook: 'Welcome to Inkstall tutoring.',
    visualAction: 'Happy student smiling directly at camera and waving warmly.',
  });
  assert.ok(smilingStockHook.score <= 6);
  assert.equal(smilingStockHook.hasGenericStock, true);
  assert.ok(smilingStockHook.diagnostics.some((d) => d.includes('generic smiling stock')));

  // 3. Slow logo intro penalized
  const slowLogoHook = evaluateHook({
    hook: 'Inkstall online tutoring.',
    visualAction: 'Slow fade from black to logo animation for 3 seconds.',
  });
  assert.ok(slowLogoHook.score <= 5);
  assert.ok(slowLogoHook.diagnostics.some((d) => d.includes('slow logo')));
});

test('Creative Intelligence: Duration-aware speech rate modeling (Indian English tempo, syllables, pauses)', () => {
  // Realistic 17-word commercial copy
  const goodCopy = 'Stop stressing over math exams. Inkstall expert live tutors give you instant clarity. Book your free demo.';
  const goodTiming = estimateSpokenDuration(goodCopy, { targetDurationSeconds: 8 });
  assert.equal(goodTiming.wordCount, 17);
  assert.ok(goodTiming.syllableCount >= 25 && goodTiming.syllableCount <= 35);
  assert.ok(goodTiming.estimatedSeconds <= 7.2);
  assert.equal(goodTiming.score, 10);
  assert.equal(goodTiming.hasSufficientCtaWindow, true);

  // Overloaded 32-word copy
  const overloadedCopy = 'In this comprehensive introductory session on mathematical derivations we will thoroughly explore how calculus functions operate under strict examination conditions so you can score perfect marks effortlessly book free demo today.';
  const overloadedTiming = estimateSpokenDuration(overloadedCopy, { targetDurationSeconds: 8 });
  assert.equal(overloadedTiming.score, 4);
  assert.ok(overloadedTiming.estimatedSeconds > 7.9);
  assert.ok(overloadedTiming.diagnostics.some((d) => d.includes('exceeds natural 8-second commercial capacity')));

  // Syllable counter precision on STEM words
  assert.equal(countSyllables('mathematics'), 4);
  assert.equal(countSyllables('trigonometry'), 5);
  assert.equal(countSyllables('differentiation'), 6);
  assert.equal(countSyllables('inkstall'), 2);
});

test('Creative Intelligence: Multi-candidate concept generation yields distinct angles & structures', () => {
  const candidates = generateCandidateConcepts({
    prompt: 'Ad for Inkstall targeting parents worried about high school math marks',
    creativeBrief: { targetAudience: 'parents of school students' },
  });

  assert.equal(candidates.length, 3);
  const angles = candidates.map((c) => c.angle);
  const uniqueAngles = new Set(angles);
  assert.equal(uniqueAngles.size, 3, 'All 3 generated candidate concepts must utilize distinct creative angles');

  for (const cand of candidates) {
    assert.ok(cand.overallScore >= 8.0, \`Candidate \${cand.conceptId} must score commercially viable\`);
    assert.ok(cand.productMechanism.length > 0);
  }
});

test('Independent Evaluator: Calibrated scoring discriminates excellent vs boring vs overloaded vs misleading ads', () => {
  const candidatePrompt = {
    text: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  // Case 1: Excellent commercial ad
  const excellentPlan = {
    ad: {
      hook: 'Is your child losing confidence in math before finals?',
      dialogue: 'Stop stressing over math exams. Inkstall expert live tutors give your child instant clarity. Book your free demo today.',
      visualAction: 'Close-up of student erasing pencil marks in frustration, cutting to tutor at clean blank whiteboard.',
      cta: 'Book Your Free Live Demo on Inkstall',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Student frustrated at desk.', dialogue: 'Stop stressing over math exams.' },
      { beat: 'product_reveal', visualAction: 'Tutor in teal top demonstrates on clean whiteboard.', dialogue: 'Inkstall expert live tutors give your child instant clarity.' },
      { beat: 'cta', visualAction: 'Student smiles with confidence.', dialogue: 'Book your free demo today.' },
    ],
  };
  const excellentScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: excellentPlan.ad.dialogue,
    visualBeats: excellentPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: excellentPlan.ad.cta,
  });

  const resExcellent = evaluateAdComprehensive({
    plan: excellentPlan,
    canonicalScript: excellentScript,
    candidatePrompt,
    expect: { mustContainPainPoint: ['math', 'exam'] },
  });
  assert.equal(resExcellent.calibrationTier, 'EXCELLENT');
  assert.ok(resExcellent.aggregateScore >= 9.0, \`Excellent ad score must be >= 9.0, got \${resExcellent.aggregateScore}\`);
  assert.equal(resExcellent.passed, true);

  // Case 2: Technically compliant but boring brochure ad
  const boringPlan = {
    ad: {
      hook: 'Education is important for everyone.',
      dialogue: 'We provide comprehensive educational solutions for all subjects and standards. Contact our team to learn more.',
      visualAction: 'Tutor smiling warmly at camera with neat desk.',
      cta: 'Learn more about Inkstall',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Smiling talent at desk.', dialogue: 'Education is important.' },
      { beat: 'product_reveal', visualAction: 'Tutor points at blank board.', dialogue: 'We provide comprehensive educational solutions.' },
      { beat: 'cta', visualAction: 'Website address shown.', dialogue: 'Learn more about Inkstall.' },
    ],
  };
  const boringScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'everyone',
    durationSeconds: 8,
    dialogue: boringPlan.ad.dialogue,
    visualBeats: boringPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: boringPlan.ad.cta,
  });
  const resBoring = evaluateAdComprehensive({
    plan: boringPlan,
    canonicalScript: boringScript,
    candidatePrompt,
    expect: {},
  });
  assert.equal(resBoring.calibrationTier, 'BORING_GENERIC');
  assert.ok(resBoring.aggregateScore <= 6.0, \`Boring ad must be penalized <= 6.0, got \${resBoring.aggregateScore}\`);
  assert.equal(resBoring.passed, false);

  // Case 3: Disconnected clickbait hook
  const disconnectedPlan = {
    ad: {
      hook: 'Watch this sports car drifting around an exploding building!',
      dialogue: 'Sports car drifting near an explosion! Anyway, Inkstall has 1-on-1 tutors. Book your free demo today.',
      visualAction: 'Sports car drifting and exploding building in opening.',
      cta: 'Book Your Free Demo',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Sports car drifting and exploding building.', dialogue: 'Sports car drifting near an explosion!' },
      { beat: 'product_reveal', visualAction: 'Tutor smiling.', dialogue: 'Inkstall has 1-on-1 tutors.' },
      { beat: 'cta', visualAction: 'End card.', dialogue: 'Book your free demo today.' },
    ],
  };
  const disScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'students',
    durationSeconds: 8,
    dialogue: disconnectedPlan.ad.dialogue,
    visualBeats: disconnectedPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: disconnectedPlan.ad.cta,
  });
  const resDis = evaluateAdComprehensive({
    plan: disconnectedPlan,
    canonicalScript: disScript,
    candidatePrompt,
    expect: {},
  });
  assert.equal(resDis.calibrationTier, 'DISCONNECTED_HOOK_REJECTED');
  assert.ok(resDis.aggregateScore <= 5.5, \`Disconnected clickbait ad must score <= 5.5, got \${resDis.aggregateScore}\`);
  assert.equal(resDis.passed, false);

  // Case 4: Misleading prohibited guarantee
  const misleadingPlan = {
    ad: {
      hook: 'Want 100% marks guaranteed on your boards?',
      dialogue: '100% board exam marks guaranteed! Pass without studying with Inkstall 1-on-1 live tutors. Book your free demo.',
      visualAction: 'Tutor gesturing at clean whiteboard.',
      cta: 'Book Your Free Demo',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Student celebrating.', dialogue: '100% board exam marks guaranteed!' },
      { beat: 'product_reveal', visualAction: 'Tutor explaining.', dialogue: 'Pass without studying with Inkstall 1-on-1 live tutors.' },
      { beat: 'cta', visualAction: 'End card.', dialogue: 'Book your free demo.' },
    ],
  };
  const misScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of students',
    durationSeconds: 8,
    dialogue: misleadingPlan.ad.dialogue,
    visualBeats: misleadingPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: misleadingPlan.ad.cta,
  });
  const resMis = evaluateAdComprehensive({
    plan: misleadingPlan,
    canonicalScript: misScript,
    candidatePrompt,
    expect: {},
  });
  assert.equal(resMis.calibrationTier, 'MISLEADING_REJECTED');
  assert.ok(resMis.aggregateScore <= 3.5, \`Misleading ad must score <= 3.5, got \${resMis.aggregateScore}\`);
  assert.equal(resMis.passed, false);
});

test('Visual Quality Rubric: Assesses commercial visual direction & clean blank surfaces', () => {
  const goodVisualCandidate = {
    visualBeats: [
      { beatName: 'hook', visualAction: 'Cinematic push-in on student staring frozen at a geometry question with ticking clock.', durationSeconds: 2.5 },
      { beatName: 'product_reveal', visualAction: 'Friendly tutor gestures at clean blank digital whiteboard with simple intuitive diagram.', durationSeconds: 3.0 },
      { beatName: 'cta', visualAction: 'Student looks up smiling as high-contrast CTA card holds.', durationSeconds: 2.5 },
    ],
    candidatePrompt: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  const evalGood = evaluateVisualCandidate(goodVisualCandidate);
  assert.ok(evalGood.aggregateScore >= 8.5);
  assert.equal(evalGood.passed, true);
  assert.equal(evalGood.dimensionScores.clean_surfaces, 10);
  assert.equal(evalGood.dimensionScores.decisive_cta_hold, 9);

  // Missing clean surface constraints
  const badVisualCandidate = {
    visualBeats: [
      { beatName: 'hook', visualAction: 'Happy student smiling directly at camera and waving.', durationSeconds: 4.0 },
      { beatName: 'cta', visualAction: 'Quick logo flash.', durationSeconds: 1.0 },
    ],
    candidatePrompt: 'Workflow: ads\\nRender text clearly on screen.',
  };
  const evalBad = evaluateVisualCandidate(badVisualCandidate);
  assert.ok(evalBad.aggregateScore < 7.0);
  assert.equal(evalBad.passed, false);
  assert.ok(evalBad.issues.some((i) => i.includes('Missing strict negative typography constraints')));
  assert.ok(evalBad.issues.some((i) => i.includes('stock talent smiling')));
});

test('Performance Marketing: Differentiates creative readiness and marks live performance NOT_MEASURED', () => {
  const assessment = assessConversionReadiness({
    plan: { ad: { cta: 'Book Your Free Live Demo on Inkstall' } },
    canonicalScript: {
      dialogue: 'Stuck on tough chemistry equations? Inkstall 1-on-1 live tutors give you clarity. Book your free demo today.',
      ctaText: 'Book Your Free Live Demo on Inkstall',
      durationSeconds: 8,
    },
  });

  assert.equal(assessment.readinessTier, 'HIGH_CONVERSION_READY');
  assert.ok(assessment.conversionReadinessScore >= 8);
  assert.equal(assessment.livePerformance.status, PERFORMANCE_METRIC_STATUS.NOT_MEASURED);
  assert.equal(assessment.livePerformance.metrics.hookRetention3s, null);
  assert.equal(assessment.livePerformance.metrics.clickThroughRate, null);
});
`;

fs.writeFileSync(bTestFile, testCode, 'utf8');
console.log('Successfully deployed expanded benchmark dataset and tests/adsCreativeIntelligence.test.js');
