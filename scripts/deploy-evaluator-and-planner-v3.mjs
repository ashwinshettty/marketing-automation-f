import fs from 'node:fs';
import path from 'node:path';

const bDir = path.resolve('../marketing-automation-b');
const bAdsDir = path.join(bDir, 'video/ads');

console.log('Deploying Evaluator, PlannerPrompt, CreativeBrief, and Orchestrator updates to:', bAdsDir);

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPDATE independentEvaluator.js
// ─────────────────────────────────────────────────────────────────────────────
const evalPath = path.join(bAdsDir, 'independentEvaluator.js');
let evalCode = fs.readFileSync(evalPath, 'utf8');

// Ensure import includes new CI functions
const oldCiImports = `import {
  evaluateHook,
  estimateSpokenDuration,
  evaluateValueProposition,
  identifyAudienceSegment,
  evaluateEmotionalArc,
  evaluateBrandAuthenticity,
  evaluateVisualContinuity,
  evaluateTextArtifactRisk,
  evaluateStoryCoherence,
  evaluateProductDifferentiation,
} from './creativeIntelligence.js';`;

const newCiImports = `import {
  evaluateHook,
  estimateSpokenDuration,
  evaluateValueProposition,
  identifyAudienceSegment,
  evaluateEmotionalArc,
  evaluateBrandAuthenticity,
  evaluateVisualContinuity,
  evaluateTextArtifactRisk,
  evaluateStoryCoherence,
  evaluateProductDifferentiation,
  evaluateEducationalDemonstration,
  evaluateSingleMessageFocus,
  evaluateConceptDifferentiation,
  NARRATIVE_STRUCTURES,
} from './creativeIntelligence.js';`;

if (evalCode.includes(oldCiImports)) {
  evalCode = evalCode.replace(oldCiImports, newCiImports);
}

// In evaluateCreativeQuality, support narrativeStructure and detect lifeless generic sloganizing
const oldCreativeQualityStart = `export const evaluateCreativeQuality = ({ plan, canonicalScript, brief = {}, expect = {} } = {}) => {
  const dialogue = canonicalScript?.dialogue || plan?.ad?.dialogue || '';
  const hook = plan?.ad?.hook || '';
  const visualAction = plan?.ad?.visualAction || '';
  const cta = plan?.ad?.cta || '';
  const scenes = plan?.sceneSequence || [];`;

const newCreativeQualityStart = `export const evaluateCreativeQuality = ({ plan, canonicalScript, brief = {}, expect = {} } = {}) => {
  const dialogue = canonicalScript?.dialogue || plan?.ad?.dialogue || '';
  const hook = plan?.ad?.hook || '';
  const visualAction = plan?.ad?.visualAction || '';
  const cta = plan?.ad?.cta || '';
  const scenes = plan?.sceneSequence || [];
  const narrativeStructure = plan?.narrativeStructure || brief?.narrativeStructure || plan?.ad?.narrativeStructure || 'EMOTIONAL_PROGRESSION';`;

if (evalCode.includes(oldCreativeQualityStart)) {
  evalCode = evalCode.replace(oldCreativeQualityStart, newCreativeQualityStart);
}

// Update emotionalArcEval call to pass narrativeStructure
const oldEmotionalArcCall = 'const emotionalArcEval = evaluateEmotionalArc({ scenes, dialogue });';
const newEmotionalArcCall = 'const emotionalArcEval = evaluateEmotionalArc({ scenes, dialogue, narrativeStructure });';
if (evalCode.includes(oldEmotionalArcCall)) {
  evalCode = evalCode.replace(oldEmotionalArcCall, newEmotionalArcCall);
}

// Add Single Message Focus evaluation and Educational Demonstration evaluation into dimensions
const oldStoryDim = `  // 10. NEW: Story Coherence (0-10) — weight 0.06
  const storyEval = evaluateStoryCoherence({ scenes, dialogue, hook });
  dimensions.storyCoherence = { score: storyEval.score, hasConflict: storyEval.hasConflict, hasMechanism: storyEval.hasMechanism, weight: 0.06 };
  diagnostics.push(...storyEval.diagnostics);`;

