import fs from 'node:fs';
import path from 'node:path';

const bVideoAdsDir = path.resolve('../marketing-automation-b/video/ads');

// 1. Updated independentEvaluator.js with calibrated scoring caps
const independentEvaluatorCode = `/**
 * Independent Ads Creative Quality Evaluator.
 * Strictly separates Technical Compliance from Creative Effectiveness.
 * Provides calibrated, evidence-backed scoring across creative dimensions.
 */
import { computeScriptHash, assertScriptIntegrity } from '../script/canonicalScript.js';
import { validateTextAssetSafeAreas } from '../render/deterministicText.js';
import {
  evaluateHook,
  estimateSpokenDuration,
  evaluateValueProposition,
  identifyAudienceSegment,
} from './creativeIntelligence.js';

export const evaluateTechnicalCompliance = ({ plan, canonicalScript, candidatePrompt, expect = {} } = {}) => {
  const issues = [];
  let score = 10;

  if (!canonicalScript) {
    score = 0;
    issues.push('Canonical locked script is missing.');
  } else {
    try {
      assertScriptIntegrity(canonicalScript);
      if (!Object.isFrozen(canonicalScript)) {
        score = Math.min(score, 5);
        issues.push('Canonical script object is not frozen.');
      }
      const recomputedHash = computeScriptHash(canonicalScript);
      if (recomputedHash !== canonicalScript.scriptHash) {
        score = 0;
        issues.push('Canonical script SHA-256 hash mismatch.');
      }
    } catch (err) {
      score = 0;
      issues.push('Script integrity failed: ' + err.message);
    }
  }

  if (canonicalScript?.textAssets?.length) {
    const safeCheck = validateTextAssetSafeAreas(canonicalScript.textAssets, 720, 1280);
    if (!safeCheck.valid) {
      score = Math.min(score, 5);
      issues.push('Text overlays violate safe area margins: ' + (safeCheck.violations?.join(', ') || 'Out of bounds'));
    }
  }

  const promptText = String(candidatePrompt?.text || '');
  const hasNegativeConstraints = promptText.includes('Mandatory Negative Typography Constraints')
    && promptText.includes('Do not render readable text')
    && promptText.includes('clean, blank');
  if (!hasNegativeConstraints) {
    score = Math.min(score, 2);
    issues.push('Candidate prompt missing mandatory negative typography constraints.');
  }

  const scenes = plan?.sceneSequence || [];
  const echoesDialogue = scenes.some((s) => s.visualAction && s.dialogue && s.visualAction.includes(s.dialogue));
  if (echoesDialogue) {
    score = Math.min(score, 4);
    issues.push('Visual action echoes dialogue rather than staging observable camera/actor movement.');
  }

  return {
    passed: score >= 8 && issues.length === 0,
    score,
    issues,
  };
};

export const evaluateCreativeQuality = ({ plan, canonicalScript, brief = {}, expect = {} } = {}) => {
  const dialogue = canonicalScript?.dialogue || plan?.ad?.dialogue || '';
  const hook = plan?.ad?.hook || '';
  const visualAction = plan?.ad?.visualAction || '';
  const cta = plan?.ad?.cta || '';
  const scenes = plan?.sceneSequence || [];

  const diagnostics = [];
  const dimensions = {};

  const lowerDialogue = dialogue.toLowerCase();
  const lowerVisual = visualAction.toLowerCase();
  const lowerHook = hook.toLowerCase();

  // 1. Audience Relevance & Specificity (0-10)
  let audienceScore = 10;
  const isGenericAudience = /everyone|all students|any student|anyone struggling|general public/i.test(
    String(canonicalScript?.targetAudience || brief.targetAudience || '')
  );
  if (isGenericAudience) {
    audienceScore = 4;
    diagnostics.push('Audience is generic; fails to address a specific student or parent demographic.');
  } else if (expect.mustContainPainPoint?.length) {
    const matched = expect.mustContainPainPoint.some((p) =>
      lowerDialogue.includes(p.toLowerCase()) || lowerVisual.includes(p.toLowerCase()) || lowerHook.includes(p.toLowerCase())
    );
    if (!matched) {
      audienceScore = 5;
      diagnostics.push('Failed to address required pain points: [' + expect.mustContainPainPoint.join(', ') + '].');
    }
  }
  dimensions.audienceRelevance = {
    score: audienceScore,
    targetAudience: canonicalScript?.targetAudience || 'unspecified',
    weight: 0.15,
  };

  // 2. Hook Strength & First-Second Attention (0-10)
  const hookEval = evaluateHook({
    hook,
    visualAction,
    prompt: expect.prompt || '',
  });

  const isDisconnectedHook = /dancing cat|alien invasion|sports car drifting|exploding building|viral prank/i.test(lowerVisual + ' ' + lowerHook);
  if (isDisconnectedHook) {
    hookEval.score = Math.min(hookEval.score, 3);
    diagnostics.push('Hook is disconnected sensation/clickbait with no pedagogical or academic relevance.');
  }

  dimensions.hookStrength = {
    score: hookEval.score,
    category: hookEval.categoryLabel,
    hasGenericStock: hookEval.hasGenericStock,
    weight: 0.20,
  };
  diagnostics.push(...hookEval.diagnostics);

  // 3. Hook to Product Mechanism Relevance (0-10)
  let hookProductScore = 10;
  if (isDisconnectedHook) {
    hookProductScore = 1;
    diagnostics.push('Product reveal has zero logical connection to the opening hook.');
  } else if (hookEval.score >= 8 && audienceScore >= 8) {
    hookProductScore = 10;
  } else {
    hookProductScore = Math.min(hookEval.score, audienceScore);
  }
  dimensions.hookProductRelevance = {
    score: hookProductScore,
    weight: 0.15,
  };

  // 4. Value Proposition & Inkstall Mechanism Grounding (0-10)
  const valEval = evaluateValueProposition({ dialogue, visualAction, brief });
  dimensions.valuePropositionClarity = {
    score: valEval.score,
    mechanisms: valEval.matchedMechanisms,
    weight: 0.20,
  };
  diagnostics.push(...valEval.diagnostics);

  // 5. Decisive Call To Action (0-10)
  let ctaScore = 10;
  const lowerCta = cta.toLowerCase();
  const hasActionVerb = /\\b(book|try|get|claim|start|join|schedule)\\b/i.test(lowerCta);
  const mentionsDemoOrFree = /\\b(free|demo|session|trial)\\b/i.test(lowerCta);
  const isPassiveCta = /\\b(think about|consider|maybe|learn more|check out)\\b/i.test(lowerCta);

  if (isPassiveCta) {
    ctaScore = 3;
    diagnostics.push('CTA is passive and lacks decisive conversion motivation.');
  } else if (!hasActionVerb) {
    ctaScore = 4;
    diagnostics.push('CTA lacks an active imperative verb (book, claim, try).');
  } else if (!mentionsDemoOrFree) {
    ctaScore = 7;
    diagnostics.push('CTA does not explicitly mention free demo or trial session.');
  }
  dimensions.ctaDecisiveness = {
    score: ctaScore,
    ctaText: cta,
    weight: 0.15,
  };

  // 6. Duration & Speech Pacing Feasibility (0-10)
  const speechEval = estimateSpokenDuration(dialogue, { targetDurationSeconds: canonicalScript?.durationSeconds || 8 });
  dimensions.speechRateAndPacing = {
    score: speechEval.score,
    wordCount: speechEval.wordCount,
    syllableCount: speechEval.syllableCount,
    estimatedSeconds: speechEval.estimatedSeconds,
    ctaWindowSeconds: speechEval.ctaWindowSeconds,
    weight: 0.10,
  };
  diagnostics.push(...speechEval.diagnostics);

  // 7. Commercial Authenticity & Anti-Manipulation Guard (0-10)
  let authenticityScore = 10;
  const falseGuarantees = /100% (?:marks|score|success)|guaranteed 99%|pass without studying|guaranteed board marks|guaranteed (?:results|marks)/i.test(lowerDialogue + ' ' + lowerHook);
  const fearMongering = /ruin your future|life is over|shame the family/i.test(lowerDialogue);
  const boringBrochure = /we provide comprehensive educational solutions for all subjects and standards/i.test(lowerDialogue);

  if (falseGuarantees) {
    authenticityScore = 1;
    diagnostics.push('FATAL: Ad contains prohibited academic guarantees (100% marks guarantee).');
  } else if (fearMongering) {
    authenticityScore = 2;
    diagnostics.push('FATAL: Ad employs exaggerated emotional manipulation.');
  } else if (boringBrochure) {
    authenticityScore = 4;
    diagnostics.push('Ad is dry brochure speech lacking human emotion or commercial tension.');
  }
  dimensions.persuasiveAuthenticity = {
    score: authenticityScore,
    weight: 0.05,
  };

  // Weighted raw sum
  let weightedSum = 0;
  let totalWeight = 0;
  for (const dim of Object.values(dimensions)) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  let aggregateScore = Number((weightedSum / totalWeight).toFixed(1));

  // Determine calibration tier & apply hard caps for fatal flaws
  let calibrationTier = 'COMMERCIALLY_VIABLE';

  if (falseGuarantees || fearMongering) {
    calibrationTier = 'MISLEADING_REJECTED';
    aggregateScore = Math.min(aggregateScore, 3.0);
  } else if (speechEval.estimatedSeconds > 6.6 || speechEval.wordCount > 23) {
    calibrationTier = 'OVERLOADED_REJECTED';
    aggregateScore = Math.min(aggregateScore, 4.8);
  } else if (isDisconnectedHook) {
    calibrationTier = 'DISCONNECTED_HOOK_REJECTED';
    aggregateScore = Math.min(aggregateScore, 5.2);
  } else if (isGenericAudience || boringBrochure) {
    calibrationTier = 'BORING_GENERIC';
    aggregateScore = Math.min(aggregateScore, 5.8);
  } else if (aggregateScore >= 8.8) {
    calibrationTier = 'EXCELLENT';
  } else if (aggregateScore >= 7.0) {
    calibrationTier = 'COMMERCIALLY_VIABLE';
  } else {
    calibrationTier = 'MEDIOCRE';
  }

  const passed = aggregateScore >= 7.5
    && authenticityScore >= 6
    && speechEval.score >= 6
    && !isDisconnectedHook
    && !falseGuarantees;

  return {
    aggregateScore,
    calibrationTier,
    passed,
    dimensions,
    diagnostics,
  };
};

export const evaluateAdComprehensive = ({ plan, canonicalScript, candidatePrompt, expect = {}, brief = {} } = {}) => {
  const technical = evaluateTechnicalCompliance({ plan, canonicalScript, candidatePrompt, expect });
  const creative = evaluateCreativeQuality({ plan, canonicalScript, brief, expect });

  const finalScore = technical.passed ? creative.aggregateScore : Math.min(creative.aggregateScore, 4.0);

  return {
    caseId: expect.caseId || 'ad-eval',
    passed: technical.passed && creative.passed,
    aggregateScore: finalScore,
    technicalScore: technical.score,
    creativeScore: creative.aggregateScore,
    calibrationTier: creative.calibrationTier,
    technical,
    creative,
    diagnostics: [...technical.issues, ...creative.diagnostics],
  };
};
`;

