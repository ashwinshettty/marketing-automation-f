1import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('../marketing-automation-b/video/ads/schemas.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `    confidence: z.number().min(0).max(1).nullable().optional(),
    inheritedFromPriorAd: z.boolean().optional(),
  })
  .strict()`;

const replacement = `    confidence: z.number().min(0).max(1).nullable().optional(),
    inheritedFromPriorAd: z.boolean().optional(),
    concept: z.any().optional(),
    narrativeStructure: z.string().max(80).optional(),
    singleFocusMessage: z.string().max(400).optional().nullable(),
    adaptiveConstraints: z.any().optional().nullable(),
    permittedDemonstrationVisuals: z.array(z.string()).optional().nullable(),
  })
  .strict()`;

if (!code.includes(target)) {
  console.error('Target not found in schemas.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated creativeBriefSchema in schemas.js.');
