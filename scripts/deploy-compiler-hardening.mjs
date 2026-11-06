import fs from 'node:fs';
import path from 'node:path';

// 1. Update story/compiler.js
const compilerPath = path.resolve('../marketing-automation-b/story/compiler.js');
let compilerCode = fs.readFileSync(compilerPath, 'utf8');

// Replace negative constraints to include typography bans
if (!compilerCode.includes('Do not render readable text')) {
  compilerCode = compilerCode.replace(
    "'Do not depict this plan as an observed or already generated video.',",
    `'Do not depict this plan as an observed or already generated video.',
    'Do not render readable text, letters, numbers, symbols, words, or typography on any surface.',
    'Whiteboards, screens, posters, notebooks, and signs must remain clean, blank, or abstractly illustrated without legible writing.',
    'Do not generate AI logos, brand watermarks, or end cards. All typography is rendered deterministically outside generation.',`
  );
}

// Replace Dialogue line with Speech context in compilePrompt
if (compilerCode.includes("line('Dialogue', plan.scene.dialogue)")) {
  compilerCode = compilerCode.replace(
    "line('Dialogue', plan.scene.dialogue)",
    "line('Speech context (pacing only, do not render text)', plan.scene.dialogue)"
  );
}

// Attach canonicalScript to buildManifest
if (!compilerCode.includes('canonicalScript:')) {
  compilerCode = compilerCode.replace(
    'generationConstraints: {',
    `canonicalScript: plan.canonicalScript || null,
  generationConstraints: {`
  );
}

fs.writeFileSync(compilerPath, compilerCode, 'utf8');
console.log('Successfully updated story/compiler.js with negative typography constraints and speech context separation.');
