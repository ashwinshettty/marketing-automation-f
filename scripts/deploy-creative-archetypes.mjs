import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. UPDATE selectCreativeAngle to detect humor and product demonstration explicitly
const targetSelectAngle = `export const selectCreativeAngle = ({ prompt = '', creativeBrief = {}, audienceSegment = null } = {}) => {
  const tones = Array.isArray(creativeBrief.tone) ? creativeBrief.tone : [];
  const text = (prompt + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();

  if (/\\b(memoriz|rote|cram|forget|fade)/i.test(text)) {
    return CREATIVE_ANGLES.misconception_correction;
  }
  if (/\\b(crowded|batch|60|personal|1-on-1|individual)\\b/i.test(text)) {
    return CREATIVE_ANGLES.before_after_contrast;
  }
  if (tones.includes('educational') || /\\b(concept|visual|whiteboard|understand|reaction|equation)\\b/i.test(text)) {
    return CREATIVE_ANGLES.unexpected_demonstration;
  }
  if (tones.includes('cinematic') || /\\b(pressure|exam|board|anxiety|stress)\\b/i.test(text)) {
    return CREATIVE_ANGLES.emotional_relief;
  }
  if (/\\b(demo|interactive|live tutor)\\b/i.test(text)) {
    return CREATIVE_ANGLES.product_demonstration;
  }

  return CREATIVE_ANGLES.problem_recognition;
};`;

const replacementSelectAngle = `export const selectCreativeAngle = ({ prompt = '', creativeBrief = {}, audienceSegment = null } = {}) => {
  const tones = Array.isArray(creativeBrief.tone) ? creativeBrief.tone : [];
  const text = (prompt + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();

  // 1. Humor / Comic Turn / Student Relatable Frustration
  if (tones.includes('funny') || tones.includes('playful') || /\\b(funny|humor|joke|hate|hating|laugh|sarcas|comic)\\b/i.test(text)) {
    return {
      id: 'relatable_humor',
      name: 'Relatable Humor',
      description: 'Playful student perspective on difficult topics with comic turn and quick payoff.',
      visualFocus: 'Comic student struggle or self-deprecating study moment transitioning to cheerful clarity.',
      pacing: 'Comic setup (0-2s) -> Humorous realization (2-5s) -> Confident CTA (5-8s).',
      narrativeStructure: 'HUMOR_RELIEF',
    };
  }

  // 2. Product Demonstration / Visual Demonstration / Conceptual Clarity
  if (tones.includes('educational') || /\\b(show|how|makes?|demonstrat|easier|visual|whiteboard|understand|mechanism|explain|diagram)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.product_demonstration,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
    };
  }

  // 3. Misconception / Rote memorization
  if (/\\b(memoriz|rote|cram|forget|fade)/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.misconception_correction,
      narrativeStructure: 'UNEXPECTED_REVEAL',
    };
  }

  // 4. Batch vs 1-on-1 Contrast
  if (/\\b(crowded|batch|60|personal|1-on-1|individual)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.before_after_contrast,
      narrativeStructure: 'VISUAL_CONTRAST',
    };
  }

  // 5. Emotional Relief / Board Pressure
  if (tones.includes('cinematic') || /\\b(pressure|exam|board|anxiety|stress)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.emotional_relief,
      narrativeStructure: 'EMOTIONAL_PROGRESSION',
    };
  }

  // 6. Direct Value Prop / Doubt clearing
  if (/\\b(countdown|score|target|doubt)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.specific_differentiator,
      narrativeStructure: 'DIRECT_VALUE_PROP',
    };
  }

  return {
    ...CREATIVE_ANGLES.problem_recognition,
    narrativeStructure: 'EMOTIONAL_PROGRESSION',
  };
};`;

if (!code.includes(targetSelectAngle)) {
  console.error('Target selectCreativeAngle not found in creativeIntelligence.js');
  process.exit(1);
}
code = code.replace(targetSelectAngle, replacementSelectAngle);

