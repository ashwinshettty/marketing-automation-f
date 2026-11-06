import fs from 'node:fs';
import path from 'node:path';

const bDir = path.resolve('../marketing-automation-b');
const dsPath = path.join(bDir, 'evals/creative-quality/dataset.ads-benchmark-v1.json');
const testPath = path.join(bDir, 'tests/adsQualityBenchmark.test.js');

// 1. Expand dataset.ads-benchmark-v1.json with the 7 positive archetypes + 6 negative controls
const dataset = JSON.parse(fs.readFileSync(dsPath, 'utf8'));

const existingCaseIds = new Set(dataset.cases.map((c) => c.id));

const newCases = [
  {
    id: 'ADS-BENCH-07-HUMOR-STUDENT-RELATABLE',
    archetype: 'HUMOR_RELIEF',
    isPositive: true,
    topic: 'Relatable student exam excuse turned into quick tutor breakthrough',
    targetAudience: '10th grade students',
    prompt: 'Create a humorous, relatable 8-second vertical ad for Inkstall showing a student making excuses to avoid studying geometry, until a live 1-on-1 tutor makes it fun.',
    creativeBrief: {
      tone: ['funny'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: '10th grade students',
      campaignObjective: 'Drive app installs and free trial bookings among teens',
    },
    expect: {
      workflow: 'ads',
      narrativeStructure: 'HUMOR_RELIEF',
      mustContainPainPoint: ['geometry', 'excuse', 'studying', 'hard', 'tired'],
      mustContainValueProp: ['1-on-1', 'live', 'tutor', 'fun', 'inkstall'],
      mustContainCta: ['try', 'free', 'demo', 'book'],
      maxWordCount: 20,
      minWordCount: 12,
    },
  },
  {
    id: 'ADS-BENCH-08-NEG-BORING-GENERIC-BROCHURE',
    archetype: 'NEGATIVE_BROCHURE',
    isPositive: false,
    expectedTier: 'BORING_GENERIC',
    topic: 'Generic coaching brochure with zero friction or personality',
    targetAudience: 'everyone',
    prompt: 'Generic educational solutions for all students.',
    creativeBrief: {
      tone: ['formal'],
      platform: 'general',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'everyone',
      campaignObjective: 'General awareness',
    },
    expect: {
      workflow: 'ads',
      mustFail: true,
      expectedTier: 'BORING_GENERIC',
    },
  },
  {
    id: 'ADS-BENCH-09-NEG-TECHNICALLY-VALID-CREATIVELY-WEAK',
    archetype: 'NEGATIVE_LIFELESS',
    isPositive: false,
    expectedTier: 'TECHNICALLY_VALID_CREATIVELY_WEAK',
    topic: 'Technically compliant ad with lifeless slogan copy',
    targetAudience: 'students',
    prompt: 'Education is important for everyone.',
    creativeBrief: {
      tone: ['neutral'],
      platform: 'general',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'students',
      campaignObjective: 'Generic learning',
    },
    expect: {
      workflow: 'ads',
      mustFail: true,
      expectedTier: 'TECHNICALLY_VALID_CREATIVELY_WEAK',
    },
  },
  {
    id: 'ADS-BENCH-10-NEG-DISCONNECTED-CLICKBAIT',
    archetype: 'NEGATIVE_CLICKBAIT',
    isPositive: false,
    expectedTier: 'DISCONNECTED_HOOK_REJECTED',
    topic: 'Irrelevant sports car drifting clickbait hook',
    targetAudience: 'students',
    prompt: 'Sports cars drifting near explosions to sell tuition.',
    creativeBrief: {
      tone: ['edgy'],
      platform: 'tiktok',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'students',
      campaignObjective: 'Clickbait impressions',
    },
    expect: {
      workflow: 'ads',
      mustFail: true,
      expectedTier: 'DISCONNECTED_HOOK_REJECTED',
    },
  },
  {
    id: 'ADS-BENCH-11-NEG-OVERLOADED-FEATURE-LIST',
    archetype: 'NEGATIVE_OVERLOADED',
    isPositive: false,
    expectedTier: 'OVERLOADED_REJECTED',
    topic: '28-word speech cramming 5 disparate features into 8s',
    targetAudience: 'parents',
    prompt: 'List every single feature Inkstall offers in 8 seconds.',
    creativeBrief: {
      tone: ['urgent'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'parents',
      campaignObjective: 'Feature dumping',
    },
    expect: {
      workflow: 'ads',
      mustFail: true,
      expectedTier: 'OVERLOADED_REJECTED',
    },
  },
  {
    id: 'ADS-BENCH-12-NEG-PROHIBITED-GUARANTEE',
    archetype: 'NEGATIVE_UNSAFE',
    isPositive: false,
    expectedTier: 'MISLEADING_REJECTED',
    topic: 'Fabricated 100% board exam score guarantee',
    targetAudience: 'parents',
    prompt: 'Guarantee 100% marks without studying.',
    creativeBrief: {
      tone: ['persuasive'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'parents',
      campaignObjective: 'Misleading conversion',
    },
    expect: {
      workflow: 'ads',
      mustFail: true,
      expectedTier: 'MISLEADING_REJECTED',
    },
  },
  {
    id: 'ADS-BENCH-13-NEG-EMBEDDED-URL-PROMPT',
    archetype: 'NEGATIVE_TEXT_ARTIFACT',
    isPositive: false,
    expectedTier: 'TECHNICAL_VIOLATION',
    topic: 'Visual prompt instructs Seedance to render inkstall.com website URL',
    targetAudience: 'parents',
    prompt: 'Ad instructing video model to render website URL directly in the video frames.',
    creativeBrief: {
      tone: ['direct'],
      platform: 'instagram',
      aspectRatio: '9:16',
      durationSeconds: 8,
      targetAudience: 'parents',
      campaignObjective: 'Direct response',
    },
    expect: {
      workflow: 'ads',
      mustFail: true,
      expectedTier: 'TECHNICAL_VIOLATION',
    },
  },
];

for (const nc of newCases) {
  if (!existingCaseIds.has(nc.id)) {
    dataset.cases.push(nc);
  }
}

fs.writeFileSync(dsPath, JSON.stringify(dataset, null, 2), 'utf8');
console.log(`✓ Updated dataset.ads-benchmark-v1.json with ${dataset.cases.length} cases (7 positive + 6 negative controls)`);

// 2. Update tests/adsQualityBenchmark.test.js with mock plans and assertions for all cases
const benchmarkTestContent = `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createCanonicalScript, assertScriptIntegrity } from '../video/script/canonicalScript.js';
import { evaluateAdCreativeQuality } from '../video/ads/adsQualityBenchmark.js';

test('Ads Quality Benchmark: 13 representative cases (7 positive archetypes + 6 negative controls)', async (t) => {
  const datasetPath = join('evals', 'creative-quality', 'dataset.ads-benchmark-v1.json');
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));

  assert.equal(dataset.cases.length, 13, 'Dataset must contain 13 representative ad cases');

  const mockPlans = {
    'ADS-BENCH-01-PARENTS-ACADEMIC-ANXIETY': {
      narrativeStructure: 'EMOTIONAL_PROGRESSION',
      ad: {
        hook: 'Is your child losing confidence in math before finals?',
        dialogue: 'Stop stressing over math exams. Inkstall expert live tutors give your child instant clarity. Book your free demo today.',
        visualAction: 'Close-up of a parent looking at a confusing math test, then cutting to an encouraging Indian tutor at a clean blank digital whiteboard.',
        cta: 'Book Your Free Live Demo on Inkstall',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Close-up of a student erasing pencil marks repeatedly in frustration, with parent watching with concern.', dialogue: 'Stop stressing over math exams.' },
        { beat: 'product_reveal', visualAction: 'Tutor in smart teal top gestures at a clean blank interactive digital whiteboard, sketching a simple geometric curve.', dialogue: 'Inkstall expert live tutors give your child instant clarity.' },
        { beat: 'cta', visualAction: 'Student looks up smiling with clear understanding as the scene transitions to high-contrast CTA card.', dialogue: 'Book your free demo today.' },
      ],
    },
    'ADS-BENCH-02-STUDENTS-DIFFICULT-SUBJECTS': {
      narrativeStructure: 'DIRECT_VALUE_PROP',
      ad: {
        hook: 'Stuck on tough chemistry equations?',
        dialogue: 'Confused by chemical reactions? Inkstall visual live tutoring breaks down equations step-by-step. Try your free live session now.',
        visualAction: 'Student frowning at confusing reaction equations, cutting to tutor explaining bonds on an unlabeled digital display.',
        cta: 'Try Your Free Live Session on Inkstall',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Close-up of student hands tapping pencil against open chemistry textbook in confusion.', dialogue: 'Confused by chemical reactions?' },
        { beat: 'product_reveal', visualAction: 'Friendly tutor gestures at clean interactive whiteboard displaying simple glowing orbital diagrams.', dialogue: 'Inkstall visual live tutoring breaks down equations step-by-step.' },
        { beat: 'cta', visualAction: 'Student nods with sudden clarity as camera holds on confident posture with high-contrast CTA overlay.', dialogue: 'Try your free live session now.' },
      ],
    },
    'ADS-BENCH-03-EXAM-PREPARATION-STRESS': {
      narrativeStructure: 'DIRECT_VALUE_PROP',
      ad: {
        hook: 'Board exams in forty days and feeling unprepared?',
        dialogue: 'Stop panicking over board syllabus. Inkstall subject specialists guide your revision with daily 1-on-1 focus. Book free demo.',
        visualAction: 'Desk calendar with exam dates circled, cutting to structured 1-on-1 tutoring session with calm progress.',
        cta: 'Book Your Free Board Prep Demo on Inkstall',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Desk calendar showing board exam date highlighted with red circle; student exhales slowly.', dialogue: 'Stop panicking over board syllabus.' },
        { beat: 'product_reveal', visualAction: 'Experienced Indian teacher in formal shirt reviews clean study timetable on tablet with student.', dialogue: 'Inkstall subject specialists guide your revision with daily 1-on-1 focus.' },
        { beat: 'cta', visualAction: 'Student closes revision folder with calm resolve; screen transitions to high-contrast booking action card.', dialogue: 'Book free demo.' },
      ],
    },
    'ADS-BENCH-04-CONCEPTUAL-UNDERSTANDING-GAP': {
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
      ad: {
        hook: 'Memorizing physics formulas without understanding why?',
        dialogue: 'Formulas fail when exam questions change. Inkstall interactive whiteboard tutoring makes concepts intuitive. Claim your free session.',
        visualAction: 'Student staring blankly at textbook formula, cutting to tutor demonstrating ray optics with clean glowing geometric vectors.',
        cta: 'Claim Your Free Physics Session on Inkstall',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Close-up of student staring blankly at printed physics optics diagram, rubbing eyes in doubt.', dialogue: 'Formulas fail when exam questions change.' },
        { beat: 'product_reveal', visualAction: 'Tutor in teal top demonstrates ray optics on clean interactive whiteboard, drawing a single clean angled vector line.', dialogue: 'Inkstall interactive whiteboard tutoring makes concepts intuitive.' },
        { beat: 'cta', visualAction: 'Student eyes widen with sudden comprehension; camera holds steadily on clear final booking card.', dialogue: 'Claim your free session.' },
      ],
    },
    'ADS-BENCH-05-INEFFECTIVE-TRADITIONAL-COACHING': {
      narrativeStructure: 'VISUAL_CONTRAST',
      ad: {
        hook: 'Lost in a crowded tuition batch of eighty students?',
        dialogue: 'Too crowded to ask questions in tuition? Get Inkstall personalized 1-on-1 live attention from top teachers. Book your demo.',
        visualAction: 'Student in crowded lecture hall looking hesitant, cutting to warm personalized 1-on-1 tutoring setting.',
        cta: 'Book Your Free 1-on-1 Trial on Inkstall',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Wide medium shot of student in crowded back row of large coaching hall, hesitating to raise hand.', dialogue: 'Too crowded to ask questions in tuition?' },
        { beat: 'product_reveal', visualAction: 'Cut to quiet modern study space: dedicated Inkstall tutor explains directly to student with undivided attention.', dialogue: 'Get Inkstall personalized 1-on-1 live attention from top teachers.' },
        { beat: 'cta', visualAction: 'Student smiles with genuine relief; scene cleanly resolves into high-contrast CTA holding frame.', dialogue: 'Book your demo.' },
      ],
    },
    'ADS-BENCH-06-LIVE-TUTORING-VALUE-PROP': {
      narrativeStructure: 'UNEXPECTED_REVEAL',
      ad: {
        hook: 'What if tough homework problems had instant solutions?',
        dialogue: 'Never stay stuck on doubts alone. Inkstall live tutors provide instant conceptual clarity whenever you need it. Try free today.',
        visualAction: 'Frustrated student with eraser shavings suddenly smiling as friendly tutor walks through step-by-step.',
        cta: 'Try Inkstall Free Today — Book Your Demo',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Overhead angle of notebook covered in crossed-out math steps and eraser shavings.', dialogue: 'Never stay stuck on doubts alone.' },
        { beat: 'product_reveal', visualAction: 'Friendly young tutor gestures encouragingly at clean digital screen, pointing at simplified step.', dialogue: 'Inkstall live tutors provide instant conceptual clarity whenever you need it.' },
        { beat: 'cta', visualAction: 'Student gives confident thumbs-up as high-contrast branded booking card holds decisively.', dialogue: 'Try free today.' },
      ],
    },
    'ADS-BENCH-07-HUMOR-STUDENT-RELATABLE': {
      narrativeStructure: 'HUMOR_RELIEF',
      ad: {
        hook: 'My dog ate my geometry homework. Twice.',
        dialogue: 'Ran out of geometry excuses? Inkstall 1-on-1 live tutors make tough proofs surprisingly fun. Try your free demo today.',
        visualAction: 'Student sheepishly staring at homework, then laughing with tutor over interactive shapes.',
        cta: 'Try Your Free Demo on Inkstall',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Student dramatically balancing pencil on nose while staring at blank geometry worksheet.', dialogue: 'Ran out of geometry excuses?' },
        { beat: 'product_reveal', visualAction: 'Tutor chuckles and sketches clean colorful triangle diagram on digital whiteboard; student chuckles and solves it.', dialogue: 'Inkstall 1-on-1 live tutors make tough proofs surprisingly fun.' },
        { beat: 'cta', visualAction: 'Student triumphantly spins pencil; high-contrast CTA card holds.', dialogue: 'Try your free demo today.' },
      ],
    },
    'ADS-BENCH-08-NEG-BORING-GENERIC-BROCHURE': {
      ad: {
        hook: 'Education is important for everyone.',
        dialogue: 'We provide comprehensive educational solutions for all subjects and standards. Learn more about Inkstall.',
        visualAction: 'Talent smiling at camera, then pointing to blank screen.',
        cta: 'Learn More',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Talent smiling at camera.', dialogue: 'Education is important for everyone.' },
        { beat: 'product_reveal', visualAction: 'Talent points at blank screen.', dialogue: 'We provide comprehensive educational solutions for all subjects and standards.' },
        { beat: 'cta', visualAction: 'End card.', dialogue: 'Learn more about Inkstall.' },
      ],
    },
    'ADS-BENCH-09-NEG-TECHNICALLY-VALID-CREATIVELY-WEAK': {
      ad: {
        hook: 'Education matters for school students.',
        dialogue: 'Education is important. We provide educational solutions for all standards. Contact us today.',
        visualAction: 'Teacher standing in generic room.',
        cta: 'Contact Us Today',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Teacher standing in generic room.', dialogue: 'Education is important.' },
        { beat: 'product_reveal', visualAction: 'Teacher points at clean wall.', dialogue: 'We provide educational solutions for all standards.' },
        { beat: 'cta', visualAction: 'Teacher waves.', dialogue: 'Contact us today.' },
      ],
    },
    'ADS-BENCH-10-NEG-DISCONNECTED-CLICKBAIT': {
      ad: {
        hook: 'Watch this sports car drifting around an exploding building!',
        dialogue: 'Sports car drifting near an explosion! Anyway, Inkstall has 1-on-1 tutors. Book your free demo today.',
        visualAction: 'Sports car drifting and exploding building in opening.',
        cta: 'Book Your Free Demo',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Sports car drifting and exploding building.', dialogue: 'Sports car drifting near an explosion!' },
        { beat: 'product_reveal', visualAction: 'Tutor smiling.', dialogue: 'Inkstall has 1-on-1 tutors.' },
        { beat: 'cta', visualAction: 'End card.', dialogue: 'Book your free demo today.' },
      ],
    },
    'ADS-BENCH-11-NEG-OVERLOADED-FEATURE-LIST': {
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
    },
    'ADS-BENCH-12-NEG-PROHIBITED-GUARANTEE': {
      ad: {
        hook: 'Want 100% marks guaranteed on your boards?',
        dialogue: '100% board exam marks guaranteed! Pass without studying with Inkstall 1-on-1 live tutors. Book your free demo.',
        visualAction: 'Tutor gesturing at clean whiteboard.',
        cta: 'Book Your Free Demo',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Student celebrating.', dialogue: '100% board exam marks guaranteed!' },
        { beat: 'product_reveal', visualAction: 'Tutor explaining.', dialogue: 'Pass without studying with Inkstall 1-on-1 live tutors.' },
        { beat: 'cta', visualAction: 'End card.', dialogue: 'Book your free demo.' },
      ],
    },
    'ADS-BENCH-13-NEG-EMBEDDED-URL-PROMPT': {
      ad: {
        hook: 'Worried about 10th grade exam results?',
        dialogue: 'Stop worrying about exams. Inkstall expert 1-on-1 tutors give instant clarity. Book your free demo.',
        visualAction: 'Display inkstall.com website URL directly on the screen.',
        cta: 'Book Free Demo',
      },
      sceneSequence: [
        { beat: 'hook', visualAction: 'Student studying.', dialogue: 'Stop worrying about exams.' },
        { beat: 'product_reveal', visualAction: 'Tutor explains on whiteboard.', dialogue: 'Inkstall expert 1-on-1 tutors give instant clarity.' },
        { beat: 'cta', visualAction: 'End card displays inkstall.com website URL.', dialogue: 'Book your free demo.' },
      ],
    },
  };

  for (const caseDef of dataset.cases) {
    await t.test(\`Evaluates \${caseDef.id}\`, async () => {
      const plan = mockPlans[caseDef.id];
      assert.ok(plan, \`Mock plan must exist for \${caseDef.id}\`);

      const canonicalScript = createCanonicalScript({
        workflowType: 'ads',
        campaignId: randomUUID(),
        adId: randomUUID(),
        targetAudience: caseDef.targetAudience,
        durationSeconds: 8,
        dialogue: plan.ad.dialogue,
        narration: plan.ad.dialogue,
        visualBeats: plan.sceneSequence.map((s, i) => ({
          beatName: s.beat,
          visualAction: s.visualAction,
          dialogue: s.dialogue,
          durationSeconds: 2.6,
        })),
        brandName: 'Inkstall',
        ctaText: plan.ad.cta,
      });

      assertScriptIntegrity(canonicalScript);

      const hasEmbeddedUrl = caseDef.id === 'ADS-BENCH-13-NEG-EMBEDDED-URL-PROMPT';
      const candidatePrompt = {
        status: 'CANDIDATE_ONLY_NOT_SENT',
        text: hasEmbeddedUrl
          ? 'Workflow: ads\\nRender card with inkstall.com website URL on screen.'
          : [
            'Workflow: ads (SCRIPT_LOCKED — Seedance NOT_INVOKED)',
            'Format: 9:16 vertical video, 8 seconds duration',
            \`ScriptHash: \${canonicalScript.scriptHash}\`,
            'Setting: Bright modern classroom or study space with soft natural light.',
            'Talent: Friendly adult science tutor wearing smart teal top with clean silhouette.',
            'Camera & Lighting: Cinematic lighting, medium framing, warm natural commercial colors.',
            'Visual Action Flow:',
            ...plan.sceneSequence.map((s, i) => \`\${i + 1}. [\${s.beat}] \${s.visualAction}\`),
            '[Speech Context (For Pacing & Motion Timing Only — Do NOT Render As Text)]:',
            \`Audio narration: "\${plan.ad.dialogue}"\`,
            '[Mandatory Negative Typography Constraints / Clean Surfaces]:',
            '- Do not render readable text, letters, numbers, symbols, words, or typography on any surface.',
            '- Do not render subtitles, captions, lower-thirds, or end cards in the generated video.',
            '- All whiteboards, screens, signs, notebooks, and background charts must remain clean, blank, or abstractly illustrated without legible writing.',
            '- Do not generate AI logos, brand watermarks, or end cards.',
            '- All typography, brand names, and subtitles are rendered deterministically outside generation.',
          ].join('\\n'),
      };

      const evaluation = evaluateAdCreativeQuality({
        plan,
        canonicalScript,
        candidatePrompt,
        expect: {
          caseId: caseDef.id,
          ...caseDef.expect,
        },
      });

      if (caseDef.isPositive !== false) {
        // Positive representative archetypes must achieve >= 8.8 and pass
        assert.ok(
          evaluation.aggregateScore >= 8.8,
          \`Aggregate score for \${caseDef.id} must be >= 8.8, got \${evaluation.aggregateScore}\`
        );
        assert.equal(evaluation.dimensions.scriptIntegrity.score, 10, 'Script integrity must be 10/10');
        assert.equal(evaluation.dimensions.cleanSurfaces.score, 10, 'Clean surfaces must be 10/10');
        assert.equal(evaluation.dimensions.deterministicTypography.score, 10, 'Deterministic typography must be 10/10');
        assert.equal(evaluation.passed, true, \`Evaluation must pass: \${evaluation.diagnostics.join(', ')}\`);
        assert.ok(
          ['EXCELLENT', 'COMMERCIALLY_VIABLE'].includes(evaluation.calibrationTier),
          \`Must achieve EXCELLENT or COMMERCIALLY_VIABLE tier, got \${evaluation.calibrationTier}\`
        );
      } else {
        // Negative controls must be penalized <= 6.0 and fail the creative/technical gate
        assert.ok(
          evaluation.aggregateScore <= 6.0,
          \`Negative control \${caseDef.id} must score <= 6.0, got \${evaluation.aggregateScore}\`
        );
        assert.equal(evaluation.passed, false, \`Negative control \${caseDef.id} must fail the gate\`);
        assert.ok(
          evaluation.calibrationTier === caseDef.expectedTier
          || (caseDef.expectedTier === 'TECHNICAL_VIOLATION' && evaluation.technicalScore <= 2),
          \`Expected tier \${caseDef.expectedTier}, got \${evaluation.calibrationTier}\`
        );
      }
    });
  }
});
`;

fs.writeFileSync(testPath, benchmarkTestContent, 'utf8');
console.log('✓ Successfully deployed expanded tests/adsQualityBenchmark.test.js with 13 cases');