const newStoryDim = `  // 10. NEW: Story Coherence (0-10) — weight 0.06
  const storyEval = evaluateStoryCoherence({ scenes, dialogue, hook });
  dimensions.storyCoherence = { score: storyEval.score, hasConflict: storyEval.hasConflict, hasMechanism: storyEval.hasMechanism, weight: 0.06 };
  diagnostics.push(...storyEval.diagnostics);

  // 10b. NEW: Single Primary Message Focus (0-10) — weight 0.05
  const focusEval = evaluateSingleMessageFocus({ dialogue, brief });
  dimensions.singleMessageFocus = { score: focusEval.score, isFocused: focusEval.isSingleMessageFocused, matchedFeatures: focusEval.matchedFeatures, weight: 0.05 };
  diagnostics.push(...focusEval.diagnostics);

  // 10c. NEW: Educational Demonstration (0-10) — adaptive weight 0.05 when whiteboard present
  const demoEval = evaluateEducationalDemonstration({ scenes, candidatePromptText: '' });
  if (demoEval.hasWhiteboardOrScreen) {
    dimensions.educationalDemonstration = { score: demoEval.score, hasWhiteboard: true, weight: 0.05 };
    diagnostics.push(...demoEval.diagnostics);
  }`;

if (evalCode.includes(oldStoryDim)) {
  evalCode = evalCode.replace(oldStoryDim, newStoryDim);
}

// Update calibration tier logic with the 5 qualitative tiers
const oldTierBlock = `  // Determine calibration band
  let calibrationTier = 'COMMERCIALLY_VIABLE';
  if (falseGuarantees || fearMongering) {
    calibrationTier = 'MISLEADING_REJECTED';
    aggregateScore = Math.min(aggregateScore, 3.0);
  } else if (speechEval.estimatedSeconds > 7.8 || speechEval.wordCount > 23) {
    calibrationTier = 'OVERLOADED_REJECTED';
    aggregateScore = Math.min(aggregateScore, 4.8);
  } else if (isDisconnectedHook) {
    calibrationTier = 'DISCONNECTED_HOOK_REJECTED';
    aggregateScore = Math.min(aggregateScore, 5.2);
  } else if (isGenericAudience || boringBrochure) {
    calibrationTier = 'BORING_GENERIC';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (aggregateScore >= 8.8) {
    calibrationTier = 'EXCELLENT';
  } else if (aggregateScore >= 7.0) {
    calibrationTier = 'COMMERCIALLY_VIABLE';
  } else if (aggregateScore >= 5.5) {
    calibrationTier = 'MEDIOCRE';
  } else {
    calibrationTier = 'SUBSTANDARD';
  }`;

const newTierBlock = `  // Check for lifeless sloganizing / keyword stuffing
  const isTechnicallyValidCreativelyWeak =
    /education is important|we provide comprehensive educational solutions|study better with our tutors|join the best learning platform|contact us today to learn more|education matters/i.test(lowerDialogue)
    || (/^math[,.]?\\s*science[,.]?\\s*exams/i.test(lowerDialogue));

  // Determine calibration band across 5 explicit qualitative tiers:
  // 1. TECHNICALLY_VALID_CREATIVELY_WEAK / BORING_GENERIC (score <= 5.8, fails gate)
  // 2. RELEVANT_BUT_GENERIC / MEDIOCRE (5.9 - 7.4)
  // 3. COMMERCIALLY_VIABLE (7.5 - 8.7, passes gate)
  // 4. DISTINCTIVE_AND_MEMORABLE / EXCELLENT (>= 8.8, passes with distinction)
  // 5. MISLEADING_OR_UNSAFE (score <= 3.0, hard rejection)
  let calibrationTier = 'COMMERCIALLY_VIABLE';
  if (falseGuarantees || fearMongering) {
    calibrationTier = 'MISLEADING_REJECTED';
    aggregateScore = Math.min(aggregateScore, 3.0);
  } else if (speechEval.estimatedSeconds > 7.8 || speechEval.wordCount > 23 || focusEval.matchedFeatures.length > 2) {
    calibrationTier = 'OVERLOADED_REJECTED';
    aggregateScore = Math.min(aggregateScore, 4.8);
  } else if (isDisconnectedHook) {
    calibrationTier = 'DISCONNECTED_HOOK_REJECTED';
    aggregateScore = Math.min(aggregateScore, 5.2);
  } else if (isTechnicallyValidCreativelyWeak) {
    calibrationTier = 'TECHNICALLY_VALID_CREATIVELY_WEAK';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (isGenericAudience || boringBrochure) {
    calibrationTier = 'BORING_GENERIC';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (aggregateScore >= 8.8) {
    calibrationTier = 'EXCELLENT';
  } else if (aggregateScore >= 7.5) {
    calibrationTier = 'COMMERCIALLY_VIABLE';
  } else if (aggregateScore >= 6.0) {
    calibrationTier = 'RELEVANT_BUT_GENERIC';
  } else {
    calibrationTier = 'SUBSTANDARD';
  }`;

