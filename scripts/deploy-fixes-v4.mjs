import fs from 'node:fs';
import path from 'node:path';

console.log('=== DEPLOYING INKSTALL ADS PIPELINE FIXES (V4) ===');

// 1. UPDATE canonicalScript.js
const canonicalScriptPath = path.resolve('../marketing-automation-b/video/script/canonicalScript.js');
let canonicalScriptCode = fs.readFileSync(canonicalScriptPath, 'utf8');

// Add productionTimeline to schema
if (!canonicalScriptCode.includes('productionTimeline: z.any().optional()')) {
  canonicalScriptCode = canonicalScriptCode.replace(
    `  scriptHash: z.string().length(64),
});`,
    `  scriptHash: z.string().length(64),
  productionTimeline: z.any().optional(),
});`
  );
}

// Update normalizedBeats calculation and add productionTimeline in createCanonicalScript
const targetBeats = `  const normalizedBeats = inputBeats.map((b, idx) => ({
    beatIndex: idx,
    beatName: String(b.beatName || b.beat || \`beat_\${idx + 1}\`),
    visualAction: norm(b.visualAction),
    dialogue: norm(b.dialogue || ''),
    durationSeconds: Number(b.durationSeconds || (durationSeconds / Math.max(1, visualBeats.length)).toFixed(1)),
  }));`;

const replacementBeats = `  const beatCount = Math.max(1, inputBeats.length);
  const baseBeat = Number((durationSeconds / beatCount).toFixed(1));
  let allocated = 0;
  const normalizedBeats = inputBeats.map((b, idx) => {
    let dur;
    if (idx === beatCount - 1) {
      dur = Number(Math.max(0.5, durationSeconds - allocated).toFixed(1));
    } else {
      dur = Number(b.durationSeconds || baseBeat);
      allocated += dur;
    }
    return {
      beatIndex: idx,
      beatName: String(b.beatName || b.beat || \`beat_\${idx + 1}\`),
      visualAction: norm(b.visualAction),
      dialogue: norm(b.dialogue || ''),
      durationSeconds: dur,
    };
  });`;

if (canonicalScriptCode.includes(targetBeats)) {
  canonicalScriptCode = canonicalScriptCode.replace(targetBeats, replacementBeats);
}

const targetScriptReturn = `  const locked = Object.freeze({
    ...validPayload,
    validationStatus: 'LOCKED',
    lockedAt: nowIso(),
    scriptHash,
  });`;

const replacementScriptReturn = `  const ctaStart = Math.max(0, Number((durationSeconds - 2.5).toFixed(1)));
  const estimatedNarrationSec = Math.min(
    Number((durationSeconds - 2.0).toFixed(1)),
    Number((words.length / 2.5).toFixed(1))
  );
  const productionTimeline = {
    totalDurationSeconds: durationSeconds,
    beatSumSeconds: Number(normalizedBeats.reduce((s, b) => s + b.durationSeconds, 0).toFixed(1)),
    narrationEstimatedSeconds: estimatedNarrationSec,
    narrationCompletionDeadlineSeconds: Math.min(6.0, Number((durationSeconds - 2.0).toFixed(1))),
    ctaOverlayStartSeconds: ctaStart,
    ctaHoldingWindowSeconds: Number((durationSeconds - ctaStart).toFixed(1)),
    guaranteedCtaWindowPassed: (durationSeconds - ctaStart) >= 2.0,
  };

  const locked = Object.freeze({
    ...validPayload,
    productionTimeline,
    validationStatus: 'LOCKED',
    lockedAt: nowIso(),
    scriptHash,
  });`;

if (canonicalScriptCode.includes(targetScriptReturn)) {
  canonicalScriptCode = canonicalScriptCode.replace(targetScriptReturn, replacementScriptReturn);
}

fs.writeFileSync(canonicalScriptPath, canonicalScriptCode, 'utf8');
console.log('1. Updated canonicalScript.js with exact beat duration sum and explicit production timeline.');

// 2. UPDATE runTrace.js
const runTracePath = path.resolve('../marketing-automation-b/video/runTrace.js');
let runTraceCode = fs.readFileSync(runTracePath, 'utf8');

// Replace buildSeedanceCandidatePrompt character anchors and script handling
const targetPromptCompiler = `  const talentDesc = brand?.talentAppearance || character?.appearance || 'Friendly adult science tutor in neat professional attire.';
  const clothingDesc = brand?.talentClothing || character?.clothingRules || 'Smart teal top with clean silhouette and dark trousers.';
  const envDesc = brand?.environmentPreferences || character?.environmentPreferences || 'Bright modern classroom or study space with soft natural light.';
  const visualStyleDesc = brand?.visualStyle || character?.visualStyle || 'Realistic cinematic lighting, medium framing, warm natural educational colors.';`;

