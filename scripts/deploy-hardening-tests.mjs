import fs from 'node:fs';
import path from 'node:path';

// 1. canonicalScript.test.js
const test1Content = `import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCanonicalScript,
  assertScriptIntegrity,
  computeScriptHash,
  ScriptIntegrityError,
  generateSubtitleSegments,
  deriveTextAssets,
} from '../video/script/canonicalScript.js';

test('createCanonicalScript creates an immutable locked script with valid hash', () => {
  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: 'Science confusing your child? Inkstall builds real understanding. Book free demo.',
    visualBeats: [
      { beatName: 'hook', visualAction: 'Parent worried at desk.', dialogue: 'Science confusing your child?' },
      { beatName: 'proof', visualAction: 'Tutor explains concept at clean whiteboard.', dialogue: 'Inkstall builds real understanding.' },
      { beatName: 'cta', visualAction: 'Hand holding phone with booking button.', dialogue: 'Book free demo.' },
    ],
    brandName: 'Inkstall',
    ctaText: 'Book a Free Demo on Inkstall',
  });

  assert.equal(script.workflowType, 'ads');
  assert.equal(script.durationSeconds, 8);
  assert.equal(script.validationStatus, 'LOCKED');
  assert.equal(typeof script.scriptHash, 'string');
  assert.equal(script.scriptHash.length, 64);
  assert.ok(Array.isArray(script.subtitleSegments));
  assert.ok(script.subtitleSegments.length > 0);
  assert.ok(Array.isArray(script.textAssets));
  assert.ok(script.textAssets.some((a) => a.purpose === 'brand_name'));
  assert.ok(script.textAssets.some((a) => a.purpose === 'cta_card'));

  // Immutability: script is frozen
  assert.ok(Object.isFrozen(script));

  // Integrity assertion passes
  assert.doesNotThrow(() => assertScriptIntegrity(script));
});

test('assertScriptIntegrity detects dialogue tampering and throws ScriptIntegrityError', () => {
  const script = createCanonicalScript({
    workflowType: 'lesson',
    targetAudience: 'learners',
    durationSeconds: 8,
    dialogue: 'Fruits develop from flowers and protect the seeds inside.',
    visualBeats: [
      { beatName: 'lesson', visualAction: 'Tutor gestures at clean whiteboard diagram.', dialogue: 'Fruits develop from flowers and protect the seeds inside.' },
    ],
  });

  // Tamper with dialogue in an unfrozen clone
  const tampered = { ...script, dialogue: 'Fruits grow from flowers and feed everyone.' };

  assert.throws(
    () => assertScriptIntegrity(tampered),
    (err) => err instanceof ScriptIntegrityError && err.code === 'SCRIPT_INTEGRITY_VIOLATION'
  );
});

test('createCanonicalScript rejects dialogue that exceeds maximum speech rate', () => {
  // 35 words in an 8-second clip = 4.375 wps (> 2.8 wps limit)
  const tooLong = 'In this comprehensive introductory session on plant morphology and biological reproduction, we will thoroughly explore how angiosperms initiate flower blooming and subsequently transition into pericarp fruit structures that encapsulate vital botanical embryos.';
  assert.throws(
    () => createCanonicalScript({
      workflowType: 'lesson',
      durationSeconds: 8,
      dialogue: tooLong,
    }),
    (err) => err instanceof ScriptIntegrityError && err.message.includes('Dialogue exceeds safe speech rate')
  );
});

test('generateSubtitleSegments generates ordered timestamped chunks within duration', () => {
  const dialogue = 'One two three four five six seven eight nine ten.';
  const segments = generateSubtitleSegments(dialogue, 8);
  assert.ok(segments.length >= 2);
  assert.equal(segments[0].startTimeSec, 0);
  assert.equal(segments[segments.length - 1].endTimeSec, 8);
});
`;

