import dotenv from 'dotenv';
import path from 'node:path';

// Load backend .env
dotenv.config({ path: path.resolve('../marketing-automation-b/.env') });

import { loadStoryConfig } from '../../marketing-automation-b/story/config.js';
import { createLlmAdapter, createHttpLlmClient } from '../../marketing-automation-b/story/llmAdapter.js';
import { createAdsOrchestrator } from '../../marketing-automation-b/video/ads/orchestrator.js';
import { MemoryAdsRepository } from '../../marketing-automation-b/video/ads/repository.js';
import { createVideoDispatcher } from '../../marketing-automation-b/video/dispatch.js';
import { evaluateAdComprehensive } from '../../marketing-automation-b/video/ads/independentEvaluator.js';

const testPrompts = [
  {
    id: 'BATCH-01',
    name: 'Baseline Understanding',
    prompt: 'Make an ad for 10th grade maths.',
    expectedArchetype: 'EMOTIONAL_PROGRESSION / Problem Recognition',
  },
  {
    id: 'BATCH-02',
    name: 'Adaptive Humor & Creative Differentiation',
    prompt: 'Make a funny ad for students who hate geometry.',
    expectedArchetype: 'HUMOR_RELIEF / Relatable Humor',
  },
  {
    id: 'BATCH-03',
    name: 'Product Demonstration & Whiteboard Mechanism',
    prompt: 'Make an ad showing how Inkstall makes difficult maths concepts easier to understand.',
    expectedArchetype: 'PRODUCT_DEMONSTRATION / Whiteboard Mechanism',
  },
];