const replacementPromptCompiler = `  // Prioritize specific concept anchors over generic brand defaults
  const concept = creativeBrief?.concept || ad?.creativeBrief?.concept || null;
  const talentDesc = concept?.characterAnchor
    || creativeBrief?.characterAnchor
    || brand?.talentAppearance
    || character?.appearance
    || 'Student in focused study setting with 1-on-1 tutor support.';
  const clothingDesc = concept?.clothingAnchor
    || brand?.talentClothing
    || character?.clothingRules
    || 'Casual everyday student attire and professional tutor in smart teal top.';
  const envDesc = concept?.environmentAnchor
    || concept?.setting
    || brand?.environmentPreferences
    || character?.environmentPreferences
    || 'Quiet, focused home study desk with soft natural daylight and clean workspace.';
  const visualStyleDesc = concept?.cinematicStyle
    || brand?.visualStyle
    || character?.visualStyle
    || 'Realistic cinematic lighting, medium framing, warm natural educational colors.';`;

if (runTraceCode.includes(targetPromptCompiler)) {
  runTraceCode = runTraceCode.replace(targetPromptCompiler, replacementPromptCompiler);
}

// In recordAdsPlan, pass canonicalScript to buildSeedanceCandidatePrompt
const targetRecordAdsPlan = `      state.llmOptimizedPromptForSeedance = buildSeedanceCandidatePrompt({
        workflow: 'ads',
        ad,
        campaign,
        creativeBrief: brief,
        brand,
      });`;

const replacementRecordAdsPlan = `      state.llmOptimizedPromptForSeedance = buildSeedanceCandidatePrompt({
        workflow: 'ads',
        ad,
        campaign,
        creativeBrief: brief,
        brand,
        canonicalScript: data.canonicalScript || ad?.canonicalScript || state.canonicalScript || null,
      });`;

if (runTraceCode.includes(targetRecordAdsPlan)) {
  runTraceCode = runTraceCode.replace(targetRecordAdsPlan, replacementRecordAdsPlan);
}

fs.writeFileSync(runTracePath, runTraceCode, 'utf8');
console.log('2. Updated runTrace.js with concept-specific anchors and canonical script passing.');

// 3. UPDATE dispatch.js
const dispatchPath = path.resolve('../marketing-automation-b/video/dispatch.js');
let dispatchCode = fs.readFileSync(dispatchPath, 'utf8');

const targetDispatch = `        trace.recordAdsPlan({
          routing,
          body: planned.body,
          config: loadStoryConfig(),
        });`;

const replacementDispatch = `        trace.recordAdsPlan({
          routing,
          body: planned.body,
          config: loadStoryConfig(),
          canonicalScript: aData.canonicalScript || null,
        });`;

if (dispatchCode.includes(targetDispatch)) {
  dispatchCode = dispatchCode.replace(targetDispatch, replacementDispatch);
  fs.writeFileSync(dispatchPath, dispatchCode, 'utf8');
  console.log('3. Updated dispatch.js with canonicalScript in trace.recordAdsPlan call.');
}

// 4. UPDATE orchestrator.js
const orchPath = path.resolve('../marketing-automation-b/video/ads/orchestrator.js');
let orchCode = fs.readFileSync(orchPath, 'utf8');

// Ensure canonicalScript is on ad object in return envelope
const targetOrchAdReturn = `          sceneSequence: committed.ad.sceneSequence,
          status: committed.ad.status,`;

const replacementOrchAdReturn = `          sceneSequence: committed.ad.sceneSequence,
          canonicalScript: committed.ad.canonicalScript || canonicalScript,
          status: committed.ad.status,`;

if (orchCode.includes(targetOrchAdReturn)) {
  orchCode = orchCode.replace(targetOrchAdReturn, replacementOrchAdReturn);
}

// Update concept selection to match selectedAngle
const targetConceptSel = `    const candidateConcepts = generateCandidateConcepts({ prompt, creativeBrief: input.creativeBrief, brandBible: workingCampaign.brand });
    const selectedConcept = candidateConcepts[0] || null;`;

const replacementConceptSel = `    const candidateConcepts = generateCandidateConcepts({
      prompt,
      creativeBrief: input.creativeBrief,
      brandBible: workingCampaign.brand,
      selectedAngle,
    });
    const selectedConcept = candidateConcepts.find(
      (c) => c.angle === selectedAngle?.name || c.narrativeStructure === selectedAngle?.narrativeStructure
    ) || candidateConcepts[0] || null;`;

if (orchCode.includes(targetConceptSel)) {
  orchCode = orchCode.replace(targetConceptSel, replacementConceptSel);
}

fs.writeFileSync(orchPath, orchCode, 'utf8');
console.log('4. Updated orchestrator.js to attach canonicalScript to ad and pick matched concept.');

// 5. UPDATE independentEvaluator.js
const evalPath = path.resolve('../marketing-automation-b/video/ads/independentEvaluator.js');
let evalCode = fs.readFileSync(evalPath, 'utf8');

const targetPromptText = `  const promptText = String(candidatePrompt?.text || '');`;
const replacementPromptText = `  const promptText = typeof candidatePrompt === 'string' ? candidatePrompt : String(candidatePrompt?.text || '');`;

if (evalCode.includes(targetPromptText)) {
  evalCode = evalCode.replace(targetPromptText, replacementPromptText);
  fs.writeFileSync(evalPath, evalCode, 'utf8');
  console.log('5. Updated independentEvaluator.js to handle string candidatePrompt.');
}

console.log('=== V4 CORE FIXES DEPLOYED SUCCESSFULLY ===');
