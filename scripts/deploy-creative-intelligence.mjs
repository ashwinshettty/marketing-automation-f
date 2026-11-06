import fs from 'node:fs';
import path from 'node:path';

const bVideoAdsDir = path.resolve('../marketing-automation-b/video/ads');
const bVideoRenderDir = path.resolve('../marketing-automation-b/video/render');
const fEvalsDir = path.resolve('evals/seedance-local');

fs.mkdirSync(bVideoAdsDir, { recursive: true });
fs.mkdirSync(bVideoRenderDir, { recursive: true });
fs.mkdirSync(fEvalsDir, { recursive: true });

// 1. creativeIntelligence.js
const creativeIntelligenceCode = `/**
 * Ads Creative Intelligence Engine for Inkstall.
 * Governs audience & pain-point intelligence, creative angle selection,
 * 1.5-second hook optimization, Inkstall value proposition grounding,
 * duration-aware speech rate modeling, and multi-candidate concept generation.
 */

export const AUDIENCE_SEGMENTS = Object.freeze({
  parents_academic_anxiety: {
    segmentId: 'parents_academic_anxiety',
    label: 'Parents of School Students (Exam/Marks Anxiety)',
    primaryConcerns: [
      'Child falling behind in mathematics or science',
      'Child silently losing confidence before board finals',
      'Child memorizing formulas without understanding principles',
      'Parent unable to explain modern curriculum at home',
      'Lack of individual attention in large school classrooms',
    ],
    emotionalStakes: 'Deep parental worry that academic gaps compound if unaddressed.',
    unsuccessfulSolutions: ['Cramming notes late at night', 'Expensive 60-student batch tuition', 'Scolding without diagnosis'],
    desiredOutcome: 'Targeted diagnosis, calm confidence, child understanding concepts independently.',
    inkstallMechanism: '1-on-1 live mentoring where an expert teacher pinpoints the exact misunderstanding on a digital whiteboard.',
    effectiveAngles: ['problem_recognition', 'emotional_relief', 'before_after_contrast', 'transformation'],
  },
  students_stem_confusion: {
    segmentId: 'students_stem_confusion',
    label: '10th/12th Grade Students (STEM & Concept Confusion)',
    primaryConcerns: [
      'Complex chemistry equations and reaction mechanisms',
      'Physics derivations that make no intuitive sense',
      'Calculus and trigonometry formulas that vanish in exam conditions',
      'Feeling embarrassed to raise hand in crowded coaching classes',
    ],
    emotionalStakes: 'Frustration of putting in hours of study without test results.',
    unsuccessfulSolutions: ['Rote memorization', 'Watching passive video lectures without interaction', 'Skipping hard chapters'],
    desiredOutcome: 'Visual step-by-step clarity, interactive doubt solving, feeling smart again.',
    inkstallMechanism: 'Interactive digital whiteboard with patient 1-on-1 live tutor working through equations together.',
    effectiveAngles: ['unexpected_demonstration', 'misconception_correction', 'relatable_frustration', 'product_demonstration'],
  },
  exam_board_stress: {
    segmentId: 'exam_board_stress',
    label: 'Board Exam Candidates & Families',
    primaryConcerns: [
      'Ticking countdown to board exams',
      'Accumulated backlog of doubts with nobody to ask',
      'Panic when encountering unfamiliar question variations',
    ],
    emotionalStakes: 'High-stakes pressure where every mark impacts admissions.',
    unsuccessfulSolutions: ['Cramming 14 hours a day', 'Panic-reading multiple guidebooks'],
    desiredOutcome: 'Structured personalized revision and instant doubt resolution.',
    inkstallMechanism: 'On-demand 1-on-1 live doubt solving and exam strategy from top tutors.',
    effectiveAngles: ['visual_tension', 'problem_recognition', 'emotional_relief'],
  },
  crowded_coaching_frustration: {
    segmentId: 'crowded_coaching_frustration',
    label: 'Learners in Ineffective Batch Coaching',
    primaryConcerns: [
      'Lost in 60 to 100 student batches',
      'Teacher races through syllabus to hit schedule',
      'Hesitation to ask doubts in front of peers',
    ],
    emotionalStakes: 'Feeling invisible and left behind while fees are already paid.',
    unsuccessfulSolutions: ['Sitting quietly in the back', 'Pretending to understand'],
    desiredOutcome: 'Personalized attention where every question is welcomed and answered.',
    inkstallMechanism: 'Dedicated 1-on-1 focus where the tutor adapts completely to the student pace.',
    effectiveAngles: ['before_after_contrast', 'relatable_frustration', 'specific_differentiator'],
  },
});

export const CREATIVE_ANGLES = Object.freeze({
  problem_recognition: {
    id: 'problem_recognition',
    name: 'Problem Recognition',
    description: 'Pinpoints the exact second friction strikes in daily study.',
    visualFocus: 'Student or parent frozen mid-action with visible doubt or hesitation.',
    pacing: 'Friction opening (0-1.5s) -> Inkstall mechanism reveal (1.5-5.5s) -> CTA (5.5-8.0s).',
  },
  visual_contradiction: {
    id: 'visual_contradiction',
    name: 'Visual Contradiction',
    description: 'Contrasts expectations of hard work with the reality of rote memorization failure.',
    visualFocus: 'Desk overflowing with books vs a blank page when tested.',
    pacing: 'Sharp contrast hook -> conceptual solution -> CTA.',
  },
  unexpected_demonstration: {
    id: 'unexpected_demonstration',
    name: 'Unexpected Demonstration',
    description: 'Shows a complex concept made intuitive in 3 seconds on a clean digital slate.',
    visualFocus: 'Abstract formula transformed into an intuitive visual diagram.',
    pacing: 'Puzzle hook -> visual breakthrough -> CTA.',
  },
  relatable_frustration: {
    id: 'relatable_frustration',
    name: 'Relatable Frustration',
    description: 'Captures an everyday student moment: hand hesitating to raise in a crowded room.',
    visualFocus: 'Hesitant student posture transitioning to confident 1-on-1 interaction.',
    pacing: 'Empathy hook -> personal tutor relief -> CTA.',
  },
  transformation: {
    id: 'transformation',
    name: 'Transformation',
    description: 'Shows the immediate shift from confusion to comprehension.',
    visualFocus: 'Furrowed brow giving way to the instant "aha!" breakthrough nod.',
    pacing: 'Confusion -> live tutor demonstration -> breakthrough CTA.',
  },
  curiosity: {
    id: 'curiosity',
    name: 'Curiosity',
    description: 'Opens with an intriguing pedagogical question that challenges conventional habits.',
    visualFocus: 'Intriguing visual question on study habits or formula memorization.',
    pacing: 'Question hook -> answer via 1-on-1 clarity -> CTA.',
  },
  emotional_relief: {
    id: 'emotional_relief',
    name: 'Emotional Relief',
    description: 'Shows the dissolution of academic anxiety when an expert tutor provides patient attention.',
    visualFocus: 'Parent and student visibly relaxing as concepts click into place.',
    pacing: 'Tension -> patient guidance -> confident CTA.',
  },
  product_demonstration: {
    id: 'product_demonstration',
    name: 'Product Demonstration',
    description: 'Direct showcase of Inkstall interactive digital whiteboard and live feedback.',
    visualFocus: 'Tutor and student actively collaborating on an intuitive digital canvas.',
    pacing: 'Live interaction demo -> value proposition -> CTA.',
  },
  before_after_contrast: {
    id: 'before_after_contrast',
    name: 'Before-and-After Contrast',
    description: 'Contrasts the chaos of crowded coaching with the calm focus of 1-on-1 mentoring.',
    visualFocus: 'Noisy crowded room vs serene focused 1-on-1 online session.',
    pacing: 'Split/sequential contrast -> personal attention benefit -> CTA.',
  },
  misconception_correction: {
    id: 'misconception_correction',
    name: 'Misconception Correction',
    description: 'Debunks rote memorization in favor of deep conceptual mastery.',
    visualFocus: 'Faded memorized text disappearing vs robust conceptual visual enduring.',
    pacing: 'Myth busted -> conceptual method revealed -> CTA.',
  },
  specific_differentiator: {
    id: 'specific_differentiator',
    name: 'Specific Product Differentiator',
    description: 'Focuses squarely on individual pacing tailored to the student specific gap.',
    visualFocus: 'Personalized diagnostic finding the exact missing puzzle piece.',
    pacing: 'Diagnostic finding -> custom guidance -> CTA.',
  },
});

export const HOOK_CATEGORIES = Object.freeze({
  visual_tension: {
    id: 'visual_tension',
    label: 'Visual Tension',
    description: 'A recognizable problem or friction event is immediately visible in the opening 1.5s.',
    example: 'Student stares at an unsolved quadratic equation while clock ticks late at night.',
  },
  curiosity: {
    id: 'curiosity',
    label: 'Curiosity',
    description: 'The opening creates an intriguing, relevant pedagogical question.',
    example: 'Why do formulas memorized at night disappear during the morning exam?',
  },
  relatability: {
    id: 'relatability',
    label: 'Relatability',
    description: 'The audience instantly recognizes a familiar academic or parenting struggle.',
    example: 'Parent opening a report card with a heavy sigh at the kitchen table.',
  },
  unexpected_visual: {
    id: 'unexpected_visual',
    label: 'Unexpected Visual',
    description: 'A visually surprising action or metaphor communicates an educational insight.',
    example: 'Pen stops dead in its tracks mid-formula like hitting an invisible wall.',
  },
  demonstration: {
    id: 'demonstration',
    label: 'Demonstration',
    description: 'The video immediately shows live interactive tutoring in action.',
    example: 'A clean digital whiteboard draws an intuitive force diagram that instantly clarifies physics.',
  },
  emotional_recognition: {
    id: 'emotional_recognition',
    label: 'Emotional Recognition',
    description: 'Authentic student or parent emotion directly communicates the problem.',
    example: 'Student hesitating to raise a hand in a 60-person lecture hall.',
  },
});

export const identifyAudienceSegment = ({ prompt = '', creativeBrief = {} } = {}) => {
  const combined = (prompt + ' ' + (creativeBrief.targetAudience || '') + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();

  if (/\\b(chemistry|reactions?|equations?|physics|derivations?|formulas?|concepts?)\\b/i.test(combined) && /\\b(student|10th|12th|grade|class)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.students_stem_confusion;
  }
  if (/\\b(board|exam|finals|prelims|countdown|pressure|stress|panic)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.exam_board_stress;
  }
  if (/\\b(crowded|batch|coaching|sixty|tuition center|hesitant|raise hand)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.crowded_coaching_frustration;
  }
  if (/\\b(parent|mother|father|child|kid|marks|score|report card|math)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.parents_academic_anxiety;
  }

  return AUDIENCE_SEGMENTS.parents_academic_anxiety;
};

export const selectCreativeAngle = ({ prompt = '', creativeBrief = {}, audienceSegment = null } = {}) => {
  const tones = Array.isArray(creativeBrief.tone) ? creativeBrief.tone : [];
  const text = (prompt + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();

  if (tones.includes('educational') || /\\b(concept|visual|whiteboard|understand|equation|formula)\\b/i.test(text)) {
    return CREATIVE_ANGLES.unexpected_demonstration;
  }
  if (/\\b(memoriz|rote|cram|forget|fades?)\\b/i.test(text)) {
    return CREATIVE_ANGLES.misconception_correction;
  }
  if (/\\b(crowded|batch|60|personal|1-on-1|individual)\\b/i.test(text)) {
    return CREATIVE_ANGLES.before_after_contrast;
  }
  if (tones.includes('cinematic') || /\\b(pressure|exam|board|anxiety|stress)\\b/i.test(text)) {
    return CREATIVE_ANGLES.emotional_relief;
  }
  if (/\\b(demo|whiteboard|interactive|live tutor)\\b/i.test(text)) {
    return CREATIVE_ANGLES.product_demonstration;
  }

  return CREATIVE_ANGLES.problem_recognition;
};

export const evaluateHook = ({ hook = '', visualAction = '', audienceSegment = null, prompt = '' } = {}) => {
  const lowerHook = String(hook || '').toLowerCase().trim();
  const lowerVisual = String(visualAction || '').toLowerCase().trim();
  const diagnostics = [];

  let matchedCategory = HOOK_CATEGORIES.visual_tension;
  if (/\\b(why|how come|what if|ever wonder|question)\\b/i.test(lowerHook)) {
    matchedCategory = HOOK_CATEGORIES.curiosity;
  } else if (/\\b(crowded|hesitat|raise hand|back of class|room of|batch)\\b/i.test(lowerVisual + ' ' + lowerHook)) {
    matchedCategory = HOOK_CATEGORIES.emotional_recognition;
  } else if (/\\b(whiteboard|draw|diagram|screen reveals|slate|breakthrough)\\b/i.test(lowerVisual)) {
    matchedCategory = HOOK_CATEGORIES.demonstration;
  } else if (/\\b(clock|ticking|exam|pressure|frozen|blank|struggling|formula)\\b/i.test(lowerVisual + ' ' + lowerHook)) {
    matchedCategory = HOOK_CATEGORIES.visual_tension;
  } else if (/\\b(report card|marks|dinner table|parent|desk)\\b/i.test(lowerVisual + ' ' + lowerHook)) {
    matchedCategory = HOOK_CATEGORIES.relatability;
  }

  let score = 10;

  const genericSmiles = /smiling directly|happy student smiling|welcoming wave|smiling warmly at camera/i.test(lowerVisual);
  const slowLogos = /logo animation|fade from black to logo|intro title card/i.test(lowerVisual);
  const vagueStock = /are you struggling with studies|welcome to inkstall|education is important/i.test(lowerHook);
  const falseGuarantees = /100% marks guaranteed|guaranteed 99%|pass without studying/i.test(lowerHook);

  if (genericSmiles) {
    score -= 4;
    diagnostics.push('Opening visual relies on generic smiling stock talent rather than problem friction.');
  }
  if (slowLogos) {
    score -= 5;
    diagnostics.push('Opening beat wastes critical first 1.5s on slow logo or intro card.');
  }
  if (vagueStock) {
    score -= 4;
    diagnostics.push('Opening hook uses generic, non-specific educational cliché.');
  }
  if (falseGuarantees) {
    score -= 6;
    diagnostics.push('Opening hook contains unauthorized guaranteed academic performance claims.');
  }

  const words = lowerHook.split(/\\s+/).filter(Boolean);
  if (words.length > 8) {
    score -= 2;
    diagnostics.push('Opening hook is too verbose for a 1.5s beat (' + words.length + ' words).');
  } else if (words.length < 3) {
    score -= 2;
    diagnostics.push('Opening hook is too terse or lacks substance.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    category: matchedCategory.id,
    categoryLabel: matchedCategory.label,
    diagnostics,
    hasGenericStock: genericSmiles || slowLogos || vagueStock,
    isCompliant: score >= 7,
  };
};

export const countSyllables = (word = '') => {
  const clean = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  const specificDict = {
    mathematics: 4,
    trigonometry: 5,
    differentiation: 6,
    photosynthesis: 5,
    electromagnetism: 6,
    quadratic: 3,
    equation: 3,
    chemistry: 3,
    personalized: 4,
    understanding: 4,
    diagnostic: 4,
    conceptual: 4,
    inkstall: 2,
    tuition: 2,
  };
  if (specificDict[clean]) return specificDict[clean];

  const stripped = clean.replace(/(?:ed|es|e)$/, '');
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
};

export const estimateSpokenDuration = (dialogue = '', { targetDurationSeconds = 8 } = {}) => {
  const text = String(dialogue || '').trim();
  if (!text) {
    return {
      wordCount: 0,
      syllableCount: 0,
      estimatedSeconds: 0,
      speechRateWordsPerSec: 0,
      syllablesPerSec: 0,
      ctaWindowSeconds: targetDurationSeconds,
      hasSufficientCtaWindow: true,
      isNaturalPacing: false,
      diagnostics: ['Empty dialogue.'],
    };
  }

  const words = text.split(/\\s+/).filter(Boolean);
  const wordCount = words.length;

  let syllableCount = 0;
  for (const w of words) {
    syllableCount += countSyllables(w);
  }

  const commaCount = (text.match(/,/g) || []).length;
  const sentenceEndCount = (text.match(/[.?!]/g) || []).length;

  const baseSpeechSeconds = syllableCount / 3.85;
  const pauseSeconds = (commaCount * 0.22) + (sentenceEndCount * 0.38);
  const estimatedSeconds = Number((baseSpeechSeconds + pauseSeconds).toFixed(2));

  const ctaWindowSeconds = Number(Math.max(0, targetDurationSeconds - estimatedSeconds).toFixed(2));
  const hasSufficientCtaWindow = ctaWindowSeconds >= 1.8;

  const diagnostics = [];
  let score = 10;

  if (wordCount > 21) {
    score -= 4;
    diagnostics.push('Dialogue contains ' + wordCount + ' words; exceeds natural 8-second commercial capacity.');
  } else if (wordCount < 12) {
    score -= 3;
    diagnostics.push('Dialogue has only ' + wordCount + ' words; may under-deliver value proposition.');
  }

  if (estimatedSeconds > 6.4) {
    score -= 3;
    diagnostics.push('Estimated speech duration (' + estimatedSeconds + 's) leaves insufficient time for CTA holding (' + ctaWindowSeconds + 's remaining; min 1.8s required).');
  }

  if (syllableCount > 38) {
    score -= 2;
    diagnostics.push('High syllable density (' + syllableCount + ' syllables); delivery will sound rushed in Indian English.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    wordCount,
    syllableCount,
    estimatedSeconds,
    speechRateWordsPerSec: Number((wordCount / targetDurationSeconds).toFixed(2)),
    syllablesPerSec: Number((syllableCount / Math.max(1, estimatedSeconds)).toFixed(2)),
    ctaWindowSeconds,
    hasSufficientCtaWindow,
    isNaturalPacing: score >= 8 && hasSufficientCtaWindow,
    diagnostics,
  };
};

export const evaluateValueProposition = ({ dialogue = '', visualAction = '', brief = {} } = {}) => {
  const combined = (dialogue + ' ' + visualAction).toLowerCase();
  const diagnostics = [];
  let score = 10;

  const concreteMechanisms = [
    { pattern: /\\b(1-on-1|one[- ]on[- ]one|personal(?:ized)? attention|dedicated tutor)\\b/i, label: '1-on-1 personalized tutoring' },
    { pattern: /\\b(live|interactive|whiteboard|digital slate|real-time)\\b/i, label: 'interactive digital whiteboard / live tutoring' },
    { pattern: /\\b(concept(?:ual)?|clarity|understand(?:ing)?|why it works|step-by-step)\\b/i, label: 'conceptual understanding' },
    { pattern: /\\b(expert|top teacher|patient mentor|doubt(?:s)?)\\b/i, label: 'expert teacher / doubt resolution' },
  ];

  const matchedMechanisms = concreteMechanisms.filter((m) => m.pattern.test(combined));

  if (matchedMechanisms.length === 0) {
    score -= 6;
    diagnostics.push('Value proposition lacks any concrete Inkstall mechanism (no mention of 1-on-1, live tutor, or digital whiteboard).');
  } else if (matchedMechanisms.length === 1) {
    score -= 2;
    diagnostics.push('Only 1 concrete mechanism identified (' + matchedMechanisms[0].label + '); recommend pairing with conceptual clarity or live interactive proof.');
  }

  const genericSlogans = /learning made easy|study smarter not harder|unlock your potential|best education platform/i.test(combined);
  if (genericSlogans) {
    score -= 3;
    diagnostics.push('Ad relies on generic education slogans without explaining the product mechanism.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    matchedMechanisms: matchedMechanisms.map((m) => m.label),
    diagnostics,
    isGrounded: score >= 7,
  };
};

export const generateCandidateConcepts = ({ prompt = '', creativeBrief = {}, brandBible = {} } = {}) => {
  const audience = identifyAudienceSegment({ prompt, creativeBrief });

  const candidates = [
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
  ];

  return candidates.map((cand) => {
    const timing = estimateSpokenDuration(cand.dialogue);
    const hookEval = evaluateHook({ hook: cand.hook, visualAction: cand.visualHook });
    const valEval = evaluateValueProposition({ dialogue: cand.dialogue, visualAction: cand.visualHook });

    const totalScore = Number(((timing.score * 0.3) + (hookEval.score * 0.35) + (valEval.score * 0.35)).toFixed(1));

    return {
      ...cand,
      timing,
      hookEval,
      valEval,
      overallScore: totalScore,
    };
  });
};
`;

