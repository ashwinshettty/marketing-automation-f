/**
 * deploy-ads-quality-hardening-v2.mjs
 *
 * Addresses root-cause failures observed in inkstall-parents-10th-grade-ad.mp4:
 *
 * 1. generate-video-3.mjs bypassed the pipeline entirely and instructed Seedance
 *    to render branded text ("Book a 1-on-1 Demo • inkstall.com") directly,
 *    causing distorted/nonsensical text artifacts.
 *
 * 2. Scene continuity was absent: raw freeform prompt provided no character
 *    consistency tokens, lighting anchors, or environment continuity directives.
 *
 * 3. Emotional arc was vague and described in narration only ("parents watch anxiously",
 *    "mother smiles with genuine peace of mind") without visual event grounding.
 *
 * 4. Creative evaluator lacked dimensions for: visual continuity, emotional authenticity,
 *    story coherence, text-artifact risk, and product differentiation.
 *
 * Changes in this v2:
 *  A. plannerPrompt.js — stronger scene-continuity directives, emotional arc grounding,
 *     extended negative typography, brand authenticity constraints.
 *  B. independentEvaluator.js — 8 new creative quality dimensions.
 *  C. visualQualityRubric.js — 5 new rubric dimensions (continuity, emotional authenticity,
 *     story coherence, text-artifact risk, product differentiation).
 *  D. creativeIntelligence.js — emotional arc validator, brand authenticity checker.
 *  E. New test file: tests/adsVideoQualityRegression.test.js — regression tests for
 *     every failure observed in the parents-10th-grade ad.
 */

import fs from 'node:fs';
import path from 'node:path';

const bDir = path.resolve('../marketing-automation-b');
const bAdsDir = path.join(bDir, 'video/ads');
const bRenderDir = path.join(bDir, 'video/render');
const bTestsDir = path.join(bDir, 'tests');

