import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load backend .env
dotenv.config({ path: path.resolve('../marketing-automation-b/.env') });

import { loadStoryConfig } from '../../marketing-automation-b/story/config.js';
import { createLlmAdapter, createHttpLlmClient } from '../../marketing-automation-b/story/llmAdapter.js';
import { createAdsOrchestrator } from '../../marketing-automation-b/video/ads/orchestrator.js';
import { MemoryAdsRepository } from '../../marketing-automation-b/video/ads/repository.js';
import { createVideoDispatcher } from '../../marketing-automation-b/video/dispatch.js';
import { evaluateAdComprehensive } from '../../marketing-automation-b/video/ads/independentEvaluator.js';

async function run() {
  console.log('=== INKSTALL ADS PIPELINE: LIVE LLM PROMPT OPTIMIZATION TEST ===\n');

  const config = loadStoryConfig();
  console.log('Story Config:');
  console.log('- Primary Provider:', config.provider);
  console.log('- Primary Model:', config.model);
  console.log('- Fallback Enabled:', config.fallbackEnabled);
  console.log('- Fallback Order:', config.fallbackOrder);

  const client = createHttpLlmClient({ timeoutMs: config.timeoutMs || 60000 });
  const llmAdapter = createLlmAdapter({
    config,
    client,
  });

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

  // Short, vague user prompt
  const userPrompt = 'make an ad for 10th grade maths';
  console.log('\n--- Input ---');
  console.log('Short Vague User Prompt:', JSON.stringify(userPrompt));

  const ownerId = 'user_eval_' + Date.now();
  const res = await dispatcher.createRequest({
    ownerId,
    body: {
      prompt: userPrompt,
      durationSeconds: 8,
      aspectRatio: '9:16',
    },
  });

  if (res.httpStatus !== 200) {
    console.error('Request failed with HTTP status:', res.httpStatus);
    console.error('Error Body:', JSON.stringify(res.body, null, 2));
    process.exit(1);
  }

  const data = res.body?.data || {};
  const ad = data.ad || {};
  const campaign = data.campaign || {};
  const brief = data.creativeBrief || {};
  const canonicalScript = data.canonicalScript || {};
  const llmSummary = data.llm || {};

  console.log('\n======================================================');
  console.log('1. WHAT LLM OPTIMIZED THE PROMPT');
  console.log('======================================================');
  console.log('Provider Primary:', llmSummary.provider || config.provider);
  console.log('Model Primary / Executed:', llmSummary.model || config.model);
  console.log('Requested Model:', llmSummary.requestedModel || config.model);
  console.log('Fallback Used:', llmSummary.fallbackUsed);
  if (llmSummary.fallbackReason) console.log('Fallback Reason:', llmSummary.fallbackReason);
  console.log('Calls Made:', llmSummary.calls);
  console.log('Repairs Attempted:', llmSummary.repairs);
  console.log('Latency:', llmSummary.latencyMs, 'ms');
  console.log('Input Tokens:', llmSummary.inputTokens);
  console.log('Output Tokens:', llmSummary.outputTokens);
  console.log('Total Tokens:', llmSummary.totalTokens);
  if (llmSummary.callSummaries) {
    console.log('Call Summaries:', JSON.stringify(llmSummary.callSummaries, null, 2));
  }

  console.log('\n======================================================');
  console.log('2. CREATIVE INTELLIGENCE & PROFESSIONAL BRIEF');
  console.log('======================================================');
  console.log('Campaign Title:', campaign.title);
  console.log('Target Audience Segment:', brief.targetAudience);
  console.log('Audience Category:', brief.audienceCategory);
  console.log('Audience Description:', brief.audienceDescription);
  console.log('Selected Creative Angle:', brief.concept?.angle || 'N/A');
  console.log('Adaptive Narrative Structure:', brief.narrativeStructure);
  console.log('Single Focus Message:', brief.singleFocusMessage);
  console.log('Permitted Demonstration Visuals:', brief.permittedDemonstrationVisuals);
  console.log('Adaptive Constraints:', JSON.stringify(brief.adaptiveConstraints, null, 2));

  console.log('\n======================================================');
  console.log('3. PRODUCED CANONICAL SCRIPT');
  console.log('======================================================');
  console.log('Script ID:', canonicalScript.scriptId);
  console.log('Script Hash:', canonicalScript.scriptHash);
  console.log('Validation Status:', canonicalScript.validationStatus);
  console.log('Duration Seconds:', canonicalScript.durationSeconds);
  console.log('Narration / Dialogue:', JSON.stringify(canonicalScript.dialogue));
  console.log('Word Count:', canonicalScript.dialogue?.split(/\s+/).length);
  console.log('CTA Text:', canonicalScript.textAssets?.find(t => t.purpose === 'cta_card')?.text);
  console.log('\nVisual Beats:');
  canonicalScript.visualBeats?.forEach((beat, i) => {
    console.log(`  Beat ${i + 1} [${beat.beatName}] (${beat.durationSeconds}s):`);
    console.log(`    Action: ${beat.visualAction}`);
    console.log(`    Speech: ${beat.dialogue}`);
  });

  console.log('\n======================================================');
  console.log('4. WHAT THE LLM GIVES TO SEEDANCE (COMPILED PROMPT)');
  console.log('======================================================');
  const runTrace = data.runTrace;
  let seedanceCandidatePrompt = null;
  if (runTrace?.jsonPath) {
    try {
      const fs = await import('node:fs');
      const traceObj = JSON.parse(fs.readFileSync(runTrace.jsonPath, 'utf8'));
      seedanceCandidatePrompt = traceObj.llmOptimizedPromptForSeedance;
    } catch (e) {
      console.warn('Could not read trace JSON file:', e.message);
    }
  }

  if (seedanceCandidatePrompt) {
    console.log('Candidate Prompt Status:', seedanceCandidatePrompt.status);
    console.log('Seedance Invoked:', seedanceCandidatePrompt.seedanceInvoked);
    console.log('Script Locked:', seedanceCandidatePrompt.scriptLocked);
    console.log('Prompt Text Sent to Seedance Compiler:\n');
    console.log('------------------------------------------------------');
    console.log(seedanceCandidatePrompt.text);
    console.log('------------------------------------------------------');
  } else {
    console.log('Plan visual action:\n', ad.visualAction);
  }

  console.log('\n======================================================');
  console.log('5. EVALUATION READINESS (LEVEL 1, 2 & 3)');
  console.log('======================================================');
  const evaluation = evaluateAdComprehensive({
    plan: {
      ...ad,
      ad,
      campaignObjective: campaign.objective,
      narrativeStructure: brief.narrativeStructure || 'EMOTIONAL_PROGRESSION',
      sceneSequence: canonicalScript.visualBeats?.map(b => ({
        beat: b.beatName,
        visualAction: b.visualAction,
        dialogue: b.dialogue,
      })),
    },
    canonicalScript,
    candidatePrompt: seedanceCandidatePrompt?.text || '',
    brief,
  });

  console.log('Passed:', evaluation.passed);
  console.log('Calibration Tier:', evaluation.calibrationTier);
  console.log('Aggregate Score:', evaluation.aggregateScore);
  console.log('Technical Score:', evaluation.technicalScore);
  console.log('Creative Score:', evaluation.creativeScore);
  console.log('Technical Issues:', evaluation.technical?.issues);

  console.log('\nReadiness Levels:');
  console.log('  Level 1 (Creative Brief Readiness):', evaluation.readiness?.level1_creativeBriefReadiness?.tier,
    `Score: ${evaluation.readiness?.level1_creativeBriefReadiness?.score}/10, Passed: ${evaluation.readiness?.level1_creativeBriefReadiness?.passed}`);
  console.log('  Level 2 (Production Readiness):', evaluation.readiness?.level2_productionReadiness?.tier,
    `Score: ${evaluation.readiness?.level2_productionReadiness?.score}/10, Passed: ${evaluation.readiness?.level2_productionReadiness?.passed}`);
  console.log('  Level 3 (Actual Video Quality):', evaluation.readiness?.level3_actualVideoQuality?.status,
    `- ${evaluation.readiness?.level3_actualVideoQuality?.note}`);

  console.log('\nVideo Generation Invoked (Must be false):', data.videoGenerationInvoked || false);
  console.log('Generation Status (Must be NOT_INVOKED):', data.generationStatus || 'NOT_INVOKED');

  console.log('\n=== TEST COMPLETE ===');
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