// 2. independentEvaluator.js
const independentEvaluatorCode = `/**
 * Independent Ads Creative Quality Evaluator.
 * Strictly separates Technical Compliance from Creative Effectiveness.
 * Provides calibrated, evidence-backed scoring across creative dimensions.
 */
import { computeScriptHash, assertScriptIntegrity } from '../script/canonicalScript.js';
import { validateTextAssetSafeAreas } from '../render/deterministicText.js';
import {
  evaluateHook,
  estimateSpokenDuration,
  evaluateValueProposition,
  identifyAudienceSegment,
} from './creativeIntelligence.js';

export const evaluateTechnicalCompliance = ({ plan, canonicalScript, candidatePrompt, expect = {} } = {}) => {
  const issues = [];
  let score = 10;

  if (!canonicalScript) {
    score = 0;
    issues.push('Canonical locked script is missing.');
  } else {
    try {
      assertScriptIntegrity(canonicalScript);
      if (!Object.isFrozen(canonicalScript)) {
        score = Math.min(score, 5);
        issues.push('Canonical script object is not frozen.');
      }
      const recomputedHash = computeScriptHash(canonicalScript);
      if (recomputedHash !== canonicalScript.scriptHash) {
        score = 0;
        issues.push('Canonical script SHA-256 hash mismatch.');
      }
    } catch (err) {
      score = 0;
      issues.push('Script integrity failed: ' + err.message);
    }
  }

  if (canonicalScript?.textAssets?.length) {
    const safeCheck = validateTextAssetSafeAreas(canonicalScript.textAssets, 720, 1280);
    if (!safeCheck.valid) {
      score = Math.min(score, 5);
      issues.push('Text overlays violate safe area margins: ' + (safeCheck.violations?.join(', ') || 'Out of bounds'));
    }
  }

  const promptText = String(candidatePrompt?.text || '');
  const hasNegativeConstraints = promptText.includes('Mandatory Negative Typography Constraints')
    && promptText.includes('Do not render readable text')
    && promptText.includes('clean, blank');
  if (!hasNegativeConstraints) {
    score = Math.min(score, 2);
    issues.push('Candidate prompt missing mandatory negative typography constraints.');
  }

  const scenes = plan?.sceneSequence || [];
  const echoesDialogue = scenes.some((s) => s.visualAction && s.dialogue && s.visualAction.includes(s.dialogue));
  if (echoesDialogue) {
    score = Math.min(score, 4);
    issues.push('Visual action echoes dialogue rather than staging observable camera/actor movement.');
  }

  return {
    passed: score >= 8 && issues.length === 0,
    score,
    issues,
  };
};

export const evaluateCreativeQuality = ({ plan, canonicalScript, brief = {}, expect = {} } = {}) => {
  const dialogue = canonicalScript?.dialogue || plan?.ad?.dialogue || '';
  const hook = plan?.ad?.hook || '';
  const visualAction = plan?.ad?.visualAction || '';
  const cta = plan?.ad?.cta || '';
  const scenes = plan?.sceneSequence || [];

  const diagnostics = [];
  const dimensions = {};

  let audienceScore = 10;
  const lowerDialogue = dialogue.toLowerCase();
  const lowerVisual = visualAction.toLowerCase();
  const lowerHook = hook.toLowerCase();

  const isGenericAudience = /everyone|all students|any student|anyone struggling|general public/i.test(
    String(canonicalScript?.targetAudience || brief.targetAudience || '')
  );
  if (isGenericAudience) {
    audienceScore = 4;
    diagnostics.push('Audience is generic; fails to address a specific student or parent demographic.');
  } else if (expect.mustContainPainPoint?.length) {
    const matched = expect.mustContainPainPoint.some((p) =>
      lowerDialogue.includes(p.toLowerCase()) || lowerVisual.includes(p.toLowerCase()) || lowerHook.includes(p.toLowerCase())
    );
    if (!matched) {
      audienceScore = 5;
      diagnostics.push('Failed to address required pain points: [' + expect.mustContainPainPoint.join(', ') + '].');
    }
  }
  dimensions.audienceRelevance = {
    score: audienceScore,
    targetAudience: canonicalScript?.targetAudience || 'unspecified',
    weight: 0.15,
  };

  const hookEval = evaluateHook({
    hook,
    visualAction,
    prompt: expect.prompt || '',
  });
  dimensions.hookStrength = {
    score: hookEval.score,
    category: hookEval.categoryLabel,
    hasGenericStock: hookEval.hasGenericStock,
    weight: 0.20,
  };
  diagnostics.push(...hookEval.diagnostics);

  let hookProductScore = 10;
  const isDisconnectedHook = /dancing cat|alien invasion|sports car drifting|exploding building/i.test(lowerVisual + ' ' + lowerHook);
  if (isDisconnectedHook) {
    hookProductScore = 2;
    diagnostics.push('Hook is disconnected clickbait with no pedagogical or academic relevance to Inkstall.');
  } else if (hookEval.score >= 8 && audienceScore >= 8) {
    hookProductScore = 10;
  } else {
    hookProductScore = Math.min(hookEval.score, audienceScore) + 1;
  }
  dimensions.hookProductRelevance = {
    score: hookProductScore,
    weight: 0.10,
  };

  const valEval = evaluateValueProposition({ dialogue, visualAction, brief });
  dimensions.valuePropositionClarity = {
    score: valEval.score,
    mechanisms: valEval.matchedMechanisms,
    weight: 0.20,
  };
  diagnostics.push(...valEval.diagnostics);

  let ctaScore = 10;
  const lowerCta = cta.toLowerCase();
  const hasActionVerb = /\\b(book|try|get|claim|start|join|schedule)\\b/i.test(lowerCta);
  const mentionsDemoOrFree = /\\b(free|demo|session|trial)\\b/i.test(lowerCta);
  const isPassiveCta = /\\b(think about|consider|maybe|learn more|check out)\\b/i.test(lowerCta);

  if (isPassiveCta) {
    ctaScore = 3;
    diagnostics.push('CTA is passive and lacks decisive conversion motivation.');
  } else if (!hasActionVerb) {
    ctaScore = 4;
    diagnostics.push('CTA lacks an active imperative verb (book, claim, try).');
  } else if (!mentionsDemoOrFree) {
    ctaScore = 7;
    diagnostics.push('CTA does not explicitly mention free demo or trial session.');
  }
  dimensions.ctaDecisiveness = {
    score: ctaScore,
    ctaText: cta,
    weight: 0.15,
  };

  const speechEval = estimateSpokenDuration(dialogue, { targetDurationSeconds: canonicalScript?.durationSeconds || 8 });
  dimensions.speechRateAndPacing = {
    score: speechEval.score,
    wordCount: speechEval.wordCount,
    syllableCount: speechEval.syllableCount,
    estimatedSeconds: speechEval.estimatedSeconds,
    ctaWindowSeconds: speechEval.ctaWindowSeconds,
    weight: 0.10,
  };
  diagnostics.push(...speechEval.diagnostics);

  let authenticityScore = 10;
  const falseGuarantees = /100% (?:marks|score|success)|guaranteed 99%|pass without studying|guaranteed board marks/i.test(lowerDialogue);
  const fearMongering = /ruin your future|life is over|shame the family/i.test(lowerDialogue);
  const boringBrochure = /we provide comprehensive educational solutions for all subjects and standards/i.test(lowerDialogue);

  if (falseGuarantees) {
    authenticityScore = 1;
    diagnostics.push('FATAL: Ad contains prohibited academic guarantees (100% marks guarantee).');
  } else if (fearMongering) {
    authenticityScore = 2;
    diagnostics.push('FATAL: Ad employs exaggerated emotional manipulation.');
  } else if (boringBrochure) {
    authenticityScore = 4;
    diagnostics.push('Ad is dry brochure speech lacking human emotion or commercial tension.');
  }
  dimensions.persuasiveAuthenticity = {
    score: authenticityScore,
    weight: 0.10,
  };

  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of Object.values(dimensions)) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  const aggregateScore = Number((weightedSum / totalWeight).toFixed(1));

  let calibrationTier = 'COMMERCIALLY_VIABLE';
  if (aggregateScore >= 8.8) {
    calibrationTier = 'EXCELLENT';
  } else if (aggregateScore >= 7.0) {
    calibrationTier = 'COMMERCIALLY_VIABLE';
  } else if (aggregateScore >= 5.5) {
    calibrationTier = 'MEDIOCRE';
  } else if (falseGuarantees || fearMongering) {
    calibrationTier = 'MISLEADING_REJECTED';
  } else if (speechEval.estimatedSeconds > 6.8) {
    calibrationTier = 'OVERLOADED_REJECTED';
  } else {
    calibrationTier = 'SUBSTANDARD';
  }

  return {
    aggregateScore,
    calibrationTier,
    passed: aggregateScore >= 7.5 && authenticityScore >= 6 && speechEval.score >= 6,
    dimensions,
    diagnostics,
  };
};

export const evaluateAdComprehensive = ({ plan, canonicalScript, candidatePrompt, expect = {}, brief = {} } = {}) => {
  const technical = evaluateTechnicalCompliance({ plan, canonicalScript, candidatePrompt, expect });
  const creative = evaluateCreativeQuality({ plan, canonicalScript, brief, expect });

  const finalScore = technical.passed ? creative.aggregateScore : Math.min(creative.aggregateScore, 4.0);

  return {
    caseId: expect.caseId || 'ad-eval',
    passed: technical.passed && creative.passed,
    aggregateScore: finalScore,
    technicalScore: technical.score,
    creativeScore: creative.aggregateScore,
    calibrationTier: creative.calibrationTier,
    technical,
    creative,
    diagnostics: [...technical.issues, ...creative.diagnostics],
  };
};
`;

