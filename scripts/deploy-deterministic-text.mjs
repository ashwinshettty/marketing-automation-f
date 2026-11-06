import fs from 'node:fs';
import path from 'node:path';

const content = `/**
 * Deterministic text and subtitle rendering engine for 9:16 vertical video.
 * Enforces exact typography outside of AI video diffusion models.
 */

const formatTimestampSrt = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return \`\${String(hrs).padStart(2, '0')}:\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')},\${String(millis).padStart(3, '0')}\`;
};

const formatTimestampVtt = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}.\${String(millis).padStart(3, '0')}\`;
};

/**
 * Generates an SRT subtitle file string from canonical subtitle segments.
 */
export const generateSrtSubtitles = (segments = []) => {
  return segments
    .map((seg, idx) => {
      const start = formatTimestampSrt(seg.startTimeSec);
      const end = formatTimestampSrt(seg.endTimeSec);
      return \`\${idx + 1}\\n\${start} --> \${end}\\n\${seg.text}\\n\`;
    })
    .join('\\n');
};

/**
 * Generates a WebVTT subtitle file string for web players.
 */
export const generateVttSubtitles = (segments = []) => {
  const body = segments
    .map((seg, idx) => {
      const start = formatTimestampVtt(seg.startTimeSec);
      const end = formatTimestampVtt(seg.endTimeSec);
      return \`\${idx + 1}\\n\${start} --> \${end}\\n\${seg.text}\\n\`;
    })
    .join('\\n');
  return \`WEBVTT\\n\\n\${body}\`;
};

/**
 * Verifies that text assets fit within 720x1280 mobile safe areas without clipping.
 */
export const validateTextAssetSafeAreas = (textAssets = [], { width = 720, height = 1280 } = {}) => {
  const issues = [];
  for (const asset of textAssets) {
    if (!asset.text || !asset.text.trim()) {
      issues.push({ textAssetId: asset.textAssetId, error: 'Text content cannot be empty.' });
    }
    // Vertical safe area checks: keep out of top 4% and bottom 6%
    if (asset.position.y === 'top' && asset.position.marginPercent < 4) {
      issues.push({ textAssetId: asset.textAssetId, error: 'Top margin is too close to edge (<4%).' });
    }
    if (asset.position.y === 'bottom' && asset.position.marginPercent < 6) {
      issues.push({ textAssetId: asset.textAssetId, error: 'Bottom margin is too close to edge (<6%).' });
    }
    // Font size scaling check for 720p width
    if (asset.style?.fontSizePx > 48) {
      issues.push({ textAssetId: asset.textAssetId, error: 'Font size too large for 720p width (>48px).' });
    }
  }
  return {
    valid: issues.length === 0,
    issues,
  };
};

/**
 * Builds a deterministic compositing specification for the final assembly stage.
 */
export const buildCompositingManifest = (canonicalScript, { videoWidth = 720, videoHeight = 1280 } = {}) => {
  if (!canonicalScript) {
    throw new Error('canonicalScript is required to build compositing manifest');
  }

  const textAssets = canonicalScript.textAssets || [];
  const srt = generateSrtSubtitles(canonicalScript.subtitleSegments || []);
  const vtt = generateVttSubtitles(canonicalScript.subtitleSegments || []);
  const safeAreaCheck = validateTextAssetSafeAreas(textAssets, { width: videoWidth, height: videoHeight });

  const layers = textAssets.map((asset) => {
    let xCoord = 'w/2 - tw/2'; // center default
    if (asset.position.x === 'left') xCoord = \`w * \${(asset.position.marginPercent / 100).toFixed(2)}\`;
    if (asset.position.x === 'right') xCoord = \`w - tw - (w * \${(asset.position.marginPercent / 100).toFixed(2)})\`;

    let yCoord = 'h/2 - th/2'; // middle default
    if (asset.position.y === 'top') yCoord = \`h * \${(asset.position.marginPercent / 100).toFixed(2)}\`;
    if (asset.position.y === 'bottom') yCoord = \`h - th - (h * \${(asset.position.marginPercent / 100).toFixed(2)})\`;

    return {
      layerId: asset.textAssetId,
      purpose: asset.purpose,
      text: asset.text,
      font: asset.style.fontFamily,
      fontSize: asset.style.fontSizePx,
      color: asset.style.color,
      backgroundColor: asset.style.backgroundColor,
      borderRadius: asset.style.borderRadiusPx,
      timing: asset.timing,
      ffmpegFilter: \`drawtext=text='\${asset.text.replace(/'/g, "\\\\\\'")}':fontsize=\${asset.style.fontSizePx}:fontcolor=\${asset.style.color}:box=1:boxcolor=\${asset.style.backgroundColor}:boxborderw=8:x=\${xCoord}:y=\${yCoord}:enable='between(t,\${asset.timing.startTimeSec},\${asset.timing.endTimeSec})'\`,
    };
  });

  return {
    scriptId: canonicalScript.scriptId,
    scriptHash: canonicalScript.scriptHash,
    resolution: { width: videoWidth, height: videoHeight, ratio: '9:16' },
    safeAreaCheck,
    layers,
    subtitles: {
      srt,
      vtt,
    },
    negativeTypographyEnforcedInSeedance: true,
  };
};
`;

const destDir = path.resolve('../marketing-automation-b/video/render');
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(path.join(destDir, 'deterministicText.js'), content, 'utf8');
console.log('Successfully wrote deterministicText.js into video/render/');
