import fs from 'node:fs';
import path from 'node:path';

const targetTestFile = path.resolve('../marketing-automation-b/tests/adsAdaptiveCreativeValidation.test.js');

const testCode = `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createCanonicalScript, assertScriptIntegrity } from '../video/script/canonicalScript.js';
import {
  evaluateHook,
  estimateSpokenDuration,
  evaluateValueProposition,
  identifyAudienceSegment,
  generateCandidateConcepts,
  evaluateEducationalDemonstration,
  evaluateSingleMessageFocus,
  evaluateConceptDifferentiation,
  NARRATIVE_STRUCTURES,
  PERMITTED_EDUCATIONAL_DEMONSTRATION_VISUALS,
} from '../video/ads/creativeIntelligence.js';
import {
  evaluateAdComprehensive,
  evaluateTechnicalCompliance,
  evaluateCreativeQuality,
} from '../video/ads/independentEvaluator.js';
import { evaluateVisualCandidate } from '../video/render/visualQualityRubric.js';

// ─── 1. ADAPTIVE CREATIVE CONSTRAINTS ────────────────────────────────────────

test('Adaptive Constraints: PRODUCT_DEMONSTRATION evaluates whiteboard mechanism without requiring parent anxiety drama', () => {
  const productDemoPlan = {
    narrativeStructure: 'PRODUCT_DEMONSTRATION',
    ad: {
      hook: 'Stuck on 3D geometry coordinates?',
      dialogue: 'Struggling with 3D vectors? Inkstall live tutors sketch coordinate planes interactively. Try a free 1-on-1 session.',
      visualAction: 'Tutor in teal top demonstrates rotating coordinate planes on clean interactive digital whiteboard; glowing vector arrow highlights direction.',
      cta: 'Try Your Free 1-on-1 Session on Inkstall',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Close-up of textbook with confusing 3D coordinate diagram.', dialogue: 'Struggling with 3D vectors?' },
      { beat: 'product_reveal', visualAction: 'Tutor in teal top gestures at clean interactive digital whiteboard, sketching a clean coordinate axis with colored vector arrows.', dialogue: 'Inkstall live tutors sketch coordinate planes interactively.' },
      { beat: 'cta', visualAction: 'Clean whiteboard transforms diagram into simple intuitive curves as high-contrast CTA card holds.', dialogue: 'Try a free 1-on-1 session.' },
    ],
  };

  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: '11th grade math students',
    durationSeconds: 8,
    dialogue: productDemoPlan.ad.dialogue,
    visualBeats: productDemoPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: productDemoPlan.ad.cta,
  });

  const prompt = {
    text: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  const res = evaluateAdComprehensive({
    plan: productDemoPlan,
    canonicalScript: script,
    candidatePrompt: prompt,
    expect: {},
  });

  assert.ok(res.aggregateScore >= 8.5, \`Product demonstration must score >= 8.5 without parent melodrama, got \${res.aggregateScore}\`);
  assert.equal(res.passed, true);
  assert.ok(['EXCELLENT', 'COMMERCIALLY_VIABLE'].includes(res.calibrationTier));
  assert.ok(res.creative.dimensions.educationalDemonstration?.score >= 9, 'Educational demonstration must score >= 9');
});

test('Adaptive Constraints: UNEXPECTED_REVEAL curiosity ad evaluates on misdirection hook without requiring emotional sorrow', () => {
  const curiosityPlan = {
    narrativeStructure: 'UNEXPECTED_REVEAL',
    ad: {
      hook: 'Memorizing formulas is the slowest way to pass finals.',
      dialogue: 'Memorizing formulas fails when questions twist. Inkstall visual 1-on-1 tutors teach core principles. Book your free demo today.',
      visualAction: 'A student closes a massive memorization guide and opens an interactive digital tablet showing an intuitive geometric proof.',
      cta: 'Book Your Free Live Demo on Inkstall',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Student pushes away thick textbook filled with highlighted formulas in mild frustration.', dialogue: 'Memorizing formulas fails when questions twist.' },
      { beat: 'product_reveal', visualAction: 'Inkstall tutor demonstrates the underlying principle using simple geometric shapes on a clean digital whiteboard.', dialogue: 'Inkstall visual 1-on-1 tutors teach core principles.' },
      { beat: 'cta', visualAction: 'Student nods with sudden understanding; high-contrast CTA card holds for booking.', dialogue: 'Book your free demo today.' },
    ],
  };

  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'high school students',
    durationSeconds: 8,
    dialogue: curiosityPlan.ad.dialogue,
    visualBeats: curiosityPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: curiosityPlan.ad.cta,
  });

  const prompt = {
    text: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  const res = evaluateAdComprehensive({
    plan: curiosityPlan,
    canonicalScript: script,
    candidatePrompt: prompt,
    expect: {},
  });

  assert.ok(res.aggregateScore >= 8.5, \`Curiosity reveal ad must score >= 8.5, got \${res.aggregateScore}\`);
  assert.equal(res.passed, true);
});

// ─── 2. EVALUATOR RELIABILITY & FALSE POSITIVE PREVENTION ───────────────────

test('Evaluator Reliability: Technically compliant but lifeless generic copy is categorized as TECHNICALLY_VALID_CREATIVELY_WEAK (score <= 5.8)', () => {
  const weakCopyPlan = {
    ad: {
      hook: 'Education is important for everyone.',
      dialogue: 'Education is important. We provide comprehensive educational solutions for all subjects and standards. Contact us today to learn more.',
      visualAction: 'Generic talent looking at camera, then pointing to clean blank screen.',
      cta: 'Contact Us Today',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Talent smiling at camera.', dialogue: 'Education is important.' },
      { beat: 'product_reveal', visualAction: 'Talent gestures at clean blank screen.', dialogue: 'We provide comprehensive educational solutions for all subjects and standards.' },
      { beat: 'cta', visualAction: 'End card.', dialogue: 'Contact us today to learn more.' },
    ],
  };

  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'students',
    durationSeconds: 8,
    dialogue: weakCopyPlan.ad.dialogue,
    visualBeats: weakCopyPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: weakCopyPlan.ad.cta,
  });

  const prompt = {
    text: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  const res = evaluateAdComprehensive({
    plan: weakCopyPlan,
    canonicalScript: script,
    candidatePrompt: prompt,
    expect: {},
  });

  assert.ok(res.aggregateScore <= 5.8, \`Technically valid but lifeless copy must score <= 5.8, got \${res.aggregateScore}\`);
  assert.equal(res.passed, false, 'Lifeless copy must fail creative gate');
  assert.ok(
    ['TECHNICALLY_VALID_CREATIVELY_WEAK', 'BORING_GENERIC'].includes(res.calibrationTier),
    \`Must flag as TECHNICALLY_VALID_CREATIVELY_WEAK or BORING_GENERIC, got \${res.calibrationTier}\`
  );
});

test('Evaluator Reliability: Keyword-stuffed copy without authentic message is flagged and penalized', () => {
  const keywordStuffedPlan = {
    ad: {
      hook: 'Math, science, exams, tutor, 1-on-1, demo.',
      dialogue: 'Math, science, exams, tutor, 1-on-1, demo. Best platform, high marks, study now.',
      visualAction: 'Tutor smiling at whiteboard.',
      cta: 'Book Demo',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Tutor smiling.', dialogue: 'Math, science, exams, tutor, 1-on-1, demo.' },
      { beat: 'product_reveal', visualAction: 'Tutor points at board.', dialogue: 'Best platform, high marks, study now.' },
      { beat: 'cta', visualAction: 'CTA hold.', dialogue: 'Book Demo.' },
    ],
  };

  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'students',
    durationSeconds: 8,
    dialogue: keywordStuffedPlan.ad.dialogue,
    visualBeats: keywordStuffedPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: keywordStuffedPlan.ad.cta,
  });

  const prompt = {
    text: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  const res = evaluateAdComprehensive({
    plan: keywordStuffedPlan,
    canonicalScript: script,
    candidatePrompt: prompt,
    expect: {},
  });

  assert.ok(res.aggregateScore <= 6.0, \`Keyword stuffed copy must score <= 6.0, got \${res.aggregateScore}\`);
  assert.equal(res.passed, false);
});

// ─── 3. TEXT-FREE EDUCATIONAL DEMONSTRATION VALIDATION ──────────────────────

test('Educational Demonstration: Clean geometric diagram on whiteboard scores 10/10', () => {
  const demoEval = evaluateEducationalDemonstration({
    scenes: [
      { visualAction: 'Tutor in teal top gestures at clean interactive digital whiteboard, sketching a clean coordinate curve with glowing directional vector arrows.' },
    ],
    candidatePromptText: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  });

  assert.equal(demoEval.score, 10);
  assert.equal(demoEval.hasVisualDemonstration, true);
  assert.equal(demoEval.isTextFreeDemonstration, true);
});

test('Educational Demonstration: Requesting equations or text on whiteboard is penalized (score <= 4)', () => {
  const demoEval = evaluateEducationalDemonstration({
    scenes: [
      { visualAction: 'Tutor writes mathematical equation E=mc^2 and formula numbers on digital whiteboard.' },
    ],
    candidatePromptText: 'Workflow: ads\\nDisplay equation on whiteboard.',
  });

  assert.ok(demoEval.score <= 4, \`Formula on whiteboard must score <= 4, got \${demoEval.score}\`);
  assert.equal(demoEval.isTextFreeDemonstration, false);
});

// ─── 4. DURATION-AWARE SINGLE PRIMARY MESSAGE FOCUS ─────────────────────────

test('Single Message Focus: Clean single-differentiator ad scores 10/10', () => {
  const focus = evaluateSingleMessageFocus({
    dialogue: 'Stuck on trigonometry? Inkstall 1-on-1 live tutors explain every step clearly. Book your free demo today.',
  });

  assert.equal(focus.score, 10);
  assert.equal(focus.isSingleMessageFocused, true);
  assert.equal(focus.matchedFeatures.length, 1);
});

test('Single Message Focus: Overloaded multi-feature laundry list in 8s is penalized (score <= 5)', () => {
  const focus = evaluateSingleMessageFocus({
    dialogue: 'Get 1-on-1 tutoring, interactive whiteboard, board exam prep, instant doubt clearing, and parent analytics. Book now.',
  });

  assert.ok(focus.score <= 5, \`Overloaded feature list must score <= 5, got \${focus.score}\`);
  assert.equal(focus.isSingleMessageFocused, false);
  assert.ok(focus.matchedFeatures.length >= 3);
});

// ─── 5. CONCEPT DIFFERENTIATION ─────────────────────────────────────────────

test('Concept Differentiation: Candidate concepts have unique angles and distinct narrative structures', () => {
  const concepts = generateCandidateConcepts({
    prompt: 'Ad for Inkstall targeting parents worried about high school math marks',
    creativeBrief: { targetAudience: 'parents of school students' },
  });

  const diff = evaluateConceptDifferentiation(concepts);
  assert.ok(diff.score >= 8, \`Concepts must be well-differentiated, got \${diff.score}\`);
  assert.equal(diff.isDifferentiated, true);
  assert.ok(diff.uniqueAnglesCount >= 3, 'All 3 concepts must have distinct angles');
  assert.ok(diff.uniqueStructuresCount >= 2, 'Candidate concepts must explore at least 2 distinct narrative structures');
});

// ─── 6. 3-LEVEL EVALUATION READINESS ARCHITECTURE ───────────────────────────

test('3-Level Readiness: Level 1 and Level 2 evaluate offline, Level 3 is strictly NOT_MEASURED', () => {
  const excellentPlan = {
    narrativeStructure: 'EMOTIONAL_PROGRESSION',
    ad: {
      hook: 'Is your child losing confidence in math before finals?',
      dialogue: 'Stop stressing over math exams. Inkstall expert live tutors give your child instant clarity. Book your free demo today.',
      visualAction: 'Close-up of student frustrated at desk, cutting to encouraging tutor at clean digital whiteboard.',
      cta: 'Book Your Free Live Demo on Inkstall',
    },
    sceneSequence: [
      { beat: 'hook', visualAction: 'Student frustrated at desk erasing marks.', dialogue: 'Stop stressing over math exams.' },
      { beat: 'product_reveal', visualAction: 'Tutor in teal top demonstrates on clean whiteboard sketching simple curve.', dialogue: 'Inkstall expert live tutors give your child instant clarity.' },
      { beat: 'cta', visualAction: 'Student looks up smiling as high-contrast CTA card holds.', dialogue: 'Book your free demo today.' },
    ],
  };

  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: excellentPlan.ad.dialogue,
    visualBeats: excellentPlan.sceneSequence.map((s) => ({ beatName: s.beat, visualAction: s.visualAction, dialogue: s.dialogue, durationSeconds: 2.6 })),
    ctaText: excellentPlan.ad.cta,
  });

  const prompt = {
    text: 'Workflow: ads\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
  };

  const res = evaluateAdComprehensive({
    plan: excellentPlan,
    canonicalScript: script,
    candidatePrompt: prompt,
    expect: {},
  });

  // Verify Level 1: Creative Brief Readiness
  assert.ok(res.readiness?.level1_creativeBriefReadiness, 'Level 1 readiness must be present');
  assert.ok(res.readiness.level1_creativeBriefReadiness.score >= 8.8, 'Level 1 score must be >= 8.8');
  assert.equal(res.readiness.level1_creativeBriefReadiness.passed, true);

  // Verify Level 2: Production Readiness
  assert.ok(res.readiness?.level2_productionReadiness, 'Level 2 readiness must be present');
  assert.equal(res.readiness.level2_productionReadiness.tier, 'PRODUCTION_READY');
  assert.equal(res.readiness.level2_productionReadiness.passed, true);
  assert.equal(res.readiness.level2_productionReadiness.deterministicTypography, true);
  assert.ok(res.readiness.level2_productionReadiness.ctaHoldingWindowSeconds >= 0.8);

  // Verify Level 3: Actual Video Quality MUST BE NOT_MEASURED
  assert.ok(res.readiness?.level3_actualVideoQuality, 'Level 3 readiness must be present');
  assert.equal(res.readiness.level3_actualVideoQuality.status, 'NOT_MEASURED', 'Level 3 status must remain NOT_MEASURED');
  assert.equal(res.readiness.level3_actualVideoQuality.evaluationType, 'INDEPENDENT_HUMAN_REVIEW_REQUIRED');
  assert.equal(res.readiness.level3_actualVideoQuality.metrics.visualContinuity, 'NOT_MEASURED');
  assert.equal(res.readiness.level3_actualVideoQuality.metrics.characterConsistency, 'NOT_MEASURED');
  assert.equal(res.readiness.level3_actualVideoQuality.metrics.commercialPolish, 'NOT_MEASURED');
});
`;

fs.writeFileSync(targetTestFile, testCode, 'utf8');
console.log('✓ Wrote tests/adsAdaptiveCreativeValidation.test.js successfully');