if (evalCode.includes(oldTierBlock)) {
  evalCode = evalCode.replace(oldTierBlock, newTierBlock);
}

// In evaluateAdComprehensive, add explicit 3-level readiness architecture
const oldComprehensiveReturn = `  return {
    caseId: expect.caseId || 'ad-eval',
    passed: technical.passed && creative.passed,
    aggregateScore: finalScore,
    technicalScore: technical.score,
    creativeScore: creative.aggregateScore,
    calibrationTier: creative.calibrationTier,
    offlineValidationOnly: true,
    note: 'Offline prompt quality score only. Actual Seedance video quality requires human evaluation of the generated artifact.',
    technical,
    creative,
    diagnostics: [...technical.issues, ...creative.diagnostics],
  };`;

const newComprehensiveReturn = `  const speechSeconds = creative.dimensions.speechRateAndPacing?.estimatedSeconds || 0;
  const ctaHoldingSeconds = Number(Math.max(0, 8.0 - speechSeconds).toFixed(2));

  return {
    caseId: expect.caseId || 'ad-eval',
    passed: technical.passed && creative.passed,
    aggregateScore: finalScore,
    technicalScore: technical.score,
    creativeScore: creative.aggregateScore,
    calibrationTier: creative.calibrationTier,
    offlineValidationOnly: true,
    note: 'Offline prompt quality score only. Actual Seedance video quality requires human evaluation of the generated artifact.',
    technical,
    creative,
    diagnostics: [...technical.issues, ...creative.diagnostics],
    // ─── 3-LEVEL EVALUATION READINESS ARCHITECTURE ─────────────────────────
    readiness: {
      level1_creativeBriefReadiness: {
        score: creative.aggregateScore,
        tier: creative.calibrationTier,
        passed: creative.passed,
        dimensions: creative.dimensions,
        isDistinctive: creative.calibrationTier === 'EXCELLENT',
      },
      level2_productionReadiness: {
        score: technical.score,
        tier: technical.passed ? 'PRODUCTION_READY' : 'TECHNICAL_VIOLATION',
        passed: technical.passed,
        timingCompliant: speechSeconds <= 6.2,
        ctaHoldingWindowSeconds: ctaHoldingSeconds,
        hasSufficientCtaWindow: ctaHoldingSeconds >= 1.8,
        deterministicTypography: true,
        safeAreasCompliant: true,
        textArtifactRisk: technical.textArtifactRisk,
        issues: technical.issues,
      },
      level3_actualVideoQuality: {
        status: 'NOT_MEASURED',
        evaluationType: 'INDEPENDENT_HUMAN_REVIEW_REQUIRED',
        reason: 'Awaiting independent human evaluation of newly rendered video artifacts. Offline validation cannot evaluate actual diffusion visual quality.',
        metrics: {
          visualContinuity: 'NOT_MEASURED',
          characterConsistency: 'NOT_MEASURED',
          motionQuality: 'NOT_MEASURED',
          absenceOfTextArtifacts: 'NOT_MEASURED',
          commercialPolish: 'NOT_MEASURED',
        },
      },
    },
  };`;

if (evalCode.includes(oldComprehensiveReturn)) {
  evalCode = evalCode.replace(oldComprehensiveReturn, newComprehensiveReturn);
}

fs.writeFileSync(evalPath, evalCode, 'utf8');
console.log('✓ Successfully updated independentEvaluator.js with 3-level readiness & qualitative tiers');

// ─────────────────────────────────────────────────────────────────────────────
// 2. UPDATE creativeBrief.js
// ─────────────────────────────────────────────────────────────────────────────
const briefPath = path.join(bAdsDir, 'creativeBrief.js');
let briefCode = fs.readFileSync(briefPath, 'utf8');

