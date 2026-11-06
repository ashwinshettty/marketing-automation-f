import fs from 'node:fs';
import path from 'node:path';

const tracePath = path.resolve('../marketing-automation-b/video/runTrace.js');
let code = fs.readFileSync(tracePath, 'utf8');

// 1. Add import of assertScriptIntegrity
if (!code.includes("import { assertScriptIntegrity } from './script/canonicalScript.js';")) {
  code = `import { assertScriptIntegrity } from './script/canonicalScript.js';\n` + code;
}

// 2. Replace buildSeedanceCandidatePrompt with hardened version
const oldFnStart = 'const buildSeedanceCandidatePrompt = ({ workflow, ad, campaign, creativeBrief, brand }) => {';
const newFn = `const buildSeedanceCandidatePrompt = ({
  workflow,
  ad = null,
  campaign = null,
  creativeBrief = null,
  brand = null,
  canonicalScript = null,
  lesson = null,
  scene = null,
  character = null,
}) => {
  if (canonicalScript) {
    try {
      assertScriptIntegrity(canonicalScript);
    } catch (err) {
      return {
        status: 'INTEGRITY_ERROR',
        error: err.message,
        note: 'Canonical script failed integrity assertion prior to prompt compilation.',
      };
    }
  }

  const script = canonicalScript || ad?.canonicalScript || scene?.canonicalScript || null;
  const scriptDialogue = script?.dialogue || ad?.dialogue || scene?.dialogue || '';
  const scriptHash = script?.scriptHash || 'unlocked_draft';
  const scriptId = script?.scriptId || null;

  const talentDesc = brand?.talentAppearance || character?.appearance || 'Friendly adult science tutor in neat professional attire.';
  const clothingDesc = brand?.talentClothing || character?.clothingRules || 'Smart teal top with clean silhouette and dark trousers.';
  const envDesc = brand?.environmentPreferences || character?.environmentPreferences || 'Bright modern classroom or study space with soft natural light.';
  const visualStyleDesc = brand?.visualStyle || character?.visualStyle || 'Realistic cinematic lighting, medium framing, warm natural educational colors.';
  const duration = ad?.targetDurationSeconds || creativeBrief?.durationSeconds || scene?.targetDurationSeconds || 8;
  const aspect = ad?.aspectRatio || creativeBrief?.aspectRatio || '9:16';

  let visualFlowLines = [];
  if (script?.visualBeats?.length) {
    visualFlowLines = script.visualBeats.map((b, i) => \`\${i + 1}. [\${b.beatName}] \${b.visualAction}\`);
  } else if (Array.isArray(ad?.sceneSequence)) {
    visualFlowLines = ad.sceneSequence.map((b, i) => \`\${i + 1}. [\${b.beat || 'beat'}] \${b.visualAction}\`);
  } else if (scene?.visualAction) {
    visualFlowLines = [\`1. [scene] \${scene.visualAction}\`];
  } else {
    visualFlowLines = ['1. [visual] Tutor engages with student in bright classroom environment.'];
  }

  const lines = [
    \`Workflow: \${workflow || 'video'} (\${script ? 'SCRIPT_LOCKED' : 'planning_only'} — Seedance NOT_INVOKED)\`,
    \`Format: \${aspect} vertical video, \${duration} seconds duration\`,
    \`ScriptId: \${scriptId || 'none'}\`,
    \`ScriptHash: \${scriptHash}\`,
    \`Seedance Generation Mode: Visuals Only (Clean Blank Surfaces)\`,
    '',
    \`Setting: \${envDesc}\`,
    \`Talent: \${talentDesc} wearing \${clothingDesc}.\`,
    \`Camera & Lighting: \${visualStyleDesc}\`,
    '',
    'Visual Action Flow:',
    ...visualFlowLines,
    '',
    '[Speech Context (For Pacing & Motion Timing Only — Do NOT Render As Text)]:',
    \`Audio narration: "\${scriptDialogue}"\`,
    '',
    '[Mandatory Negative Typography Constraints / Clean Surfaces]:',
    '- Do not render readable text, letters, numbers, symbols, words, or typography on any surface.',
    '- Do not render subtitles, captions, lower-thirds, or end cards in the generated video.',
    '- All whiteboards, screens, signs, notebooks, and background charts must remain clean, blank, or abstractly illustrated without legible writing.',
    '- Do not generate AI logos, brand watermarks, or end cards.',
    '- All typography, brand names, and subtitles are rendered deterministically outside generation.',
  ];

  return {
    status: 'CANDIDATE_ONLY_NOT_SENT',
    seedanceInvoked: false,
    text: lines.join('\\n'),
    scriptId,
    scriptHash,
    scriptLocked: Boolean(script),
  };
};`;

if (code.includes(oldFnStart)) {
  const endIdx = code.indexOf('return {\n    status: \'CANDIDATE_ONLY_NOT_SENT\',\n    seedanceInvoked: false,\n    text: lines.join(\'\\n\'),\n  };\n};');
  if (endIdx > 0) {
    code = code.slice(0, code.indexOf(oldFnStart)) + newFn + code.slice(endIdx + 'return {\n    status: \'CANDIDATE_ONLY_NOT_SENT\',\n    seedanceInvoked: false,\n    text: lines.join(\'\\n\'),\n  };\n};'.length);
  }
}

// 3. Add continuityProvenance to createRunTrace state
if (!code.includes('continuityProvenance: null,')) {
  code = code.replace(
    'resultRefs: null,',
    `resultRefs: null,
    continuityProvenance: null,`
  );
}

// 4. Update flush to render continuityProvenance in markdown
if (!code.includes('## Continuity provenance')) {
  code = code.replace(
    '`## Audience`,',
    `\`## Continuity provenance\`,
      '',
      '\`\`\`json',
      JSON.stringify(safe(state.continuityProvenance), null, 2),
      '\`\`\`',
      '',
      \`## Audience\`,`
  );
}

fs.writeFileSync(tracePath, code, 'utf8');
console.log('Successfully updated video/runTrace.js with script-locked Seedance prompt compiler and continuity provenance!');
