import fs from 'node:fs';

const bDir = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b';

// 1. Patch video/ads/adsQualityBenchmark.js
const bmarkPath = `${bDir}/video/ads/adsQualityBenchmark.js`;
let bmarkCode = fs.readFileSync(bmarkPath, 'utf8');

const oldFinalScore = `  // If fatal flaw occurred (misleading, disconnected hook, or overloaded), use the capped score
  const finalScore = (comprehensive.calibrationTier.includes('REJECTED') || comprehensive.calibrationTier.includes('BORING'))
    ? comprehensive.aggregateScore
    : legacyAggregate;`;

const newFinalScore = `  // If fatal flaw occurred (misleading, disconnected hook, overloaded, weak copy, or technical failure), use the capped score
  const isFlawed = !comprehensive.technical.passed
    || comprehensive.calibrationTier.includes('REJECTED')
    || comprehensive.calibrationTier.includes('BORING')
    || comprehensive.calibrationTier.includes('WEAK');

  const finalScore = isFlawed
    ? comprehensive.aggregateScore
    : legacyAggregate;

  const reportedTier = !comprehensive.technical.passed
    ? 'TECHNICAL_VIOLATION'
    : comprehensive.calibrationTier;`;

if (bmarkCode.includes(oldFinalScore)) {
  bmarkCode = bmarkCode.replace(oldFinalScore, newFinalScore);
  bmarkCode = bmarkCode.replace(
    'calibrationTier: comprehensive.calibrationTier,',
    'calibrationTier: reportedTier,'
  );
  fs.writeFileSync(bmarkPath, bmarkCode, 'utf8');
  console.log('✓ Updated finalScore and reportedTier in adsQualityBenchmark.js');
}

// 2. Patch ADS-BENCH-11 in tests/adsQualityBenchmark.test.js (21 words instead of 25)
const testPath = `${bDir}/tests/adsQualityBenchmark.test.js`;
let testCode = fs.readFileSync(testPath, 'utf8');

const oldBench11 = `    'ADS-BENCH-11-NEG-OVERLOADED-FEATURE-LIST': {
      ad: {
        hook: 'Need total academic transformation right now?',
        dialogue: 'Inkstall gives 1-on-1 tutoring, interactive whiteboard, board exam prep, instant doubt clearing, test series, and parent analytics app tracking. Book your session right now today.',
        visualAction: 'Tutor talking very fast.',
        cta: 'Book Now',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Tutor talking fast.', dialogue: 'Need total academic transformation right now?' },
        { beat: 'product_reveal', visualAction: 'Screens flashing.', dialogue: 'Inkstall gives 1-on-1 tutoring, interactive whiteboard, board exam prep, instant doubt clearing, test series, and parent analytics app tracking.' },
        { beat: 'cta', visualAction: 'Flash card.', dialogue: 'Book your session right now today.' },
      ],
    },`;

const newBench11 = `    'ADS-BENCH-11-NEG-OVERLOADED-FEATURE-LIST': {
      ad: {
        hook: 'Need total academic transformation right now?',
        dialogue: 'Get 1-on-1 tutoring, interactive whiteboard, board exam prep, instant doubt clearing, and parent analytics. Book free session today.',
        visualAction: 'Tutor talking very fast.',
        cta: 'Book Free Session Today',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Tutor talking fast.', dialogue: 'Need total academic transformation right now?' },
        { beat: 'product_reveal', visualAction: 'Screens flashing.', dialogue: 'Get 1-on-1 tutoring, interactive whiteboard, board exam prep, instant doubt clearing, and parent analytics.' },
        { beat: 'cta', visualAction: 'Flash card.', dialogue: 'Book free session today.' },
      ],
    },`;

if (testCode.includes(oldBench11)) {
  testCode = testCode.replace(oldBench11, newBench11);
  fs.writeFileSync(testPath, testCode, 'utf8');
  console.log('✓ Updated ADS-BENCH-11 dialogue in tests/adsQualityBenchmark.test.js');
}
