import fs from 'node:fs';
import path from 'node:path';

// 1. Update canonicalScript.js to default visualBeats if empty
const canonPath = path.resolve('../marketing-automation-b/video/script/canonicalScript.js');
let canonCode = fs.readFileSync(canonPath, 'utf8');

canonCode = canonCode.replace(
  `  const normalizedBeats = visualBeats.map((b, idx) => ({`,
  `  const inputBeats = Array.isArray(visualBeats) && visualBeats.length > 0
    ? visualBeats
    : [{ beatName: 'scene', visualAction: 'Main visual scene staging.', dialogue: cleanDialogue, durationSeconds }];

  const normalizedBeats = inputBeats.map((b, idx) => ({`
);

fs.writeFileSync(canonPath, canonCode, 'utf8');
console.log('Updated canonicalScript.js with resilient visualBeats defaulting');

// 2. Update deterministicText.test.js
const testPath = path.resolve('../marketing-automation-b/tests/deterministicText.test.js');
let testCode = fs.readFileSync(testPath, 'utf8');

testCode = testCode.replace(
  `  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: 'Confused by physics? Inkstall tutoring brings clarity. Book today.',
    brandName: 'Inkstall',
    ctaText: 'Book a Free Demo on Inkstall',
  });`,
  `  const script = createCanonicalScript({
    workflowType: 'ads',
    targetAudience: 'parents of school students',
    durationSeconds: 8,
    dialogue: 'Confused by physics? Inkstall tutoring brings clarity. Book today.',
    visualBeats: [
      { beatName: 'hook', visualAction: 'Parent looks at notes.', dialogue: 'Confused by physics?' },
      { beatName: 'proof', visualAction: 'Tutor explains clearly.', dialogue: 'Inkstall tutoring brings clarity.' },
      { beatName: 'cta', visualAction: 'Phone screen with booking button.', dialogue: 'Book today.' },
    ],
    brandName: 'Inkstall',
    ctaText: 'Book a Free Demo on Inkstall',
  });`
);

fs.writeFileSync(testPath, testCode, 'utf8');
console.log('Updated deterministicText.test.js with explicit visualBeats');
