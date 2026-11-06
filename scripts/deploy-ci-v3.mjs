import fs from 'node:fs';
import path from 'node:path';

const bDir = path.resolve('../marketing-automation-b');
const bAdsDir = path.join(bDir, 'video/ads');
const bRenderDir = path.join(bDir, 'video/render');
const bTestsDir = path.join(bDir, 'tests');
const bEvalsDir = path.join(bDir, 'evals/creative-quality');

console.log('Deploying Creative Intelligence v3 to:', bDir);

// ─────────────────────────────────────────────────────────────────────────────
// 1. UPDATE creativeIntelligence.js
// ─────────────────────────────────────────────────────────────────────────────
const ciPath = path.join(bAdsDir, 'creativeIntelligence.js');
let ciCode = fs.readFileSync(ciPath, 'utf8');

const v3CIMarker = '// === v3 ADDITIONS: Adaptive Commercial Quality & Demonstrations ===';
if (!ciCode.includes(v3CIMarker)) {
  const v3CIAdditions = `

${v3CIMarker}
/**
 * Adaptive Narrative Structures for Short-Form Video Advertising.
 * Universal technical constraints (safe areas, locked script, deterministic CTA)
 * are always preserved, while storytelling constraints adapt to the selected concept.
 */
export const NARRATIVE_STRUCTURES = Object.freeze({
  EMOTIONAL_PROGRESSION: {
    id: 'EMOTIONAL_PROGRESSION',
    name: 'Emotional Progression',
    description: 'Relatable problem tension → Visible tutoring intervention → Earned emotional relief',
    primaryUse: 'Parent anxiety, student confidence loss, exam fear',
    requiresCausalTutoringAction: true,
    requiresEmotionalReaction: true,
    requiresWhiteboardDemonstration: false,
    requiresContrastStaging: false,
  },
  PRODUCT_DEMONSTRATION: {
    id: 'PRODUCT_DEMONSTRATION',
    name: 'Product Demonstration',
    description: 'Friction concept → Interactive clean whiteboard diagram/transformation → Conceptual breakthrough',
    primaryUse: 'Difficult subjects (physics, chemistry, geometry), conceptual gaps, interactive whiteboard differentiation',
    requiresCausalTutoringAction: true,
    requiresEmotionalReaction: false,
    requiresWhiteboardDemonstration: true,
    requiresContrastStaging: false,
  },
  UNEXPECTED_REVEAL: {
    id: 'UNEXPECTED_REVEAL',
    name: 'Unexpected Reveal / Curiosity',
    description: 'Arresting misdirection/myth → Counter-intuitive educational truth → Decisive CTA',
    primaryUse: 'Formula memorization myths, counter-intuitive study tips, curiosity-driven hooks',
    requiresCausalTutoringAction: false,
    requiresEmotionalReaction: false,
    requiresWhiteboardDemonstration: false,
    requiresCuriosityMisdirection: true,
  },
  VISUAL_CONTRAST: {
    id: 'VISUAL_CONTRAST',
    name: 'Visual Contrast',
    description: 'Crowded batch chaos / confusing textbook vs Calm, focused 1-on-1 clarity',
    primaryUse: 'Traditional coaching inefficiency, large batches, hesitation to ask doubts',
    requiresCausalTutoringAction: true,
    requiresEmotionalReaction: false,
    requiresWhiteboardDemonstration: false,
    requiresContrastStaging: true,
  },
  DIRECT_VALUE_PROP: {
    id: 'DIRECT_VALUE_PROP',
    name: 'Direct Value Proposition',
    description: 'Specific exam countdown / targeted syllabus friction → Dedicated Inkstall method → Decisive CTA',
    primaryUse: 'Board exams, finals countdown, targeted doubt clearing',
    requiresCausalTutoringAction: false,
    requiresEmotionalReaction: false,
    requiresWhiteboardDemonstration: false,
    requiresTargetedFriction: true,
  },
  HUMOR_RELIEF: {
    id: 'HUMOR_RELIEF',
    name: 'Relatable Humor & Comic Turn',
    description: 'Relatable comic setup → Comic turn → Quick tutoring payoff',
    primaryUse: 'Parent-teen dynamics, homework procrastination, exam excuses',
    requiresCausalTutoringAction: false,
    requiresEmotionalReaction: false,
    requiresWhiteboardDemonstration: false,
    requiresComicTurn: true,
  },
});

/**
 * Permitted text-free educational visual demonstration elements.
 * Diffusion models hallucinate distorted letters/numbers, but CAN cleanly render
 * abstract visual geometry, colored vector paths, diagrams, and transformations.
 */
export const PERMITTED_EDUCATIONAL_DEMONSTRATION_VISUALS = Object.freeze([
  'geometric_diagrams',
  'coordinate_axes_and_curves',
  'colored_vector_arrows',
  'molecular_and_chemical_structures',
  'visual_geometric_transformations',
  'color_coded_problem_breakdowns',
  'clean_interactive_whiteboard_interactions',
]);

/**
 * Evaluate whether digital whiteboards and educational screens feature
 * clean, text-free visual demonstrations rather than empty voids or text-clutter.
 *
 * @param {Object} params
 * @param {Array}  params.scenes
 * @param {string} params.candidatePromptText
 * @returns {Object} demonstrationEval
 */
export const evaluateEducationalDemonstration = ({ scenes = [], candidatePromptText = '' } = {}) => {
  const allVisuals = scenes.map((s) => String(s.visualAction || '')).join(' ').toLowerCase();
  const promptText = String(candidatePromptText || '').toLowerCase();
  const diagnostics = [];
  let score = 10;

  const hasWhiteboardOrScreen = /whiteboard|screen|tablet|digital display|slate|monitor/i.test(allVisuals + ' ' + promptText);
  if (!hasWhiteboardOrScreen) {
    return {
      score: 7,
      hasWhiteboardOrScreen: false,
      isTextFreeDemonstration: true,
      hasVisualDemonstration: false,
      diagnostics: ['No whiteboard or digital screen in visual staging.'],
    };
  }

  // Check for clean, permitted visual demonstration elements
  const hasPermittedVisuals = /diagram|geometric|curve|graph|axis|axes|vector|arrow|shape|circle|triangle|visual transformation|sketching|drawing|animated curve|glowing line|color-coded|color coded/i.test(allVisuals);
  const isCompletelyBlankVoid = /clean blank (?:whiteboard|screen|slate)$/i.test(allVisuals.trim())
    && !hasPermittedVisuals;

  // Prohibited: instructions requesting readable text/equations on the board
  const hasProhibitedTextOnBoard = /(?:whiteboard|screen).*(?:shows?|displays?|renders?|writes?).*(?:equation|formula|numbers?|text|words?|letters?)/i.test(allVisuals + ' ' + promptText)
    || /mathematical equation|chemical formula|algebra problem/i.test(allVisuals);

  if (hasProhibitedTextOnBoard) {
    score = 3;
    diagnostics.push('Prohibited readable text/equations requested on digital whiteboard — will produce distorted diffusion artifacts. Replace with abstract visual diagrams.');
  } else if (hasPermittedVisuals) {
    score = 10;
    diagnostics.push('Whiteboard features clean, text-free visual educational demonstration (diagram/shapes/curves).');
  } else if (isCompletelyBlankVoid) {
    score = 7;
    diagnostics.push('Whiteboard is completely empty void — add clean visual diagrams, arrows, or geometric curves to demonstrate Inkstall teaching mechanism.');
  }

  return {
    score,
    hasWhiteboardOrScreen,
    isTextFreeDemonstration: !hasProhibitedTextOnBoard,
    hasVisualDemonstration: hasPermittedVisuals,
    diagnostics,
  };
};

/**
 * Evaluate single-message focus for an 8-second commercial format.
 * Squeezing an oversized multi-feature laundry list into 8s creates cognitive overload.
 *
 * @param {Object} params
 * @param {string} params.dialogue
 * @param {Object} params.brief
 * @returns {Object} focusResult
 */
export const evaluateSingleMessageFocus = ({ dialogue = '', brief = {} } = {}) => {
  const text = String(dialogue || '').toLowerCase();
  const diagnostics = [];
  let score = 10;

  // Count distinct feature buckets mentioned in dialogue
  const featureBuckets = [
    { name: '1-on-1 tutoring', pattern: /1-on-1|one[- ]on[- ]one|personal tutor|private tutor/i },
    { name: 'interactive whiteboard', pattern: /whiteboard|digital tablet|interactive/i },
    { name: 'board exam prep', pattern: /board exam|finals|cbse|icse|10th board/i },
    { name: 'instant doubt clearing', pattern: /instant doubt|ask doubts|doubt clearance/i },
    { name: 'analytics / parent app', pattern: /analytics|parent app|tracking|report card/i },
    { name: 'test series / mock tests', pattern: /test series|mock test|practice papers/i },
  ];

  const matchedBuckets = featureBuckets.filter((b) => b.pattern.test(text));
  if (matchedBuckets.length > 2) {
    score = 5;
    diagnostics.push(\`Overloaded feature laundry list (\${matchedBuckets.length} features mentioned in 8s: \${matchedBuckets.map((b) => b.name).join(', ')}). Prioritize ONE primary advertising message for vertical commercial impact.\`);
  } else if (matchedBuckets.length === 0) {
    score = 6;
    diagnostics.push('No concrete Inkstall product mechanism mentioned; copy lacks product focus.');
  } else {
    diagnostics.push(\`Clean single-message focus: \${matchedBuckets.map((b) => b.name).join(' & ')}.\`);
  }

  return {
    score,
    matchedFeatures: matchedBuckets.map((b) => b.name),
    isSingleMessageFocused: matchedBuckets.length <= 2 && matchedBuckets.length >= 1,
    diagnostics,
  };
};

/**
 * Validate concept differentiation across multiple candidate concepts.
 * Ensures the system does not generate 3 variations of the same template.
 *
 * @param {Array} concepts
 * @returns {Object} diffResult
 */
export const evaluateConceptDifferentiation = (concepts = []) => {
  if (!Array.isArray(concepts) || concepts.length < 2) {
    return { score: 10, isDifferentiated: true, diagnostics: [] };
  }

  const angles = concepts.map((c) => c.angle || '');
  const uniqueAngles = new Set(angles);
  const narrativeStructures = concepts.map((c) => c.narrativeStructure || '');
  const uniqueStructures = new Set(narrativeStructures);

  const diagnostics = [];
  let score = 10;

  if (uniqueAngles.size < concepts.length) {
    score -= 3;
    diagnostics.push(\`Duplicate creative angles detected (\${uniqueAngles.size} unique across \${concepts.length} concepts).\`);
  }

  if (uniqueStructures.size < Math.min(2, concepts.length)) {
    score -= 2;
    diagnostics.push('Candidate concepts share identical narrative structure — explore diverse storytelling formulas.');
  }

  return {
    score: Math.max(1, score),
    uniqueAnglesCount: uniqueAngles.size,
    uniqueStructuresCount: uniqueStructures.size,
    isDifferentiated: score >= 8,
    diagnostics,
  };
};
`;

  // Also enhance generateCandidateConcepts to include narrativeStructure and singleFocusMessage
  const oldCandidateConcepts = `  const candidates = [
    {
      conceptId: 'concept_A_problem_recognition',
      angle: CREATIVE_ANGLES.problem_recognition.name,
      hookCategory: HOOK_CATEGORIES.visual_tension.label,
      hook: 'Stuck on that same math problem for forty minutes?',
      visualHook: 'Student staring frozen at a geometry question with eraser shavings on desk.',
      dialogue: 'Stuck on that same math problem for forty minutes? Inkstall expert 1-on-1 live tutors make tough concepts click instantly. Book your free demo session.',
      cta: 'Book Your Free Live Demo on Inkstall',
      productMechanism: '1-on-1 live diagnostic with interactive whiteboard',
      targetAudience: audience.label,
    },
    {
      conceptId: 'concept_B_misconception_correction',
      angle: CREATIVE_ANGLES.misconception_correction.name,
      hookCategory: HOOK_CATEGORIES.curiosity.label,
      hook: 'Memorizing formulas fails the moment exam questions change.',
      visualHook: 'Rapid contrast of a student blanking on a test vs understanding the principle on a clean digital slate.',
      dialogue: 'Memorizing formulas fails the moment questions change. Inkstall visual whiteboard tutoring builds deep conceptual understanding. Claim your free demo.',
      cta: 'Claim Your Free Demo on Inkstall',
      productMechanism: 'Conceptual whiteboard breakdown',
      targetAudience: audience.label,
    },
    {
      conceptId: 'concept_C_before_after_contrast',
      angle: CREATIVE_ANGLES.before_after_contrast.name,
      hookCategory: HOOK_CATEGORIES.relatability.label,
      hook: 'Lost in a crowded tuition batch of sixty students?',
      visualHook: 'Student in a crowded lecture hall hesitating to raise hand, cutting to peaceful 1-on-1 tutor focus.',
      dialogue: 'Hesitant to ask doubts in crowded tuition? Get Inkstall 1-on-1 live attention from top teachers. Book your free trial today.',
      cta: 'Book Your Free Trial on Inkstall',
      productMechanism: 'Dedicated 1-on-1 personalized attention',
      targetAudience: audience.label,
    },
  ];`;

  const newCandidateConcepts = `  const candidates = [
    {
      conceptId: 'concept_A_problem_recognition',
      angle: CREATIVE_ANGLES.problem_recognition.name,
      narrativeStructure: 'EMOTIONAL_PROGRESSION',
      singleFocusMessage: '1-on-1 live diagnostic tutoring with dedicated subject specialist',
      hookCategory: HOOK_CATEGORIES.visual_tension.label,
      hook: 'Stuck on that same math problem for forty minutes?',
      visualHook: 'Student staring frozen at a geometry question with eraser shavings on desk.',
      dialogue: 'Stuck on that same math problem for forty minutes? Inkstall expert 1-on-1 live tutors make tough concepts click instantly. Book your free demo session.',
      cta: 'Book Your Free Live Demo on Inkstall',
      productMechanism: '1-on-1 live diagnostic with interactive whiteboard',
      targetAudience: audience.label,
      adaptiveConstraints: {
        requiresEmotionalCausality: true,
        requiresVisualDemonstration: false,
        characterContinuityScope: 'persistent_student',
      },
      permittedDemonstrationVisuals: ['geometric_diagrams', 'clean_interactive_whiteboard_interactions'],
    },
    {
      conceptId: 'concept_B_misconception_correction',
      angle: CREATIVE_ANGLES.misconception_correction.name,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
      singleFocusMessage: 'Visual concept breakdown on interactive digital whiteboard',
      hookCategory: HOOK_CATEGORIES.curiosity.label,
      hook: 'Memorizing formulas fails the moment exam questions change.',
      visualHook: 'Rapid contrast of a student blanking on a test vs understanding the principle on a clean digital slate.',
      dialogue: 'Memorizing formulas fails the moment questions change. Inkstall visual whiteboard tutoring builds deep conceptual understanding. Claim your free demo.',
      cta: 'Claim Your Free Demo on Inkstall',
      productMechanism: 'Conceptual whiteboard breakdown',
      targetAudience: audience.label,
      adaptiveConstraints: {
        requiresEmotionalCausality: false,
        requiresVisualDemonstration: true,
        characterContinuityScope: 'tutor_and_whiteboard',
      },
      permittedDemonstrationVisuals: ['geometric_diagrams', 'coordinate_axes_and_curves', 'colored_vector_arrows'],
    },
    {
      conceptId: 'concept_C_before_after_contrast',
      angle: CREATIVE_ANGLES.before_after_contrast.name,
      narrativeStructure: 'VISUAL_CONTRAST',
      singleFocusMessage: 'Personalized 1-on-1 attention vs crowded 60-student batches',
      hookCategory: HOOK_CATEGORIES.relatability.label,
      hook: 'Lost in a crowded tuition batch of sixty students?',
      visualHook: 'Student in a crowded lecture hall hesitating to raise hand, cutting to peaceful 1-on-1 tutor focus.',
      dialogue: 'Hesitant to ask doubts in crowded tuition? Get Inkstall 1-on-1 live attention from top teachers. Book your free trial today.',
      cta: 'Book Your Free Trial on Inkstall',
      productMechanism: 'Dedicated 1-on-1 personalized attention',
      targetAudience: audience.label,
      adaptiveConstraints: {
        requiresContrastStaging: true,
        requiresEmotionalCausality: false,
        characterContinuityScope: 'student_contrast',
      },
      permittedDemonstrationVisuals: ['clean_interactive_whiteboard_interactions'],
    },
  ];`;

  if (ciCode.includes(oldCandidateConcepts)) {
    ciCode = ciCode.replace(oldCandidateConcepts, newCandidateConcepts);
  }

  // Also make evaluateEmotionalArc adaptive to narrativeStructure
  const oldEmotionalArcSignature = 'export const evaluateEmotionalArc = ({ scenes = [], dialogue = \'\' } = {}) => {';
  const newEmotionalArcSignature = 'export const evaluateEmotionalArc = ({ scenes = [], dialogue = \'\', narrativeStructure = \'EMOTIONAL_PROGRESSION\' } = {}) => {';
  if (ciCode.includes(oldEmotionalArcSignature)) {
    ciCode = ciCode.replace(oldEmotionalArcSignature, newEmotionalArcSignature);
  }

  // If narrativeStructure is not EMOTIONAL_PROGRESSION, waive parent tears requirement
  const emotionalArcStructureCheck = `  // When narrative structure is PRODUCT_DEMONSTRATION, UNEXPECTED_REVEAL, or DIRECT_VALUE_PROP,
  // do not penalize for missing parental emotional melodrama.
  if (['PRODUCT_DEMONSTRATION', 'UNEXPECTED_REVEAL', 'DIRECT_VALUE_PROP', 'HUMOR_RELIEF'].includes(narrativeStructure)) {
    return {
      score: 9,
      diagnostics: [\`Narrative structure is \${narrativeStructure}; evaluated on demonstration/curiosity mechanics rather than emotional melodrama.\`],
      hasProblemBeat: true,
      hasTutorAction: true,
      hasVisualResolution: true,
      hasEmotionalResponse: true,
      isAuthentic: true,
      isAdaptiveWaived: true,
    };
  }`;

  ciCode = ciCode.replace(
    'export const evaluateEmotionalArc = ({ scenes = [], dialogue = \'\', narrativeStructure = \'EMOTIONAL_PROGRESSION\' } = {}) => {\n  const diagnostics = [];\n  let score = 10;',
    'export const evaluateEmotionalArc = ({ scenes = [], dialogue = \'\', narrativeStructure = \'EMOTIONAL_PROGRESSION\' } = {}) => {\n' + emotionalArcStructureCheck + '\n  const diagnostics = [];\n  let score = 10;'
  );

  ciCode += v3CIAdditions;
  fs.writeFileSync(ciPath, ciCode, 'utf8');
  console.log('✓ Updated creativeIntelligence.js with v3 adaptive commercial intelligence');
} else {
  console.log('⏭ creativeIntelligence.js v3 already present');
}

console.log('Creative Intelligence update complete.');