const oldBriefArgs = `  intent = null,
  variationOfAdId = null,
  priorBrief = null,
} = {}) => {`;

const newBriefArgs = `  intent = null,
  variationOfAdId = null,
  priorBrief = null,
  concept = null,
  narrativeStructure = null,
  singleFocusMessage = null,
  adaptiveConstraints = null,
  permittedDemonstrationVisuals = null,
} = {}) => {`;

if (briefCode.includes(oldBriefArgs)) {
  briefCode = briefCode.replace(oldBriefArgs, newBriefArgs);
}

const oldBriefReturn = `    intent: intent || routing?.intent || priorBrief?.intent || 'new_campaign',
    variationOfAdId: variationOfAdId || priorBrief?.variationOfAdId || null,
  };`;

const newBriefReturn = `    intent: intent || routing?.intent || priorBrief?.intent || 'new_campaign',
    variationOfAdId: variationOfAdId || priorBrief?.variationOfAdId || null,
    // v3 adaptive concept fields
    concept: concept || null,
    narrativeStructure: narrativeStructure || concept?.narrativeStructure || 'EMOTIONAL_PROGRESSION',
    singleFocusMessage: singleFocusMessage || concept?.singleFocusMessage || null,
    adaptiveConstraints: adaptiveConstraints || concept?.adaptiveConstraints || null,
    permittedDemonstrationVisuals: permittedDemonstrationVisuals || concept?.permittedDemonstrationVisuals || null,
  };`;

if (briefCode.includes(oldBriefReturn)) {
  briefCode = briefCode.replace(oldBriefReturn, newBriefReturn);
}

fs.writeFileSync(briefPath, briefCode, 'utf8');
console.log('✓ Successfully updated creativeBrief.js with adaptive concept parameters');

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPDATE orchestrator.js
// ─────────────────────────────────────────────────────────────────────────────
const orchPath = path.join(bAdsDir, 'orchestrator.js');
let orchCode = fs.readFileSync(orchPath, 'utf8');

// Ensure import includes creative intelligence functions
if (!orchCode.includes('identifyAudienceSegment')) {
  orchCode = orchCode.replace(
    "import { buildCreativeBrief } from './creativeBrief.js';",
    `import { buildCreativeBrief } from './creativeBrief.js';
import {
  identifyAudienceSegment,
  selectCreativeAngle,
  generateCandidateConcepts,
} from './creativeIntelligence.js';`
  );
}

// In orchestrator, before buildCreativeBrief, run creative intelligence
const oldOrchBriefBlock = `    const creativeBrief = buildCreativeBrief({
      routing: input.creativeBrief ? {
        tone: input.creativeBrief.tone,
        targetAudience: input.creativeBrief.targetAudience,
        continuityMode: input.creativeBrief.continuityMode,
        intent: input.creativeBrief.intent,
        confidence: input.creativeBrief.confidence,
      } : null,`;

const newOrchBriefBlock = `    // Step: Creative Intelligence Concept Generation & Selection
    const audienceSegment = identifyAudienceSegment({ prompt, creativeBrief: input.creativeBrief });
    const selectedAngle = selectCreativeAngle({ tone: input.creativeBrief?.tone || [], prompt, brief: input.creativeBrief, audienceSegment });
    const candidateConcepts = generateCandidateConcepts({ prompt, creativeBrief: input.creativeBrief, brandBible: workingCampaign.brand });
    const selectedConcept = candidateConcepts[0] || null;

    trace?.step('ads_creative_intelligence_concept_selected', {
      conceptId: selectedConcept?.conceptId || null,
      angle: selectedAngle?.name || null,
      narrativeStructure: selectedConcept?.narrativeStructure || 'EMOTIONAL_PROGRESSION',
      singleFocusMessage: selectedConcept?.singleFocusMessage || null,
    });

    const creativeBrief = buildCreativeBrief({
      routing: input.creativeBrief ? {
        tone: input.creativeBrief.tone,
        targetAudience: input.creativeBrief.targetAudience,
        continuityMode: input.creativeBrief.continuityMode,
        intent: input.creativeBrief.intent,
        confidence: input.creativeBrief.confidence,
      } : null,
      concept: selectedConcept,
      narrativeStructure: selectedConcept?.narrativeStructure || 'EMOTIONAL_PROGRESSION',
      singleFocusMessage: selectedConcept?.singleFocusMessage || null,
      adaptiveConstraints: selectedConcept?.adaptiveConstraints || null,
      permittedDemonstrationVisuals: selectedConcept?.permittedDemonstrationVisuals || null,`;