// 2. deterministicText.test.js
const test2Content = `import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSrtSubtitles,
  generateVttSubtitles,
  validateTextAssetSafeAreas,
  buildCompositingManifest,
} from '../video/render/deterministicText.js';
import { createCanonicalScript } from '../video/script/canonicalScript.js';

test('generateSrtSubtitles and generateVttSubtitles format timestamps accurately', () => {
  const segments = [
    { segmentId: '1', startTimeSec: 0, endTimeSec: 2.5, text: 'Hello classroom.' },
    { segmentId: '2', startTimeSec: 2.5, endTimeSec: 5.0, text: 'Welcome to science.' },
  ];

  const srt = generateSrtSubtitles(segments);
  assert.ok(srt.includes('00:00:00,000 --> 00:00:02,500'));
  assert.ok(srt.includes('Hello classroom.'));

  const vtt = generateVttSubtitles(segments);
  assert.ok(vtt.startsWith('WEBVTT'));
  assert.ok(vtt.includes('00:00.000 --> 00:02.500'));
});

test('buildCompositingManifest builds valid FFmpeg drawtext layers and enforces safe areas', () => {
  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: 'Confused by physics? Inkstall tutoring brings clarity. Book today.',
    brandName: 'Inkstall',
    ctaText: 'Book a Free Demo on Inkstall',
  });

  const manifest = buildCompositingManifest(script, { videoWidth: 720, videoHeight: 1280 });
  assert.equal(manifest.scriptId, script.scriptId);
  assert.equal(manifest.scriptHash, script.scriptHash);
  assert.ok(manifest.safeAreaCheck.valid);
  assert.ok(manifest.layers.length >= 2);

  const brandLayer = manifest.layers.find((l) => l.purpose === 'brand_name');
  assert.ok(brandLayer);
  assert.equal(brandLayer.text, 'Inkstall');
  assert.ok(brandLayer.ffmpegFilter.includes('drawtext=text=\\'Inkstall\\''));

  const ctaLayer = manifest.layers.find((l) => l.purpose === 'cta_card');
  assert.ok(ctaLayer);
  assert.equal(ctaLayer.text, 'Book a Free Demo on Inkstall');
  assert.ok(ctaLayer.ffmpegFilter.includes('between(t,5.5,8)'));
});
`;

// 3. workflowIsolation.test.js
const test3Content = `import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVideoIntent } from '../video/intentRouter.js';
import { extractAudience } from '../video/intentRouter.js';
import { compilePrompt } from '../story/compiler.js';
import { createCanonicalScript } from '../video/script/canonicalScript.js';

test('Intent router isolates ads from lesson and preserves audience specificity', async () => {
  const adPrompt = 'Create an Instagram marketing ad for Inkstall tutoring targeting parents of school students.';
  const adRouting = await resolveVideoIntent({ prompt: adPrompt, workflowHint: 'ads' });
  assert.equal(adRouting.workflow, 'ads');
  assert.equal(adRouting.audienceCategory, 'prospective_customers');
  assert.equal(adRouting.audienceDescription, 'parents of school students');

  const lessonPrompt = 'Continue the biology lesson explaining how fruits develop from flowers.';
  const lessonRouting = await resolveVideoIntent({ prompt: lessonPrompt });
  assert.equal(lessonRouting.workflow, 'lesson');
  assert.equal(lessonRouting.continuityMode, 'sequential');
});

test('Story prompt compiler includes mandatory negative typography constraints and separates speech context', () => {
  const character = {
    profileLabel: 'Tutor profile',
    appearance: 'Friendly Indian science tutor in teal top.',
    faceRules: 'Warm eyes and smile.',
    hairRules: 'Neat dark hair.',
    clothingRules: 'Smart teal top.',
    voice: { description: 'Warm Indian English.' },
    environmentPreferences: 'Bright classroom with clean whiteboard.',
  };
  const story = { facts: [], continuityRules: [] };
  const plan = {
    sceneObjective: 'Explain fruit development from flowers.',
    characterInstructions: {
      preserveClothing: true,
      preserveEnvironment: true,
      requestedChanges: [],
    },
    narrativeContext: { continuitySummary: 'Previous lesson covered leaves and photosynthesis.' },
    scene: {
      openingTransition: 'Tutor stands at clean whiteboard.',
      visualAction: 'Tutor points at unlabeled flower and fruit diagram.',
      dialogue: 'Fruits develop from flowers and protect the seeds inside.',
      endingBeat: 'Tutor smiles.',
    },
  };

  const compiled = compilePrompt({ character, story, plan, assets: [], durationSeconds: 8 });

  // Negative constraints must be present
  assert.ok(compiled.includes('Do not render readable text, letters, numbers, symbols, words, or typography on any surface.'));
  assert.ok(compiled.includes('Whiteboards, screens, posters, notebooks, and signs must remain clean, blank, or abstractly illustrated without legible writing.'));
  assert.ok(compiled.includes('Do not generate AI logos, brand watermarks, or end cards.'));

  // Dialogue must be marked as speech context, NOT rendered as on-screen text
  assert.ok(compiled.includes('Speech context (pacing only, do not render text): Fruits develop from flowers and protect the seeds inside.'));
});
`;

const testsDir = path.resolve('../marketing-automation-b/tests');
fs.writeFileSync(path.join(testsDir, 'canonicalScript.test.js'), test1Content, 'utf8');
fs.writeFileSync(path.join(testsDir, 'deterministicText.test.js'), test2Content, 'utf8');
fs.writeFileSync(path.join(testsDir, 'workflowIsolation.test.js'), test3Content, 'utf8');
console.log('Successfully wrote canonicalScript.test.js, deterministicText.test.js, and workflowIsolation.test.js!');