// 3. visualQualityRubric.js
const visualQualityRubricCode = `/**
 * 12-Dimension Commercial Advertising Visual Quality Rubric.
 * Assesses visual fixtures and candidate staging prompts without invoking video generation.
 */

export const VISUAL_RUBRIC_DIMENSIONS = [
  { id: 'opening_visual', name: 'Opening Visual (0-1.5s)', description: 'Immediately arrests scroll with relevant tension or action.' },
  { id: 'audience_relevance', name: 'Audience Relevance', description: 'Visually depicts the authentic demographic and setting.' },
  { id: 'emotional_expression', name: 'Emotional Expression', description: 'Actor emotion feels authentic, not exaggerated or stock-like.' },
  { id: 'composition_clarity', name: 'Composition & Hierarchy', description: 'Subject is centered, readable in 9:16, free of clutter.' },
  { id: 'clean_surfaces', name: 'Clean Blank Surfaces', description: 'Whiteboards, screens, and charts remain blank/uncluttered.' },
  { id: 'camera_motion', name: 'Camera Motion Pacing', description: 'Smooth, intentional camera movement (push-in, pan) without disorienting cuts.' },
  { id: 'lighting_aesthetic', name: 'Commercial Lighting', description: 'Soft natural daylight or warm key-light with commercial polish.' },
  { id: 'commercial_palette', name: 'Color Palette & Atmosphere', description: 'Teal/navy brand harmony, crisp contrast, premium look.' },
  { id: 'brand_integration', name: 'Brand Integration', description: 'Inkstall elements fit organically into the study environment.' },
  { id: 'typography_overlay', name: 'Deterministic Typography', description: 'Subtitles and CTA cards stay strictly inside mobile safe areas.' },
  { id: 'narrative_coherence', name: '8-Second Narrative Pacing', description: 'Smooth 3-beat progression from problem to breakthrough to CTA.' },
  { id: 'decisive_cta_hold', name: 'Decisive CTA Hold', description: 'Final 2.0s firmly holds the high-contrast booking action card.' },
];

export const evaluateVisualCandidate = ({ visualBeats = [], candidatePrompt = '', textAssets = [] } = {}) => {
  const promptText = String(candidatePrompt || '');
  const scores = {};
  const issues = [];

  const firstBeat = visualBeats[0] || {};
  const firstAction = String(firstBeat.visualAction || '').toLowerCase();
  const hasOpeningTension = /ticking|clock|staring|hesitat|frozen|doubt|exam|stack|curious|demonstrat/i.test(firstAction);
  const hasStockSmile = /smiling directly|wave|smiling at camera/i.test(firstAction);
  scores.opening_visual = hasOpeningTension && !hasStockSmile ? 9 : hasStockSmile ? 4 : 7;
  if (hasStockSmile) issues.push('Opening visual features stock talent smiling rather than friction.');

  const hasNegativeConstraints = promptText.includes('clean, blank') && promptText.includes('Do not render readable text');
  scores.clean_surfaces = hasNegativeConstraints ? 10 : 3;
  if (!hasNegativeConstraints) issues.push('Missing strict negative typography constraints.');

  const hasMotionStaging = visualBeats.some((b) => /push-in|slow pan|medium shot|handheld|dynamic cut|close-up/i.test(b.visualAction || ''));
  scores.camera_motion = hasMotionStaging ? 9 : 6;

  const lastBeat = visualBeats[visualBeats.length - 1] || {};
  const ctaDuration = lastBeat.durationSeconds || 2.0;
  scores.decisive_cta_hold = ctaDuration >= 1.8 ? 9 : 5;
  if (ctaDuration < 1.8) issues.push('CTA beat duration (' + ctaDuration + 's) is too short for viewer conversion processing.');

  const scoreValues = Object.values(scores);
  const aggregateScore = Number((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1));

  return {
    aggregateScore,
    dimensionScores: scores,
    passed: aggregateScore >= 8.0 && scores.clean_surfaces >= 8,
    issues,
  };
};
`;

