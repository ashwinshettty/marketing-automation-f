import fs from 'node:fs';
import path from 'node:path';

const targetTestFile = path.resolve('../marketing-automation-b/tests/adsQualityBenchmark.test.js');

const code = `import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createCanonicalScript, assertScriptIntegrity } from '../video/script/canonicalScript.js';
import { evaluateAdCreativeQuality } from '../video/ads/adsQualityBenchmark.js';

test('Ads Quality Benchmark: 6 representative cases evaluate >= 9.0 on creative and technical quality', async (t) => {
  const datasetPath = join('evals', 'creative-quality', 'dataset.ads-benchmark-v1.json');
  const dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));

  assert.equal(dataset.cases.length, 6, 'Dataset must contain 6 representative ad cases');

  // Realistic mock plans generated for each benchmark case adhering to the professional planner guidelines
  const mockPlans = {
    'ADS-BENCH-01-PARENTS-ACADEMIC-ANXIETY': {
      ad: {
        hook: 'Is your child losing confidence in math before finals?',
        dialogue: 'Stop stressing over math exams. Inkstall expert live tutors give your child instant clarity. Book your free demo today.',
        visualAction: 'Close-up of a parent looking at a confusing math test, then cutting to an encouraging Indian tutor at a clean blank digital whiteboard.',
        cta: 'Book Your Free Live Demo on Inkstall',
      },
      sceneSequence: [
        {
          beat: 'hook',
          visualAction: 'Close-up of a student erasing pencil marks repeatedly in frustration, with parent watching with concern.',
          dialogue: 'Stop stressing over math exams.',
        },
        {
          beat: 'product_reveal',
          visualAction: 'Tutor in smart teal top gestures at a clean blank interactive digital whiteboard, sketching a simple geometric curve.',
          dialogue: 'Inkstall expert live tutors give your child instant clarity.',
        },
        {
          beat: 'cta',
          visualAction: 'Student looks up smiling with clear understanding as the scene transitions to high-contrast CTA card.',
          dialogue: 'Book your free demo today.',
        },
      ],
    },
    'ADS-BENCH-02-STUDENTS-DIFFICULT-SUBJECTS': {
      ad: {
        hook: 'Stuck on tough chemistry equations?',
        dialogue: 'Confused by chemical reactions? Inkstall visual live tutoring breaks down equations step-by-step. Try your free live session now.',
        visualAction: 'Student frowning at confusing reaction equations, cutting to tutor explaining bonds on an unlabeled digital display.',
        cta: 'Try Your Free Live Session on Inkstall',
      },
      sceneSequence: [
        {
          beat: 'hook',
          visualAction: 'Medium close-up of a student staring blankly at a chemistry textbook with an eraser.',
          dialogue: 'Confused by chemical reactions?',
        },
        {
          beat: 'product_reveal',
          visualAction: 'Friendly science tutor points to an abstract clean molecular illustration on a clean screen.',
          dialogue: 'Inkstall visual live tutoring breaks down equations step-by-step.',
        },
        {
          beat: 'cta',
          visualAction: 'Student nods with sudden clarity as camera holds on final action.',
          dialogue: 'Try your free live session now.',
        },
      ],
    },
    'ADS-BENCH-03-EXAM-PREPARATION-STRESS': {
      ad: {
        hook: 'Board exams looming with too many doubts?',
        dialogue: 'Feel the exam pressure building? Inkstall personalized 1-on-1 tutoring turns panic into confidence. Claim your free demo session.',
        visualAction: 'Clock ticking near a student desk, cutting to a warm 1-on-1 online tutor session on a clean tablet.',
        cta: 'Claim Your Free Demo Session on Inkstall',
      },
      sceneSequence: [
        {
          beat: 'hook',
          visualAction: 'Cinematic push-in on a student desk with a ticking wall clock showing late evening study pressure.',
          dialogue: 'Feel the exam pressure building?',
        },
        {
          beat: 'proof',
          visualAction: 'Tutor provides calm, patient guidance over a clean interactive digital screen without readable text.',
          dialogue: 'Inkstall personalized 1-on-1 tutoring turns panic into confidence.',
        },
        {
          beat: 'cta',
          visualAction: 'Student smiles with relaxed posture, ready for board exams.',
          dialogue: 'Claim your free demo session.',
        },
      ],
    },
    'ADS-BENCH-04-CONCEPTUAL-UNDERSTANDING-GAP': {
      ad: {
        hook: 'Memorizing formulas without understanding principles?',
        dialogue: 'Formulas fade, but concepts last forever. Inkstall visual whiteboard tutoring makes every tough concept click. Book your demo.',
        visualAction: 'Rapid cut of student forgetting a memorized formula, cutting to tutor demonstrating concept visually.',
        cta: 'Book Your Free Demo on Inkstall',
      },
      sceneSequence: [
        {
          beat: 'hook',
          visualAction: 'Student hesitating with pen mid-air trying to recall a forgotten physics formula.',
          dialogue: 'Formulas fade, but concepts last forever.',
        },
        {
          beat: 'product_reveal',
          visualAction: 'Dynamic push-in on an engaging tutor drawing a clean, intuitive force diagram on a blank whiteboard.',
          dialogue: 'Inkstall visual whiteboard tutoring makes every tough concept click.',
        },
        {
          beat: 'cta',
          visualAction: 'Student taps desk with sudden breakthrough realization.',
          dialogue: 'Book your demo.',
        },
      ],
    },
    'ADS-BENCH-05-INEFFECTIVE-TRADITIONAL-COACHING': {
      ad: {
        hook: 'Lost in a crowded tuition batch of sixty students?',
        dialogue: 'Hesitant to ask doubts in crowded tuition? Get Inkstall 1-on-1 live attention from expert teachers. Book your free demo.',
        visualAction: 'Contrasting a crowded noisy lecture hall with a calm, focused 1-on-1 online tutoring session.',
        cta: 'Book Your Free Live Demo on Inkstall',
      },
      sceneSequence: [
        {
          beat: 'hook',
          visualAction: 'Student sitting at the back of a crowded coaching room, hesitating to raise a hand.',
          dialogue: 'Hesitant to ask doubts in crowded tuition?',
        },
        {
          beat: 'solution',
          visualAction: 'Split transition to a bright, quiet study desk where a dedicated tutor gives full personal attention.',
          dialogue: 'Get Inkstall 1-on-1 live attention from expert teachers.',
        },
        {
          beat: 'cta',
          visualAction: 'Student smiles confidently as tutor offers thumbs up on screen.',
          dialogue: 'Book your free demo.',
        },
      ],
    },
    'ADS-BENCH-06-LIVE-TUTORING-VALUE-PROP': {
      ad: {
        hook: 'Stuck on a tough question right now?',
        dialogue: 'Never get stuck again. Inkstall live tutors give you instant 1-on-1 concept clarity on demand. Start your free trial today.',
        visualAction: 'Close-up of a student getting instant visual assistance on a clean interactive tablet.',
        cta: 'Start Your Free Trial on Inkstall',
      },
      sceneSequence: [
        {
          beat: 'hook',
          visualAction: 'Student looking puzzled at a complex problem on desk.',
          dialogue: 'Never get stuck again.',
        },
        {
          beat: 'product_reveal',
          visualAction: 'Tutor smiling warmly while drawing a clear visual breakdown on a blank digital slate.',
          dialogue: 'Inkstall live tutors give you instant 1-on-1 concept clarity on demand.',
        },
        {
          beat: 'cta',
          visualAction: 'Student writes down solution confidently.',
          dialogue: 'Start your free trial today.',
        },
      ],
    },
  };

  for (const caseDef of dataset.cases) {
    await t.test(\`Evaluates \${caseDef.id}\`, async () => {
      const plan = mockPlans[caseDef.id];
      assert.ok(plan, \`Mock plan must exist for \${caseDef.id}\`);

      // 1. Create canonical locked script with valid UUIDs
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
      assert.ok(Object.isFrozen(canonicalScript));

      // 2. Candidate Seedance prompt with clean blank surfaces
      const candidatePrompt = {
        status: 'CANDIDATE_ONLY_NOT_SENT',
        text: [
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

      // 3. Evaluate creative and technical quality
      const evaluation = evaluateAdCreativeQuality({
        plan,
        canonicalScript,
        candidatePrompt,
        expect: {
          caseId: caseDef.id,
          ...caseDef.expect,
        },
      });

      assert.ok(evaluation.aggregateScore >= 9.0, \`Aggregate score for \${caseDef.id} must be >= 9.0, got \${evaluation.aggregateScore}\`);
      assert.equal(evaluation.dimensions.scriptIntegrity.score, 10, 'Script integrity must be 10/10');
      assert.equal(evaluation.dimensions.cleanSurfaces.score, 10, 'Clean surfaces must be 10/10');
      assert.equal(evaluation.dimensions.deterministicTypography.score, 10, 'Deterministic typography must be 10/10');
      assert.equal(evaluation.dimensions.speechRateFeasibility.score, 10, 'Speech rate must be 10/10 (15-20 words)');
      assert.equal(evaluation.passed, true, \`Evaluation must pass with 0 diagnostics: \${evaluation.diagnostics.join(', ')}\`);
    });
  }
});
`;

fs.writeFileSync(targetTestFile, code, 'utf8');
console.log('Successfully updated tests/adsQualityBenchmark.test.js with UUIDs');