// 2. UPDATE generateCandidateConcepts with rich, dynamic archetypes
const targetCandidates = `export const generateCandidateConcepts = ({ prompt = '', creativeBrief = {}, brandBible = {} } = {}) => {
  const audience = identifyAudienceSegment({ prompt, creativeBrief });

  const candidates = [
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

const replacementCandidates = `export const generateCandidateConcepts = ({ prompt = '', creativeBrief = {}, brandBible = {}, selectedAngle = null } = {}) => {
  const audience = identifyAudienceSegment({ prompt, creativeBrief });
  const text = (prompt + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();
  const tones = Array.isArray(creativeBrief.tone) ? creativeBrief.tone : [];

  const isHumor = tones.includes('funny') || tones.includes('playful') || /\\b(funny|humor|joke|hate|hating|laugh|sarcas|comic)\\b/i.test(text);
  const isDemonstration = tones.includes('educational') || /\\b(show|how|makes?|demonstrat|easier|visual|whiteboard|understand|mechanism|explain|diagram)\\b/i.test(text);

  let candidates;

  if (isHumor) {
    candidates = [
      {
        conceptId: 'concept_geometry_humor',
        angle: 'Relatable Humor',
        narrativeStructure: 'HUMOR_RELIEF',
        singleFocusMessage: 'Inkstall 1-on-1 whiteboard sessions make angles and proofs finally click.',
        hookCategory: HOOK_CATEGORIES.relatability.label,
        hook: 'Why does geometry feel like negotiating with alien shapes?',
        visualHook: 'Student staring in comic bewilderment at an upside-down protractor surrounded by eraser dust.',
        dialogue: 'Geometry feeling like an alien language? Inkstall 1-on-1 whiteboard tutors make proofs simple. Book your free demo.',
        cta: 'Book Your Free Demo on Inkstall',
        productMechanism: 'Patient 1-on-1 whiteboard guidance unravelling confusing shapes',
        targetAudience: audience.label,
        characterAnchor: '10th grade student at cluttered study table with compass and geometric sketches; friendly patient math tutor in teal top.',
        clothingAnchor: 'Comfortable casual student tee and smart signature teal tutor top.',
        environmentAnchor: 'Student study table with compass, protractor, and crumpled geometry sketches.',
        cinematicStyle: 'Playful documentary framing, snappy comic timing, natural study light with zero artificial glitz.',
        adaptiveConstraints: {
          requiresComicTurn: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'student_comic_relief',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'visual_geometric_transformations', 'colored_vector_arrows'],
      },
      {
        conceptId: 'concept_geometry_demonstration',
        angle: CREATIVE_ANGLES.product_demonstration.name,
        narrativeStructure: 'PRODUCT_DEMONSTRATION',
        singleFocusMessage: 'Interactive visual geometry breakdowns turning abstract theorems into clear pictures.',
        hookCategory: HOOK_CATEGORIES.curiosity.label,
        hook: 'Watch a scary circle theorem turn into child\\'s play in 3 seconds.',
        visualHook: 'Tutor smoothly sketches a geometric circle proof on interactive whiteboard, highlighting angle subtended.',
        dialogue: 'Tired of memorizing circle theorems? See them solved live on Inkstall interactive whiteboards. Claim your free demo.',
        cta: 'Claim Your Free Demo on Inkstall',
        productMechanism: 'Live digital whiteboard theorem transformation',
        targetAudience: audience.label,
        characterAnchor: 'Attentive student observing tutor gesturing at digital canvas.',
        clothingAnchor: 'Student everyday shirt and professional teal tutor top.',
        environmentAnchor: 'Modern interactive learning studio with clean digital whiteboard.',
        cinematicStyle: 'Crisp macro focus on geometric arcs and angle transformations.',
        adaptiveConstraints: {
          requiresVisualDemonstration: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'tutor_and_whiteboard',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'visual_geometric_transformations'],
      },
      {
        conceptId: 'concept_geometry_contrast',
        angle: CREATIVE_ANGLES.before_after_contrast.name,
        narrativeStructure: 'VISUAL_CONTRAST',
        singleFocusMessage: 'Personal 1-on-1 pacing unblocks geometry doubts without classroom embarrassment.',
        hookCategory: HOOK_CATEGORIES.relatability.label,
        hook: 'Too embarrassed to ask why alternate interior angles are equal?',
        visualHook: 'Hesitant student shrinking in crowded classroom vs smiling with confidence in 1-on-1 session.',
        dialogue: 'Too shy to ask geometry doubts in crowded class? Inkstall private 1-on-1 tutors explain every step patiently. Try a free session.',
        cta: 'Try a Free Session on Inkstall',
        productMechanism: 'Judgment-free 1-on-1 geometry pacing',
        targetAudience: audience.label,
        characterAnchor: 'Student transitioning from hesitant to empowered.',
        clothingAnchor: 'Everyday casual student attire.',
        environmentAnchor: 'Crowded noisy coaching classroom cutting to peaceful study nook.',
        cinematicStyle: 'Sharp contrast lighting between chaotic coaching and calm 1-on-1 focus.',
        adaptiveConstraints: {
          requiresContrastStaging: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'student_contrast',
        },
        permittedDemonstrationVisuals: ['clean_interactive_whiteboard_interactions'],
      },
    ];
  } else if (isDemonstration) {
    candidates = [
      {
        conceptId: 'concept_maths_demonstration',
        angle: CREATIVE_ANGLES.product_demonstration.name,
        narrativeStructure: 'PRODUCT_DEMONSTRATION',
        singleFocusMessage: 'Visual whiteboard concept breakdowns reveal the mechanism behind difficult formulas.',
        hookCategory: HOOK_CATEGORIES.curiosity.label,
        hook: 'Watch what happens when you stop memorizing math and actually see it.',
        visualHook: 'Clean interactive digital whiteboard where an abstract algebraic curve smoothly transforms into a geometric parabola.',
        dialogue: 'Stop memorizing complex formulas blindly. Inkstall visual whiteboard tutoring makes the mechanism obvious. Book your free demo.',
        cta: 'Book Your Free Demo on Inkstall',
        productMechanism: 'Dynamic interactive visual whiteboard transformations',
        targetAudience: audience.label,
        characterAnchor: 'Experienced Inkstall math tutor with digital stylus demonstrating at clean interactive digital canvas; focused student observing breakthrough.',
        clothingAnchor: 'Professional tutor in clean silhouette teal top; attentive student in everyday attire.',
        environmentAnchor: 'Modern minimalist interactive learning studio with clean digital whiteboard.',
        cinematicStyle: 'Crisp macro focus on visual whiteboard transformations, warm natural backlighting.',
        adaptiveConstraints: {
          requiresVisualDemonstration: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'tutor_and_whiteboard',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'coordinate_axes_and_curves', 'visual_geometric_transformations'],
      },
      {
        conceptId: 'concept_maths_curiosity',
        angle: CREATIVE_ANGLES.misconception_correction.name,
        narrativeStructure: 'UNEXPECTED_REVEAL',
        singleFocusMessage: 'Visual conceptual proofs replace pages of confusing rote formulas.',
        hookCategory: HOOK_CATEGORIES.curiosity.label,
        hook: 'Most students don\\'t hate math; they hate blind memorization.',
        visualHook: 'A wall of confusing textbook formulas smoothly replaced by one elegant visual diagram on a tablet screen.',
        dialogue: 'Math isn\\'t about memorizing steps. It\\'s about visual patterns that make sense. Experience Inkstall 1-on-1 tutoring today.',
        cta: 'Experience Inkstall 1-on-1 Today',
        productMechanism: 'Visual pattern intuition replacing rote memorization',
        targetAudience: audience.label,
        characterAnchor: 'Inquisitive high school student engaged in 1-on-1 live discussion.',
        clothingAnchor: 'Smart-casual student attire.',
        environmentAnchor: 'Warm contemporary study room with tablet and notebook.',
        cinematicStyle: 'Elegant tracking shot, calm natural palette, focused lighting.',
        adaptiveConstraints: {
          requiresCuriosityMisdirection: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'tutor_and_student',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'colored_vector_arrows'],
      },
      {
        conceptId: 'concept_maths_relief',
        angle: CREATIVE_ANGLES.problem_recognition.name,
        narrativeStructure: 'EMOTIONAL_PROGRESSION',
        singleFocusMessage: 'Dedicated 1-on-1 diagnostic live tutoring pinpointing the exact conceptual obstacle.',
        hookCategory: HOOK_CATEGORIES.visual_tension.label,
        hook: 'Stuck staring at the same complex equation for thirty minutes?',
        visualHook: 'Student staring frozen at a late-night trigonometry question with eraser shavings unblocking immediately with tutor guidance.',
        dialogue: 'Stuck on that same math problem for thirty minutes? Inkstall expert 1-on-1 live tutors pinpoint your exact gap instantly. Book your demo.',
        cta: 'Book Your Free Live Demo on Inkstall',
        productMechanism: 'Live diagnostic doubt resolution',
        targetAudience: audience.label,
        characterAnchor: '10th grade student at home study desk; Inkstall math specialist.',
        clothingAnchor: 'Casual student clothes and signature teal tutor top.',
        environmentAnchor: 'Quiet home study desk with textbook and soft evening lamp.',
        cinematicStyle: 'Authentic documentary framing, warm realistic tones with zero artificial glitz.',
        adaptiveConstraints: {
          requiresEmotionalCausality: true,
          requiresVisualDemonstration: false,
          characterContinuityScope: 'persistent_student',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'clean_interactive_whiteboard_interactions'],
      },
    ];
  } else {
    // Default / Baseline 10th Maths Archetypes
    candidates = [
      {
        conceptId: 'concept_10th_maths_friction',
        angle: CREATIVE_ANGLES.problem_recognition.name,
        narrativeStructure: 'EMOTIONAL_PROGRESSION',
        singleFocusMessage: 'Dedicated 1-on-1 diagnostic live tutoring pinpointing the exact syllabus gap.',
        hookCategory: HOOK_CATEGORIES.visual_tension.label,
        hook: 'Forty minutes on one 10th grade math problem shouldn\\'t leave you doubting yourself.',
        visualHook: 'Student staring frozen at a late-night quadratic problem with eraser shavings.',
        dialogue: 'Struggling with 10th grade math doubts? Inkstall 1-on-1 live tutors explain every step until it clicks. Book your free demo.',
        cta: 'Book Your Free Demo on Inkstall',
        productMechanism: '1-on-1 live diagnostic with interactive whiteboard',
        targetAudience: audience.label,
        characterAnchor: '10th grade student sitting at home study desk; Inkstall subject specialist tutor in teal top.',
        clothingAnchor: 'Casual student attire and professional tutor in smart teal top.',
        environmentAnchor: 'Quiet, focused home study desk with soft natural daylight and syllabus textbook.',
        cinematicStyle: 'Authentic documentary framing, warm realistic tones with zero artificial glitz.',
        adaptiveConstraints: {
          requiresEmotionalCausality: true,
          requiresVisualDemonstration: false,
          characterContinuityScope: 'persistent_student',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'clean_interactive_whiteboard_interactions'],
      },
      {
        conceptId: 'concept_10th_maths_demonstration',
        angle: CREATIVE_ANGLES.product_demonstration.name,
        narrativeStructure: 'PRODUCT_DEMONSTRATION',
        singleFocusMessage: 'Visual whiteboard derivations making 10th board formulas intuitive and memorable.',
        hookCategory: HOOK_CATEGORIES.curiosity.label,
        hook: '10th board maths doesn\\'t require memorizing 200 formulas.',
        visualHook: 'Interactive clean digital whiteboard showing core visual formula derivation step by step.',
        dialogue: '10th board math isn\\'t about rote memorization. Inkstall visual whiteboard tutoring makes concepts impossible to forget. Try a free session.',
        cta: 'Try a Free Session on Inkstall',
        productMechanism: 'Interactive digital whiteboard derivation',
        targetAudience: audience.label,
        characterAnchor: 'Attentive 10th grader observing tutor gesture at interactive digital canvas.',
        clothingAnchor: 'Everyday student clothes and signature teal tutor top.',
        environmentAnchor: 'Bright modern study space with clean digital whiteboard.',
        cinematicStyle: 'Crisp macro focus on whiteboard derivation, natural soft light.',
        adaptiveConstraints: {
          requiresVisualDemonstration: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'tutor_and_whiteboard',
        },
        permittedDemonstrationVisuals: ['geometric_diagrams', 'coordinate_axes_and_curves'],
      },
      {
        conceptId: 'concept_10th_maths_contrast',
        angle: CREATIVE_ANGLES.before_after_contrast.name,
        narrativeStructure: 'VISUAL_CONTRAST',
        singleFocusMessage: 'Personal 1-on-1 live attention vs crowded 60-student batch coaching.',
        hookCategory: HOOK_CATEGORIES.relatability.label,
        hook: 'Lost in a crowded 60-student batch while 10th board exams approach?',
        visualHook: 'Student in noisy crowded lecture hall hesitating to raise hand, cutting to calm 1-on-1 private whiteboard session.',
        dialogue: 'Lost in a crowded 60-student coaching batch? Get private 1-on-1 attention tailored to your exact pace. Book your demo.',
        cta: 'Book Your Free Demo on Inkstall',
        productMechanism: 'Personalized 1-on-1 pacing',
        targetAudience: audience.label,
        characterAnchor: '10th grade student transitioning from crowded coaching to calm 1-on-1 focus.',
        clothingAnchor: 'School uniform / casual student wear.',
        environmentAnchor: 'Noisy crowded coaching room cutting to peaceful home desk.',
        cinematicStyle: 'Sharp contrast lighting and pacing between chaos and serene focus.',
        adaptiveConstraints: {
          requiresContrastStaging: true,
          requiresEmotionalCausality: false,
          characterContinuityScope: 'student_contrast',
        },
        permittedDemonstrationVisuals: ['clean_interactive_whiteboard_interactions'],
      },
    ];
  }`;

if (!code.includes(targetCandidates)) {
  console.error('Target generateCandidateConcepts not found in creativeIntelligence.js');
  process.exit(1);
}

code = code.replace(targetCandidates, replacementCandidates);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated creativeIntelligence.js with rich differentiated archetypes.');