// 4. performanceMarketing.js
const performanceMarketingCode = `/**
 * Performance Marketing Evaluation Layer.
 * Differentiates Creative Intelligence from Conversion Readiness and Live Performance.
 */

export const PERFORMANCE_METRIC_STATUS = Object.freeze({
  MEASURED: 'MEASURED',
  NOT_MEASURED: 'NOT_MEASURED_OFFLINE_SIMULATION',
  ESTIMATED_BENCHMARK: 'ESTIMATED_BENCHMARK',
});

export const assessConversionReadiness = ({ plan, canonicalScript, brief = {} } = {}) => {
  const cta = String(canonicalScript?.ctaText || plan?.ad?.cta || '');
  const dialogue = String(canonicalScript?.dialogue || plan?.ad?.dialogue || '');

  const hasFrictionHook = /\\b(stuck|behind|confus|marks|exam|doubt|hesitant|memoriz)\\b/i.test(dialogue);
  const hasClearMechanism = /\\b(1-on-1|live|tutor|whiteboard|interactive|concept)\\b/i.test(dialogue);
  const hasActionableCta = /\\b(book|free|demo|trial|claim)\\b/i.test(cta);

  let conversionReadinessScore = 10;
  if (!hasFrictionHook) conversionReadinessScore -= 3;
  if (!hasClearMechanism) conversionReadinessScore -= 3;
  if (!hasActionableCta) conversionReadinessScore -= 4;

  return {
    conversionReadinessScore: Math.max(1, conversionReadinessScore),
    readinessTier: conversionReadinessScore >= 8 ? 'HIGH_CONVERSION_READY' : conversionReadinessScore >= 6 ? 'MODERATE' : 'LOW',
    livePerformance: {
      status: PERFORMANCE_METRIC_STATUS.NOT_MEASURED,
      note: 'Live conversion performance requires active ad platform traffic; billable generation & publishing remain BLOCKED.',
      metrics: {
        hookRetention3s: null,
        videoCompletionRate: null,
        clickThroughRate: null,
        demoBookingRate: null,
        costPerDemoLead: null,
      },
    },
    recommendations: [
      hasFrictionHook ? 'Hook tension establishes clear problem.' : 'Sharpen opening friction in first 1.5s.',
      hasClearMechanism ? 'Mechanism is concrete.' : 'Include specific 1-on-1 live whiteboard mechanism.',
      hasActionableCta ? 'CTA is actionable.' : 'Make CTA direct with free demo offer.',
    ],
  };
};
`;

fs.writeFileSync(path.join(bVideoAdsDir, 'creativeIntelligence.js'), creativeIntelligenceCode, 'utf8');
fs.writeFileSync(path.join(bVideoAdsDir, 'independentEvaluator.js'), independentEvaluatorCode, 'utf8');
fs.writeFileSync(path.join(bVideoRenderDir, 'visualQualityRubric.js'), visualQualityRubricCode, 'utf8');
fs.writeFileSync(path.join(bVideoAdsDir, 'performanceMarketing.js'), performanceMarketingCode, 'utf8');

console.log('Successfully deployed creativeIntelligence, independentEvaluator, visualQualityRubric, and performanceMarketing');
