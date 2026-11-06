import fs from 'node:fs';
import path from 'node:path';

const testPath = path.resolve('../marketing-automation-b/tests/adsAdaptiveCreativeValidation.test.js');
let code = fs.readFileSync(testPath, 'utf8');

const newTests = `

// ─── 7. EXPLICIT PRODUCTION TIMELINE & SCRIPT PROPAGATION ASSERTIONS ─────────

test('Production Contract: Beat sums strictly equal durationSeconds with zero arithmetic drift', () => {
  // Test 3 beats over 8 seconds
  const script3 = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: '10th grade students',
    durationSeconds: 8,
    dialogue: 'Stuck on that same math problem for thirty minutes? Inkstall expert 1-on-1 live tutors pinpoint your exact gap instantly. Book your demo.',
    visualBeats: [
      { beatName: 'hook', visualAction: 'Student staring frozen at late-night quadratic problem.' },
      { beatName: 'product_reveal', visualAction: 'Tutor in teal top demonstrates visual curve on clean whiteboard.' },
      { beatName: 'cta', visualAction: 'Camera holds on student smiling in relief.' },
    ],
  });

  const sum3 = Number(script3.visualBeats.reduce((s, b) => s + b.durationSeconds, 0).toFixed(1));
  assert.equal(sum3, 8.0, \`3-beat visual sum must be exactly 8.0s, got \${sum3}\`);
  assert.deepEqual(script3.visualBeats.map(b => b.durationSeconds), [2.7, 2.7, 2.6]);
  assert.equal(script3.productionTimeline.beatSumSeconds, 8.0);
  assert.equal(script3.productionTimeline.totalDurationSeconds, 8.0);

  // Test 4 beats over 8 seconds
  const script4 = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'students',
    durationSeconds: 8,
    dialogue: 'Geometry confusing? Inkstall whiteboard tutors make proofs simple. Book now.',
    visualBeats: [
      { beatName: 'hook', visualAction: 'Beat 1' },
      { beatName: 'conflict', visualAction: 'Beat 2' },
      { beatName: 'product_reveal', visualAction: 'Beat 3' },
      { beatName: 'cta', visualAction: 'Beat 4' },
    ],
  });
  const sum4 = Number(script4.visualBeats.reduce((s, b) => s + b.durationSeconds, 0).toFixed(1));
  assert.equal(sum4, 8.0, \`4-beat visual sum must be exactly 8.0s, got \${sum4}\`);
  assert.equal(script4.productionTimeline.beatSumSeconds, 8.0);
});

test('Production Contract: Narration deadline <= 6.0s preserves guaranteed >= 2.0s CTA overlay window', () => {
  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: '10th grade students',
    durationSeconds: 8,
    dialogue: 'Geometry turning into alien shapes? Inkstall 1-on-1 makes proofs click. Book free demo.',
    ctaText: 'Book Your Free Demo on Inkstall',
  });

  assert.ok(script.productionTimeline, 'productionTimeline must be present on locked script');
  assert.ok(script.productionTimeline.narrationCompletionDeadlineSeconds <= 6.0, 'Narration completion deadline must be <= 6.0s');
  assert.equal(script.productionTimeline.ctaOverlayStartSeconds, 5.5, 'CTA overlay start must be 5.5s');
  assert.equal(script.productionTimeline.ctaHoldingWindowSeconds, 2.5, 'CTA holding window must be 2.5s');
  assert.equal(script.productionTimeline.guaranteedCtaWindowPassed, true, 'guaranteedCtaWindowPassed must be true');

  // Verify text assets reflect the same timeline contract
  const ctaAsset = script.textAssets.find(t => t.purpose === 'cta_card');
  assert.ok(ctaAsset, 'CTA card asset must exist in textAssets');
  assert.equal(ctaAsset.timing.startTimeSec, 5.5);
  assert.equal(ctaAsset.timing.endTimeSec, 8.0);
  assert.equal(ctaAsset.timing.endTimeSec - ctaAsset.timing.startTimeSec, 2.5);
});

test('Script Integrity Propagation: Seedance candidate prompt carries exact ScriptId and SHA-256 ScriptHash', () => {
  const { buildSeedanceCandidatePrompt } = awaitImportSync('../video/runTrace.js');

  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'students who hate geometry',
    durationSeconds: 8,
    dialogue: 'Geometry turning into alien shapes? Inkstall 1-on-1 makes proofs click. Book free demo.',
    ctaText: 'Book Your Free Demo on Inkstall',
  });

  const candidate = buildSeedanceCandidatePrompt({
    workflow: 'ads',
    canonicalScript: script,
    creativeBrief: {
      concept: {
        characterAnchor: '10th grade student at cluttered study table; friendly tutor in teal top.',
        clothingAnchor: 'Casual student tee and signature teal tutor top.',
        setting: 'Student study table with compass and protractor.',
        cinematicStyle: 'Playful documentary framing, snappy comic timing.',
      },
    },
  });

  assert.equal(candidate.status, 'CANDIDATE_ONLY_NOT_SENT');
  assert.equal(candidate.seedanceInvoked, false);
  assert.equal(candidate.scriptLocked, true);
  assert.equal(candidate.scriptId, script.scriptId);
  assert.equal(candidate.scriptHash, script.scriptHash);

  assert.ok(candidate.text.includes(\`ScriptId: \${script.scriptId}\`), 'Candidate prompt text must include exact ScriptId');
  assert.ok(candidate.text.includes(\`ScriptHash: \${script.scriptHash}\`), 'Candidate prompt text must include exact ScriptHash');
  assert.ok(candidate.text.includes('10th grade student at cluttered study table'), 'Candidate prompt text must include concept character anchor');
  assert.ok(candidate.text.includes('Student study table with compass and protractor'), 'Candidate prompt text must include concept setting anchor');
  assert.ok(candidate.text.includes('[Mandatory Negative Typography Constraints / Clean Surfaces]:'), 'Must include negative typography constraints');
});

// ─── 8. COMBINATION & AMBIGUOUS ARCHETYPES VALIDATION ───────────────────────

test('Combination Archetype: Funny Product Demonstration routes to Humorous Product Demonstration with clean whiteboard mechanism', () => {
  const { selectCreativeAngle, generateCandidateConcepts } = awaitImportSync('../video/ads/creativeIntelligence.js');

  const angle = selectCreativeAngle({
    prompt: 'Make a funny ad demonstrating how Inkstall whiteboard solves difficult calculus',
    creativeBrief: { tone: ['funny', 'educational'] },
  });

  assert.equal(angle.id, 'humorous_demonstration');
  assert.equal(angle.name, 'Humorous Product Demonstration');
  assert.equal(angle.narrativeStructure, 'PRODUCT_DEMONSTRATION');

  const concepts = generateCandidateConcepts({
    prompt: 'Make a funny ad demonstrating how Inkstall whiteboard solves difficult calculus',
    creativeBrief: { tone: ['funny', 'educational'] },
  });

  assert.ok(concepts.length >= 3, 'Must produce candidate concepts');
  assert.ok(concepts.some(c => c.narrativeStructure === 'PRODUCT_DEMONSTRATION'));
});

test('Combination Archetype: Parent-focused geometry concern routes to Emotional Progression with student persistence', () => {
  const { selectCreativeAngle, generateCandidateConcepts } = awaitImportSync('../video/ads/creativeIntelligence.js');

  const angle = selectCreativeAngle({
    prompt: 'Ad for parents worried their 10th grader is falling behind in geometry proofs',
    creativeBrief: { tone: ['cinematic'] },
  });

  assert.equal(angle.name, 'Emotional Relief');
  assert.equal(angle.narrativeStructure, 'EMOTIONAL_PROGRESSION');

  const concepts = generateCandidateConcepts({
    prompt: 'Ad for parents worried their 10th grader is falling behind in geometry proofs',
    creativeBrief: { tone: ['cinematic'] },
  });

  assert.ok(concepts.length >= 3, 'Must produce candidate concepts');
  const primary = concepts[0];
  assert.equal(primary.adaptiveConstraints.characterContinuityScope, 'persistent_student');
});
`;

// Helper for dynamic imports in test file if needed or require directly
if (!code.includes('awaitImportSync')) {
  const importHelper = `
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const awaitImportSync = (relPath) => require(relPath);
`;
  // Instead of require on ESM, let's use direct top-level ESM imports
}

fs.writeFileSync(testPath, code, 'utf8');
console.log('Read test file.');
