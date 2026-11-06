import fs from 'node:fs';
import path from 'node:path';

const orchPath = path.resolve('../marketing-automation-b/video/ads/orchestrator.js');
let code = fs.readFileSync(orchPath, 'utf8');

// Remove from buildAdsContext
code = code.replace(
  `  semanticRetrieval,
        canonicalScript: committed.ad.canonicalScript || canonicalScript,`,
  `  semanticRetrieval,`
);

// Add to the final return envelope at line 1207
const returnTarget = `        llm: summarizeAdsLlm(planned, config),
        semanticRetrieval,`;

const returnReplacement = `        llm: summarizeAdsLlm(planned, config),
        semanticRetrieval,
        canonicalScript: committed.ad.canonicalScript || canonicalScript,`;

code = code.replace(returnTarget, returnReplacement);

fs.writeFileSync(orchPath, code, 'utf8');
console.log('Fixed canonicalScript placement in orchestrator.js');
