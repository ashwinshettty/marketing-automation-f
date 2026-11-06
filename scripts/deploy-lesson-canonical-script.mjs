import fs from 'node:fs';
import path from 'node:path';

const orchPath = path.resolve('../marketing-automation-b/story/orchestrator.js');
let code = fs.readFileSync(orchPath, 'utf8');

// 1. Add import
if (!code.includes("import { createCanonicalScript }")) {
  code = code.replace(
    "import { compilePrompt, buildManifest } from './compiler.js';",
    `import { compilePrompt, buildManifest } from './compiler.js';
import { createCanonicalScript } from '../video/script/canonicalScript.js';`
  );
}

// 2. Create canonical script before buildScene
if (!code.includes('const canonicalScript = createCanonicalScript({')) {
  const target = 'const scene = buildScene({';
  const replacement = `const canonicalScript = createCanonicalScript({
        workflowType: 'lesson',
        seriesId: workingSeries.id,
        sceneId: null,
        targetAudience: 'learners',
        durationSeconds,
        dialogue: finalized.plan.scene.dialogue,
        narration: finalized.plan.scene.dialogue,
        visualBeats: [
          {
            beatName: 'lesson_beat',
            visualAction: finalized.plan.scene.visualAction,
            dialogue: finalized.plan.scene.dialogue,
            durationSeconds,
          },
        ],
        characterId: workingCharacter.id,
        brandName: 'Inkstall',
        focusLabel: finalized.plan.sceneObjective || null,
        continuityReferences: {
          predecessorSeriesId: workingSeries.id,
          predecessorSceneId: previousScene?.id || null,
          predecessorTopic: previousScene?.objective || null,
          continuityMode: 'story_continuation',
        },
      });
      finalized.plan.canonicalScript = canonicalScript;

      const scene = buildScene({`;
  code = code.replace(target, replacement);
}

// 3. Attach canonicalScript to scene object
if (!code.includes('scene.canonicalScript = canonicalScript;')) {
  code = code.replace(
    'scene.compiledPrompt = finalized.compiled;',
    `scene.compiledPrompt = finalized.compiled;
      scene.canonicalScript = canonicalScript;`
  );
}

// 4. Return canonicalScript in publicPlan
if (!code.includes('canonicalScript: scene.canonicalScript || null,')) {
  code = code.replace(
    'manifest: scene.manifest,',
    `manifest: scene.manifest,
  canonicalScript: scene.canonicalScript || null,`
  );
}

fs.writeFileSync(orchPath, code, 'utf8');
console.log('Successfully updated story/orchestrator.js with canonical script lock!');
