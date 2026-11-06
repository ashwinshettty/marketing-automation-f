import fs from 'node:fs';
import path from 'node:path';

const content = `import { createHash } from 'node:crypto';
import { z } from 'zod';
import { newId, nowIso } from '../../story/ids.js';

export class ScriptIntegrityError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ScriptIntegrityError';
    this.code = 'SCRIPT_INTEGRITY_VIOLATION';
    this.details = details;
  }
}

export const textAssetSchema = z.object({
  textAssetId: z.string().uuid(),
  purpose: z.enum([
    'brand_name',
    'cta_card',
    'cta_button',
    'whiteboard_label',
    'subtitle',
    'lower_third',
    'ui_overlay',
  ]),
  text: z.string().min(1).max(300),
  position: z.object({
    x: z.enum(['center', 'left', 'right']),
    y: z.enum(['top', 'middle', 'bottom']),
    marginPercent: z.number().min(0).max(40).default(5),
    safeArea: z.enum(['mobile-9:16', 'desktop-16:9', 'standard']).default('mobile-9:16'),
  }),
  style: z.object({
    fontFamily: z.string().max(80).default('Inter, -apple-system, sans-serif'),
    fontSizePx: z.number().int().min(10).max(120).default(28),
    fontWeight: z.enum(['normal', 'bold', '600', '700']).default('bold'),
    color: z.string().max(30).default('#FFFFFF'),
    backgroundColor: z.string().max(50).default('rgba(0,0,0,0.65)'),
    borderRadiusPx: z.number().int().min(0).max(50).default(8),
  }),
  timing: z.object({
    startTimeSec: z.number().min(0),
    endTimeSec: z.number().min(0),
  }),
});

export const subtitleSegmentSchema = z.object({
  segmentId: z.string().uuid(),
  sequenceIndex: z.number().int().min(0),
  startTimeSec: z.number().min(0),
  endTimeSec: z.number().min(0),
  text: z.string().min(1).max(200),
});

export const canonicalScriptSchema = z.object({
  scriptId: z.string().uuid(),
  scriptVersion: z.number().int().min(1),
  workflowType: z.enum(['ads', 'lesson']),
  seriesId: z.string().uuid().nullable().optional(),
  campaignId: z.string().uuid().nullable().optional(),
  sceneId: z.string().uuid().nullable().optional(),
  adId: z.string().uuid().nullable().optional(),
  language: z.string().max(16).default('en-IN'),
  targetAudience: z.string().min(1).max(300),
  durationSeconds: z.number().min(1).max(60),
  dialogue: z.string().min(1).max(2000),
  narration: z.string().min(1).max(2000),
  visualBeats: z.array(
    z.object({
      beatIndex: z.number().int().min(0),
      beatName: z.string().max(80),
      visualAction: z.string().min(1).max(800),
      dialogue: z.string().max(800),
      durationSeconds: z.number().min(0.5).max(30),
    }),
  ).min(1),
  subtitleSegments: z.array(subtitleSegmentSchema),
  textAssets: z.array(textAssetSchema),
  characterId: z.string().uuid().nullable().optional(),
  brandId: z.string().max(120).nullable().optional(),
  continuityReferences: z.object({
    predecessorSeriesId: z.string().uuid().nullable().optional(),
    predecessorSceneId: z.string().uuid().nullable().optional(),
    predecessorAdId: z.string().uuid().nullable().optional(),
    predecessorTopic: z.string().max(300).nullable().optional(),
    continuityMode: z.string().max(60).default('none'),
  }),
  validationStatus: z.enum(['VALID', 'INVALID', 'LOCKED']),
  lockedAt: z.string(),
  scriptHash: z.string().length(64),
});

export const computeScriptHash = (payload) => {
  const norm = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  const canonicalRepresentation = {
    workflowType: payload.workflowType,
    targetAudience: norm(payload.targetAudience),
    durationSeconds: Number(payload.durationSeconds),
    dialogue: norm(payload.dialogue),
    narration: norm(payload.narration || payload.dialogue),
    visualBeats: (payload.visualBeats || []).map((b) => ({
      beatName: b.beatName,
      visualAction: norm(b.visualAction),
      dialogue: norm(b.dialogue),
      durationSeconds: Number(b.durationSeconds),
    })),
    textAssets: (payload.textAssets || []).map((t) => ({
      purpose: t.purpose,
      text: norm(t.text),
      timing: t.timing,
    })),
    characterId: payload.characterId || null,
    brandId: payload.brandId || null,
  };

  return createHash('sha256')
    .update(JSON.stringify(canonicalRepresentation))
    .digest('hex');
};

export const generateSubtitleSegments = (dialogue, durationSeconds) => {
  const words = String(dialogue || '').trim().split(/\\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  const wordsPerChunk = 4;
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }

  const chunkDuration = durationSeconds / chunks.length;
  return chunks.map((chunk, idx) => ({
    segmentId: newId(),
    sequenceIndex: idx,
    startTimeSec: Number((idx * chunkDuration).toFixed(2)),
    endTimeSec: Number(((idx + 1) * chunkDuration).toFixed(2)),
    text: chunk,
  }));
};

export const deriveTextAssets = ({
  workflowType,
  brandName = 'Inkstall',
  ctaText = 'Book a Free Demo on Inkstall',
  focusLabel = null,
  durationSeconds = 8,
}) => {
  const assets = [];

  assets.push({
    textAssetId: newId(),
    purpose: 'brand_name',
    text: brandName,
    position: {
      x: 'left',
      y: 'top',
      marginPercent: 6,
      safeArea: 'mobile-9:16',
    },
    style: {
      fontFamily: 'Inter, -apple-system, sans-serif',
      fontSizePx: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      borderRadiusPx: 6,
    },
    timing: {
      startTimeSec: 0,
      endTimeSec: durationSeconds,
    },
  });

  if (ctaText) {
    const ctaStart = Math.max(0, durationSeconds - 2.5);
    assets.push({
      textAssetId: newId(),
      purpose: 'cta_card',
      text: ctaText,
      position: {
        x: 'center',
        y: 'bottom',
        marginPercent: 10,
        safeArea: 'mobile-9:16',
      },
      style: {
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSizePx: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#0284C7',
        borderRadiusPx: 12,
      },
      timing: {
        startTimeSec: Number(ctaStart.toFixed(1)),
        endTimeSec: durationSeconds,
      },
    });
  }

  if (focusLabel) {
    assets.push({
      textAssetId: newId(),
      purpose: 'whiteboard_label',
      text: focusLabel,
      position: {
        x: 'center',
        y: 'top',
        marginPercent: 12,
        safeArea: 'mobile-9:16',
      },
      style: {
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSizePx: 24,
        fontWeight: '600',
        color: '#0F172A',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadiusPx: 8,
      },
      timing: {
        startTimeSec: 1.5,
        endTimeSec: Math.max(2, durationSeconds - 2),
      },
    });
  }

  return assets;
};

export const createCanonicalScript = ({
  workflowType,
  seriesId = null,
  campaignId = null,
  sceneId = null,
  adId = null,
  language = 'en-IN',
  targetAudience = 'learners',
  durationSeconds = 8,
  dialogue,
  narration = null,
  visualBeats = [],
  textAssets = null,
  characterId = null,
  brandId = null,
  brandName = 'Inkstall',
  ctaText = null,
  focusLabel = null,
  continuityReferences = {},
}) => {
  const norm = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  const cleanDialogue = norm(dialogue);
  if (!cleanDialogue) {
    throw new ScriptIntegrityError('Canonical script dialogue cannot be empty.');
  }

  const cleanNarration = norm(narration || cleanDialogue);
  const words = cleanDialogue.split(/\\s+/).filter(Boolean);
  const wordsPerSec = words.length / Math.max(1, durationSeconds);

  if (wordsPerSec > 2.8) {
    throw new ScriptIntegrityError(
      \`Dialogue exceeds safe speech rate for \${durationSeconds}s (\${words.length} words = \${wordsPerSec.toFixed(1)} wps; max 2.8 wps).\`,
      { wordCount: words.length, durationSeconds, wordsPerSec },
    );
  }

  const normalizedBeats = visualBeats.map((b, idx) => ({
    beatIndex: idx,
    beatName: String(b.beatName || b.beat || \`beat_\${idx + 1}\`),
    visualAction: norm(b.visualAction),
    dialogue: norm(b.dialogue || ''),
    durationSeconds: Number(b.durationSeconds || (durationSeconds / Math.max(1, visualBeats.length)).toFixed(1)),
  }));

  const subtitles = generateSubtitleSegments(cleanDialogue, durationSeconds);
  const resolvedTextAssets = textAssets && Array.isArray(textAssets)
    ? textAssets
    : deriveTextAssets({
        workflowType,
        brandName: brandName || 'Inkstall',
        ctaText: ctaText || (workflowType === 'ads' ? 'Book a Free Demo on Inkstall' : null),
        focusLabel,
        durationSeconds,
      });

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
    characterId,
    brandId,
    continuityReferences: {
      predecessorSeriesId: continuityReferences.predecessorSeriesId || null,
      predecessorSceneId: continuityReferences.predecessorSceneId || null,
      predecessorAdId: continuityReferences.predecessorAdId || null,
      predecessorTopic: continuityReferences.predecessorTopic || null,
      continuityMode: continuityReferences.continuityMode || 'none',
    },
    validationStatus: 'LOCKED',
    lockedAt: nowIso(),
  };

  const scriptHash = computeScriptHash(payload);
  const scriptRecord = {
    ...payload,
    scriptHash,
  };

  canonicalScriptSchema.parse(scriptRecord);
  return Object.freeze(scriptRecord);
};

export const assertScriptIntegrity = (script, expectedHash = null) => {
  if (!script || typeof script !== 'object') {
    throw new ScriptIntegrityError('Script object is missing or invalid.');
  }

  const targetHash = expectedHash || script.scriptHash;
  if (!targetHash) {
    throw new ScriptIntegrityError('Script does not contain a locked scriptHash.');
  }

  const computed = computeScriptHash(script);
  if (computed !== targetHash) {
    throw new ScriptIntegrityError(
      \`Script drift detected! Computed hash \${computed} does not match locked hash \${targetHash}.\`,
      { computed, expected: targetHash },
    );
  }

  return true;
};
`;

const destDir = path.resolve('../marketing-automation-b/video/script');
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(path.join(destDir, 'canonicalScript.js'), content, 'utf8');
console.log('Successfully wrote canonicalScript.js into video/script/');
