import fs from 'node:fs';
import path from 'node:path';

const orchPath = path.resolve('../marketing-automation-b/video/ads/orchestrator.js');
let code = fs.readFileSync(orchPath, 'utf8');

// 1. Add import of createCanonicalScript if not present
if (!code.includes("import { createCanonicalScript }")) {
  code = code.replace(
    "import { MemoryAdsRepository } from './repository.js';",
    `import { MemoryAdsRepository } from './repository.js';
import { createCanonicalScript } from '../script/canonicalScript.js';`
  );
}

// 2. Add canonical script creation before const ad = {
if (!code.includes('const canonicalScript = createCanonicalScript({')) {
  const target = 'const ad = {';
  const replacement = `const canonicalScript = createCanonicalScript({
      workflowType: 'ads',
      campaignId: workingCampaign.id,
      adId: planned.plan?.id || newId(),
      targetAudience: creativeBrief.audienceDescription || workingCampaign.targetAudience,
      durationSeconds,
      dialogue: planned.plan.ad.dialogue,
      narration: planned.plan.ad.dialogue,
      visualBeats: (planned.plan.sceneSequence || []).map((b) => ({
        beatName: b.beat,
        visualAction: b.visualAction,
        dialogue: b.dialogue,
        durationSeconds: Number((durationSeconds / Math.max(1, (planned.plan.sceneSequence || []).length)).toFixed(1)),
      })),
      brandName: workingCampaign.brand?.name || 'Inkstall',
      ctaText: planned.plan.ad.cta || 'Book a Free Demo on Inkstall',
      continuityReferences: {
        predecessorAdId: continuity.previousAd?.id || null,
        continuityMode: creativeBrief.continuityMode || 'none',
      },
    });

    const ad = {
      canonicalScript,`;
  code = code.replace(target, replacement);
}

// 3. Return canonicalScript in data
if (!code.includes('canonicalScript: committed.ad.canonicalScript')) {
  code = code.replace(
    'semanticRetrieval,',
    `semanticRetrieval,
        canonicalScript: committed.ad.canonicalScript || canonicalScript,`
  );
}

fs.writeFileSync(orchPath, code, 'utf8');
console.log('Successfully updated video/ads/orchestrator.js with canonical script lock!');
