import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('../marketing-automation-b/video/ads/adsQualityBenchmark.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `      const computedHash = computeScriptHash({
        workflowType: canonicalScript.workflowType,
        targetAudience: canonicalScript.targetAudience,
        durationSeconds: canonicalScript.durationSeconds,
        dialogue: canonicalScript.dialogue,
        visualBeats: canonicalScript.visualBeats,
      });`,
  `      const computedHash = computeScriptHash(canonicalScript);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Updated adsQualityBenchmark.js computeScriptHash');
