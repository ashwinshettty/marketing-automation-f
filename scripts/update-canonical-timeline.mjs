import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('../marketing-automation-b/video/script/canonicalScript.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `  const payload = {
    scriptId: newId(),
    scriptVersion: 1,
    workflowType,
    seriesId,
    campaignId,
    sceneId,
    adId,
    language,
    targetAudience: norm(targetAudience),
    durationSeconds: Number(durationSeconds),
    dialogue: cleanDialogue,
    narration: cleanNarration,
    visualBeats: normalizedBeats,
    subtitleSegments: subtitles,
    textAssets: resolvedTextAssets,
    characterId,
    brandId,`;

const replacement = `  const ctaStart = Math.max(0, Number((durationSeconds - 2.5).toFixed(1)));
  const estimatedNarrationSec = Math.min(
    Number((durationSeconds - 2.0).toFixed(1)),
    Number((words.length / 2.5).toFixed(1))
  );
  const productionTimeline = {
    totalDurationSeconds: Number(durationSeconds),
    beatSumSeconds: Number(normalizedBeats.reduce((s, b) => s + b.durationSeconds, 0).toFixed(1)),
    narrationEstimatedSeconds: estimatedNarrationSec,
    narrationCompletionDeadlineSeconds: Math.min(6.0, Number((durationSeconds - 2.0).toFixed(1))),
    ctaOverlayStartSeconds: ctaStart,
    ctaHoldingWindowSeconds: Number((durationSeconds - ctaStart).toFixed(1)),
    guaranteedCtaWindowPassed: (durationSeconds - ctaStart) >= 2.0,
  };

  const payload = {
    scriptId: newId(),
    scriptVersion: 1,
    workflowType,
    seriesId,
    campaignId,
    sceneId,
    adId,
    language,
    targetAudience: norm(targetAudience),
    durationSeconds: Number(durationSeconds),
    dialogue: cleanDialogue,
    narration: cleanNarration,
    visualBeats: normalizedBeats,
    subtitleSegments: subtitles,
    textAssets: resolvedTextAssets,
    productionTimeline,
    characterId,
    brandId,`;

if (!code.includes(target)) {
  console.error('Target not found in canonicalScript.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully attached productionTimeline directly to canonicalScript payload.');