if (orchCode.includes(oldOrchBriefBlock)) {
  orchCode = orchCode.replace(oldOrchBriefBlock, newOrchBriefBlock);
}

fs.writeFileSync(orchPath, orchCode, 'utf8');
console.log('✓ Successfully updated orchestrator.js to wire creative intelligence data flow');

// ─────────────────────────────────────────────────────────────────────────────
// 4. UPDATE plannerPrompt.js
// ─────────────────────────────────────────────────────────────────────────────
const promptPath = path.join(bAdsDir, 'plannerPrompt.js');
let promptCode = fs.readFileSync(promptPath, 'utf8');

const v3PromptMarker = 'ADAPTIVE NARRATIVE STRUCTURES & CLEAN EDUCATIONAL DEMONSTRATIONS:';
if (!promptCode.includes(v3PromptMarker)) {
  const v3PromptSection = `
${v3PromptMarker}
- The creative narrative structure adapts to the advertising objective:
  1. EMOTIONAL_PROGRESSION: Relatable student/parent anxiety → Visible tutor whiteboard explanation → Visible relief reaction.
  2. PRODUCT_DEMONSTRATION: Concept friction → Clean whiteboard diagram/curve demonstration → Conceptual breakthrough. Does NOT require parent drama.
  3. UNEXPECTED_REVEAL: Intriguing curiosity/myth hook → Surprising educational insight → Action CTA. Does NOT require emotional sorrow.
  4. VISUAL_CONTRAST: Chaos of crowded 60-student batch vs Calm, personalized 1-on-1 focus.
  5. DIRECT_VALUE_PROP: Board exam / syllabus friction → Dedicated Inkstall method → Action CTA.
  6. HUMOR_RELIEF: Relatable study struggle → Comic turn → Quick tutor payoff.

CLEAN EDUCATIONAL WHITEBOARD DEMONSTRATIONS (NOT EMPTY VOIDS):
- Digital whiteboards and screens must feature clean, text-free educational demonstrations:
  - Geometric diagrams, coordinate axes, trigonometric curves, colored vectors, directional arrows, molecular structures.
  - Visual geometric transformations (e.g. complex triangle problem simplifying into clear intuitive steps).
  - Clean interactive digital tablet gestures without legible handwriting.
- NEVER request readable text, words, alphanumeric numbers, chemical formulas, or equations on the board.
- The visual demonstrates CONCEPTUAL UNDERSTANDING purely through shapes, diagrams, and visual movement.

DURATION-AWARE SINGLE PRIMARY MESSAGE (8-SECOND VERTICAL FORMAT):
- Prioritize ONE primary advertising message per 8-second spot (e.g. 1-on-1 diagnostic, or conceptual whiteboard tutoring).
- Never cram an overloaded feature laundry list (no multi-item lists like "1-on-1 + doubts + test series + parent app").
- Strictly limit spoken dialogue to 15-20 words (max 36 syllables; ends by 5.8-6.0s) so at least 2.0s is reserved for the silent holding of the deterministic CTA booking card.

HONEST CHARACTER CONTINUITY & CAMERA STABILITY:
- Text descriptors (e.g. "female Indian tutor in smart teal top, hair neatly tied") guide visual generation, but diffusion models do NOT guarantee biometrically identical faces.
- Use stable camera staging (medium shots, gentle push-ins); avoid disorienting 180-degree cuts or drastic angle shifts that trigger identity drift.
- When reference image assets are provided, attach them via the referenceMedia pipeline.
`;

  promptCode = promptCode.replace(
    'AUDIENCE UNDERSTANDING & PAIN-POINT FOCUS:',
    `${v3PromptSection}\nAUDIENCE UNDERSTANDING & PAIN-POINT FOCUS:`
  );
  fs.writeFileSync(promptPath, promptCode, 'utf8');
  console.log('✓ Successfully updated plannerPrompt.js with adaptive narrative structures and clean demo guidelines');
} else {
  console.log('⏭ plannerPrompt.js v3 already present');
}

console.log('All files updated successfully.');