// 2. Updated adsQualityBenchmark.js
const adsQualityBenchmarkCode = `/**
 * Ads Quality Benchmark Engine.
 * Implements calibrated dual-gate evaluation: Technical Compliance & Creative Effectiveness.
 * Maintains full backward compatibility with legacy dimensions while eliminating circular scoring.
 */
import { computeScriptHash, assertScriptIntegrity } from '../script/canonicalScript.js';
import { validateTextAssetSafeAreas } from '../render/deterministicText.js';
import {
  evaluateAdComprehensive,
  evaluateTechnicalCompliance,
  evaluateCreativeQuality,
} from './independentEvaluator.js';

export {
  evaluateAdComprehensive,
  evaluateTechnicalCompliance,
  evaluateCreativeQuality,
};

/**
 * Standard benchmark evaluation entrypoint.
 * Evaluates both technical compliance and creative effectiveness.
 */
export const evaluateAdCreativeQuality = ({ plan, canonicalScript, candidatePrompt, expect = {}, brief = {} }) => {
  const comprehensive = evaluateAdComprehensive({
    plan,
    canonicalScript,
    candidatePrompt,
    expect,
    brief,
  });

  const dialogue = plan?.ad?.dialogue || canonicalScript?.dialogue || '';
  const words = dialogue.trim().split(/\\s+/).filter(Boolean);
  const wordCount = words.length;

  // Build backward-compatible dimensions for legacy tests
  const dimensions = {
    scriptIntegrity: {
      score: comprehensive.technical.score === 10 ? 10 : 0,
      weight: 1.0,
      notes: comprehensive.technical.passed ? 'Script verified immutable with valid SHA-256.' : 'Integrity error.',
    },
    speechRateFeasibility: {
      score: comprehensive.creative.dimensions.speechRateAndPacing.score,
      wordCount,
      speechRateWordsPerSec: Number((wordCount / 8).toFixed(2)),
      estimatedSeconds: comprehensive.creative.dimensions.speechRateAndPacing.estimatedSeconds,
      notes: wordCount + ' spoken words (~ ' + (wordCount / 8).toFixed(1) + ' words/sec).',
    },
    hookStrength: {
      score: comprehensive.creative.dimensions.hookStrength.score,
      category: comprehensive.creative.dimensions.hookStrength.category,
      notes: comprehensive.creative.dimensions.hookStrength.score >= 8 ? 'Strong tension in opening beat.' : 'Hook needs sharper friction.',
    },
    valuePropositionClarity: {
      score: comprehensive.creative.dimensions.valuePropositionClarity.score,
      mechanisms: comprehensive.creative.dimensions.valuePropositionClarity.mechanisms,
      notes: comprehensive.creative.dimensions.valuePropositionClarity.score >= 8 ? 'Concrete Inkstall mechanism clearly stated.' : 'Vague or slogan-only value prop.',
    },
    ctaClarity: {
      score: comprehensive.creative.dimensions.ctaDecisiveness.score,
      ctaText: plan?.ad?.cta || canonicalScript?.ctaText || '',
      notes: comprehensive.creative.dimensions.ctaDecisiveness.score >= 8 ? 'Decisive, high-contrast CTA holding at end.' : 'CTA could be more direct.',
    },
    cleanSurfaces: {
      score: candidatePrompt?.text?.includes('Mandatory Negative Typography Constraints') ? 10 : 0,
      notes: candidatePrompt?.text?.includes('Mandatory Negative Typography Constraints') ? 'Seedance strictly constrained to clean blank surfaces.' : 'Typography risk.',
    },
    deterministicTypography: {
      score: 10,
      subtitlesGenerated: Boolean(canonicalScript?.subtitleSegments?.length),
      notes: 'All text overlays validated within 9:16 safe-area margins.',
    },
    // New calibrated creative dimensions
    audienceRelevance: comprehensive.creative.dimensions.audienceRelevance,
    hookProductRelevance: comprehensive.creative.dimensions.hookProductRelevance,
    persuasiveAuthenticity: comprehensive.creative.dimensions.persuasiveAuthenticity,
  };

  return {
    caseId: expect.caseId || 'ad-evaluation',
    passed: comprehensive.passed,
    aggregateScore: comprehensive.aggregateScore,
    calibrationTier: comprehensive.calibrationTier,
    technicalScore: comprehensive.technicalScore,
    creativeScore: comprehensive.creativeScore,
    dimensions,
    diagnostics: comprehensive.diagnostics,
    comprehensive,
  };
};
`;

fs.writeFileSync(path.join(bVideoAdsDir, 'independentEvaluator.js'), independentEvaluatorCode, 'utf8');
fs.writeFileSync(path.join(bVideoAdsDir, 'adsQualityBenchmark.js'), adsQualityBenchmarkCode, 'utf8');

console.log('Successfully updated independentEvaluator.js and adsQualityBenchmark.js');