async function run() {
  console.log('================================================================================');
  console.log('INKSTALL ADS PIPELINE: 3-ARCHETYPE VALIDATION BATCH');
  console.log('Testing: Baseline vs Adaptive Humor vs Product Demonstration');
  console.log('Zero video generation calls authorized (Seedance NOT_INVOKED)');
  console.log('================================================================================\n');

  const config = loadStoryConfig();
  const client = createHttpLlmClient({ timeoutMs: config.timeoutMs || 60000 });
  const llmAdapter = createLlmAdapter({ config, client });

  const repository = new MemoryAdsRepository();
  const adsOrchestrator = createAdsOrchestrator({
    repository,
    llm: llmAdapter,
    config,
  });

  const dispatcher = createVideoDispatcher({
    adsOrchestrator,
    intentLlm: llmAdapter,
  });

  const results = [];

  for (const item of testPrompts) {
    console.log(`\n>>> RUNNING TEST [${item.id}]: "${item.name}"`);
    console.log(`User Prompt: "${item.prompt}"`);

    const ownerId = `user_${item.id.toLowerCase()}_${Date.now()}`;
    const start = Date.now();

    const res = await dispatcher.createRequest({
      ownerId,
      body: {
        prompt: item.prompt,
        workflow: 'ads',
        durationSeconds: 8,
        aspectRatio: '9:16',
      },
    });

    const duration = Date.now() - start;

    if (res.httpStatus !== 200) {
      console.error(`Request failed with status ${res.httpStatus}:`, res.body);
      process.exit(1);
    }

    const data = res.body?.data || {};
    const ad = data.ad || {};
    const brief = data.creativeBrief || {};
    const canonicalScript = data.canonicalScript || ad.canonicalScript || {};
    const llmSummary = data.llm || {};

    let seedancePrompt = null;
    if (data.runTrace?.jsonPath) {
      try {
        const fs = await import('node:fs');
        const resolvedPath = path.isAbsolute(data.runTrace.jsonPath)
          ? data.runTrace.jsonPath
          : path.resolve(data.runTrace.jsonPath);
        const traceObj = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        seedancePrompt = traceObj.llmOptimizedPromptForSeedance;
      } catch (e) {
        console.warn('Could not read trace json:', e.message);
      }
    }

    const evaluation = evaluateAdComprehensive({
      plan: {
        ...ad,
        ad,
        campaignObjective: item.prompt,
        narrativeStructure: brief.narrativeStructure || 'EMOTIONAL_PROGRESSION',
        sceneSequence: canonicalScript.visualBeats?.map(b => ({
          beat: b.beatName,
          visualAction: b.visualAction,
          dialogue: b.dialogue,
        })),
      },
      canonicalScript,
      candidatePrompt: seedancePrompt?.text || '',
      brief,
    });

    results.push({
      item,
      duration,
      llmSummary,
      brief,
      canonicalScript,
      seedancePrompt,
      evaluation,
    });

    console.log(`✓ Completed in ${(duration / 1000).toFixed(1)}s (Model: ${llmSummary.model || config.model})`);
  }

  console.log('\n\n================================================================================');
  console.log('COMPARATIVE BATCH REPORT ACROSS 3 ARCHETYPES');
  console.log('================================================================================\n');

  results.forEach((r, idx) => {
    const { item, llmSummary, brief, canonicalScript, seedancePrompt, evaluation } = r;
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`ARCHETYPE ${idx + 1}: ${item.name.toUpperCase()}`);
    console.log(`Prompt: "${item.prompt}"`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`LLM Model: ${llmSummary.model || 'default'} (Provider: ${llmSummary.provider || 'default'}, Latency: ${llmSummary.latencyMs}ms)`);
    console.log(`Selected Creative Angle: ${brief.concept?.angle || 'N/A'}`);
    console.log(`Adaptive Narrative Structure: ${brief.narrativeStructure}`);
    console.log(`Single Focus Message: "${brief.singleFocusMessage}"`);
    console.log(`Permitted Demonstration Visuals:`, brief.permittedDemonstrationVisuals || []);
    console.log(`Character Anchor: "${brief.concept?.characterAnchor || 'N/A'}"`);
    console.log(`Setting Anchor: "${brief.concept?.environmentAnchor || brief.concept?.setting || 'N/A'}"`);
    
    console.log(`\nScript Integrity & Production Timeline:`);
    console.log(`  Script ID: ${canonicalScript.scriptId}`);
    console.log(`  Script Hash: ${canonicalScript.scriptHash}`);
    console.log(`  Script Status: ${canonicalScript.validationStatus}`);
    console.log(`  Dialogue: "${canonicalScript.dialogue}" (${canonicalScript.dialogue?.split(/\s+/).length} words)`);
    console.log(`  Production Timeline:`);
    console.log(`    - Total Video Duration: ${canonicalScript.productionTimeline?.totalDurationSeconds}s`);
    console.log(`    - Sum of Visual Beats: ${canonicalScript.productionTimeline?.beatSumSeconds}s (Beat allocations: ${canonicalScript.visualBeats?.map(b => b.durationSeconds).join('s, ')}s)`);
    console.log(`    - Narration Est. Duration: ${canonicalScript.productionTimeline?.narrationEstimatedSeconds}s`);
    console.log(`    - Narration Completion Deadline: ${canonicalScript.productionTimeline?.narrationCompletionDeadlineSeconds}s`);
    console.log(`    - CTA Overlay Start: ${canonicalScript.productionTimeline?.ctaOverlayStartSeconds}s`);
    console.log(`    - Guaranteed CTA Visible Window: ${canonicalScript.productionTimeline?.ctaHoldingWindowSeconds}s (>= 2.0s: ${canonicalScript.productionTimeline?.guaranteedCtaWindowPassed})`);

    console.log(`\nVisual Beats:`);
    canonicalScript.visualBeats?.forEach((beat, bIdx) => {
      console.log(`  Beat ${bIdx + 1} [${beat.beatName}] (${beat.durationSeconds}s):`);
      console.log(`    Action: ${beat.visualAction}`);
      console.log(`    Speech: ${beat.dialogue}`);
    });

    console.log(`\nSeedance Visual Prompt Compilation (Trace Inspection):`);
    console.log(`  Seedance Invoked: ${seedancePrompt?.seedanceInvoked} (Must be false)`);
    console.log(`  Candidate Status: ${seedancePrompt?.status}`);
    console.log(`  Script Locked in Prompt: ${seedancePrompt?.scriptLocked}`);
    
    // Check metadata in compiled prompt string
    const promptText = seedancePrompt?.text || '';
    const scriptIdMatch = promptText.match(/ScriptId:\s*(\S+)/);
    const scriptHashMatch = promptText.match(/ScriptHash:\s*(\S+)/);
    const talentMatch = promptText.match(/Talent:\s*(.+)/);
    const settingMatch = promptText.match(/Setting:\s*(.+)/);

    console.log(`  Prompt ScriptId: ${scriptIdMatch ? scriptIdMatch[1] : 'none'} (Matches Canonical: ${scriptIdMatch?.[1] === canonicalScript.scriptId})`);
    console.log(`  Prompt ScriptHash: ${scriptHashMatch ? scriptHashMatch[1] : 'none'} (Matches Canonical: ${scriptHashMatch?.[1] === canonicalScript.scriptHash})`);
    console.log(`  Prompt Talent Anchor: ${talentMatch ? talentMatch[1] : 'none'}`);
    console.log(`  Prompt Setting Anchor: ${settingMatch ? settingMatch[1] : 'none'}`);

    console.log(`\nEvaluation Readiness:`);
    console.log(`  Level 1 (Creative Brief Readiness): Tier ${evaluation.readiness?.level1_creativeBriefReadiness?.tier}, Score ${evaluation.readiness?.level1_creativeBriefReadiness?.score}/10`);
    console.log(`  Level 2 (Production Readiness): Tier ${evaluation.readiness?.level2_productionReadiness?.tier}, Score ${evaluation.readiness?.level2_productionReadiness?.score}/10`);
    console.log(`  Level 3 (Actual Video Quality): ${evaluation.readiness?.level3_actualVideoQuality?.status} (${evaluation.readiness?.level3_actualVideoQuality?.note})`);
    console.log('\n');
  });

  console.log('================================================================================');
  console.log('DIFFERENTIATION CHECK:');
  const angles = results.map(r => r.brief.concept?.angle);
  const structures = results.map(r => r.brief.narrativeStructure);
  const hooks = results.map(r => r.canonicalScript.visualBeats?.[0]?.visualAction);
  const singleMessages = results.map(r => r.brief.singleFocusMessage);

  console.log('Angles explored:', angles);
  console.log('Narrative structures explored:', structures);
  console.log('Distinct angles count:', new Set(angles).size, 'of 3');
  console.log('Distinct narrative structures count:', new Set(structures).size, 'of 3');
  console.log('Distinct single focus messages count:', new Set(singleMessages).size, 'of 3');

  if (new Set(angles).size === 3 && new Set(structures).size >= 2) {
    console.log('SUCCESS: The 3 prompts produced 3 genuinely distinct advertising concepts!');
  } else {
    console.warn('WARNING: Concepts lacked full differentiation.');
  }
  console.log('================================================================================');
}

run().catch((err) => {
  console.error('Fatal batch test error:', err);
  process.exit(1);
});