fs.mkdirSync(bAdsDir, { recursive: true });
fs.mkdirSync(bRenderDir, { recursive: true });
fs.mkdirSync(bTestsDir, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// A. HARDENED PLANNER PROMPT (plannerPrompt.js)
// ─────────────────────────────────────────────────────────────────────────────

const plannerPromptCode = `export const ADS_PLANNER_INSTRUCTION = \`You are the principal Ads creative director and video-generation planner for short, high-conversion marketing videos (Inkstall and similar education / product brands).
Return ONLY one compact JSON object that matches the ads plan schema. No markdown fences, no commentary, no trailing text.
Keep ad.dialogue short enough for ad.targetDurationSeconds (about 2 words per second; strictly 15–20 words for an 8s ad). Prefer 2–4 sceneSequence beats.
sceneSequence[].beat must be one of: hook, problem, desire, product_reveal, proof, cta (never scene_1 / beat_2).
Every sceneSequence[].dialogue must be a non-empty spoken line or voice-over (never "").
ad.visualAction and every sceneSequence[].visualAction must describe observable on-screen staging (camera, gesture, prop, UI) — never copy dialogue or hook text.
This is NOT an educational lesson planner. Do not invent teacher recaps, "Previously, we learned…", classroom pedagogy, or homework language.
Focus on campaign objective, Brand Bible continuity, hook, problem/desire, product reveal, proof, and a clear CTA.

AUDIENCE UNDERSTANDING & PAIN-POINT FOCUS:
- Never write generic ads for "everyone" or vague "students". Target the specific viewer and their frustration (e.g. parents anxious about child\'s dropping math scores, exam preparation stress, fear of falling behind in crowded classrooms).
- The viewer must instantly think: "This understands my problem, and this is exactly what I need."
- For parent-focused ads: show concern through subtle, realistic behavior — not exaggerated anxiety or artificial smiling. A parent quietly looking at a report card with a slight frown is more authentic than a parent dramatically clutching their head.
- Emotional transitions must be gradual: tension → tutor appears → visible guidance → calm relief. Never jump abruptly from despair to joy without a visible causal event (the tutor explaining a concept on screen).

FIRST-SECOND HOOK (0–1.5s):
- The opening visual must immediately communicate a relatable tension or friction event relevant to the problem.
- Prohibit slow fade-ins, smiling faces doing nothing, unnecessary logo animations, and generic classroom footage.
- Examples: A frustrated student staring at confusing formulas with an eraser, a parent looking worriedly at a report card, a ticking countdown clock.
- Avoid exaggerated despair — realistic concern (furrowed brow, tired posture, quiet worry) is more persuasive than theatrical distress.

CORE MECHANISM & PRODUCT CLARITY (1.5–5.5s):
- Position Inkstall's concrete value proposition: 1-on-1 personalized live tutoring with expert teachers on an interactive digital whiteboard.
- Show the breakthrough "aha!" moment where concept clarity is unlocked, replacing confusion with confidence.
- The emotional resolution must be visually caused by the tutor's explanation — not merely narrated. Something must happen on the whiteboard or screen that the student responds to with visible understanding.
- Inkstall positioning: personalized 1-on-1 and small-group tuition, subject-specialist teachers, interactive learning, individualized pace, trustworthy academic support.
- Do NOT invent: academic guarantees, success statistics, testimonials, or promotional offers.

VISUAL CONTINUITY REQUIREMENTS (ALL SCENES):
- Every scene must share identical character descriptors in visualAction: same talent (gender, age range, clothing color), same environment category (indoor home vs tutoring screen vs classroom). Do not allow characters to change appearance or teleport between locations without a motivated cut.
- Establish a visual anchor in the first scene (e.g. "Indian mother in blue salwar kameez at warm-lit kitchen table") and explicitly reuse it in subsequent scenes: "same mother now visibly relaxed at the same table".
- Camera work should feel motivated: if the previous scene is wide, the next can push in. Never use random or disorienting cuts.
- Lighting must remain consistent scene-to-scene: warm amber home lighting for family scenes; cool soft white screen glow for digital tutoring scenes.
- Use transition signals in visualAction: "cut to", "camera holds on", "slow push-in", "dissolve to" — never leave the transition implicit.

CLEAN BLANK SURFACES & SEEDANCE STAGING MANDATE:
- The video generation model (Seedance) generates visuals only; it cannot render accurate typography, text, formulas, or UI text.
- Every visualAction MUST stage clean, blank, or abstract surfaces: e.g. "Tutor gestures at a clean, blank digital whiteboard with a simple geometrical sketch", "Student looks up smiling from a clean desk", "Tablet screen shows an abstract glowing learning graph with NO readable text".
- CRITICAL: Never instruct Seedance to show brand names, website URLs, CTA text, phone numbers, or any readable typographic element. All such content is added deterministically in post-production.
- Prohibit readable letters, numbers, whiteboard writing, captions, subtitles, logos, UI labels, mathematical equations, or fake UI text in visualAction.
- Use: blank whiteboards, clean surfaces, abstract educational visuals, text-free interfaces, glowing diagrams without labels.

DECISIVE CALL TO ACTION (5.5–8.0s):
- Clear, concise voice-over only. The CTA card content (brand name, URL, booking text) is rendered deterministically by the typography engine — never by Seedance.
- The final scene's visualAction must show a calm, conclusive human moment (student studying confidently, parent smiling genuinely) with no on-screen text requests.
- The CTA beat must be at least 2.0s long for the deterministic end card to hold.
- Ban unsupported guarantees (no "100% marks guaranteed") or artificial urgency.

Honor creativeBrief as structured constraints:
- tone (funny, cinematic, persuasive, educational, fast, …) must shape dialogue, visuals, and beats
- pacing must match creativeBrief.pacing
- targetAudience, platform, aspectRatio, and durationSeconds are hard constraints
- continuityMode sequential: advance from previousAd without restarting the brand intro
- openingBridge: one natural spoken advertising line a host could say aloud from campaignContinuity.bridgeBrief (previousKeyMessage + nextNarrativePurpose + tone). Never use production notes such as "the next beat shows", "Last beat:", or "Building on …?". Never copy the user prompt or splice question-mark fragments
- If previousAdSource is "planned", the prior spot was planned only (not a generated/succeeded video); keep continuity honest and do not imply a rendered prior ad
- Honor creativeBrief.tone and pacing for THIS spot even when continuing a campaign (funny → persuasive must change voice, not just labels): drop joke/gag register, lead with a clear benefit reason, do not reuse the prior funny punchline structure, and do not reuse the prior hook verbatim
- When tone includes cinematic or premium: write spoken film narration from a human emotional journey grounded in THIS campaign's productFacts / objective — cinematic style is reusable; semantics are not. Arc: a person's uncertainty → the weight of the choice → a quieter realization → product earned in that resolution. Ground examples in the current domain (education/admissions → school-choice pressure; meal kits → weeknight dinner pressure). Never import another product's domain (e.g. no "school choice" VO for a meal-kit brand). Ban brochure speech ("navigate with confidence", "simplifies the process", "admissions can be overwhelming", "ready for the next step", "unlock … future/path/potential", "bright future", "discover … guidance"). Ban visual-description-as-dialogue ("soft sunlight on the papers", "one quiet breath at the kitchen table", "camera pans…", "Then BrandName."). Put camera/staging only in visualAction. At least one non-CTA line must work if heard with eyes closed as a human thought. Cinematic must be audible in dialogue, not only in visuals
- When tone includes funny: write a real joke beat — setup (specific situation), turn (unexpected twist or exaggeration), payoff (product as punchline). Ban thin stock filler ("It's tough!", "We can help!", "No sweat!", "Math is hard!"). Keep lines natural when spoken aloud. Still ban lesson-recap / classroom / homework pedagogy language; comedy about product stress is fine without schoolroom framing
- When tone includes persuasive (including continuations): every non-CTA line should carry a concrete benefit (time saved, exam confidence, dinner in under 20 minutes, clearer comparison). Ban stock filler ("We've got you!", "Confidence is key!", "Too little time, too much to do."). OpeningBridge alone is not enough — ad.dialogue and scene lines must also speak the benefit
- When tone includes instructional or educational: calmly walk the viewer through a real method — at least two concrete comparison or process steps parents can follow (e.g. curriculum vs facilities, subjects vs fees, side-by-side program points). Ban slogan-only lines ("Compare schools with ease.", "Inkstall simplifies your search.") without demonstrating how. Show how the product supports those steps in spoken dialogue and scene beats
- continuityMode variation / intent NEW_AD_VARIATION: keep campaign identity and product facts, change creative execution relative to variationOfAdId; do not assume every viewer saw the prior ad
- intent REVISE_AD: revise the targeted ad in place; do not invent a new sequence beat as if this were the next spot
- intent NEW_BRAND_IDENTITY: propose a new persistent talent/brand profile via brandInstructions.requestedChanges (field/description objects); do not silently overwrite the previous profile in narration alone
- intent STYLE_CHANGE: update visual style only; preserve talent identity and voice
- intent BRAND_CHANGE: approved edits to the current Brand Bible fields only

Brand Bible rules:
- Copy voice, visualStyle, talentAppearance, talentClothing, and productFacts from brandBible unless an authorized brand/style intent exists
- Never invent medical or guaranteed-placement claims
- Only assert product capabilities supported by brandBible.productFacts, approvedClaims, or the campaign objective
- Semantic matches of prior ads inform creative context only; they never change Brand Bible identity

Never authorize or trigger video generation. Planning only.
Required top-level fields:
intent, needsClarification, clarificationQuestion, campaignObjective, targetAudience,
narrativeContext, brandInstructions, ad, sceneSequence, warnings.\`;

export const adsRepairInstruction = (issues) =>
  \`Repair the previous ads plan into ONE complete schema-valid JSON object only (no markdown, no prose).
If the previous output was truncated, finish a complete object that still matches the schema.
ad.hook, ad.cta, ad.visualAction, and ad.dialogue must be non-empty strings (summarize sceneSequence if needed).
ad.visualAction / scene visualAction must be staging directions with clean blank surfaces (e.g. "Tutor points to an unlabeled digital whiteboard diagram", "Student looks up smiling from a clean desk"), never copy hook/dialogue text verbatim or near-verbatim. Prohibit text or letters in visualAction. CRITICAL: never instruct Seedance to display brand names, URLs, CTAs, or any readable text — all typography is deterministically post-produced.
Ensure scene-to-scene visual continuity: every sceneSequence[].visualAction must explicitly reuse the character descriptors and environment established in the first scene.
Emotional arc must be grounded in visual events: the tutor must perform a visible action (explain on whiteboard, demonstrate step-by-step) that causes the student or parent to visibly react with understanding or relief — not merely narrated.
ad.dialogue must fit the target duration (~2 words/sec; strictly 15–20 words for 8s). Shorten copy if length was rejected.
ad.openingBridge must be natural spoken advertising copy (a host could say it aloud). Never use "the next beat shows", "Last beat:", or prompt echoes; rebuild from previousAd creative + narrative function only.
Product claims must stay inside brandBible.productFacts / approvedClaims / campaign objective.
sceneSequence must be a non-empty array; every scene needs beat ∈ {hook,problem,desire,product_reveal,proof,cta}, a non-empty visualAction, and a non-empty dialogue/voice-over line.
For cinematic/premium tone, replace brochure and shot-description speech with speakable film narration grounded in brandBible.productFacts / campaign objective (human perspective → emotional tension → narrative progression). Reuse cinematic style, not another product's semantics. Domain examples: education → school-choice uncertainty; meal kit → weeknight dinner pressure. Ban cross-domain leaks (no admissions VO for meal kits). Ban "navigate with confidence", "simplifies the process", "unlock … future/path", "bright future", "discover … guidance", "ready for the next step", and ban staging-as-dialogue ("soft sunlight on the papers", "one quiet breath at the kitchen table", "Then BrandName."). Keep CTA lines plain if needed; at least one non-CTA line must express a human thought that advances the emotional arc.
For funny→persuasive continuations, drop gag register and lead with a clear time/benefit reason.
For funny tone failures, rebuild setup → turn → payoff with specific spoken comedy (ban "It's tough!" / "We can help!"); still avoid homework/classroom/lesson-recap language.
For persuasive / stock-body failures, rewrite non-CTA lines into concrete benefit speech (ban "We've got you!" / "Confidence is key!"); keep openingBridge natural if present.
For instructional / educational failures, rewrite into a calm walkthrough with at least two concrete comparison dimensions and how the product helps (ban "Compare schools with ease" / "simplifies your search" alone).
narrativeContext must be an object with previousAdId, continuitySummary, campaignFactsToPreserve (not a bare string).
Fix these issues:\\n\${issues
    .map((issue) => \`- \${issue.path || 'response'}: \${issue.message}\`)
    .join('\\n')}\`;
`;

// ─────────────────────────────────────────────────────────────────────────────
// B. ENHANCED CREATIVE INTELLIGENCE (additive functions only)
// ─────────────────────────────────────────────────────────────────────────────

const creativeIntelligenceAdditionsCode = `/**
 * Additional Creative Intelligence functions for v2 hardening.
 * Addresses visual continuity, emotional arc authenticity, and brand grounding.
 *
 * Appended to video/ads/creativeIntelligence.js (additive, no existing code replaced).
 */

/**
 * Evaluate whether the emotional arc is grounded in visible visual events,
 * not merely described in narration.
 *
 * A professionally produced ad must show the emotional resolution being CAUSED
 * by something on screen (tutor explains concept → student's face changes).
 * If the arc is only narrated ("parent feels relieved") without a visual causal event,
 * the ad will feel dishonest and AI-generated.
 *
 * @param {Object} params
 * @param {Array}  params.scenes  - sceneSequence from the plan
 * @param {string} params.dialogue - full ad dialogue
 * @returns {Object} emotionalArcResult
 */
export const evaluateEmotionalArc = ({ scenes = [], dialogue = '' } = {}) => {
  const diagnostics = [];
  let score = 10;

  const allVisuals = scenes.map((s) => String(s.visualAction || '').toLowerCase()).join(' ');
  const allDialogue = String(dialogue || '').toLowerCase();

  // 1. Check for a problem beat
  const hasProblemBeat = scenes.some((s) =>
    /hook|problem|desire/.test(String(s.beat || '').toLowerCase())
  );
  const hasProblemVisual = /frustrat|staring|worried|anxious|concern|hesitat|furrowed|confused|frozen|tired|rubbing|sigh|trouble/i.test(allVisuals);
  const hasProblemDialogue = /stuck|confus|behind|struggle|doubt|falling|difficult|hard|exam|stress|anxious/i.test(allDialogue);

  if (!hasProblemBeat && !hasProblemVisual) {
    score -= 3;
    diagnostics.push('Missing identifiable problem/tension beat — ad lacks emotional starting point.');
  }

  // 2. Check for a visible causal resolution event (the "because" moment)
  const hasTutorAction = /tutor|teacher|mentor|expert/.test(allVisuals);
  const hasVisualResolution = /explains?|demonstrates?|draws?|points?|gestures?|writes?|sketches?|shows?|guides?|walks? through|whiteboard|tablet|screen/i.test(allVisuals);
  const hasEmotionalResponse = /smil|relief|relax|lights? up|nods?|leans? in|brightens?|confident|clarity|aha|understanding/i.test(allVisuals);

  if (hasTutorAction && !hasVisualResolution) {
    score -= 3;
    diagnostics.push('Tutor is present but performs no visible action — emotional resolution appears unmotivated. Add a visible whiteboard/screen event that causes the student or parent to visibly react.');
  }

  if (!hasEmotionalResponse && hasProblemBeat) {
    score -= 2;
    diagnostics.push('No visible emotional response to the tutor intervention — add a close-up of the student or parent reaction (lights up, nods, visibly relaxes) to ground the resolution.');
  }

  // 3. Check for abrupt emotional jump (anxiety → joy without transition)
  const hasAbruptJoy = /parent.*smiling.*genuinely|mother.*smiles.*peace|student.*celebrates.*confidently/i.test(allVisuals);
  const hasTransitionBeat = /product_reveal|proof/.test(scenes.map((s) => String(s.beat || '').toLowerCase()).join(' '));
  if (hasAbruptJoy && !hasTransitionBeat) {
    score -= 2;
    diagnostics.push('Abrupt emotional transition (anxiety → joy) without an intervening product_reveal or proof beat — add a visible tutoring moment to bridge the gap.');
  }

  // 4. Check for exaggerated emotional language (overacting risk)
  const hasExaggeratedEmotion = /dramatically|tears|crying|devastated|shatter|overwhelm|ruin|crisis|meltdown/i.test(allVisuals + allDialogue);
  if (hasExaggeratedEmotion) {
    score -= 2;
    diagnostics.push('Exaggerated emotional language detected — use realistic, subtle emotional cues rather than theatrical distress.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    diagnostics,
    hasProblemBeat,
    hasTutorAction,
    hasVisualResolution,
    hasEmotionalResponse,
    isAuthentic: score >= 7,
  };
};

/**
 * Evaluate brand authenticity for Inkstall-specific positioning.
 *
 * The ad should communicate Inkstall's actual verified positioning:
 * - Personalized 1-on-1 and small-group tuition
 * - Subject-specialist teachers
 * - Interactive learning and conceptual understanding
 * - Individualized learning pace
 * - Trustworthy academic support
 *
 * It must NOT invent: success statistics, testimonials, placement records,
 * academic guarantees, website URLs, or unverified promotional offers.
 *
 * @param {Object} params
 * @param {string} params.dialogue
 * @param {string} params.visualAction
 * @returns {Object} brandAuthenticityResult
 */
export const evaluateBrandAuthenticity = ({ dialogue = '', visualAction = '' } = {}) => {
  const combined = \`\${dialogue} \${visualAction}\`.toLowerCase();
  const diagnostics = [];
  let score = 10;

  // Verified Inkstall positioning — should be present
  const verifiedPositioning = [
    { pattern: /1-on-1|one[- ]on[- ]one|personal(?:ized)? (?:attention|tuition|tutoring|learning)/i, label: '1-on-1 personalized tuition' },
    { pattern: /subject.?specialist|expert teacher|dedicated (?:tutor|teacher|mentor)/i, label: 'Subject-specialist teachers' },
    { pattern: /interactive|whiteboard|digital (?:whiteboard|tablet|slate)|conceptual|understanding|clarity/i, label: 'Interactive learning / conceptual understanding' },
    { pattern: /(?:own|individual(?:ized)?|personalized) pace|at (?:their|your|his|her) own pace/i, label: 'Individualized learning pace' },
  ];

  const matchedPositioning = verifiedPositioning.filter((p) => p.pattern.test(combined));
  if (matchedPositioning.length === 0) {
    score -= 5;
    diagnostics.push('Ad fails to communicate any verified Inkstall positioning (no 1-on-1, specialist teacher, interactive learning, or individualized pace).');
  } else if (matchedPositioning.length === 1) {
    score -= 2;
    diagnostics.push(\`Only 1 Inkstall differentiator cited (\${matchedPositioning[0].label}). Add at least one more for credibility.\`);
  }

  // Prohibited invented claims — these must not appear
  const prohibitedClaims = [
    { pattern: /\\d+%\\s*(?:success|pass|marks?|score|students?|results?)/i, label: 'Fabricated success statistic' },
    { pattern: /\\d+\\+?\\s*students? (?:passed|succeeded|scored|ranked|got)/i, label: 'Invented testimonial count' },
    { pattern: /guaranteed?\\s*(?:marks?|score|pass|success|board|results?)/i, label: 'Prohibited performance guarantee' },
    { pattern: /rank\\s*\\d+|top\\s*\\d+%|iit|neet|jee\\s+rank/i, label: 'Unverified placement/rank claim' },
    { pattern: /www\\.|inkstall\\.com|\\.in\\/|http/i, label: 'URL in visual prompt (must be deterministic)' },
  ];

  for (const claim of prohibitedClaims) {
    if (claim.pattern.test(combined)) {
      score = Math.min(score - 3, 2);
      diagnostics.push(\`PROHIBITED: \${claim.label} detected — remove immediately.\`);
    }
  }

  // Generic coaching-centre visuals (should be avoided)
  const genericCoachingVisuals = /crowd(?:ed)? classroom|hundreds? of students?|large batch|rows? of students?|traditional classroom|chalk(?:board)?/i.test(combined);
  if (genericCoachingVisuals && !/cut to|contrast|vs\.?/i.test(combined)) {
    score -= 2;
    diagnostics.push('Generic coaching-centre visuals (crowded classroom, chalkboard rows) without a contrast moment — use 1-on-1 tutoring scenes to differentiate from competitors.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    diagnostics,
    matchedPositioning: matchedPositioning.map((p) => p.label),
    isAuthentic: score >= 7,
  };
};

/**
 * Validate visual continuity across scene sequence.
 * Checks that character descriptors and environment cues are consistently reused.
 *
 * @param {Array} scenes - sceneSequence from the plan
 * @returns {Object} continuityResult
 */
export const evaluateVisualContinuity = (scenes = []) => {
  const diagnostics = [];
  let score = 10;

  if (!Array.isArray(scenes) || scenes.length < 2) {
    return {
      score: 10,
      diagnostics: ['Single scene or no scenes — continuity not applicable.'],
      isConsistent: true,
    };
  }

  const visualActions = scenes.map((s) => String(s.visualAction || '').toLowerCase());

  // 1. Check for transition signals between scenes
  const hasTransitionSignals = visualActions.slice(1).some((v) =>
    /cut to|camera (?:holds?|pushes?|pans?|zooms?|moves?)|dissolve|fade|same (?:room|setting|location|table|desk|student)|back to/i.test(v)
  );
  if (!hasTransitionSignals) {
    score -= 2;
    diagnostics.push('No transition signals between scenes (cut to, camera holds, dissolve, same location). Scenes may feel abruptly disconnected.');
  }

  // 2. Check that later scenes reference the same setting or character
  const firstScene = visualActions[0];
  const firstHasAnchor = /(?:indian|mother|father|parent|student|tutor|teacher|tutor|woman|man|girl|boy|teen)/i.test(firstScene);
  if (firstHasAnchor) {
    const laterScenesReuseCharacter = visualActions.slice(1).some((v) =>
      /same|again|now|continues?|still|mother|father|parent|student|tutor|teacher|teen/i.test(v)
    );
    if (!laterScenesReuseCharacter) {
      score -= 3;
      diagnostics.push('Later scenes do not explicitly reference the character or setting established in the opening scene — Seedance may generate inconsistent characters across shots.');
    }
  }

  // 3. Check for character identity anchors (clothing, age, gender)
  const hasCharacterAnchor = visualActions.some((v) =>
    /wearing|top|shirt|salwar|sari|kurta|in (?:blue|teal|white|grey|gray|green|red)|hair (?:tied|loose|neat|long|short)|early \d0s|mid.?\d0s|young|teen|elderly/i.test(v)
  );
  if (!hasCharacterAnchor) {
    score -= 2;
    diagnostics.push('No clothing or appearance anchor in any scene — add character descriptors (e.g. "Indian mother in blue salwar") to enforce Seedance character consistency.');
  }

  // 4. Check for random/unmotivated camera cuts (location jumps without staging)
  const hasUnmotivatedJump = visualActions.some((v) =>
    /suddenly(?! shows? a)|teleports?|jumps? to|randomly/i.test(v)
  );
  if (hasUnmotivatedJump) {
    score -= 2;
    diagnostics.push('Unmotivated visual jump detected — all location changes must be staged with transition signals.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    diagnostics,
    isConsistent: score >= 7,
  };
};

/**
 * Evaluate text-artifact risk in the Seedance visual prompt.
 * Detects instructions that would cause Seedance to hallucinate text.
 *
 * This is the direct root cause of the distorted text seen in
 * inkstall-parents-10th-grade-ad.mp4: the prompt asked Seedance to
 * render "Book a 1-on-1 Demo • inkstall.com" as on-screen text.
 *
 * @param {Object} params
 * @param {string} params.candidatePromptText - The compiled Seedance prompt string
 * @param {Array}  params.scenes - sceneSequence from the plan
 * @returns {Object} textArtifactRiskResult
 */
export const evaluateTextArtifactRisk = ({ candidatePromptText = '', scenes = [] } = {}) => {
  const combined = \`\${candidatePromptText} \${scenes.map((s) => s.visualAction || '').join(' ')}\`;
  const diagnostics = [];
  let riskScore = 0; // Higher = more risk (inverted: 10 - riskScore = quality score)

  // Explicit text-render requests (CRITICAL)
  const criticalRiskPatterns = [
    { pattern: /typography card|text card|card shows|card reads?|title card|end card shows?/i, label: 'On-screen card text requested' },
    { pattern: /(?:display|show|render|write|type)s? "[\w\s•·@\/.,-]{3,}"/i, label: 'Quoted text render instruction' },
    { pattern: /\binkstall\.com\b|\bwww\./i, label: 'Website URL in visual prompt' },
    { pattern: /subtitle|caption|lower.third|overlay.*text/i, label: 'Subtitle/caption text in prompt' },
    { pattern: /logo.*appear|brand.*watermark|display.*logo/i, label: 'Logo render instruction' },
  ];

  // Moderate risk patterns
  const moderateRiskPatterns = [
    { pattern: /whiteboard.*(?:write|shows?|displays?|equation|formula|numbers?|text)/i, label: 'Whiteboard text content instruction' },
    { pattern: /screen.*(?:shows?|displays?) text/i, label: 'Screen text instruction' },
    { pattern: /mathematical equation|algebraic expression|chemical formula/i, label: 'Mathematical/chemical formula request' },
    { pattern: /readable|legible|visible text/i, label: 'Explicit legibility instruction' },
  ];

  // Mandatory clean-surface guards that SHOULD be present
  const hasNegativeConstraints =
    /do not render readable text|blank.*whiteboard|clean.*surfaces?|no readable text|text.free|without.*text|without.*writing/i.test(candidatePromptText);

  for (const p of criticalRiskPatterns) {
    if (p.pattern.test(combined)) {
      riskScore += 4;
      diagnostics.push(\`CRITICAL TEXT-ARTIFACT RISK: \${p.label} — Seedance cannot reproduce this accurately and will hallucinate distorted text.\`);
    }
  }

  for (const p of moderateRiskPatterns) {
    if (p.pattern.test(combined)) {
      riskScore += 2;
      diagnostics.push(\`TEXT-ARTIFACT RISK: \${p.label} — replace with abstract visual instruction (e.g. "abstract glowing diagram without labels").\`);
    }
  }

  if (!hasNegativeConstraints) {
    riskScore += 3;
    diagnostics.push('Missing mandatory negative typography constraints — prompt must include "Do not render readable text" and "clean, blank" surface instructions.');
  }

  const qualityScore = Math.max(1, Math.min(10, 10 - riskScore));

  return {
    score: qualityScore,
    riskScore,
    diagnostics,
    isClean: qualityScore >= 8,
    hasCriticalRisk: riskScore >= 4,
  };
};

/**
 * Evaluate story coherence — whether the ad tells a unified 3-beat narrative
 * (problem → tutor intervention → resolution/CTA) that supports the brand message.
 *
 * @param {Object} params
 * @param {Array}  params.scenes - sceneSequence from the plan
 * @param {string} params.dialogue - full ad dialogue
 * @param {string} params.hook - hook line
 * @returns {Object} storyCoherenceResult
 */
export const evaluateStoryCoherence = ({ scenes = [], dialogue = '', hook = '' } = {}) => {
  const diagnostics = [];
  let score = 10;

  const beatTypes = scenes.map((s) => String(s.beat || '').toLowerCase());

  // 1. Must have a hook/problem beat
  const hasConflict = beatTypes.some((b) => /hook|problem|desire/.test(b));
  if (!hasConflict) {
    score -= 3;
    diagnostics.push('No hook/problem/desire beat — ad lacks a narrative conflict that motivates the viewer to watch further.');
  }

  // 2. Must have a product reveal or proof
  const hasMechanism = beatTypes.some((b) => /product_reveal|proof/.test(b));
  if (!hasMechanism) {
    score -= 3;
    diagnostics.push('No product_reveal or proof beat — the ad skips from problem to CTA without showing how Inkstall solves the problem.');
  }

  // 3. Must have a CTA beat
  const hasCta = beatTypes.some((b) => /cta/.test(b));
  if (!hasCta) {
    score -= 2;
    diagnostics.push('No CTA beat defined in scene sequence.');
  }

  // 4. Check scene count reasonableness
  if (scenes.length < 2) {
    score -= 2;
    diagnostics.push('Only 1 scene beat — ad cannot tell a coherent problem-solution story. Add at least hook + product_reveal + cta.');
  } else if (scenes.length > 5) {
    score -= 1;
    diagnostics.push(\`Too many scene beats (\${scenes.length}) for an 8-second ad — simplify to 3–4 focused beats.\`);
  }

  // 5. Dialogue must contain both problem signal and solution signal
  const combinedText = \`\${hook} \${dialogue}\`.toLowerCase();
  const hasProblemInDialogue = /stuck|confus|behind|doubt|hard|exam|stress|falling|anxious|worried|marks|wrong|unclear/i.test(combinedText);
  const hasSolutionInDialogue = /inkstall|1-on-1|tutor|tuition|clear|understand|concept|mentor|expert/i.test(combinedText);
  if (!hasProblemInDialogue) {
    score -= 1;
    diagnostics.push('Dialogue does not reference the problem or viewer pain point — opening copy lacks relatability.');
  }
  if (!hasSolutionInDialogue) {
    score -= 2;
    diagnostics.push('Dialogue does not reference the product or solution — failing to close the problem-solution loop.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    diagnostics,
    hasConflict,
    hasMechanism,
    hasCta,
    isCoherent: score >= 7,
  };
};

/**
 * Evaluate product differentiation — whether the ad distinguishes Inkstall
 * from generic coaching centres in a meaningful, specific way.
 *
 * @param {Object} params
 * @param {string} params.dialogue
 * @param {string} params.visualAction
 * @param {Array}  params.scenes
 * @returns {Object} differentiationResult
 */
export const evaluateProductDifferentiation = ({ dialogue = '', visualAction = '', scenes = [] } = {}) => {
  const combined = \`\${dialogue} \${visualAction} \${scenes.map((s) => s.visualAction || '').join(' ')}\`.toLowerCase();
  const diagnostics = [];
  let score = 10;

  // Inkstall-specific differentiators (should appear)
  const differentiators = [
    { pattern: /1-on-1|one[- ]on[- ]one/i, label: '1-on-1 format' },
    { pattern: /interactive (?:whiteboard|learning|session)|digital whiteboard/i, label: 'Interactive digital whiteboard' },
    { pattern: /(?:own|individual(?:ized)?|personalized) pace/i, label: 'Individualized pace' },
    { pattern: /subject.?specialist|expert (?:tutor|teacher)|dedicated (?:tutor|teacher)/i, label: 'Subject-specialist teacher' },
    { pattern: /small.?group|personal(?:ized)? attention/i, label: 'Small-group / personalized attention' },
  ];

  const matchedDiff = differentiators.filter((d) => d.pattern.test(combined));

  if (matchedDiff.length === 0) {
    score -= 5;
    diagnostics.push('Ad communicates no specific product differentiator — indistinguishable from a generic tutoring ad. Add 1-on-1, interactive whiteboard, individualized pace, or specialist teacher.');
  } else if (matchedDiff.length === 1) {
    score -= 2;
    diagnostics.push(\`Only 1 differentiator (\${matchedDiff[0].label}) — consider adding one more for stronger competitive positioning.\`);
  }

  // Generic education slogan detection
  const hasGenericSlogan = /learning made easy|study smarter not harder|unlock your potential|best (?:tutoring|education) platform|quality education|expert educators?|trusted platform/i.test(combined);
  if (hasGenericSlogan && matchedDiff.length < 2) {
    score -= 2;
    diagnostics.push('Relies on generic education slogans without specific Inkstall differentiators — replace with concrete mechanism description.');
  }

  score = Math.max(1, Math.min(10, score));

  return {
    score,
    diagnostics,
    matchedDifferentiators: matchedDiff.map((d) => d.label),
    isDifferentiated: score >= 7,
  };
};
`;

// ─────────────────────────────────────────────────────────────────────────────
// C. ENHANCED INDEPENDENT EVALUATOR (independentEvaluator.js)
// ─────────────────────────────────────────────────────────────────────────────

const independentEvaluatorCode = `/**
 * Independent Ads Creative Quality Evaluator — v2 Hardened.
 *
 * Strictly separates Technical Compliance from Creative Effectiveness.
 * v2 adds 5 new creative dimensions discovered from inkstall-parents-10th-grade-ad.mp4:
 *   - Visual Continuity
 *   - Emotional Authenticity
 *   - Text Artifact Risk
 *   - Story Coherence
 *   - Product Differentiation
 *
 * IMPORTANT: High scores in this evaluator reflect offline prompt quality assessment.
 * They do NOT guarantee that the Seedance-generated video will be visually high quality.
 * Actual video quality requires human evaluation of the generated artifact.
 */
import { computeScriptHash, assertScriptIntegrity } from '../script/canonicalScript.js';
import { validateTextAssetSafeAreas } from '../render/deterministicText.js';
import {
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
} from './creativeIntelligence.js';

/**
 * Gate 1: Technical Compliance (Deterministic Pass/Fail + Score 0-10)
 */
export const evaluateTechnicalCompliance = ({ plan, canonicalScript, candidatePrompt, expect = {} } = {}) => {
  const issues = [];
  let score = 10;

  // 1. Canonical Script Integrity & Immutability
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
      issues.push(\`Script integrity failed: \${err.message}\`);
    }
  }

  // 2. Deterministic Safe Area Bounds
  if (canonicalScript?.textAssets?.length) {
    const safeCheck = validateTextAssetSafeAreas(canonicalScript.textAssets, 720, 1280);
    if (!safeCheck.valid) {
      score = Math.min(score, 5);
      issues.push(\`Text overlays violate safe area margins: \${safeCheck.violations?.join(', ') || 'Out of bounds'}\`);
    }
  }

  // 3. Negative Typography Compiler Constraints (Seedance Clean Blank Surfaces)
  const promptText = String(candidatePrompt?.text || '');
  const hasNegativeConstraints = promptText.includes('Mandatory Negative Typography Constraints')
    && promptText.includes('Do not render readable text')
    && promptText.includes('clean, blank');
  if (!hasNegativeConstraints) {
    score = Math.min(score, 2);
    issues.push('Candidate prompt missing mandatory negative typography constraints.');
  }

  // 4. Text Artifact Risk (critical: no URL/brand/text rendering instructions in prompt)
  const textArtifactCheck = evaluateTextArtifactRisk({
    candidatePromptText: promptText,
    scenes: plan?.sceneSequence || [],
  });
  if (textArtifactCheck.hasCriticalRisk) {
    score = Math.min(score, 1);
    issues.push(...textArtifactCheck.diagnostics.filter((d) => d.startsWith('CRITICAL')));
  } else if (textArtifactCheck.score < 7) {
    score = Math.min(score, 5);
    issues.push(...textArtifactCheck.diagnostics);
  }

  // 5. Staging Isolation (Visual action must not echo dialogue)
  const scenes = plan?.sceneSequence || [];
  const echoesDialogue = scenes.some((s) => s.visualAction && s.dialogue && s.visualAction.includes(s.dialogue));
  if (echoesDialogue) {
    score = Math.min(score, 4);
    issues.push('Visual action echoes dialogue rather than staging observable camera/actor movement.');
  }

  // 6. CTA hold duration check
  const ctaBeat = scenes.find((s) => /cta/.test(String(s.beat || '').toLowerCase()));
  if (ctaBeat && typeof ctaBeat.durationSeconds === 'number' && ctaBeat.durationSeconds < 2.0) {
    score = Math.min(score, 6);
    issues.push(\`CTA beat duration (\${ctaBeat.durationSeconds}s) is too short — must be >= 2.0s for the deterministic end card to hold.\`);
  }

  return {
    passed: score >= 8 && issues.length === 0,
    score,
    issues,
    textArtifactRisk: textArtifactCheck,
  };
};

/**
 * Gate 2: Creative Quality & Commercial Effectiveness (0-10 Calibrated)
 * v2: adds Visual Continuity, Emotional Authenticity, Text Artifact Risk,
 *     Story Coherence, Product Differentiation, and Brand Authenticity dimensions.
 */
export const evaluateCreativeQuality = ({ plan, canonicalScript, brief = {}, expect = {} } = {}) => {
  const dialogue = canonicalScript?.dialogue || plan?.ad?.dialogue || '';
  const hook = plan?.ad?.hook || '';
  const visualAction = plan?.ad?.visualAction || '';
  const cta = plan?.ad?.cta || '';
  const scenes = plan?.sceneSequence || [];

  const diagnostics = [];
  const dimensions = {};

  const lowerDialogue = dialogue.toLowerCase();
  const lowerVisual = visualAction.toLowerCase();
  const lowerHook = hook.toLowerCase();

  // 1. Audience Relevance & Specificity (0-10) — weight 0.12
  let audienceScore = 10;
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
      diagnostics.push(\`Failed to address required pain points: [\${expect.mustContainPainPoint.join(', ')}].\`);
    }
  }
  dimensions.audienceRelevance = { score: audienceScore, targetAudience: canonicalScript?.targetAudience || 'unspecified', weight: 0.12 };

  // 2. Hook Strength & First-Second Attention (0-10) — weight 0.15
  const hookEval = evaluateHook({ hook, visualAction, prompt: expect.prompt || '' });
  dimensions.hookStrength = { score: hookEval.score, category: hookEval.categoryLabel, hasGenericStock: hookEval.hasGenericStock, weight: 0.15 };
  diagnostics.push(...hookEval.diagnostics);

  // 3. Hook to Product Mechanism Relevance (0-10) — weight 0.08
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
  dimensions.hookProductRelevance = { score: hookProductScore, weight: 0.08 };

  // 4. Value Proposition & Inkstall Mechanism Grounding (0-10) — weight 0.12
  const valEval = evaluateValueProposition({ dialogue, visualAction, brief });
  dimensions.valuePropositionClarity = { score: valEval.score, mechanisms: valEval.matchedMechanisms, weight: 0.12 };
  diagnostics.push(...valEval.diagnostics);

  // 5. Decisive Call To Action (0-10) — weight 0.10
  let ctaScore = 10;
  const lowerCta = cta.toLowerCase();
  const hasActionVerb = /\\b(book|try|get|claim|start|join|schedule)\\b/i.test(lowerCta);
  const mentionsDemoOrFree = /\\b(free|demo|session|trial)\\b/i.test(lowerCta);
  const isPassiveCta = /\\b(think about|consider|maybe|learn more|check out)\\b/i.test(lowerCta);
  if (isPassiveCta) { ctaScore = 3; diagnostics.push('CTA is passive and lacks decisive conversion motivation.'); }
  else if (!hasActionVerb) { ctaScore = 4; diagnostics.push('CTA lacks an active imperative verb (book, claim, try).'); }
  else if (!mentionsDemoOrFree) { ctaScore = 7; diagnostics.push('CTA does not explicitly mention free demo or trial session.'); }
  dimensions.ctaDecisiveness = { score: ctaScore, ctaText: cta, weight: 0.10 };

  // 6. Duration & Speech Pacing Feasibility (0-10) — weight 0.08
  const speechEval = estimateSpokenDuration(dialogue, { targetDurationSeconds: canonicalScript?.durationSeconds || 8 });
  dimensions.speechRateAndPacing = { score: speechEval.score, wordCount: speechEval.wordCount, syllableCount: speechEval.syllableCount, estimatedSeconds: speechEval.estimatedSeconds, ctaWindowSeconds: speechEval.ctaWindowSeconds, weight: 0.08 };
  diagnostics.push(...speechEval.diagnostics);

  // 7. Commercial Tone & Anti-Manipulation Guard (0-10) — weight 0.08
  let authenticityScore = 10;
  const falseGuarantees = /100% (?:marks|score|success)|guaranteed 99%|pass without studying|guaranteed board marks/i.test(lowerDialogue);
  const fearMongering = /ruin your future|life is over|shame the family/i.test(lowerDialogue);
  const boringBrochure = /we provide comprehensive educational solutions for all subjects and standards/i.test(lowerDialogue);
  if (falseGuarantees) { authenticityScore = 1; diagnostics.push('FATAL: Ad contains prohibited academic guarantees (100% marks guarantee).'); }
  else if (fearMongering) { authenticityScore = 2; diagnostics.push('FATAL: Ad employs exaggerated emotional manipulation.'); }
  else if (boringBrochure) { authenticityScore = 4; diagnostics.push('Ad is dry brochure speech lacking human emotion or commercial tension.'); }
  dimensions.persuasiveAuthenticity = { score: authenticityScore, weight: 0.08 };

  // 8. NEW: Visual Continuity (0-10) — weight 0.08
  const continuityEval = evaluateVisualContinuity(scenes);
  dimensions.visualContinuity = { score: continuityEval.score, weight: 0.08 };
  diagnostics.push(...continuityEval.diagnostics.filter((d) => !d.includes('not applicable')));

  // 9. NEW: Emotional Arc Authenticity (0-10) — weight 0.08
  const emotionalArcEval = evaluateEmotionalArc({ scenes, dialogue });
  dimensions.emotionalArcAuthenticity = { score: emotionalArcEval.score, hasVisualResolution: emotionalArcEval.hasVisualResolution, weight: 0.08 };
  diagnostics.push(...emotionalArcEval.diagnostics);

  // 10. NEW: Story Coherence (0-10) — weight 0.06
  const storyEval = evaluateStoryCoherence({ scenes, dialogue, hook });
  dimensions.storyCoherence = { score: storyEval.score, hasConflict: storyEval.hasConflict, hasMechanism: storyEval.hasMechanism, weight: 0.06 };
  diagnostics.push(...storyEval.diagnostics);

  // 11. NEW: Product Differentiation (0-10) — weight 0.07
  const diffEval = evaluateProductDifferentiation({ dialogue, visualAction, scenes });
  dimensions.productDifferentiation = { score: diffEval.score, matchedDifferentiators: diffEval.matchedDifferentiators, weight: 0.07 };
  diagnostics.push(...diffEval.diagnostics);

  // 12. NEW: Brand Authenticity (0-10) — weight 0.06
  const brandEval = evaluateBrandAuthenticity({ dialogue, visualAction });
  dimensions.brandAuthenticity = { score: brandEval.score, matchedPositioning: brandEval.matchedPositioning, weight: 0.06 };
  diagnostics.push(...brandEval.diagnostics);

  // Calculate weighted aggregate score
  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of Object.values(dimensions)) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  const aggregateScore = Number((weightedSum / totalWeight).toFixed(1));

  // Determine calibration band
  let calibrationTier = 'COMMERCIALLY_VIABLE';
  if (aggregateScore >= 8.8) calibrationTier = 'EXCELLENT';
  else if (aggregateScore >= 7.0) calibrationTier = 'COMMERCIALLY_VIABLE';
  else if (aggregateScore >= 5.5) calibrationTier = 'MEDIOCRE';
  else if (falseGuarantees || fearMongering) calibrationTier = 'MISLEADING_REJECTED';
  else if (speechEval.estimatedSeconds > 6.8) calibrationTier = 'OVERLOADED_REJECTED';
  else if (isDisconnectedHook) calibrationTier = 'DISCONNECTED_HOOK_REJECTED';
  else calibrationTier = 'SUBSTANDARD';

  const passed = aggregateScore >= 7.5
    && authenticityScore >= 6
    && speechEval.score >= 6
    && continuityEval.score >= 6
    && emotionalArcEval.score >= 6;

  return {
    aggregateScore,
    calibrationTier,
    passed,
    dimensions,
    diagnostics,
  };
};

/**
 * Unified Comprehensive Quality Evaluation
 *
 * NOTE: Scores reflect OFFLINE PROMPT QUALITY only. They are not a guarantee of
 * actual Seedance video quality, which requires human evaluation of the generated artifact.
 */
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
    offlineValidationOnly: true,
    note: 'Offline prompt quality score only. Actual Seedance video quality requires human evaluation of the generated artifact.',
    technical,
    creative,
    diagnostics: [...technical.issues, ...creative.diagnostics],
  };
};
`;

// ─────────────────────────────────────────────────────────────────────────────
// D. ENHANCED VISUAL QUALITY RUBRIC (visualQualityRubric.js)
// ─────────────────────────────────────────────────────────────────────────────

const visualQualityRubricCode = `/**
 * 17-Dimension Commercial Advertising Visual Quality Rubric — v2.
 *
 * v2 adds 5 new dimensions from the inkstall-parents-10th-grade-ad.mp4 failures:
 * 13. Visual Continuity
 * 14. Emotional Authenticity
 * 15. Text Artifact Risk
 * 16. Product Differentiation
 * 17. CTA Visibility (combined deterministic + hold window)
 *
 * OFFLINE VALIDATION ONLY. Does not evaluate actual generated video frames.
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
  // v2 additions
  { id: 'visual_continuity', name: 'Visual Continuity', description: 'Character, clothing, environment, and lighting consistent across all scenes.' },
  { id: 'emotional_authenticity', name: 'Emotional Authenticity', description: 'Emotions are gradual, realistic, and visually caused — not narrated.' },
  { id: 'text_artifact_risk', name: 'Text Artifact Risk', description: 'Zero instructions for Seedance to render branded text, URLs, or equations.' },
  { id: 'product_differentiation', name: 'Product Differentiation', description: 'Visually distinguishes Inkstall 1-on-1 from generic batch coaching.' },
  { id: 'cta_visibility', name: 'CTA Visibility & Safe Areas', description: 'CTA end card holds >= 2.0s, inside mobile safe area, no narration competition.' },
];

export const evaluateVisualCandidate = ({ visualBeats = [], candidatePrompt = '', textAssets = [], scenes = [] } = {}) => {
  const promptText = String(candidatePrompt || '');
  const scores = {};
  const issues = [];

  // 1. Opening Visual
  const firstBeat = visualBeats[0] || {};
  const firstAction = String(firstBeat.visualAction || '').toLowerCase();
  const hasOpeningTension = /ticking|clock|staring|hesitat|frozen|doubt|exam|stack|curious|demonstrat|worried|furrowed|frustrated|concern/i.test(firstAction);
  const hasStockSmile = /smiling directly|wave|smiling at camera|welcoming wave/i.test(firstAction);
  scores.opening_visual = hasOpeningTension && !hasStockSmile ? 9 : hasStockSmile ? 4 : 7;
  if (hasStockSmile) issues.push('Opening visual features stock talent smiling rather than friction.');

  // 2. Clean Surfaces & Negative Typography
  const hasNegativeConstraints = promptText.includes('clean, blank') && promptText.includes('Do not render readable text');
  scores.clean_surfaces = hasNegativeConstraints ? 10 : 3;
  if (!hasNegativeConstraints) issues.push('Missing strict negative typography constraints.');

  // 3. Camera Motion & Pacing
  const allVisualActions = [...visualBeats.map((b) => b.visualAction || ''), ...scenes.map((s) => s.visualAction || '')];
  const hasMotionStaging = allVisualActions.some((v) => /push-in|slow pan|medium shot|handheld|dynamic cut|close-up|dissolve|cut to|holds? on/i.test(v));
  scores.camera_motion = hasMotionStaging ? 9 : 6;

  // 4. Decisive CTA Hold
  const lastBeat = visualBeats[visualBeats.length - 1] || {};
  const ctaDuration = lastBeat.durationSeconds || 0;
  scores.decisive_cta_hold = ctaDuration >= 2.0 ? 9 : ctaDuration >= 1.8 ? 7 : 5;
  if (ctaDuration < 2.0) issues.push(\`CTA beat duration (\${ctaDuration}s) is too short — the deterministic end card needs >= 2.0s to hold.\`);

  // 5. NEW: Visual Continuity
  const allVisuals = allVisualActions.join(' ').toLowerCase();
  const hasCharacterAnchor = /wearing|top|shirt|salwar|sari|kurta|in (?:blue|teal|white)|hair (?:tied|neat)|early \d0s|indian (?:mother|father|student)/i.test(allVisuals);
  const hasTransitionSignal = /cut to|same (?:room|table|location)|camera holds|dissolve|now (?:relaxed|smiling|studying)/i.test(allVisuals);
  scores.visual_continuity = (hasCharacterAnchor && hasTransitionSignal) ? 9 : hasCharacterAnchor ? 7 : hasTransitionSignal ? 6 : 4;
  if (!hasCharacterAnchor) issues.push('No character appearance anchor — add clothing/age descriptors so Seedance generates a consistent character.');
  if (!hasTransitionSignal) issues.push('No scene transition signals — add "cut to", "same location", or "camera holds" to guide Seedance continuity.');

  // 6. NEW: Emotional Authenticity
  const hasTutorAction = /tutor|teacher|mentor/.test(allVisuals);
  const hasVisualResolution = /explains?|demonstrates?|draws?|points?|whiteboard|tablet|screen/i.test(allVisuals);
  const hasReaction = /smil|relief|relax|lights? up|nods?|confident|clarity|aha/i.test(allVisuals);
  const hasExaggeration = /dramatical|tears|crying|devastated|meltdown/i.test(allVisuals);
  scores.emotional_authenticity = (hasVisualResolution && hasReaction && !hasExaggeration) ? 9
    : (hasVisualResolution && !hasExaggeration) ? 7
    : hasExaggeration ? 4 : 5;
  if (!hasVisualResolution && hasTutorAction) issues.push('Tutor present but no visible teaching action — add whiteboard/tablet explanation to ground the emotional resolution.');
  if (hasExaggeration) issues.push('Exaggerated emotional language detected — use subtle, realistic cues.');

  // 7. NEW: Text Artifact Risk
  const hasUrlOrBrand = /inkstall\.com|www\.|http|typography card|card reads?|display "[\w\s•·]{3,}"/i.test(promptText + allVisuals);
  const hasFormulaRequest = /mathematical equation|chemical formula|algebra problem|write.*formula/i.test(allVisuals);
  scores.text_artifact_risk = hasUrlOrBrand ? 1 : hasFormulaRequest ? 4 : hasNegativeConstraints ? 10 : 5;
  if (hasUrlOrBrand) issues.push('CRITICAL: URL or branded text instruction found — will cause Seedance text hallucination artifacts.');
  if (hasFormulaRequest) issues.push('Formula/equation render request — replace with "abstract diagram" to avoid text artifacts.');

  // 8. NEW: Product Differentiation
  const hasDifferentiator = /1-on-1|one[- ]on[- ]one|interactive whiteboard|digital whiteboard|individual(?:ized)? pace|subject.?specialist/i.test(allVisuals);
  scores.product_differentiation = hasDifferentiator ? 9 : 5;
  if (!hasDifferentiator) issues.push('No visual product differentiator — show 1-on-1 interaction, interactive whiteboard, or individualized learning to distinguish from generic coaching.');

  // 9. NEW: CTA Visibility
  const hasCtaTypographyAsset = textAssets.some((a) => a.purpose === 'cta_card' || a.purpose === 'cta_button');
  const ctaAsset = textAssets.find((a) => a.purpose === 'cta_card');
  const ctaHold = ctaAsset ? (ctaAsset.timing?.endTimeSec - ctaAsset.timing?.startTimeSec) : (lastBeat.durationSeconds || 0);
  scores.cta_visibility = (hasCtaTypographyAsset && ctaHold >= 2.0) ? 9
    : hasCtaTypographyAsset ? 7 : ctaHold >= 2.0 ? 6 : 4;
  if (!hasCtaTypographyAsset) issues.push('No deterministic CTA typography asset defined — CTA must be rendered by the compositing engine, not by Seedance.');

  const scoreValues = Object.values(scores);
  const aggregateScore = Number((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1));

  return {
    aggregateScore,
    dimensionScores: scores,
    passed: aggregateScore >= 8.0 && scores.clean_surfaces >= 8 && scores.text_artifact_risk >= 8,
    issues,
    offlineValidationOnly: true,
    note: 'Scores are based on prompt inspection only. Actual visual quality requires human review of the Seedance-generated video frames.',
  };
};
`;

// ─────────────────────────────────────────────────────────────────────────────
// E. REGRESSION TEST SUITE (tests/adsVideoQualityRegression.test.js)
// ─────────────────────────────────────────────────────────────────────────────

const regressionTestCode = `/**
 * Ads Video Quality Regression Test Suite
 *
 * Tests the specific failures observed in inkstall-parents-10th-grade-ad.mp4:
 *
 * FAILURE 1: Text artifact (distorted "Book a 1-on-1 Demo • inkstall.com" on screen)
 *   → Root cause: generate-video-3.mjs asked Seedance to render branded text.
 *   → Tests: text artifact risk evaluator, pipeline prompt constraints.
 *
 * FAILURE 2: Scene discontinuity (characters/environment appeared inconsistent)
 *   → Root cause: No character anchors or transition signals in prompt.
 *   → Tests: visual continuity evaluator.
 *
 * FAILURE 3: Unmotivated emotional arc (mother "smiles with peace" without causal event)
 *   → Root cause: Emotional resolution was narrated, not visually grounded.
 *   → Tests: emotional arc authenticity evaluator.
 *
 * FAILURE 4: Generic coaching-centre visuals, no Inkstall differentiation
 *   → Root cause: Plannerless freeform prompt, no brand positioning requirements.
 *   → Tests: brand authenticity, product differentiation evaluators.
 *
 * FAILURE 5: CTA holding window not enforced
 *   → Root cause: generate-video-3.mjs provided no CTA duration constraints.
 *   → Tests: CTA visibility, holding window validators.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEmotionalArc,
  evaluateBrandAuthenticity,
  evaluateVisualContinuity,
  evaluateTextArtifactRisk,
  evaluateStoryCoherence,
  evaluateProductDifferentiation,
} from '../video/ads/creativeIntelligence.js';
import {
  evaluateAdComprehensive,
  evaluateTechnicalCompliance,
  evaluateCreativeQuality,
} from '../video/ads/independentEvaluator.js';
import { evaluateVisualCandidate } from '../video/render/visualQualityRubric.js';
import { createCanonicalScript } from '../video/script/canonicalScript.js';

// ─── FAILURE 1: Text Artifact Risk ───────────────────────────────────────────

test('Regression: Text artifact risk — URL in visual prompt is CRITICAL risk (inkstall-parents-10th-grade-ad root cause)', () => {
  const badPromptWithUrl = \`Create video for Inkstall.
Typography card: "Book a 1-on-1 Demo • inkstall.com"
Scene 1: Parents watching student study.\`;

  const result = evaluateTextArtifactRisk({
    candidatePromptText: badPromptWithUrl,
    scenes: [],
  });

  assert.ok(result.hasCriticalRisk, 'URL/branded text in prompt must be flagged as CRITICAL text artifact risk');
  assert.ok(result.score <= 3, \`Text artifact quality score must be <= 3 for URL-containing prompt, got \${result.score}\`);
  assert.ok(result.diagnostics.some((d) => d.startsWith('CRITICAL')), 'Must produce a CRITICAL diagnostic');
});

test('Regression: Text artifact risk — formula/equation render request is moderate risk', () => {
  const promptWithFormula = \`Scene: Tutor writes a mathematical equation on whiteboard.
Student struggles with algebraic expression.\`;

  const result = evaluateTextArtifactRisk({
    candidatePromptText: promptWithFormula,
    scenes: [{ visualAction: 'Tutor writes mathematical equation on whiteboard' }],
  });

  assert.ok(result.score <= 6, \`Formula instruction must score <= 6, got \${result.score}\`);
  assert.ok(result.diagnostics.length > 0, 'Must produce at least one risk diagnostic');
});

test('Regression: Text artifact risk — clean prompt with negative constraints scores >= 9', () => {
  const cleanPrompt = \`[Mandatory Negative Typography Constraints / Clean Surfaces]:
- Do not render readable text, letters, numbers, symbols, words, or typography on any surface.
- All whiteboards, screens, signs must remain clean, blank, or abstractly illustrated without legible writing.
Scene: Tutor gestures at clean blank digital whiteboard.\`;

  const result = evaluateTextArtifactRisk({
    candidatePromptText: cleanPrompt,
    scenes: [{ visualAction: 'Tutor gestures at clean blank digital whiteboard with abstract glowing diagram' }],
  });

  assert.ok(result.score >= 9, \`Clean prompt must score >= 9, got \${result.score}\`);
  assert.ok(!result.hasCriticalRisk, 'Clean prompt must not have critical text artifact risk');
});

test('Regression: Technical compliance rejects prompt with URL/branded text (score capped at 1)', () => {
  const canonicalScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: 'Worried about your child? Inkstall 1-on-1 tutors give clarity. Book free demo.',
    visualBeats: [
      { beatName: 'hook', visualAction: 'Parent looks worried at report card.', dialogue: 'Worried about your child?', durationSeconds: 2 },
      { beatName: 'cta', visualAction: 'Student smiles at tablet.', dialogue: 'Book free demo.', durationSeconds: 2.5 },
    ],
    ctaText: 'Book a Free Demo on Inkstall',
  });

  const badPrompt = { text: 'Typography card: Book a 1-on-1 Demo • inkstall.com\\nScene 1: Parents watching.' };

  const result = evaluateTechnicalCompliance({
    plan: { sceneSequence: [] },
    canonicalScript,
    candidatePrompt: badPrompt,
  });

  assert.ok(!result.passed, 'Technical compliance must FAIL when prompt contains URL text instructions');
  assert.ok(result.score <= 2, \`Score must be capped at <= 2 for CRITICAL text risk, got \${result.score}\`);
  assert.ok(result.issues.some((i) => /CRITICAL.*text|URL|branded text|text.*risk/i.test(i)), 'Issues must include text artifact reason');
});

// ─── FAILURE 2: Scene Continuity ─────────────────────────────────────────────

test('Regression: Visual continuity — no character anchor fails continuity check', () => {
  const scenesWithoutAnchor = [
    { beat: 'hook', visualAction: 'A student sits at a desk with books.', dialogue: 'Struggling with exams?' },
    { beat: 'product_reveal', visualAction: 'A tutor explains something.', dialogue: 'Inkstall 1-on-1 live tutors help.' },
    { beat: 'cta', visualAction: 'Someone smiles at a tablet.', dialogue: 'Book your free demo.' },
  ];

  const result = evaluateVisualContinuity(scenesWithoutAnchor);

  assert.ok(result.score <= 6, \`Missing character anchor must score <= 6, got \${result.score}\`);
  assert.ok(result.diagnostics.some((d) => /character|appearance|anchor|clothing/i.test(d)), 'Must flag missing character anchor');
});

test('Regression: Visual continuity — with character anchor and transition signals scores >= 8', () => {
  const scenesWithAnchor = [
    { beat: 'hook', visualAction: 'Indian mother in blue salwar kameez sits at warm kitchen table, looking at report card with a slight frown.', dialogue: 'Worried about your child?' },
    { beat: 'product_reveal', visualAction: 'Cut to — same mother now watching tablet screen showing Inkstall tutor explaining on clean blank whiteboard.', dialogue: 'Inkstall 1-on-1 expert tutors build real understanding.' },
    { beat: 'cta', visualAction: 'Camera holds on same mother at kitchen table, visibly more relaxed, son studying confidently beside her.', dialogue: 'Book your free demo today.' },
  ];

  const result = evaluateVisualContinuity(scenesWithAnchor);

  assert.ok(result.score >= 8, \`Strong continuity should score >= 8, got \${result.score}\`);
  assert.ok(result.isConsistent, 'Strong continuity scenes must be marked consistent');
});

test('Regression: Visual quality rubric rejects prompt with no character anchor (score < 8)', () => {
  const weakCandidate = {
    visualBeats: [
      { beatName: 'hook', visualAction: 'Student at desk with books.', durationSeconds: 2 },
      { beatName: 'product_reveal', visualAction: 'Tutor explains on screen.', durationSeconds: 3.5 },
      { beatName: 'cta', visualAction: 'Smiling person at phone.', durationSeconds: 2.5 },
    ],
    candidatePrompt: '[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
    textAssets: [],
    scenes: [],
  };

  const result = evaluateVisualCandidate(weakCandidate);
  assert.ok(!result.passed || result.dimensionScores.visual_continuity < 8,
    \`Weak continuity should fail rubric or score < 8 on visual_continuity, got \${result.dimensionScores.visual_continuity}\`);
  assert.ok(result.issues.some((i) => /character|anchor|continuity|transition/i.test(i)), 'Rubric must flag continuity issues');
});

// ─── FAILURE 3: Emotional Arc Authenticity ────────────────────────────────────

test('Regression: Emotional arc — resolution narrated without tutor action scores <= 5', () => {
  const narrationOnlyArc = [
    { beat: 'hook', visualAction: 'Parents look anxiously at student studying.', dialogue: 'Is your child struggling?' },
    { beat: 'cta', visualAction: 'Mother smiles with genuine peace of mind.', dialogue: 'Book your free demo today.' },
  ];

  const result = evaluateEmotionalArc({ scenes: narrationOnlyArc, dialogue: 'Is your child struggling? Book your free demo today.' });

  assert.ok(result.score <= 6, \`Narration-only emotional arc must score <= 6, got \${result.score}\`);
  assert.ok(result.diagnostics.some((d) => /tutor|visible|action|causal|whiteboard|explains/i.test(d)),
    'Must flag missing visual causal event');
});

test('Regression: Emotional arc — tutor explains on whiteboard causes visible student reaction scores >= 8', () => {
  const groundedArc = [
    { beat: 'hook', visualAction: 'Teen boy frowns at open textbook, eraser in hand, tired posture at desk.', dialogue: 'Stuck on that same concept again?' },
    { beat: 'product_reveal', visualAction: 'Subject-specialist Inkstall tutor explains step-by-step on clean digital whiteboard; student leans forward, eyes widening with understanding.', dialogue: 'Inkstall expert tutors explain concepts clearly, at your pace.' },
    { beat: 'cta', visualAction: 'Same student nods confidently as tutor smiles; camera holds on student opening notebook with purpose.', dialogue: 'Book your free 1-on-1 session today.' },
  ];

  const result = evaluateEmotionalArc({ scenes: groundedArc, dialogue: 'Stuck on that same concept again? Inkstall expert tutors explain concepts clearly, at your pace. Book your free 1-on-1 session today.' });

  assert.ok(result.score >= 8, \`Visually grounded arc should score >= 8, got \${result.score}\`);
  assert.ok(result.isAuthentic, 'Grounded emotional arc must be marked authentic');
  assert.ok(result.hasVisualResolution, 'Must detect visual resolution event');
});

test('Regression: Emotional arc — exaggerated emotional language is penalized', () => {
  const dramaticArc = [
    { beat: 'hook', visualAction: 'Parent dramatically crying over report card.', dialogue: 'Your child is failing?' },
    { beat: 'cta', visualAction: 'Student celebrates wildly after one session.', dialogue: 'Book now.' },
  ];

  const result = evaluateEmotionalArc({ scenes: dramaticArc, dialogue: 'Your child is failing? Book now.' });

  assert.ok(result.score <= 5, \`Exaggerated emotional language must score <= 5, got \${result.score}\`);
  assert.ok(result.diagnostics.some((d) => /exaggerat/i.test(d)), 'Must flag exaggerated emotional language');
});

// ─── FAILURE 4: Brand Authenticity & Product Differentiation ─────────────────

test('Regression: Brand authenticity — no Inkstall differentiators scores <= 5', () => {
  const genericDialogue = 'Give your child the best education. Our tutors help all students. Sign up today.';
  const result = evaluateBrandAuthenticity({ dialogue: genericDialogue, visualAction: 'Students in classroom.' });

  assert.ok(result.score <= 5, \`Generic ad must score <= 5 on brand authenticity, got \${result.score}\`);
  assert.ok(result.diagnostics.some((d) => /verified inkstall|1-on-1|specialist|whiteboard|pace/i.test(d)),
    'Must flag missing Inkstall positioning');
});

test('Regression: Brand authenticity — invented success statistic is prohibited', () => {
  const inventedStatDialogue = '95% of our students improved marks in 30 days. Inkstall 1-on-1 tutors.';
  const result = evaluateBrandAuthenticity({ dialogue: inventedStatDialogue, visualAction: '' });

  assert.ok(result.score <= 4, \`Invented statistic must score <= 4, got \${result.score}\`);
  assert.ok(result.diagnostics.some((d) => /prohibited|statistic|fabricated/i.test(d)), 'Must flag invented statistic');
});

test('Regression: Brand authenticity — verified Inkstall positioning scores >= 8', () => {
  const goodDialogue = '1-on-1 live tutoring with subject-specialist teachers on an interactive digital whiteboard. At your child\'s own pace.';
  const result = evaluateBrandAuthenticity({ dialogue: goodDialogue, visualAction: 'Tutor explains on clean whiteboard.' });

  assert.ok(result.score >= 8, \`Verified positioning should score >= 8, got \${result.score}\`);
  assert.ok(result.isAuthentic, 'Verified positioning must be marked authentic');
  assert.ok(result.matchedPositioning.length >= 2, \`Should match >= 2 positioning claims, got \${result.matchedPositioning.length}\`);
});

test('Regression: Product differentiation — no differentiator in visual prompt scores <= 6', () => {
  const result = evaluateProductDifferentiation({
    dialogue: 'Learn from our best tutors. Education matters.',
    visualAction: 'Generic classroom with students and teacher.',
    scenes: [{ visualAction: 'Students in rows listening to teacher.' }],
  });

  assert.ok(result.score <= 6, \`No differentiator must score <= 6, got \${result.score}\`);
  assert.ok(!result.isDifferentiated, 'Must not be marked differentiated');
});

test('Regression: Product differentiation — 1-on-1 interactive whiteboard scores >= 8', () => {
  const result = evaluateProductDifferentiation({
    dialogue: 'Get 1-on-1 live tutoring with an interactive digital whiteboard at your own pace.',
    visualAction: 'Tutor and student collaborate on clean digital whiteboard 1-on-1.',
    scenes: [
      { visualAction: '1-on-1 session: subject-specialist tutor explains on interactive whiteboard.' },
    ],
  });

  assert.ok(result.score >= 8, \`Clear differentiator should score >= 8, got \${result.score}\`);
  assert.ok(result.isDifferentiated, 'Must be marked differentiated');
  assert.ok(result.matchedDifferentiators.length >= 2, \`Should match >= 2 differentiators, got \${result.matchedDifferentiators.length}\`);
});

// ─── FAILURE 5: CTA Visibility & Holding Window ────────────────────────────────

test('Regression: CTA hold < 2.0s is flagged as too short by technical compliance', () => {
  const canonicalScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: 'Child struggling with math? Inkstall 1-on-1 live tutors help. Book free demo.',
    visualBeats: [
      { beatName: 'hook', visualAction: 'Parent looks at report card with slight frown.', dialogue: 'Child struggling with math?', durationSeconds: 3 },
      { beatName: 'product_reveal', visualAction: 'Tutor explains on clean blank digital whiteboard.', dialogue: 'Inkstall 1-on-1 live tutors help.', durationSeconds: 3.5 },
      { beatName: 'cta', visualAction: 'Student studies confidently.', dialogue: 'Book free demo.', durationSeconds: 1.0 }, // TOO SHORT
    ],
    ctaText: 'Book a Free Demo on Inkstall',
  });

  const cleanPrompt = {
    text: '[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank\\n- Mandatory Negative Typography Constraints',
  };

  const result = evaluateTechnicalCompliance({
    plan: {
      sceneSequence: [
        { beat: 'hook', visualAction: 'Parent looks at report card.', dialogue: 'Child struggling with math?' },
        { beat: 'cta', visualAction: 'Student studies confidently.', dialogue: 'Book free demo.', durationSeconds: 1.0 },
      ],
    },
    canonicalScript,
    candidatePrompt: cleanPrompt,
  });

  assert.ok(!result.passed, 'Technical compliance must FAIL when CTA hold < 2.0s');
  assert.ok(result.issues.some((i) => /cta.*duration|holding|too short|2\.0/i.test(i)), 'Must flag CTA duration issue');
});

test('Regression: Visual rubric CTA visibility — no deterministic CTA asset scores <= 6', () => {
  const result = evaluateVisualCandidate({
    visualBeats: [
      { beatName: 'hook', visualAction: 'Student frowns at textbook.', durationSeconds: 2.5 },
      { beatName: 'product_reveal', visualAction: 'Tutor gestures at clean whiteboard.', durationSeconds: 3.5 },
      { beatName: 'cta', visualAction: 'Student smiles.', durationSeconds: 2.0 },
    ],
    candidatePrompt: '[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
    textAssets: [], // No deterministic CTA asset
    scenes: [],
  });

  assert.ok(result.dimensionScores.cta_visibility <= 6, \`Missing CTA typography asset must score <= 6, got \${result.dimensionScores.cta_visibility}\`);
  assert.ok(result.issues.some((i) => /deterministic|typography.*asset|compositing/i.test(i)), 'Must flag missing deterministic CTA asset');
});

test('Regression: Visual rubric CTA visibility — deterministic CTA asset with 2.5s hold scores >= 9', () => {
  const result = evaluateVisualCandidate({
    visualBeats: [
      { beatName: 'hook', visualAction: 'Indian mother in salwar looks at report card with concern.', durationSeconds: 2.5 },
      { beatName: 'product_reveal', visualAction: 'Subject-specialist tutor explains on clean blank whiteboard.', durationSeconds: 3 },
      { beatName: 'cta', visualAction: 'Same mother relaxes; student smiles.', durationSeconds: 2.5 },
    ],
    candidatePrompt: '[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text\\n- clean, blank',
    textAssets: [
      {
        textAssetId: 'test-cta-id',
        purpose: 'cta_card',
        text: 'Book a Free Demo on Inkstall',
        timing: { startTimeSec: 5.5, endTimeSec: 8.0 },
        position: { x: 'center', y: 'bottom', marginPercent: 10, safeArea: 'mobile-9:16' },
        style: { fontFamily: 'Inter', fontSizePx: 28, fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#0284C7', borderRadiusPx: 12 },
      },
    ],
    scenes: [],
  });

  assert.ok(result.dimensionScores.cta_visibility >= 9, \`Deterministic CTA with 2.5s hold should score >= 9, got \${result.dimensionScores.cta_visibility}\`);
});

// ─── FULL PIPELINE INTEGRATION: Parents 10th Grade Scenario ──────────────────

test('Regression: Full evaluation of parents-10th-grade-like plan with all v2 dimensions', () => {
  // This represents a correctly-planned version of the generate-video-3.mjs scenario
  const goodPlan = {
    ad: {
      hook: 'Is your 10th grader spending hours studying — but still unclear on concepts?',
      dialogue: 'Confused child, worried parent? Inkstall 1-on-1 subject-specialist tutors make concepts click. Book your free demo.',
      visualAction: 'Indian mother in blue salwar kameez at warm kitchen table, quietly watching teenage son hunched over textbooks with concern.',
      cta: 'Book Your Free 1-on-1 Demo on Inkstall',
    },
    sceneSequence: [
      {
        beat: 'hook',
        visualAction: 'Indian mother in blue salwar kameez sits at warm kitchen table; teenage son (10th grade) hunched over textbooks, rubbing his forehead. She watches with quiet concern.',
        dialogue: 'Is your 10th grader spending hours studying — but still unclear on concepts?',
        durationSeconds: 2.5,
      },
      {
        beat: 'product_reveal',
        visualAction: 'Cut to — same son now in 1-on-1 video call with an Inkstall subject-specialist tutor. Tutor patiently explains on a clean blank digital whiteboard using an abstract geometric diagram. Son leans forward, visibly engaged.',
        dialogue: 'Inkstall 1-on-1 subject-specialist tutors explain at your child\'s own pace.',
        durationSeconds: 3.0,
      },
      {
        beat: 'cta',
        visualAction: 'Camera holds on same mother at kitchen table — now noticeably calmer, watching son study confidently beside her. Soft warm light.',
        dialogue: 'Book your free demo.',
        durationSeconds: 2.5,
      },
    ],
  };

  const canonicalScript = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of 10th grade students',
    durationSeconds: 8,
    dialogue: goodPlan.ad.dialogue,
    visualBeats: goodPlan.sceneSequence.map((s) => ({
      beatName: s.beat,
      visualAction: s.visualAction,
      dialogue: s.dialogue,
      durationSeconds: s.durationSeconds,
    })),
    ctaText: goodPlan.ad.cta,
    brandName: 'Inkstall',
  });

  const cleanPrompt = {
    text: \`Workflow: ads (SCRIPT_LOCKED)\\n[Mandatory Negative Typography Constraints / Clean Surfaces]:\\n- Do not render readable text, letters, numbers, symbols, words, or typography on any surface.\\n- clean, blank whiteboard surfaces only.\\n- Do not render readable text\\n- Mandatory Negative Typography Constraints\`,
  };

  const result = evaluateAdComprehensive({
    plan: goodPlan,
    canonicalScript,
    candidatePrompt: cleanPrompt,
    expect: { mustContainPainPoint: ['confused', 'worried', 'hours studying'] },
    brief: { targetAudience: 'parents of 10th grade students' },
  });

  // Technical compliance must pass
  assert.ok(result.technical.passed, \`Technical compliance must pass for a well-formed plan, issues: \${result.technical.issues.join('; ')}\`);

  // Creative dimensions must all be reasonable
  const dims = result.creative.dimensions;
  assert.ok(dims.visualContinuity.score >= 7, \`Visual continuity should be >= 7, got \${dims.visualContinuity.score}\`);
  assert.ok(dims.emotionalArcAuthenticity.score >= 7, \`Emotional arc should be >= 7, got \${dims.emotionalArcAuthenticity.score}\`);
  assert.ok(dims.brandAuthenticity.score >= 7, \`Brand authenticity should be >= 7, got \${dims.brandAuthenticity.score}\`);
  assert.ok(dims.productDifferentiation.score >= 7, \`Product differentiation should be >= 7, got \${dims.productDifferentiation.score}\`);
  assert.ok(dims.storyCoherence.score >= 7, \`Story coherence should be >= 7, got \${dims.storyCoherence.score}\`);

  // Overall
  assert.ok(result.aggregateScore >= 7.5, \`Well-formed plan should score >= 7.5, got \${result.aggregateScore}\`);
  assert.ok(result.offlineValidationOnly, 'Result must be marked offlineValidationOnly');
});

test('Regression: Story coherence — ad without product_reveal beat is incoherent', () => {
  const result = evaluateStoryCoherence({
    scenes: [
      { beat: 'hook', visualAction: 'Student struggles.' },
      { beat: 'cta', visualAction: 'Student smiles.' },
    ],
    dialogue: 'Struggling? Book free demo.',
    hook: 'Struggling?',
  });

  assert.ok(result.score <= 6, \`Missing product_reveal should score <= 6, got \${result.score}\`);
  assert.ok(!result.hasMechanism, 'Must detect missing product_reveal mechanism beat');
  assert.ok(result.diagnostics.some((d) => /product_reveal|proof|mechanism|skips/i.test(d)), 'Must flag missing mechanism beat');
});

test('Regression: Story coherence — full 3-beat arc with conflict, mechanism, CTA scores >= 8', () => {
  const result = evaluateStoryCoherence({
    scenes: [
      { beat: 'hook', visualAction: 'Student confused at desk.' },
      { beat: 'product_reveal', visualAction: 'Tutor explains on whiteboard, student lights up.' },
      { beat: 'cta', visualAction: 'Student studies confidently.' },
    ],
    dialogue: 'Stuck on chemistry? Inkstall 1-on-1 tutors make it clear. Book your free demo.',
    hook: 'Stuck on chemistry?',
  });

  assert.ok(result.score >= 8, \`Full 3-beat arc should score >= 8, got \${result.score}\`);
  assert.ok(result.isCoherent, 'Full arc must be marked coherent');
  assert.ok(result.hasConflict && result.hasMechanism && result.hasCta, 'Must have all three arc elements');
});
`;

// ─────────────────────────────────────────────────────────────────────────────
// WRITE ALL FILES
// ─────────────────────────────────────────────────────────────────────────────

// Read existing creativeIntelligence.js and append new functions
const existingCIPath = path.join(bAdsDir, 'creativeIntelligence.js');
let existingCI = fs.existsSync(existingCIPath) ? fs.readFileSync(existingCIPath, 'utf8') : '';

// Append new functions only if not already present
const ciAdditionsMarker = '// === v2 ADDITIONS: Visual Continuity, Emotional Arc, Brand Authenticity ===';
if (!existingCI.includes(ciAdditionsMarker)) {
  const ciAdditionsBlock = `\n\n${ciAdditionsMarker}\n${creativeIntelligenceAdditionsCode}`;
  fs.writeFileSync(existingCIPath, existingCI + ciAdditionsBlock, 'utf8');
  console.log('✓ Appended v2 functions to creativeIntelligence.js');
} else {
  console.log('⏭ creativeIntelligence.js v2 additions already present, skipping');
}

// Write independent evaluator (full replacement — v2)
fs.writeFileSync(path.join(bAdsDir, 'independentEvaluator.js'), independentEvaluatorCode, 'utf8');
console.log('✓ Wrote independentEvaluator.js (v2 — 12 creative dimensions)');

// Write visual quality rubric (full replacement — v2)
fs.writeFileSync(path.join(bRenderDir, 'visualQualityRubric.js'), visualQualityRubricCode, 'utf8');
console.log('✓ Wrote visualQualityRubric.js (v2 — 17 dimensions including 5 new)');

// Write planner prompt (full replacement — hardened)
fs.writeFileSync(path.join(bAdsDir, 'plannerPrompt.js'), plannerPromptCode, 'utf8');
console.log('✓ Wrote plannerPrompt.js (hardened — scene continuity + emotional arc + brand authenticity)');

// Write regression test suite
fs.writeFileSync(path.join(bTestsDir, 'adsVideoQualityRegression.test.js'), regressionTestCode, 'utf8');
console.log('✓ Wrote tests/adsVideoQualityRegression.test.js (regression tests for inkstall-parents-10th-grade-ad failures)');

console.log('\n=== Deployment Summary ===');
console.log('Files modified:');
console.log('  video/ads/creativeIntelligence.js — appended 6 new v2 functions');
console.log('  video/ads/independentEvaluator.js — replaced with v2 (12 creative dimensions)');
console.log('  video/render/visualQualityRubric.js — replaced with v2 (17 dimensions)');
console.log('  video/ads/plannerPrompt.js — hardened with continuity/emotional/brand constraints');
console.log('Files created:');
console.log('  tests/adsVideoQualityRegression.test.js — 18 regression tests');
console.log('\nNext step: node scripts/deploy-ads-quality-hardening-v2.mjs && node --test tests/adsVideoQualityRegression.test.js');
